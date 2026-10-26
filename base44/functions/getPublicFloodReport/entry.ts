import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { loadActiveFloods, yearOf } from '../../shared/floodSources.ts';

const CACHE_KEY = 'public_flood_report';
const TTL_MS = 6 * 60 * 60 * 1000;
const SCHEMA_VERSION = 1;

function buildReport(records) {
  const totals = {
    total_events: 0,
    total_deaths: 0,
    total_injured: 0,
    total_affected: 0,
    total_damage_usd: 0,
    countries_affected: 0,
    states_affected: 0,
    hurricane_events: 0,
    events_with_damage: 0,
  };

  const years = new Set();
  const countries = new Map();
  const states = new Map();
  const hazards = new Map();
  const sources = new Map();
  const byYear = new Map();

  for (const r of records) {
    const year = yearOf(r.start_date);
    const damage = Number(r.damage_usd) || 0;
    const deaths = Number(r.deaths) || 0;
    const injured = Number(r.injured) || 0;
    const affected = Number(r.affected_people) || 0;

    totals.total_events++;
    totals.total_deaths += deaths;
    totals.total_injured += injured;
    totals.total_affected += affected;
    totals.total_damage_usd += damage;
    if (damage > 0) totals.events_with_damage++;
    if (r.hurricane_related || r.hazard_type === 'hurricane_flood') totals.hurricane_events++;

    if (year) years.add(year);

    const hazardLabel =
      r.hazard_type === 'flash_flood'
        ? 'Flash flood'
        : r.hazard_type === 'coastal_flood'
          ? 'Coastal flood'
          : r.hazard_type === 'riverine_flood'
            ? 'Riverine flood'
            : r.hazard_type === 'hurricane_flood'
              ? 'Hurricane-driven flood'
              : 'Flood';
    hazards.set(hazardLabel, (hazards.get(hazardLabel) || 0) + 1);

    const sourceLabel = r.source || 'MANUAL';
    sources.set(sourceLabel, (sources.get(sourceLabel) || 0) + 1);

    if (year) {
      const bucket = byYear.get(year) || { year, count: 0, deaths: 0, damage_usd: 0, affected: 0, hurricane: 0 };
      bucket.count++;
      bucket.deaths += deaths;
      bucket.damage_usd += damage;
      bucket.affected += affected;
      if (r.hurricane_related || r.hazard_type === 'hurricane_flood') bucket.hurricane++;
      byYear.set(year, bucket);
    }

    const countryKey = r.country_code || r.country_name;
    if (countryKey) {
      const countryBucket = countries.get(countryKey) || {
        code: r.country_code || null,
        name: r.country_name || r.country_code,
        count: 0,
      };
      countryBucket.count++;
      countries.set(countryKey, countryBucket);
    }

    if (r.admin1_name) {
      const stateBucket = states.get(r.admin1_name) || {
        name: r.admin1_name,
        count: 0,
        deaths: 0,
        damage_usd: 0,
      };
      stateBucket.count++;
      stateBucket.deaths += deaths;
      stateBucket.damage_usd += damage;
      states.set(r.admin1_name, stateBucket);
    }
  }

  const yearList = [...years].sort((a, b) => a - b);
  const from = yearList.length ? yearList[0] : null;
  const to = yearList.length ? yearList[yearList.length - 1] : null;
  const filledYears = [];
  if (from && to) {
    for (let y = from; y <= to; y++) {
      filledYears.push(byYear.get(y) || { year: y, count: 0, deaths: 0, damage_usd: 0, affected: 0, hurricane: 0 });
    }
  }

  const stateList = [...states.values()].filter((s) => typeof s === 'object');
  const countryList = [...countries.values()].filter((c) => typeof c === 'object');

  const mostSevere = records
    .slice()
    .sort((a, b) => (Number(b.damage_usd) || 0) - (Number(a.damage_usd) || 0) || (Number(b.deaths) || 0) - (Number(a.deaths) || 0))
    .slice(0, 8)
    .map((r) => ({
      event_name: r.event_name,
      place: r.admin1_name || r.country_name || null,
      start_date: r.start_date,
      deaths: Number(r.deaths) || 0,
      damage_usd: Number(r.damage_usd) || 0,
      source: r.source,
    }));

  const sourceIds = new Set(records.map((r) => r.source).filter(Boolean));

  return {
    schema_version: SCHEMA_VERSION,
    data_as_of: new Date().toISOString(),
    years: { from, to },
    totals: {
      ...totals,
      countries_affected: countryList.length,
      states_affected: stateList.length,
      pct_hurricane: totals.total_events ? Math.round((totals.hurricane_events / totals.total_events) * 100) : 0,
      pct_with_damage: totals.total_events ? Math.round((totals.events_with_damage / totals.total_events) * 100) : 0,
    },
    by_year: filledYears,
    by_country: countryList.sort((a, b) => b.count - a.count).slice(0, 12),
    top_states_by_count: stateList.slice().sort((a, b) => b.count - a.count).slice(0, 10),
    top_states_by_damage: stateList.slice().sort((a, b) => b.damage_usd - a.damage_usd).slice(0, 10),
    hazard_mix: [...hazards.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    source_mix: [...sources.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    most_severe: mostSevere,
    coverage: {
      sources_used: [...sourceIds],
      us_only: [...sourceIds].every((s) => s === 'OPENFEMA' || s === 'NOAA_STORM_EVENTS'),
      years_without_data: filledYears.filter((y) => y.count === 0).map((y) => y.year),
    },
  };
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    try {
      const cached = await base44.asServiceRole.entities.ReportCache.filter({ cache_key: CACHE_KEY });
      if (cached.length > 0) {
        const age = Date.now() - new Date(cached[0].built_at).getTime();
        if (age < TTL_MS && cached[0].payload?.schema_version === SCHEMA_VERSION) {
          return Response.json(cached[0].payload);
        }
      }
    } catch (e) {
      // cache unreadable — rebuild below
    }

    const records = await loadActiveFloods(base44);
    const report = buildReport(records);

    // An empty report is never cached: it is what an unpopulated database looks
    // like, and pinning it for six hours would keep the page blank long after
    // flood records were imported.
    if (report.totals.total_events > 0) {
      try {
        const existing = await base44.asServiceRole.entities.ReportCache.filter({ cache_key: CACHE_KEY });
        const now = new Date().toISOString();
        if (existing.length > 0) {
          await base44.asServiceRole.entities.ReportCache.update(existing[0].id, { payload: report, built_at: now });
        } else {
          await base44.asServiceRole.entities.ReportCache.create({ cache_key: CACHE_KEY, payload: report, built_at: now });
        }
      } catch (e) {
        console.error('Flood report cache write failed (non-fatal):', e?.message);
      }
    }

    return Response.json(report);
  } catch (error) {
    console.error('getPublicFloodReport error:', error?.message, error?.stack);
    return Response.json({ error: error?.message || 'Failed to build the flood report' }, { status: 500 });
  }
}