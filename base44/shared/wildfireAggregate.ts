// Shared wildfire aggregation + validation helpers. Used by the public
// report function (getPublicWildfireReport) and the admin validation
// function (validateWildfireData) so the two can never drift. Plain module —
// no Deno.serve; import and reuse.

import { COUNTRY_NAMES } from './wildfireCountries.ts';
import { normalizeName, haversine } from './wildfireDedup.ts';

export const SMOULDER_WINDOW_DAYS = 30;
const MS_24H = 24 * 60 * 60 * 1000;
const MS_7D = 7 * 24 * 60 * 60 * 1000;
const MS_30D = 30 * 24 * 60 * 60 * 1000;

// Full active incident set, paged per-country so the global list cap never
// truncates the dataset and zero-incident countries are representable.
export async function loadAllActiveIncidents(base44) {
  const codes = Object.keys(COUNTRY_NAMES);
  // Small serial-ish batches to stay under the platform rate limit.
  const CHUNK = 5;
  const all = [];
  for (let i = 0; i < codes.length; i += CHUNK) {
    const chunk = codes.slice(i, i + CHUNK);
    const results = await Promise.all(
      chunk.map((code) => base44.asServiceRole.entities.WildfireIncident.filter({ country_code: code }))
    );
    for (const incs of results) {
      for (const inc of incs) {
        if (inc.is_merged_away) continue;
        all.push(inc);
      }
    }
    // Yield between batches to avoid bursts.
    await new Promise((r) => setTimeout(r, 120));
  }
  return all;
}

// Canonical display bucket for a raw cause string. Display-only — never
// written back to records. Order matters: arson is human, checked before
// the broad agricultural/power/human buckets.
export function canonicalCause(raw) {
  const s = (raw || '').toLowerCase().trim();
  if (!s || s.includes('under investigation') || s.includes('investigat') ||
      s === 'unknown' || s.includes('undetermined') || s.includes('unspecified') || s.includes('not determined')) {
    return 'Under Investigation';
  }
  if (s.includes('lightning') || s.includes('natural')) return 'Lightning';
  if (s.includes('arson')) return 'Human Activity';
  if (s.includes('agricult') || s.includes('land clearing') || s.includes('slash') ||
      s.includes('crop') || s.includes('burning') || s.includes('pasture')) return 'Agricultural';
  if (s.includes('power') || s.includes('utility') || s.includes('electric') ||
      s.includes('infrastructure') || s.includes('transmission')) return 'Power/Infrastructure';
  if (s.includes('human') || s.includes('neglig') || s.includes('accident') || s.includes('campfire') ||
      s.includes('firework') || s.includes('smoking') || s.includes('equipment') || s.includes('vehicle') ||
      s.includes('debris') || s.includes('lawn') || s.includes('children') || s.includes('laser')) {
    return 'Human Activity';
  }
  return 'Other';
}

export function computeHolidayProximity(incidents, holidays) {
  const firework = (holidays || []).filter(
    (h) => h.date && h.has_public_fireworks !== false && h.country_code
  );
  const byCountry = new Map();
  for (const h of firework) {
    const arr = byCountry.get(h.country_code) || [];
    arr.push(h);
    byCountry.set(h.country_code, arr);
  }
  const scopedCountries = new Set(byCountry.keys());
  let totalScoped = 0;
  let within24h = 0;
  let within7d = 0;
  const holidayMatchMap = new Map();

  for (const inc of incidents) {
    if (!inc.start_date || !inc.country_code) continue;
    const countryHolidays = byCountry.get(inc.country_code);
    if (!countryHolidays) continue; // no firework holidays in this country
    totalScoped++;
    const fireTime = new Date(inc.start_date).getTime();
    let bestHoliday = null;
    let bestDiff = Infinity;
    for (const h of countryHolidays) {
      const diff = Math.abs(fireTime - new Date(h.date).getTime());
      if (diff <= MS_7D && diff < bestDiff) { bestDiff = diff; bestHoliday = h; }
    }
    if (bestHoliday) {
      within7d++;
      if (bestDiff <= MS_24H) within24h++;
      const key = `${bestHoliday.country_code}|${bestHoliday.holiday_name}|${bestHoliday.date}`;
      if (!holidayMatchMap.has(key)) holidayMatchMap.set(key, { holiday: bestHoliday, matched: [] });
      holidayMatchMap.get(key).matched.push(inc);
    }
  }

  const matches = Array.from(holidayMatchMap.values())
    .map(({ holiday, matched }) => ({
      holiday_name: holiday.holiday_name,
      country_code: holiday.country_code,
      date: holiday.date,
      matched_count: matched.length,
      hectares_total: Math.round(matched.reduce((s, i) => s + (i.hectares_burned || 0), 0)),
    }))
    .filter((m) => m.matched_count > 0)
    .sort((a, b) => b.matched_count - a.matched_count)
    .slice(0, 20);

  return {
    scoped_countries: Array.from(scopedCountries).sort(),
    total_scoped: totalScoped,
    within_24h: within24h,
    within_7d: within7d,
    pct_24h: totalScoped > 0 ? (within24h / totalScoped) * 100 : 0,
    pct_7d: totalScoped > 0 ? (within7d / totalScoped) * 100 : 0,
    holiday_matches: matches,
  };
}

