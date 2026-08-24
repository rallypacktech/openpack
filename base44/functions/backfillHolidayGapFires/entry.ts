import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { COUNTRY_NAMES } from '../../shared/wildfireCountries.ts';
import { normalizeName } from '../../shared/wildfireDedup.ts';

function severityFromHectares(ha) {
  const ac = ha * 2.471;
  if (ac >= 100000) return 'catastrophic';
  if (ac >= 10000) return 'major';
  if (ac >= 1000) return 'moderate';
  return 'minor';
}

const schema = {
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
          start_date: { type: 'string' },
          hectares_burned: { type: 'number' },
          acres_burned: { type: 'number' },
          notes: { type: 'string' },
        },
      },
    },
  },
};

// One-time backfill targeting documented fireworks-adjacent wildfires for
// under-represented firework-tradition holidays (Australia Day, Lunar/Chinese
// New Year, Diwali, and other thin-match holidays) so their correlation is
// visible alongside US Independence Day / New Year's Eve.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Search for DOCUMENTED wildfires from 2016 through 2025 that occurred within roughly 7 days of firework-tradition holidays OUTSIDE the United States, where fireworks were a known or suspected cause, or where the fire coincided closely with public fireworks displays. Focus on these under-represented holidays and regions:

1. Australia Day (January 26, Australia) — late January bushfires near fireworks events.
2. Lunar / Chinese New Year (late January–February, China, Singapore, Malaysia, Vietnam) — fires during CNY fireworks celebrations.
3. Diwali (October–November, India, also Nepal, Sri Lanka) — fires caused by or coinciding with Diwali firecrackers.
4. Guy Fawkes Night / Bonfire Night (Nov 5, United Kingdom, New Zealand) — fires near bonfires/fireworks.
5. San Juan Night (June 23, Spain) — fires coinciding with bonfire beach celebrations.
6. Bastille Day (July 14, France) — fires near fireworks displays.
7. Canada Day (July 1, Canada) — fires near fireworks.
8. Orthodox Easter / other firework-tradition holidays (Greece, Eastern Europe) where documented.

For each documented fire provide: incident_name (official name if known, otherwise a descriptive name), country_code (ISO 3166-1 alpha-2), admin1_name (state/province/region if known), start_date (YYYY-MM-DD, the ignition date), hectares_burned (number; convert from acres using 1 acre = 0.4047 ha if needed), acres_burned (number), and a short notes field naming the nearby holiday and source/context. Only include real, documented fires — do not invent or estimate fires. Return as many as you can find across the decade, prioritizing Australia Day, Lunar New Year, and Diwali.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: schema,
    });

    const raw = (res.incidents || []).filter((i) => i.incident_name && i.start_date);

    // Normalize + validate country codes.
    const valid = raw
      .map((i) => {
        const cc = (i.country_code || '').toUpperCase();
        if (!COUNTRY_NAMES[cc]) return null;
        const ha = i.hectares_burned != null ? Number(i.hectares_burned) : Math.round((Number(i.acres_burned) || 0) * 0.404686);
        const ac = i.acres_burned != null ? Number(i.acres_burned) : Math.round(ha * 2.47105);
        return {
          ...i,
          country_code: cc,
          hectares_burned: ha,
          acres_burned: ac,
        };
      })
      .filter(Boolean);

    // Dedup against existing incidents by incident_name + country_code + start_date.
    const byCountry = new Map();
    for (const inc of valid) {
      if (!byCountry.has(inc.country_code)) byCountry.set(inc.country_code, []);
      byCountry.get(inc.country_code).push(inc);
    }
    const existingKeys = new Set();
    for (const [cc, list] of byCountry) {
      const existing = await base44.asServiceRole.entities.WildfireIncident.filter({ country_code: cc });
      for (const e of existing) {
        const key = `${(e.incident_name || '').toLowerCase().trim()}_${(e.country_code || '').toLowerCase()}_${e.start_date}`;
        existingKeys.add(key);
      }
    }

    const toCreate = [];
    let skipped = 0;
    for (const inc of valid) {
      const key = `${(inc.incident_name || '').toLowerCase().trim()}_${(inc.country_code || '').toLowerCase()}_${inc.start_date}`;
      if (existingKeys.has(key)) {
        skipped++;
        continue;
      }
      existingKeys.add(key);
      toCreate.push({
        incident_name: inc.incident_name,
        country_code: inc.country_code,
        admin1_name: inc.admin1_name || '',
        start_date: inc.start_date,
        hectares_burned: inc.hectares_burned,
        acres_burned: inc.acres_burned,
        cause: 'Fireworks',
        cause_cleaned: 'Fireworks',
        source: 'MANUAL',
        source_incident_id: `fw-${normalizeName(inc.incident_name)}-${inc.country_code}-${inc.start_date}`,
        severity: severityFromHectares(inc.hectares_burned || 0),
        notes: inc.notes || 'Documented fireworks-adjacent wildfire (holiday-gap backfill).',
      });
    }

    let created = 0;
    let createdNames = [];
    if (toCreate.length > 0) {
      const recs = await base44.asServiceRole.entities.WildfireIncident.bulkCreate(toCreate);
      created = recs.length;
      createdNames = recs.slice(0, 20).map((r) => `${r.incident_name} (${r.country_code}, ${r.start_date})`);
    }

    try {
      await base44.asServiceRole.entities.WildfireImportLog.create({
        country_code: 'XX',
        country_name: 'Fireworks holiday-gap backfill 2016-2025',
        source: 'MANUAL',
        imported_at: new Date().toISOString(),
        incidents_created: created,
        years_range: '2016-2025',
        batch: 0,
      });
    } catch (e) {
      console.error('import log failed:', e);
    }

    return Response.json({
      success: true,
      llm_returned: raw.length,
      valid_country: valid.length,
      created,
      skipped,
      created_sample: createdNames,
    });
  } catch (error) {
    console.error('backfillHolidayGapFires error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}