import { base44 } from "@/api/base44Client";

// The readiness map is public and publishes only aggregates — individual quiz
// answers stay private. So the map reads precomputed snapshot rows from the
// publicly readable ReportCache entity rather than the raw QuizResult records.
const SCHEMA_VERSION = 1;
const PAGE = 500;

// Which QuizResult field each map level groups by.
const LEVEL_FIELD = {
  global: "country_name",
  country: "country_name",
  state: "admin1_name",
  county: "admin2_name",
  postal: "postal_code",
};

// Same key format the readiness function uses, so the two stay interchangeable.
export const snapshotKey = (level, country, admin1, admin2) =>
  `readiness_avg_${level}_${country || ""}_${admin1 || ""}_${admin2 || ""}`;

// Builds the aggregate payload for one node (level + parent geography).
export function buildAggregate(level, country, admin1, admin2, results) {
  const allScores = results
    .map((r) => r.score)
    .filter((s) => typeof s === "number");
  const globalAverage = allScores.length
    ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
    : 0;

  let filtered = results;
  if (country) filtered = filtered.filter((r) => r.country_name === country);
  if (admin1) filtered = filtered.filter((r) => r.admin1_name === admin1);
  if (admin2) filtered = filtered.filter((r) => r.admin2_name === admin2);

  const field = LEVEL_FIELD[level] || "country_name";
  const groups = {};
  for (const r of filtered) {
    const key = r[field];
    if (!key) continue;
    if (!groups[key]) groups[key] = { name: key, scores: [], lats: [], lngs: [] };
    groups[key].scores.push(r.score);
    if (typeof r.latitude === "number") groups[key].lats.push(r.latitude);
    if (typeof r.longitude === "number") groups[key].lngs.push(r.longitude);
  }

  const locations = Object.values(groups).map((g) => ({
    name: g.name,
    avg_score: g.scores.length
      ? Math.round(g.scores.reduce((a, b) => a + b, 0) / g.scores.length)
      : 0,
    count: g.scores.length,
    latitude: g.lats.length
      ? Math.round((g.lats.reduce((a, b) => a + b, 0) / g.lats.length) * 10000) / 10000
      : null,
    longitude: g.lngs.length
      ? Math.round((g.lngs.reduce((a, b) => a + b, 0) / g.lngs.length) * 10000) / 10000
      : null,
  }));

  const sorted = [...locations].sort((a, b) => b.avg_score - a.avg_score);

  return {
    level,
    locations,
    top5_best: sorted.slice(0, 5),
    top5_worst: sorted.length > 5 ? sorted.slice(-5).reverse() : [],
    global_average: globalAverage,
    total_responses: allScores.length,
    filtered_count: filtered.length,
    built_at: new Date().toISOString(),
    schema_version: SCHEMA_VERSION,
  };
}

// Reads the stored snapshot for one map node (null when nothing is stored yet).
export async function readReadinessSnapshot({ level, country_name, admin1_name, admin2_name }) {
  const key = snapshotKey(level, country_name, admin1_name, admin2_name);
  const rows = await base44.entities.ReportCache.filter({ cache_key: key });
  const items = Array.isArray(rows) ? rows : rows?.items || [];
  return items.length ? items[0].payload : null;
}

// Rebuilds every map node from the live quiz results. Admins can read all quiz
// results and write the cache rows, so this runs from the map page itself —
// no server-side job needed.
export async function refreshReadinessSnapshots() {
  const results = [];
  let cursor;
  for (;;) {
    const page = await base44.entities.QuizResult.filter(
      { is_bot: { $ne: true } },
      { limit: PAGE, sort: "-created_date", cursor }
    );
    results.push(...(page?.items || []));
    if (!page?.has_more || !page?.next_cursor) break;
    cursor = page.next_cursor;
  }

  const nodes = [{ level: "global", country_name: null, admin1_name: null, admin2_name: null }];
  const countries = [...new Set(results.map((r) => r.country_name).filter(Boolean))];
  for (const c of countries) {
    nodes.push({ level: "state", country_name: c, admin1_name: null, admin2_name: null });
    const inCountry = results.filter((r) => r.country_name === c);
    const states = [...new Set(inCountry.map((r) => r.admin1_name).filter(Boolean))];
    for (const s of states) {
      nodes.push({ level: "county", country_name: c, admin1_name: s, admin2_name: null });
      const inState = inCountry.filter((r) => r.admin1_name === s);
      const counties = [...new Set(inState.map((r) => r.admin2_name).filter(Boolean))];
      for (const co of counties) {
        nodes.push({ level: "postal", country_name: c, admin1_name: s, admin2_name: co });
      }
    }
  }

  const cached = await base44.entities.ReportCache.filter({});
  const existingByKey = {};
  (Array.isArray(cached) ? cached : cached?.items || []).forEach((r) => {
    existingByKey[r.cache_key] = r;
  });

  let written = 0;
  for (const node of nodes) {
    const payload = buildAggregate(
      node.level,
      node.country_name,
      node.admin1_name,
      node.admin2_name,
      results
    );
    if (payload.filtered_count === 0) continue;
    const key = snapshotKey(node.level, node.country_name, node.admin1_name, node.admin2_name);
    const row = existingByKey[key];
    if (row) {
      await base44.entities.ReportCache.update(row.id, {
        payload,
        built_at: payload.built_at,
      });
    } else {
      await base44.entities.ReportCache.create({
        cache_key: key,
        payload,
        built_at: payload.built_at,
      });
    }
    written++;
  }
  return written;
}