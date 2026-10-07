import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Public, unauthenticated endpoint: aggregates QuizResult records by
// geographic level (global/country → state → county → postal) and returns
// each location's average score, response count, and centroid lat/lng,
// plus top-5 best and top-5 worst prepared at that level.
// Cached via ReportCache (1h TTL) to avoid recomputing on every page load.
const VALID_LEVELS = new Set(['global', 'country', 'state', 'county', 'postal']);

const buildCacheKey = (lvl, c, a1, a2) =>
  `readiness_avg_${lvl}_${c || ''}_${a1 || ''}_${a2 || ''}`;

// This endpoint is public, so the geo filters arrive straight from the request
// body. Accept only a short, control-character-free string — otherwise an
// attacker can mint unlimited cache keys and drive unbounded database work.
function sanitizeGeoName(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 80) return null;
  if (/[\u0000-\u001f\u007f]/.test(trimmed)) return null;
  return trimmed;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    // Parse params from body (SDK invoke sends POST with JSON)
    let level = 'global';
    let countryName = null;
    let admin1Name = null;
    let admin2Name = null;

    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (VALID_LEVELS.has(body.level)) level = body.level;
        countryName = sanitizeGeoName(body.country_name);
        admin1Name = sanitizeGeoName(body.admin1_name);
        admin2Name = sanitizeGeoName(body.admin2_name);
      } catch (_) {}
    }

    // Cache key includes level + parent filters so each drill-down view is cached independently
    const cacheKey = buildCacheKey(level, countryName, admin1Name, admin2Name);
    const TTL_MS = 60 * 60 * 1000; // 1 hour
    const SCHEMA_VERSION = 1;

    // Serve cached snapshot if fresh
    try {
      const cached = await base44.asServiceRole.entities.ReportCache.filter({ cache_key: cacheKey });
      if (cached.length > 0) {
        const age = Date.now() - new Date(cached[0].built_at).getTime();
        if (age < TTL_MS && cached[0].payload?.schema_version === SCHEMA_VERSION) {
          return Response.json(cached[0].payload);
        }
      }
    } catch (_) {}

    // Drill-down filters must point at data that actually exists. A cheap
    // filtered probe rejects bogus/random names without a full-table scan and
    // without persisting a junk cache row for every invented key.
    const filterQuery = {};
    if (countryName) filterQuery.country_name = countryName;
    if (admin1Name) filterQuery.admin1_name = admin1Name;
    if (admin2Name) filterQuery.admin2_name = admin2Name;
    const hasFilter = Object.keys(filterQuery).length > 0;

    if (hasFilter) {
      const probe = await base44.asServiceRole.entities.QuizResult.filter(
        { ...filterQuery, is_bot: { $ne: true } },
        { limit: 1, fields: ['id'] }
      );
      const probeItems = Array.isArray(probe) ? probe : (probe?.items || []);
      if (probeItems.length === 0) {
        // Nothing matches — serve the global figures from the cached global
        // snapshot (a single indexed read) and cache nothing.
        let globalAverage = 0;
        let totalResponses = 0;
        try {
          const globalCached = await base44.asServiceRole.entities.ReportCache.filter({
            cache_key: buildCacheKey('global', null, null, null),
          });
          if (globalCached.length > 0) {
            globalAverage = globalCached[0].payload?.global_average ?? 0;
            totalResponses = globalCached[0].payload?.total_responses ?? 0;
          }
        } catch (_) {}
        return Response.json({
          level,
          locations: [],
          top5_best: [],
          top5_worst: [],
          global_average: globalAverage,
          total_responses: totalResponses,
          filtered_count: 0,
          built_at: new Date().toISOString(),
          schema_version: SCHEMA_VERSION,
        });
      }
    }

    // Load all non-bot quiz results (paginated to avoid truncation)
    const allResults = [];
    const LIMIT = 500;
    let skip = 0;
    while (true) {
      const batch = await base44.asServiceRole.entities.QuizResult.list('-created_date', LIMIT, skip);
      for (const r of batch) {
        if (r.is_bot) continue;
        allResults.push(r);
      }
      if (batch.length < LIMIT) break;
      skip += LIMIT;
    }

    // Overall average across ALL non-bot results (for quiz results page)
    const allScores = allResults.map(r => r.score).filter(s => typeof s === 'number');
    const globalAverage = allScores.length > 0
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : 0;

    // Filter by parent geography for drill-down
    let filtered = allResults;
    if (countryName) filtered = filtered.filter(r => r.country_name === countryName);
    if (admin1Name) filtered = filtered.filter(r => r.admin1_name === admin1Name);
    if (admin2Name) filtered = filtered.filter(r => r.admin2_name === admin2Name);

    // Determine grouping field based on level
    let groupField;
    if (level === 'global' || level === 'country') groupField = 'country_name';
    else if (level === 'state') groupField = 'admin1_name';
    else if (level === 'county') groupField = 'admin2_name';
    else groupField = 'postal_code';

    // Group and aggregate
    const groups = {};
    for (const r of filtered) {
      const key = r[groupField];
      if (!key) continue;
      if (!groups[key]) groups[key] = { name: key, scores: [], lats: [], lngs: [] };
      groups[key].scores.push(r.score);
      if (typeof r.latitude === 'number') groups[key].lats.push(r.latitude);
      if (typeof r.longitude === 'number') groups[key].lngs.push(r.longitude);
    }

    const locations = Object.values(groups).map(g => {
      const avg = g.scores.length > 0
        ? Math.round(g.scores.reduce((a, b) => a + b, 0) / g.scores.length)
        : 0;
      return {
        name: g.name,
        avg_score: avg,
        count: g.scores.length,
        latitude: g.lats.length > 0
          ? Math.round((g.lats.reduce((a, b) => a + b, 0) / g.lats.length) * 10000) / 10000
          : null,
        longitude: g.lngs.length > 0
          ? Math.round((g.lngs.reduce((a, b) => a + b, 0) / g.lngs.length) * 10000) / 10000
          : null,
      };
    });

    // Sort for top 5 best / worst (require at least 1 response)
    const sorted = [...locations].sort((a, b) => b.avg_score - a.avg_score);
    const top5Best = sorted.slice(0, 5);
    const top5Worst = sorted.length > 5 ? sorted.slice(-5).reverse() : [];

    const payload = {
      level,
      locations,
      top5_best: top5Best,
      top5_worst: top5Worst,
      global_average: globalAverage,
      total_responses: allScores.length,
      filtered_count: filtered.length,
      built_at: new Date().toISOString(),
      schema_version: SCHEMA_VERSION,
    };

    // Cache (upsert) — non-fatal on failure. Never persist a key that matched no
    // data, so invented filters cannot bloat the cache table.
    if (filtered.length > 0) {
      try {
        const existing = await base44.asServiceRole.entities.ReportCache.filter({ cache_key: cacheKey });
        const now = new Date().toISOString();
        if (existing.length > 0) {
          await base44.asServiceRole.entities.ReportCache.update(existing[0].id, { payload, built_at: now });
        } else {
          await base44.asServiceRole.entities.ReportCache.create({ cache_key: cacheKey, payload, built_at: now });
        }
      } catch (e) {
        console.error('ReportCache write failed (non-fatal):', e);
      }
    }

    return Response.json(payload);
  } catch (error) {
    console.error('getReadinessAverages error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}