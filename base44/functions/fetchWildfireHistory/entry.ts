import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const country_code = body?.country_code;
    const admin1_name = body?.admin1_name;
    const years_back = body?.years_back || 10;
    if (!country_code) return Response.json({ error: 'country_code is required' }, { status: 400 });

    const currentYear = new Date().getFullYear();
    const startYear = currentYear - years_back;
    const regionText = admin1_name ? `${admin1_name}, ${country_code}` : `the country with ISO code ${country_code}`;

    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `List up to 10 most significant wildfires in ${regionText} from ${startYear} to ${currentYear}. For each fire provide: incident_name, admin1_name, admin2_name, start_date (YYYY-MM-DD), containment_date or null, hectares_burned, acres_burned, responding_organizations (array), latitude, longitude, cause, structures_destroyed, fatalities, severity (minor/moderate/major/catastrophic), and a brief notes field. Focus on fires that burned more than 1,000 hectares or had structural damage or fatalities.`,
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
                containment_date: { type: 'string' },
                hectares_burned: { type: 'number' },
                acres_burned: { type: 'number' },
                responding_organizations: { type: 'array', items: { type: 'string' } },
                latitude: { type: 'number' },
                longitude: { type: 'number' },
                cause: { type: 'string' },
                structures_destroyed: { type: 'number' },
                fatalities: { type: 'number' },
                severity: { type: 'string' },
                notes: { type: 'string' }
              }
            }
          }
        }
      }
    });

    const incidents = llmResponse.incidents || [];
    if (incidents.length === 0) {
      return Response.json({ success: false, error: 'No incidents returned by LLM' });
    }

    const counties = await base44.asServiceRole.entities.CountyTerritory.filter({ country_code });
    const countyLookup = {};
    counties.forEach(c => {
      const key = `${(c.admin1_name || '').toLowerCase()}_${(c.admin2_name || '').toLowerCase()}`;
      countyLookup[key] = c.id;
    });

    const incidentRecords = incidents.map(inc => {
      const lookupKey = `${(inc.admin1_name || '').toLowerCase()}_${(inc.admin2_name || '').toLowerCase()}`;
      return {
        incident_name: inc.incident_name,
        county_territory_id: countyLookup[lookupKey] || null,
        country_code,
        admin1_name: inc.admin1_name || '',
        admin2_name: inc.admin2_name || '',
        start_date: inc.start_date,
        containment_date: inc.containment_date || null,
        end_date: null,
        hectares_burned: inc.hectares_burned || 0,
        acres_burned: inc.acres_burned || 0,
        responding_organizations: inc.responding_organizations || [],
        latitude: inc.latitude,
        longitude: inc.longitude,
        source: 'MANUAL',
        severity: inc.severity || 'moderate',
        cause: inc.cause || 'Unknown',
        structures_destroyed: inc.structures_destroyed || 0,
        fatalities: inc.fatalities || 0,
        notes: inc.notes || ''
      };
    });

    const created = await base44.asServiceRole.entities.WildfireIncident.bulkCreate(incidentRecords);

    return Response.json({
      success: true,
      incidents_fetched: incidents.length,
      incidents_created: created.length,
      counties_matched: incidentRecords.filter(r => r.county_territory_id).length
    });
  } catch (error) {
    console.error('fetchWildfireHistory error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});