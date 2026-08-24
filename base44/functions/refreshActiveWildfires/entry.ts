import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { COUNTRY_NAMES, EFFIS_COUNTRY_CODES } from '../../shared/wildfireCountries.ts';
import { secrets } from 'base44:runtime';

// Authorization: valid automation secret (scheduled jobs) OR admin user (manual runs).
async function isAuthorized(base44, req) {
  const secret = secrets.get('AUTOMATION_SECRET');
  const provided = req.headers.get('x-automation-secret');
  if (secret && provided) {
    const a = new TextEncoder().encode(secret);
    const b = new TextEncoder().encode(provided);
    if (a.length === b.length) {
      let diff = 0;
      for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
      if (diff === 0) return true;
    }
  }
  try {
    const user = await base44.auth.me();
    if (user && user.role === 'admin') return true;
  } catch (_e) { /* not a user request */ }
  return false;
}

const acreToHectare = (ac) => Math.round((ac || 0) * 0.404686);
const hectareToAcre = (ha) => Math.round((ha || 0) * 2.47105);
const todayISO = () => new Date().toISOString().split('T')[0];

function severityFromAcres(ac) {
  if (ac >= 100000) return 'catastrophic';
  if (ac >= 10000) return 'major';
  if (ac >= 1000) return 'moderate';
  return 'minor';
}

// Normalize any source incident into the common shape used by reconcile().
function norm(inc, fallbackCountry) {
  const country_code = (inc.country_code || fallbackCountry || '').toUpperCase();
  const acres = inc.acres_burned != null ? Number(inc.acres_burned) : hectareToAcre(inc.hectares_burned);
  const hectares = inc.hectares_burned != null ? Number(inc.hectares_burned) : acreToHectare(acres);
  return {
    incident_name: (inc.incident_name || '').trim(),
    country_code,
    admin1_name: inc.admin1_name || '',
    admin2_name: inc.admin2_name || '',
    start_date: inc.start_date || todayISO(),
    acres_burned: acres,
    hectares_burned: hectares,
    containment_percent: inc.containment_percent != null ? Number(inc.containment_percent) : null,
    latitude: inc.latitude != null ? Number(inc.latitude) : null,
    longitude: inc.longitude != null ? Number(inc.longitude) : null,
    cause: inc.cause || 'Unknown',
    responding_organizations: inc.responding_organizations || [],
  };
}

// Reconcile a list of normalized active incidents against existing records.
// Dedup by incident_name + country_code + start_date. Updates containment dates
// and hectare changes (>10%); creates unmatched records. Writes one import log.
async function reconcileSource(base44, source, incidents) {
  if (!incidents.length) {
    await logImport(base44, source, 0, 0, 0, 0);
    return { source, found: 0, created: 0, contained: 0, hectares_updated: 0, skipped: 0 };
  }

  const codes = [...new Set(incidents.map((i) => i.country_code).filter(Boolean))];
  const existingByCountry = {};
  for (const code of codes) {
    existingByCountry[code] = await base44.asServiceRole.entities.WildfireIncident.filter({ country_code: code });
  }
  const existingByKey = {};
  for (const code of codes) {
    for (const e of existingByCountry[code]) {
      if (e.is_merged_away) continue;
      const key = `${(e.incident_name || '').toLowerCase().trim()}_${(e.country_code || '').toLowerCase()}_${e.start_date}`;
      existingByKey[key] = e;
    }
  }

  const toCreate = [];
  let contained = 0;
  let hectaresUpdated = 0;
  let skipped = 0;

  for (const inc of incidents) {
    if (!inc.incident_name || !inc.country_code) continue;
    const key = `${inc.incident_name.toLowerCase()}_${inc.country_code.toLowerCase()}_${inc.start_date}`;
    const match = existingByKey[key];

    if (match) {
      const update = {};
      // Containment detection: source shows 100% contained and record lacks containment/end.
      if (inc.containment_percent != null && inc.containment_percent >= 100 && !match.containment_date && !match.end_date) {
        update.containment_date = todayISO();
        update.end_date = todayISO();
        contained++;
      }
      // Hectare change detection: >10% difference.
      const existingHa = match.hectares_burned || 0;
      if (inc.hectares_burned > 0 && existingHa > 0 &&
          Math.abs(inc.hectares_burned - existingHa) / existingHa > 0.1) {
        update.hectares_burned = inc.hectares_burned;
        update.acres_burned = inc.acres_burned;
        hectaresUpdated++;
      }
      if (Object.keys(update).length > 0) {
        try {
          await base44.asServiceRole.entities.WildfireIncident.update(match.id, update);
        } catch (e) {
          console.error(`update failed ${match.id}:`, e);
        }
      } else {
        skipped++;
      }
    } else {
      toCreate.push({
        incident_name: inc.incident_name,
        country_code: inc.country_code,
        admin1_name: inc.admin1_name,
        admin2_name: inc.admin2_name,
        start_date: inc.start_date,
        acres_burned: inc.acres_burned,
        hectares_burned: inc.hectares_burned,
        containment_date: inc.containment_percent >= 100 ? todayISO() : null,
        end_date: inc.containment_percent >= 100 ? todayISO() : null,
        latitude: inc.latitude,
        longitude: inc.longitude,
        source,
        severity: severityFromAcres(inc.acres_burned),
        cause: inc.cause,
        responding_organizations: inc.responding_organizations,
        notes: `Active ${source} incident refresh.`,
      });
    }
  }

  let created = 0;
  if (toCreate.length > 0) {
    const recs = await base44.asServiceRole.entities.WildfireIncident.bulkCreate(toCreate);
    created = recs.length;
  }

  await logImport(base44, source, created, contained, hectaresUpdated, skipped);
  return { source, found: incidents.length, created, contained, hectares_updated: hectaresUpdated, skipped };
}