export function buildReport(incidents, holidays) {
  const byYear = {};
  const byCountry = {};
  const causeCounts = {};
  let totalIncidents = 0;
  let totalHectares = 0;
  let totalStructures = 0;
  let totalFatalities = 0;
  let mostRecent = null;
  const firstActivityByCountry = {};

  for (const inc of incidents) {
    if (!inc.start_date) continue;
    const year = parseInt(String(inc.start_date).substring(0, 4), 10);
    totalIncidents++;
    const ha = inc.hectares_burned || 0;
    totalHectares += ha;
    totalStructures += inc.structures_destroyed || 0;
    totalFatalities += inc.fatalities || 0;
    byYear[year] = byYear[year] || { year, count: 0, hectares: 0 };
    byYear[year].count++;
    byYear[year].hectares += ha;
    if (!mostRecent || inc.start_date > mostRecent) mostRecent = inc.start_date;

    const cc = inc.country_code;
    if (cc) {
      byCountry[cc] = byCountry[cc] || { code: cc, name: COUNTRY_NAMES[cc] || cc, count: 0, hectares: 0 };
      byCountry[cc].count++;
      byCountry[cc].hectares += ha;
      if (!firstActivityByCountry[cc] || inc.start_date < firstActivityByCountry[cc]) {
        firstActivityByCountry[cc] = inc.start_date;
      }
    }
    const bucket = canonicalCause(inc.cause_cleaned || inc.cause);
    causeCounts[bucket] = (causeCounts[bucket] || 0) + 1;
  }

  const yearList = Object.values(byYear).sort((a, b) => a.year - b.year);
  const countryList = Object.values(byCountry);
  const topByCount = [...countryList].sort((a, b) => b.count - a.count).slice(0, 10);
  const topByHectares = [...countryList].sort((a, b) => b.hectares - a.hectares).slice(0, 10);
  const causeDistribution = Object.entries(causeCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Countries whose first recorded activity falls in 2024 or 2025 only.
  const newlyActive = Object.entries(firstActivityByCountry)
    .filter(([, d]) => {
      const y = parseInt(String(d).substring(0, 4), 10);
      return y === 2024 || y === 2025;
    })
    .map(([cc, d]) => ({ code: cc, name: COUNTRY_NAMES[cc] || cc, first_date: d }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Countries in the master list with zero recorded incidents.
  const incidentCodes = new Set(Object.keys(firstActivityByCountry));
  const zeroActivity = Object.keys(COUNTRY_NAMES)
    .filter((c) => !incidentCodes.has(c))
    .map((c) => ({ code: c, name: COUNTRY_NAMES[c] }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    totals: {
      total_incidents: totalIncidents,
      total_hectares: Math.round(totalHectares),
      total_structures: totalStructures,
      total_fatalities: totalFatalities,
      countries_affected: Object.keys(byCountry).length,
      most_recent_date: mostRecent,
    },
    by_year: yearList,
    top_countries_by_count: topByCount,
    top_countries_by_hectares: topByHectares,
    cause_distribution: causeDistribution,
    newly_active_countries: newlyActive,
    zero_activity_countries: zeroActivity,
    holiday_proximity: computeHolidayProximity(incidents, holidays),
    spikes: [
      { years: '2017–2018', note: 'Major fire seasons across the western US, southern Europe (Portugal, Greece), and Australia.' },
      { years: '2024–2025', note: 'Record year (2024) coinciding with the 2023–2024 El Niño; elevated activity continued into 2025.' },
    ],
    data_as_of: new Date().toISOString(),
  };
}

// --- Validation helpers (read-only; never write) ---

// Same normalized name + same country, re-ignition within 30 days of the
// prior fire's end/containment (and within 50 km if coords exist).
export function findSmoulderCandidates(incidents) {
  const groups = new Map();
  for (const inc of incidents) {
    if (!inc.incident_name || !inc.start_date) continue;
    const key = `${inc.country_code || ''}|${normalizeName(inc.incident_name)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(inc);
  }
  const candidates = [];
  for (const arr of groups.values()) {
    if (arr.length < 2) continue;
    arr.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    for (let i = 1; i < arr.length; i++) {
      const prev = arr[i - 1];
      const cur = arr[i];
      const prevEnd = prev.end_date || prev.containment_date || prev.start_date;
      const gap = new Date(cur.start_date).getTime() - new Date(prevEnd).getTime();
      if (gap > 0 && gap <= MS_30D) {
        let geoOk = true;
        if (prev.latitude && cur.latitude) {
          geoOk = haversine(prev.latitude, prev.longitude, cur.latitude, cur.longitude) <= 50;
        }
        if (geoOk) {
          candidates.push({
            earlier_id: prev.id,
            later_id: cur.id,
            name: cur.incident_name,
            country_code: cur.country_code,
            gap_days: Math.round(gap / (24 * 60 * 60 * 1000)),
          });
        }
      }
    }
  }
  return candidates;
}

// Group raw cause labels under their canonical bucket so admin can see the
// fragmentation that should be canonicalized.
export function groupCauseVariants(incidents) {
  const rawCounts = {};
  for (const inc of incidents) {
    const raw = (inc.cause_cleaned || inc.cause || 'Unknown').trim();
    rawCounts[raw] = (rawCounts[raw] || 0) + 1;
  }
  const buckets = {};
  for (const [raw, count] of Object.entries(rawCounts)) {
    const bucket = canonicalCause(raw);
    if (!buckets[bucket]) buckets[bucket] = { canonical: bucket, total: 0, variants: [] };
    buckets[bucket].total += count;
    buckets[bucket].variants.push({ label: raw, count });
  }
  return Object.values(buckets)
    .map((b) => ({ canonical: b.canonical, total: b.total, variants: b.variants.sort((a, c) => c.count - a.count) }))
    .sort((a, b) => b.total - a.total);
}

export function findHectaresOutliers(incidents) {
  const unitSwap = [];
  const huge = [];
  for (const inc of incidents) {
    const ha = inc.hectares_burned || 0;
    const ac = inc.acres_burned || 0;
    if (ha > 0 && ac > 0) {
      // Hectares should be ~0.4× acres; hectares ≈ acres (±20%) implies a unit swap.
      if (ha > ac * 0.8 && ha < ac * 1.2) unitSwap.push(inc.id);
    }
    if (ha > 1000000) huge.push(inc.id);
  }
  return { unit_swap_suspects: unitSwap, huge_suspects: huge };
}

export function findPre2016(incidents) {
  return incidents
    .filter((i) => i.start_date && parseInt(String(i.start_date).substring(0, 4), 10) < 2016)
    .map((i) => ({ id: i.id, name: i.incident_name, start_date: i.start_date, country_code: i.country_code }));
}

export const findMissingGeo = (incidents) =>
  incidents.filter((i) => !i.latitude || !i.longitude).map((i) => i.id);

export const findMissingHectares = (incidents) =>
  incidents.filter((i) => !i.hectares_burned || i.hectares_burned === 0).map((i) => i.id);

export const findMissingContainment = (incidents) =>
  incidents.filter((i) => !i.containment_date && !i.end_date).map((i) => i.id);