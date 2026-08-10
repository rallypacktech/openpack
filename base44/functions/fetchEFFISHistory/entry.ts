import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { COUNTRY_NAMES, EFFIS_COUNTRY_CODES } from '../../shared/wildfireCountries.ts';

const EFFIS_COUNTRIES = Object.fromEntries(
  Object.entries(COUNTRY_NAMES).filter(([code]) => EFFIS_COUNTRY_CODES.has(code)),
);

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const country_code = (body?.country_code || '').toUpperCase();
    const admin1_name = body?.admin1_name;
    const years_back = body?.years_back || 10;
    const batch = body?.batch || 0; // 0 = whole range, 1/2/3 = thirds
    if (!country_code) return Response.json({ error: 'country_code is required' }, { status: 400 });
    if (!EFFIS_COUNTRIES[country_code]) {
      return Response.json({ error: `Unsupported EFFIS country: ${country_code}. Supported: ${Object.keys(EFFIS_COUNTRIES).join(', ')}` }, { status: 400 });
    }

    const countryName = EFFIS_COUNTRIES[country_code];
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - years_back;
    let batchStartYear, batchEndYear;
    if (batch === 0) {
      batchStartYear = startYear;
      batchEndYear = currentYear;
    } else {
      const third = Math.ceil(years_back / 3);
      if (batch === 1) { batchStartYear = startYear; batchEndYear = startYear + third - 1; }
      else if (batch === 2) { batchStartYear = startYear + third; batchEndYear = startYear + 2 * third - 1; }
      else { batchStartYear = startYear + 2 * third; batchEndYear = currentYear; }
    }
    const yearsRange = `${batchStartYear}-${batchEndYear}`;
    const regionText = admin1_name ? `${admin1_name}, ${countryName} (ISO ${country_code})` : `${countryName} (ISO ${country_code})`;

    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `Using data from the European Forest Fire Information System (EFFIS / Copernicus), list up to 12 most significant wildfires in ${regionText} from ${batchStartYear} to ${batchEndYear}. Focus on fires documented by EFFIS with burnt areas greater than 500 hectares. For each fire provide: incident_name, admin1_name (region/province), admin2_name (province/department), start_date (YYYY-MM-DD), containment_date or null, hectares_burned, acres_burned (convert from hectares: 1 ha = 2.471 acres), latitude, longitude, cause (if known), structures_destroyed, fatalities, severity (minor/moderate/major/catastrophic), and a notes field mentioning it was sourced from EFFIS.`,
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
                latitude: { type: 'number' },
                longitude: { type: 'number' },
                cause: { type: 'string' },
                structures_destroyed: { type: 'number' },
                fatalities: { type: 'number' },
                severity: { type: 'string' },
                notes: { type: 'string' },
              },
            },
          },
        },
      },
    });

    const incidents = llmResponse.incidents || [];
    if (incidents.length === 0) {
      try {
        await base44.asServiceRole.entities.WildfireImportLog.create({
          country_code, country_name: countryName, source: 'COPERNICUS_EFFIS',
          imported_at: new Date().toISOString(), incidents_created: 0,
          years_range: yearsRange, batch,
        });
      } catch (e) { console.error('import log failed:', e); }
      return Response.json({ success: false, error: 'No EFFIS incidents returned by LLM', batch, years: yearsRange });
    }

    // Deduplicate against existing EFFIS records for this country
    const existing = await base44.asServiceRole.entities.WildfireIncident.filter({ country_code, source: 'COPERNICUS_EFFIS' });
    const existingKeys = new Set(existing.map((e) => `${(e.incident_name || '').toLowerCase()}_${e.start_date}`));

    const counties = await base44.asServiceRole.entities.CountyTerritory.filter({ country_code });
    const countyLookup = {};
    counties.forEach((c) => {
      countyLookup[`${(c.admin1_name || '').toLowerCase()}_${(c.admin2_name || '').toLowerCase()}`] = c.id;
    });

    const newRecords = [];
    const skipped = [];
    for (const inc of incidents) {
      const dedupKey = `${(inc.incident_name || '').toLowerCase()}_${inc.start_date}`;
      if (existingKeys.has(dedupKey)) { skipped.push(inc.incident_name); continue; }
      const lookupKey = `${(inc.admin1_name || '').toLowerCase()}_${(inc.admin2_name || '').toLowerCase()}`;
      newRecords.push({
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
        responding_organizations: [],
        latitude: inc.latitude,
        longitude: inc.longitude,
        source: 'COPERNICUS_EFFIS',
        source_incident_id: `EFFIS-${country_code}-${dedupKey}`,
        severity: inc.severity || 'moderate',
        cause: inc.cause || 'Unknown',
        structures_destroyed: inc.structures_destroyed || 0,
        fatalities: inc.fatalities || 0,
        notes: inc.notes || 'Sourced from EFFIS (Copernicus European Forest Fire Information System)',
      });
    }

    let created = [];
    if (newRecords.length > 0) {
      created = await base44.asServiceRole.entities.WildfireIncident.bulkCreate(newRecords);
    }

    try {
      await base44.asServiceRole.entities.WildfireImportLog.create({
        country_code, country_name: countryName, source: 'COPERNICUS_EFFIS',
        imported_at: new Date().toISOString(), incidents_created: created.length,
        years_range: yearsRange, batch,
      });
    } catch (e) { console.error('import log failed:', e); }

    return Response.json({
      success: true,
      country: countryName,
      batch,
      years: yearsRange,
      incidents_fetched: incidents.length,
      incidents_created: created.length,
      duplicates_skipped: skipped.length,
      counties_matched: newRecords.filter((r) => r.county_territory_id).length,
    });
  } catch (error) {
    console.error('fetchEFFISHistory error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}