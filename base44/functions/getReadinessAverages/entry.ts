import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Public, unauthenticated endpoint: publishes aggregate readiness scores by
// geography (world → country → state → county → postal).
//
// Every figure is served from ONE cached snapshot of per-area totals, so a visitor
// walking the map's drill-downs costs a single cached read however many areas they
// open. The snapshot is rebuilt at most once an hour from one pass over the quiz
// results — request volume can no longer drive database work.
const VALID_LEVELS = new Set(['global', 'country', 'state', 'county', 'postal']);
const SNAPSHOT_KEY = 'readiness_totals_v1';
const TTL_MS = 60 * 60 * 1000; // 1 hour
const SCHEMA_VERSION = 3;
// Aggregate-only figures: a cell backed by fewer than this many respondents is an
// individual (their score tied to a postal area and its centroid), so the cell is
// withheld until enough people share that area.
const MIN_CELL_RESPONSES = 5;

// This endpoint is public, so the geo filters arrive straight from the request
// body. Accept only a short, control-character-free string.
function sanitizeGeoName(value: string | null) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 80) return null;
  if (/[\u0000-\u001f\u007f]/.test(trimmed)) return null;
  return trimmed;
}

// One pass over the quiz results, reduced to per-geography totals. Only sums and
// counts are kept — never an individual score, id or answer.
async function buildSnapshot(sr) {
  const chains = new Map();
  let totalCount = 0;
  let totalSum = 0;

  const LIMIT = 500;
  let skip = 0;
  while (true) {
    const batch = await sr.entities.QuizResult.list('-created_date', LIMIT, skip);
    for (const r of batch) {
      if (r.is_bot) continue;
      if (typeof r.score !== 'number') continue;

      totalCount++;
      totalSum += r.score;

      const country = r.country_name || '';
      const admin1 = r.admin1_name || '';
      const admin2 = r.admin2_name || '';
      const postal = r.postal_code || '';
      const key = `${country}|${admin1}|${admin2}|${postal}`;

      let chain = chains.get(key);
      if (!chain) {
        chain = { country, admin1, admin2, postal, count: 0, score_sum: 0, lat_sum: 0, lng_sum: 0, geo_count: 0 };
        chains.set(key, chain);
      }
      chain.count++;
      chain.score_sum += r.score;
      if (typeof r.latitude === 'number' && typeof r.longitude === 'number') {
        chain.lat_sum += r.latitude;
        chain.lng_sum += r.longitude;
        chain.geo_count++;
      }
    }
    if (batch.length < LIMIT) break;
    skip += LIMIT;
  }

  return {
    schema_version: SCHEMA_VERSION,
    built_at: new Date().toISOString(),
    total_responses: totalCount,
    total_score_sum: totalSum,
    chains: [...chains.values()],
  };
}

// Fresh snapshot or a rebuild. A failed cache write is non-fatal — the caller still
// gets its answer, it just costs another build later.
async function readSnapshot(sr) {
  try {
    const cached = await sr.entities.ReportCache.filter({ cache_key: SNAPSHOT_KEY });
    if (cached.length > 0 && cached[0].payload?.schema_version === SCHEMA_VERSION) {
      if (Date.now() - new Date(cached[0].built_at).getTime() < TTL_MS) {
        return cached[0].payload;
      }
    }
  } catch (_) {}

  const snapshot = await buildSnapshot(sr);
  try {
    const existing = await sr.entities.ReportCache.filter({ cache_key: SNAPSHOT_KEY });
    if (existing.length > 0) {
      await sr.entities.ReportCache.update(existing[0].id, { payload: snapshot, built_at: snapshot.built_at });
    } else {
      await sr.entities.ReportCache.create({ cache_key: SNAPSHOT_KEY, payload: snapshot, built_at: snapshot.built_at });
    }
  } catch (e) {
    console.error('ReportCache write failed (non-fatal):', e);
  }
  return snapshot;
}

export default async function (req) {
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

    const snapshot = await readSnapshot(base44.asServiceRole);

    // Narrow to the requested branch of the drill-down. A made-up place simply
    // matches nothing, so it costs nothing.
    const chains = (snapshot.chains || []).filter((c) =>
      (!countryName || c.country === countryName) &&
      (!admin1Name || c.admin1 === admin1Name) &&
      (!admin2Name || c.admin2 === admin2Name)
    );

    const groupField =
      level === 'global' || level === 'country' ? 'country'
        : level === 'state' ? 'admin1'
          : level === 'county' ? 'admin2'
            : 'postal';

    const groups = new Map();
    let filteredCount = 0;

    for (const c of chains) {
      filteredCount += c.count;
      const key = c[groupField];
      if (!key) continue;

      let g = groups.get(key);
      if (!g) {
        g = { name: key, count: 0, score_sum: 0, lat_sum: 0, lng_sum: 0, geo_count: 0 };
        groups.set(key, g);
      }
      g.count += c.count;
      g.score_sum += c.score_sum;
      g.lat_sum += c.lat_sum;
      g.lng_sum += c.lng_sum;
      g.geo_count += c.geo_count;
    }

    // k-anonymity: only cells with enough respondents are published, and the top
    // lists are drawn from those same cells so neither can expose one person.
    const locations = [...groups.values()]
      .filter((g) => g.count >= MIN_CELL_RESPONSES)
      .map((g) => ({
        name: g.name,
        avg_score: Math.round(g.score_sum / g.count),
        count: g.count,
        latitude: g.geo_count > 0 ? Math.round((g.lat_sum / g.geo_count) * 10000) / 10000 : null,
        longitude: g.geo_count > 0 ? Math.round((g.lng_sum / g.geo_count) * 10000) / 10000 : null,
      }));

    const sorted = [...locations].sort((a, b) => b.avg_score - a.avg_score);

    return Response.json({
      level,
      locations,
      top5_best: sorted.slice(0, 5),
      top5_worst: sorted.length > 5 ? sorted.slice(-5).reverse() : [],
      global_average: snapshot.total_responses > 0
        ? Math.round(snapshot.total_score_sum / snapshot.total_responses)
        : 0,
      total_responses: snapshot.total_responses || 0,
      filtered_count: filteredCount,
      built_at: snapshot.built_at,
      schema_version: SCHEMA_VERSION,
    });
  } catch (error) {
    console.error('getReadinessAverages error:', error);
    // Public endpoint: never return internal exception text to an anonymous caller.
    return Response.json({ error: 'Something went wrong' }, { status: 500 });
  }
}