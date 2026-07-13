import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const countryCode = body.country_code || 'US';
    const admin1Filter = body.admin1_name;

    const scopeDesc = admin1Filter
      ? `the major wildfires in ${admin1Filter}, ${countryCode}`
      : `the major wildfires in ${countryCode}`;

    const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `List ${scopeDesc} from 2015 to 2025. For each wildfire provide: incident_name, admin1_name (state/province), admin2_name (county/district), start_date (YYYY-MM-DD format), containment_date (YYYY-MM-DD or null), hectares_burned (convert from acres if needed: 1 acre = 0.404686 hectares), responding_organizations (array of agency names), latitude, longitude, cause (human, lightning, unknown, etc.), structures_destroyed, fatalities, and severity (one of: minor, moderate, major, catastrophic). Include at least the 15 largest and most significant fires.`,
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
                responding_organizations: { type: 'array', items: { type: 'string' } },
                latitude: { type: 'number' },
                longitude: { type: 'number' },
                cause: { type: 'string' },
                structures_destroyed: { type: 'number' },
                fatalities: { type: 'number' },
                severity: { type: 'string' }
              }
            }
          }
        }
      }
    });

    const incidents = llmResponse.incidents || [];
    if (incidents.length === 0) {
      return Response.json({ success: true, incidents_created: 0, message: 'No incidents returned by LLM' });
    }

    const incidentRecords = incidents.map((i) => ({
      incident_name: i.incident_name,
      country_code: countryCode,
      admin1_name: i.admin1_name,
      admin2_name: i.admin2_name,
      start_date: i.start_date,
      containment_date: i.containment_date || undefined,
      hectares_burned: i.hectares_burned,
      responding_organizations: i.responding_organizations || [],
      latitude: i.latitude,
      longitude: i.longitude,
      source: 'MANUAL',
      cause: i.cause,
      structures_destroyed: i.structures_destroyed,
      fatalities: i.fatalities,
      severity: i.severity
    }));

    await base44.asServiceRole.entities.WildfireIncident.bulkCreate(incidentRecords);

    return Response.json({
      success: true,
      incidents_created: incidentRecords.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});