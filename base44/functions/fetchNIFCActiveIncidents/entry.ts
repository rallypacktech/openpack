import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    // Use LLM with web search to scrape NIFC's current active large incident list
    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `Search the NIFC (National Interagency Fire Center) website at nifc.gov and the NIFC National Fire News page for the current list of ACTIVE large wildfires in the United States. List ALL currently active large fire incidents that NIFC is tracking. For each fire provide: incident_name, admin1_name (state full name), admin2_name (county if available), start_date (YYYY-MM-DD), acres_burned (number), containment_percent (number 0-100), latitude, longitude, cause (if known), and responding_organizations (array of agency names). Only include incidents that are currently ACTIVE (not contained or fully controlled).`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          incidents: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                incident_name: { type: 'string' },
                admin1_name: { type: 'string' },
                admin2_name: { type: 'string' },
                start_date: { type: 'string' },
                acres_burned: { type: 'number' },
                containment_percent: { type: 'number' },
                latitude: { type: 'number' },
                longitude: { type: 'number' },
                cause: { type: 'string' },
                responding_organizations: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      }
    });

    const incidents = llmResponse.incidents || [];
    if (incidents.length === 0) {
      return Response.json({ success: false, message: 'No active NIFC incidents found' });
    }

    // Fetch existing US wildfire incidents to deduplicate by name + state
    const existing = await base44.asServiceRole.entities.WildfireIncident.filter({ country_code: 'US' });
    const existingByKey = {};
    existing.forEach(i => {
      const key = `${(i.incident_name || '').toLowerCase().trim()}_${(i.admin1_name || '').toLowerCase().trim()}`;
      existingByKey[key] = i;
    });

    const toCreate = [];
    const toUpdate = [];
    let skippedCount = 0;

    for (const inc of incidents) {
      const key = `${(inc.incident_name || '').toLowerCase().trim()}_${(inc.admin1_name || '').toLowerCase().trim()}`;
      const match = existingByKey[key];

      const hectares = inc.acres_burned ? Math.round(inc.acres_burned * 0.404686) : 0;
      const severity = inc.acres_burned >= 100000 ? 'catastrophic'
                     : inc.acres_burned >= 10000 ? 'major'
                     : inc.acres_burned >= 1000 ? 'moderate'
                     : 'minor';

      if (match) {
        // Update if acreage changed significantly (>10% difference)
        const existingAcres = match.acres_burned || 0;
        if (inc.acres_burned && Math.abs(inc.acres_burned - existingAcres) / Math.max(existingAcres, 1) > 0.1) {
          toUpdate.push({
            id: match.id,
            acres_burned: inc.acres_burned,
            hectares_burned: hectares,
            containment_date: inc.containment_percent >= 100 ? new Date().toISOString().split('T')[0] : (match.containment_date || null),
            notes: `Updated from NIFC active incident list. Containment: ${inc.containment_percent || 0}%`,
          });
        } else {
          skippedCount++;
        }
      } else {
        toCreate.push({
          incident_name: inc.incident_name,
          country_code: 'US',
          admin1_name: inc.admin1_name || '',
          admin2_name: inc.admin2_name || '',
          start_date: inc.start_date || new Date().toISOString().split('T')[0],
          acres_burned: inc.acres_burned || 0,
          hectares_burned: hectares,
          latitude: inc.latitude,
          longitude: inc.longitude,
          source: 'NIFC',
          severity,
          cause: inc.cause || 'Unknown',
          responding_organizations: inc.responding_organizations || [],
          notes: `Active NIFC incident. Containment: ${inc.containment_percent || 0}%`,
        });
      }
    }

    let created = 0;
    let updated = 0;

    if (toCreate.length > 0) {
      const createdRecords = await base44.asServiceRole.entities.WildfireIncident.bulkCreate(toCreate);
      created = createdRecords.length;
    }

    for (const upd of toUpdate) {
      try {
        await base44.asServiceRole.entities.WildfireIncident.update(upd.id, {
          acres_burned: upd.acres_burned,
          hectares_burned: upd.hectares_burned,
          containment_date: upd.containment_date,
          notes: upd.notes,
        });
        updated++;
      } catch (e) {
        console.error(`Failed to update ${upd.id}:`, e);
      }
    }

    return Response.json({
      success: true,
      incidents_found: incidents.length,
      created,
      updated,
      skipped: skippedCount,
      source: 'NIFC (via web search)',
      fetched_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('fetchNIFCActiveIncidents error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});