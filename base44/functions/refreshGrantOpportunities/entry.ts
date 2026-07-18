import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const today = new Date().toISOString().slice(0, 10);
    const result = { archived_overdue: 0, new_identified: 0, reactivated: 0, errors: [] };

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

Search for CURRENT, REAL grant and award opportunities with UPCOMING deadlines (after ${today}) that RallyPack could qualify for. Focus on:
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

    // ── STEP 3: Check archived grants for new upcoming deadlines ──
    const archived = await base44.asServiceRole.entities.GrantLOI.filter({ status: 'archived' });
    const reactivations = [];

    for (const grant of archived) {
      try {
        const checkPrompt = `Check the current status and deadline for this grant/award:
Name: ${grant.grant_name}
Funder: ${grant.funder_name}
Previous deadline: ${grant.deadline || 'unknown'}
URL: ${grant.grant_url || 'N/A'}

Search for the current cycle of this program. Does it have a NEW upcoming deadline (after ${today})? If yes, provide the new deadline. If the program is discontinued, has no upcoming deadline, or you cannot find a new cycle, set has_upcoming_deadline to false.`;

        const checkSchema = {
          type: 'object',
          properties: {
            has_upcoming_deadline: { type: 'boolean' },
            new_deadline: { type: 'string', description: 'YYYY-MM-DD or null' },
            notes: { type: 'string' }
          }
        };

        const checkRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: checkPrompt,
          add_context_from_internet: true,
          model: 'gemini_3_flash',
          response_json_schema: checkSchema,
        });

        if (checkRes.has_upcoming_deadline && checkRes.new_deadline && checkRes.new_deadline >= today) {
          reactivations.push({
            id: grant.id,
            status: 'identified',
            deadline: checkRes.new_deadline,
            review_notes: [grant.review_notes || '', `Reactivated: ${checkRes.notes || 'new deadline found'}`].filter(Boolean).join('\n'),
          });
        }
      } catch (e) {
        // Skip individual failures
      }
    }

    if (reactivations.length > 0) {
      await base44.asServiceRole.entities.GrantLOI.bulkUpdate(reactivations);
      result.reactivated = reactivations.length;
    }

    return Response.json({ success: true, ...result, checked_at: new Date().toISOString() });
  } catch (error) {
    console.error('refreshGrantOpportunities error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});