import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const ACRES_TO_HECTARES = 0.404686;
const BATCH_SIZE = 8;

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const dryRun = body.dry_run !== false; // default to dry-run for safety

    // 1. Gather incidents with missing or zero hectares (single fetch, limit 200)
    const missing: any[] = await base44.asServiceRole.entities.WildfireIncident.filter(
      { hectares_burned: 0, is_merged_away: false },
      '-start_date',
      200
    );

    if (missing.length === 0) {
      return Response.json({
        success: true,
        dry_run: dryRun,
        total_checked: 0,
        updated: 0,
        found: 0,
        message: 'No incidents with missing hectare counts found.'
      });
    }

    // 2. Process in batches via LLM web search
    const foundResults: any[] = [];
    const notFound: any[] = [];

    for (let i = 0; i < missing.length; i += BATCH_SIZE) {
      const chunk = missing.slice(i, i + BATCH_SIZE);
      const lookupItems = chunk.map((inc, idx) => ({
        lookup_id: String(idx),
        db_id: inc.id,
        name: inc.incident_name,
        country: inc.country_code,
        admin1: inc.admin1_name || '',
        start_date: inc.start_date,
        notes: inc.notes || ''
      }));

      const prompt = `You are a wildfire data researcher. For each wildfire below, search the web (AP News, Reuters, official fire agencies like CAL FIRE/NIFC/EFFIS, and credited local news) and find the BURNED AREA in hectares or acres.

For each fire return:
- lookup_id: the id provided
- found: true/false (whether a credible burned-area figure was found in a news or agency source)
- hectares: the figure in hectares (convert from acres if needed: 1 acre = ${ACRES_TO_HECTARES} hectares; round to 2 decimals)
- acres: the original acres figure if the source reported in acres, else 0
- source_name: the credited news source or agency name (e.g. "CAL FIRE", "AP News", "Reuters")
- source_url: the article or agency page URL where the figure was reported
- notes: brief context (1 sentence)

Important rules:
- Only set found=true if a specific numeric burned-area figure was explicitly reported. Do NOT estimate or guess.
- Structural fires (buildings, resorts, boats, villages of houses) are NOT wildfires — set found=false for those.
- Aggregated seasonal statistics without a per-incident figure: set found=false.

Wildfires to research:
${JSON.stringify(lookupItems, null, 2)}

Return ONLY a JSON object: { "results": [ { lookup_id, found, hectares, acres, source_name, source_url, notes } ] }`;

      let llmRes: any;
      try {
        llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          add_context_from_internet: true,
          model: 'gemini_3_flash',
          response_json_schema: {
            type: 'object',
            properties: {
              results: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    lookup_id: { type: 'string' },
                    found: { type: 'boolean' },
                    hectares: { type: 'number' },
                    acres: { type: 'number' },
                    source_name: { type: 'string' },
                    source_url: { type: 'string' },
                    notes: { type: 'string' }
                  }
                }
              }
            }
          }
        });
      } catch (e) {
        // LLM batch failed — skip, continue with next batch
        continue;
      }

      const results = llmRes?.results || [];
      for (const r of results) {
        const matchInc = chunk[parseInt(r.lookup_id)];
        if (!matchInc) continue;
        if (r.found && r.hectares > 0) {
          foundResults.push({
            id: matchInc.id,
            incident_name: matchInc.incident_name,
            country_code: matchInc.country_code,
            start_date: matchInc.start_date,
            hectares: r.hectares,
            acres: r.acres || Math.round(r.hectares / ACRES_TO_HECTARES),
            source_name: r.source_name,
            source_url: r.source_url,
            source_note: r.notes
          });
        } else {
          notFound.push({
            id: matchInc.id,
            incident_name: matchInc.incident_name,
            country_code: matchInc.country_code,
            start_date: matchInc.start_date
          });
        }
      }
    }

    // 3. Apply updates (unless dry-run)
    let updatedCount = 0;
    if (!dryRun && foundResults.length > 0) {
      const updates = foundResults.map(r => ({
        id: r.id,
        hectares_burned: r.hectares,
        acres_burned: r.acres,
        hectares_source: `${r.source_name} — ${r.source_url}${r.source_note ? ' (' + r.source_note + ')' : ''}`
      }));
      await base44.asServiceRole.entities.WildfireIncident.bulkUpdate(updates);
      updatedCount = updates.length;
    }

    return Response.json({
      success: true,
      dry_run: dryRun,
      total_checked: missing.length,
      found: foundResults.length,
      updated: updatedCount,
      found_details: foundResults.map(r => ({
        incident_name: r.incident_name,
        country: r.country_code,
        start_date: r.start_date,
        hectares: r.hectares,
        acres: r.acres,
        source: r.source_name,
        source_url: r.source_url
      })),
      not_found_count: notFound.length,
      not_found_sample: notFound.slice(0, 20)
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}