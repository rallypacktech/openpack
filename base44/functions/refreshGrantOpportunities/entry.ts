import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const today = new Date().toISOString().slice(0, 10);
    const result = { archived_overdue: 0, new_identified: 0, reactivated: 0, archived_checked: 0, archived_remaining: 0, errors: [] };

    // ── STEP 1: Archive overdue "identified" grants ──
    const identified = await base44.asServiceRole.entities.GrantLOI.filter({ status: 'identified' });
    const overdueIds = identified
      .filter(g => g.deadline && g.deadline < today)
      .map(g => g.id);

    if (overdueIds.length > 0) {
      await base44.asServiceRole.entities.GrantLOI.bulkUpdate(
        overdueIds.map(id => ({ id, status: 'archived' }))
      );
      result.archived_overdue = overdueIds.length;
    }

    // ── STEP 2: Discover new opportunities via LLM + web search ──
    const existingNames = new Set(
      (await base44.asServiceRole.entities.GrantLOI.list('-updated_date', 500))
        .map(g => (g.grant_name || '').toLowerCase().trim())
    );

    const discoverPrompt = `You are researching grant and award opportunities for RallyPack, a free open-source disaster preparedness platform.

RallyPack's mission areas:
- Technology for emergency management and disaster response
- AI for humanitarian action and preparedness
- Keeping families together and connected during emergencies
- Emergency preparedness, disaster relief, and community resilience

Search the following grant discovery sources for CURRENT, REAL grant and award opportunities with UPCOMING deadlines (after ${today}) that RallyPack could qualify for:

GRANT DISCOVERY SOURCES TO CHECK:
1. Candid / Foundation Maps — https://candid.org/ and https://maps.foundationcenter.org/
2. HumanePro Grant Listings — https://humanepro.org/grant-listings
3. Grants.gov (Simpler) — https://simpler.grants.gov/
4. Pedigree Foundation — https://www.pedigreefoundation.org/shelters-grant/
5. FEMA Grants — https://www.fema.gov/grants
6. Animal Welfare Funding (UW Madison) — https://www.library.wisc.edu/memorial/collections/grants-information-collection/resources/animal-welfare-funding-and-fundraising/
7. Chronicle of Philanthropy — https://www.philanthropy.com/fundraising/
8. GrantInterface — https://www.grantinterface.com
9. Petco Love Shelter Partner Grants — https://petcolove.org/shelter-partners/grants/

Focus on:
- Federal agencies (FEMA, DHS, CDC, NSF, etc.)
- Tech company philanthropy programs (Google.org, Microsoft AI for Good, AWS, etc.)
- Foundations focused on disaster relief, community resilience, family safety, or tech-for-good
- Awards recognizing innovation in emergency tech or community preparedness

For each opportunity, provide: the exact grant/award name, the funder name, a URL to the official program page, the deadline (YYYY-MM-DD format), the estimated funding amount in USD (0 for non-monetary awards), whether it's a "grant" or "award", a priority level (high/medium/low based on alignment and funding size), and a brief description.

Only include opportunities you can verify have upcoming deadlines. Do not include programs with rolling/no deadlines.`;

    const discoverSchema = {
      type: 'object',
      properties: {
        opportunities: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              grant_name: { type: 'string' },
              funder_name: { type: 'string' },
              grant_url: { type: 'string' },
              deadline: { type: 'string', description: 'YYYY-MM-DD format' },
              amount_requested: { type: 'number', description: 'USD, 0 for awards' },
              opportunity_type: { type: 'string', enum: ['grant', 'award'] },
              priority: { type: 'string', enum: ['low', 'medium', 'high'] },
              description: { type: 'string' },
              category_hint: { type: 'string', description: 'emergency_admin, remote_disaster_relief, emergency_tech, public_health_prep, community_resilience, or other' }
            }
          }
        }
      }
    };

    let newOpportunities = [];
    try {
      const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: discoverPrompt,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: discoverSchema,
      });
      newOpportunities = (llmRes.opportunities || []).filter(
        o => o.grant_name && o.deadline && o.deadline >= today
      );
    } catch (e) {
      result.errors.push(`LLM discovery failed: ${e.message}`);
    }

    // Dedup and create new identified grants
    const toCreate = [];
    for (const opp of newOpportunities) {
      const nameKey = (opp.grant_name || '').toLowerCase().trim();
      if (existingNames.has(nameKey)) continue;
      existingNames.add(nameKey); // prevent dups within same batch

      const validCategories = ['emergency_admin', 'remote_disaster_relief', 'emergency_tech', 'public_health_prep', 'community_resilience', 'other'];
      const category = validCategories.includes(opp.category_hint) ? opp.category_hint : 'other';

      toCreate.push({
        grant_name: opp.grant_name,
        funder_name: opp.funder_name || 'Unknown',
        grant_category: category,
        opportunity_type: opp.opportunity_type === 'award' ? 'award' : 'grant',
        grant_url: opp.grant_url || '',
        deadline: opp.deadline,
        amount_requested: opp.amount_requested || 0,
        priority: ['high', 'medium', 'low'].includes(opp.priority) ? opp.priority : 'medium',
        status: 'identified',
        review_notes: opp.description || '',
      });
    }

    if (toCreate.length > 0) {
      await base44.asServiceRole.entities.GrantLOI.bulkCreate(toCreate);
      result.new_identified = toCreate.length;
    }

    // ── STEP 3: Check archived grants for new upcoming deadlines (batched) ──
    const allArchived = await base44.asServiceRole.entities.GrantLOI.filter(
      { status: 'archived' },
      '-updated_date',
      500
    );

    // Cap per-run to avoid timeouts — admin can re-run to process the rest
    const ARCHIVED_BATCH_CAP = 30;
    const archivedBatch = allArchived.slice(0, ARCHIVED_BATCH_CAP);
    const reactivations = [];

    if (archivedBatch.length > 0) {
      const batchItems = archivedBatch.map((g, i) => ({
        lookup_id: String(i),
        name: g.grant_name,
        funder: g.funder_name,
        previous_deadline: g.deadline || 'unknown',
        url: g.grant_url || 'N/A',
      }));

      const batchPrompt = `For each archived grant/award below, search the web for its current cycle. Does it have a NEW upcoming deadline (after ${today})? Only set has_upcoming_deadline=true if you can verify a specific new deadline date.

Grants to check:
${JSON.stringify(batchItems, null, 2)}

Return ONLY a JSON object with a "results" array, one entry per lookup_id.`;

      const batchSchema = {
        type: 'object',
        properties: {
          results: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                lookup_id: { type: 'string' },
                has_upcoming_deadline: { type: 'boolean' },
                new_deadline: { type: 'string', description: 'YYYY-MM-DD or null' },
                notes: { type: 'string' },
              },
            },
          },
        },
      };

      try {
        const batchRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: batchPrompt,
          add_context_from_internet: true,
          model: 'gemini_3_flash',
          response_json_schema: batchSchema,
        });

        const batchResults = batchRes.results || [];
        for (const r of batchResults) {
          const idx = parseInt(r.lookup_id);
          const grant = archivedBatch[idx];
          if (!grant) continue;
          if (r.has_upcoming_deadline && r.new_deadline && r.new_deadline >= today) {
            reactivations.push({
              id: grant.id,
              status: 'identified',
              deadline: r.new_deadline,
              review_notes: [grant.review_notes || '', `Reactivated: ${r.notes || 'new deadline found'}`].filter(Boolean).join('\n'),
            });
          }
        }
      } catch (e) {
        result.errors.push(`Archived batch check failed: ${e.message}`);
      }
    }

    if (reactivations.length > 0) {
      await base44.asServiceRole.entities.GrantLOI.bulkUpdate(reactivations);
      result.reactivated = reactivations.length;
    }
    result.archived_checked = archivedBatch.length;
    result.archived_remaining = Math.max(0, allArchived.length - ARCHIVED_BATCH_CAP);

    return Response.json({ success: true, ...result, checked_at: new Date().toISOString() });
  } catch (error) {
    console.error('refreshGrantOpportunities error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});