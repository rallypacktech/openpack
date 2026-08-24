import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { loadAllActiveIncidents, buildReport } from '../../shared/wildfireAggregate.ts';

// Public, unauthenticated endpoint: returns the full 10-year wildfire
// aggregate for the public trend-report page and for AI/search crawlers.
// No auth.me() guard — treat as a public read endpoint.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    const CACHE_KEY = 'public_wildfire_report';
    const TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
    // Bump when the report's JSON shape changes (e.g. holiday_matches → holiday_groups)
    // so a stale-shaped cached payload is auto-invalidated instead of served for up to 6h.
    const REPORT_SCHEMA_VERSION = 3;

    // Serve a cached snapshot only if fresh AND matching the current schema version.
    try {
      const cached = await base44.asServiceRole.entities.ReportCache.filter({ cache_key: CACHE_KEY });
      if (cached.length > 0) {
        const age = Date.now() - new Date(cached[0].built_at).getTime();
        const cachedVersion = cached[0].payload?.schema_version;
        if (age < TTL_MS && cachedVersion === REPORT_SCHEMA_VERSION) {
          return Response.json(cached[0].payload);
        }
      }
    } catch (e) {
      // cache table missing or unreadable — fall through to rebuild
    }

    const incidents = await loadAllActiveIncidents(base44);

    let holidays = [];
    try {
      holidays = await base44.asServiceRole.entities.HolidayFireworkDisplay.list('-date', 500);
    } catch (e) {
      // holidays optional — report still works without them
    }

    const report = buildReport(incidents, holidays);
    report.schema_version = REPORT_SCHEMA_VERSION;

    // Persist the rebuilt report (upsert) — non-fatal on failure.
    try {
      const existing = await base44.asServiceRole.entities.ReportCache.filter({ cache_key: CACHE_KEY });
      const now = new Date().toISOString();
      if (existing.length > 0) {
        await base44.asServiceRole.entities.ReportCache.update(existing[0].id, { payload: report, built_at: now });
      } else {
        await base44.asServiceRole.entities.ReportCache.create({ cache_key: CACHE_KEY, payload: report, built_at: now });
      }
    } catch (e) {
      console.error('ReportCache write failed (non-fatal):', e);
    }

    return Response.json(report);
  } catch (error) {
    console.error('getPublicWildfireReport error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}