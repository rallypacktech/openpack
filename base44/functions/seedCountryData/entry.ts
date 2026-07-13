import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const countryCode = body.country_code;
    const admin1Filter = body.admin1_name;
    if (!countryCode) return Response.json({ error: 'country_code is required' }, { status: 400 });

    const scopeDesc = admin1Filter
      ? `all counties, parishes, boroughs, and districts in ${admin1Filter}, ${countryCode}`
      : `all administrative level-2 divisions (counties, districts, municipalities, parishes) in ${countryCode}`;

    const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `List ${scopeDesc}. For each division provide: admin1_name (state/province/region), admin2_name (county/district name), admin2_type (one of: county, parish, borough, district, municipality, province, department, prefecture, canton, shire, region, other), latitude, longitude, population, area_sq_km, and timezone (IANA format). Return as many as you can find — do not summarize or truncate.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          country_name: { type: 'string' },
          divisions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                admin1_name: { type: 'string' },
                admin2_name: { type: 'string' },
                admin2_type: { type: 'string' },
                latitude: { type: 'number' },
                longitude: { type: 'number' },
                population: { type: 'number' },
                area_sq_km: { type: 'number' },
                timezone: { type: 'string' }
              }
            }
          }
        }
      }
    });

    const countryName = llmResponse.country_name || countryCode;
    const divisions = llmResponse.divisions || [];

    if (divisions.length === 0) {
      return Response.json({ success: true, country: countryName, counties_created: 0, message: 'No divisions returned by LLM' });
    }

    const countyRecords = divisions.map((d) => ({
      country_code: countryCode,
      country_name: countryName,
      admin1_name: d.admin1_name,
      admin2_name: d.admin2_name,
      admin2_type: d.admin2_type || 'other',
      latitude: d.latitude,
      longitude: d.longitude,
      population: d.population,
      area_sq_km: d.area_sq_km,
      timezone: d.timezone
    }));

    const createdCounties = await base44.asServiceRole.entities.CountyTerritory.bulkCreate(countyRecords);

    // Create NULL reporting agency entries for each county so they are accounted for
    const nullAgencyRecords = (Array.isArray(createdCounties) ? createdCounties : []).map((c) => ({
      county_territory_id: c.id,
      country_code: countryCode,
      agency_name: 'Unknown — Placeholder',
      agency_type: 'other',
      is_null_entry: true,
      jurisdiction_level: 'county',
      notes: 'NULL entry — agency not yet identified. County is accounted for in the chain of command.'
    }));

    let nullAgenciesCreated = 0;
    if (nullAgencyRecords.length > 0) {
      await base44.asServiceRole.entities.ReportingAgency.bulkCreate(nullAgencyRecords);
      nullAgenciesCreated = nullAgencyRecords.length;
    }

    return Response.json({
      success: true,
      country: countryName,
      counties_created: countyRecords.length,
      null_agencies_created: nullAgenciesCreated
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});