async function logImport(base44, source, created, contained, hectaresUpdated, skipped) {
  try {
    await base44.asServiceRole.entities.WildfireImportLog.create({
      country_code: source === 'COPERNICUS_EFFIS' ? 'EU' : (source === 'NIFC' || source === 'CAL_FIRE' ? 'US' : 'XX'),
      country_name: `Active refresh — ${source}`,
      source,
      imported_at: new Date().toISOString(),
      incidents_created: created,
      years_range: 'active',
      batch: 0,
    });
  } catch (e) {
    console.error('import log failed:', e);
  }
}

// --- Source fetchers ---

const commonSchema = {
  type: 'object',
  properties: {
    incidents: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          incident_name: { type: 'string' },
          country_code: { type: 'string' },
          admin1_name: { type: 'string' },
          admin2_name: { type: 'string' },
          start_date: { type: 'string' },
          acres_burned: { type: 'number' },
          hectares_burned: { type: 'number' },
          containment_percent: { type: 'number' },
          latitude: { type: 'number' },
          longitude: { type: 'number' },
          cause: { type: 'string' },
          responding_organizations: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
};

async function fetchNIFC(base44) {
  const res = await base44.integrations.Core.InvokeLLM({
    prompt: `Search the NIFC (National Interagency Fire Center) and NIFC National Fire News page for the current list of ACTIVE large wildfires in the United States. List ALL currently active large fire incidents NIFC is tracking. For each fire provide: incident_name, country_code (use "US"), admin1_name (state full name), admin2_name (county if available), start_date (YYYY-MM-DD), acres_burned (number), hectares_burned (convert: 1 acre = 0.4047 ha), containment_percent (number 0-100), latitude, longitude, cause (if known), and responding_organizations (array of agency names). Only include incidents currently ACTIVE (not fully contained).`,
    add_context_from_internet: true,
    model: 'gemini_3_flash',
    response_json_schema: commonSchema,
  });
  return (res.incidents || []).map((i) => norm(i, 'US'));
}

async function fetchCalFire(base44) {
  // 1) Try the official CAL FIRE incident feed first.
  try {
    const r = await fetch('https://www.fire.ca.gov/umbraco/api/IncidentApi/List?incidentType=Wildfire&status=Active');
    if (r.ok) {
      const data = await r.json();
      const list = Array.isArray(data) ? data : data?.incidents || [];
      const mapped = list
        .filter((x) => x.Active !== false && x.IsVisible !== false)
        .map((x) => {
          const acres = Number(x.AcresBurned || 0);
          return norm({
            incident_name: x.Name,
            country_code: 'US',
            admin1_name: 'California',
            admin2_name: x.County || x.LocationCounty || '',
            start_date: x.Started ? new Date(x.Started).toISOString().split('T')[0] : todayISO(),
            acres_burned: acres,
            hectares_burned: acreToHectare(acres),
            containment_percent: x.PercentContained != null ? Number(x.PercentContained) : null,
            latitude: x.Latitude,
            longitude: x.Longitude,
            cause: x.Cause || 'Unknown',
            responding_organizations: ['CAL FIRE'],
          }, 'US');
        })
        .filter((i) => i.incident_name);
      if (mapped.length > 0) return mapped;
    }
  } catch (e) {
    console.error('CAL FIRE feed fetch failed, falling back to LLM:', e);
  }
  // 2) LLM fallback.
  const res = await base44.integrations.Core.InvokeLLM({
    prompt: `Search the official CAL FIRE (fire.ca.gov) incidents page for currently ACTIVE wildfires under CAL FIRE jurisdiction in California, USA. List ALL currently active fires. For each: incident_name, country_code "US", admin1_name "California", admin2_name (county if available), start_date (YYYY-MM-DD), acres_burned (number), hectares_burned (convert: 1 acre = 0.4047 ha), containment_percent (number 0-100), latitude, longitude, cause (if known), responding_organizations ["CAL FIRE"]. Only include active (not fully contained) fires.`,
    add_context_from_internet: true,
    model: 'gemini_3_flash',
    response_json_schema: commonSchema,
  });
  return (res.incidents || []).map((i) => norm(i, 'US'));
}

async function fetchEFFIS(base44) {
  const countries = [...EFFIS_COUNTRY_CODES].join(', ');
  const res = await base44.integrations.Core.InvokeLLM({
    prompt: `Using data from EFFIS / Copernicus European Forest Fire Information System, list currently ACTIVE (uncontained) wildfires in the current fire season across European countries (including but not limited to ${countries}). For each fire provide: incident_name, country_code (ISO alpha-2), admin1_name, admin2_name, start_date (YYYY-MM-DD), hectares_burned (number), acres_burned (convert: 1 ha = 2.471 acres), containment_percent (number 0-100, use 0 if still active), latitude, longitude, cause (if known), responding_organizations (array). Only include fires that are currently ACTIVE.`,
    add_context_from_internet: true,
    model: 'gemini_3_flash',
    response_json_schema: commonSchema,
  });
  return (res.incidents || []).map((i) => norm(i, null));
}

async function fetchOtherRegions(base44) {
  const res = await base44.integrations.Core.InvokeLLM({
    prompt: `Search for currently ACTIVE large wildfires (uncontained, current or recent fire season) in major non-US, non-European fire regions: Australia, Canada, Russia, Brazil, Argentina, Chile, South Africa, Indonesia, Mongolia, and any other notable regions. For each fire provide: incident_name, country_code (ISO alpha-2), admin1_name, admin2_name, start_date (YYYY-MM-DD), hectares_burned (number), acres_burned (convert: 1 ha = 2.471 acres), containment_percent (number 0-100, use 0 if still active), latitude, longitude, cause (if known), responding_organizations (array). Only include fires that are currently ACTIVE.`,
    add_context_from_internet: true,
    model: 'gemini_3_flash',
    response_json_schema: commonSchema,
  });
  return (res.incidents || []).map((i) => norm(i, null));
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    if (!(await isAuthorized(base44, req))) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const ranAt = new Date().toISOString();
    const results = [];

    // Sequential to respect LLM rate limits and stay under the platform timeout.
    results.push(await reconcileSource(base44, 'NIFC', await fetchNIFC(base44)));
    results.push(await reconcileSource(base44, 'CAL_FIRE', await fetchCalFire(base44)));
    results.push(await reconcileSource(base44, 'COPERNICUS_EFFIS', await fetchEFFIS(base44)));
    results.push(await reconcileSource(base44, 'MANUAL', await fetchOtherRegions(base44)));

    return Response.json({
      success: true,
      ran_at: ranAt,
      sources: results,
      totals: {
        created: results.reduce((s, r) => s + r.created, 0),
        contained: results.reduce((s, r) => s + r.contained, 0),
        hectares_updated: results.reduce((s, r) => s + r.hectares_updated, 0),
        skipped: results.reduce((s, r) => s + r.skipped, 0),
      },
    });
  } catch (error) {
    console.error('refreshActiveWildfires error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}