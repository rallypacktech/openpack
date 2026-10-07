// Read-through cache for public endpoints that are expensive to rebuild.
//
// Public pages are open to anonymous traffic, so any endpoint that computes a
// result from the whole database (or calls a metered third-party API with the
// app's secret key) must not do that work once per visitor. Snapshots live in
// the ReportCache entity so they survive between invocations.

/**
 * Returns the cached payload when it exists and is younger than `ttlMs`,
 * otherwise null so the caller rebuilds it. Never throws — a missing or
 * unreadable cache table just means a rebuild.
 */
export async function readCachedPayload(sr, cacheKey, ttlMs) {
  try {
    const rows = await sr.entities.ReportCache.filter({ cache_key: cacheKey });
    if (rows.length > 0) {
      const age = Date.now() - new Date(rows[0].built_at).getTime();
      if (age < ttlMs) return rows[0].payload;
    }
  } catch (e) {
    // cache table missing or unreadable — fall through to rebuild
  }
  return null;
}

/** Upserts the snapshot. Non-fatal: a failed write must not fail the request. */
export async function writeCachedPayload(sr, cacheKey, payload) {
  try {
    const existing = await sr.entities.ReportCache.filter({ cache_key: cacheKey });
    const now = new Date().toISOString();
    if (existing.length > 0) {
      await sr.entities.ReportCache.update(existing[0].id, { payload, built_at: now });
    } else {
      await sr.entities.ReportCache.create({ cache_key: cacheKey, payload, built_at: now });
    }
  } catch (e) {
    console.error('ReportCache write failed (non-fatal):', e);
  }
}