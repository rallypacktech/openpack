import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const WEBMASTERS = "https://searchconsole.googleapis.com/webmasters/v3";
const DIMENSIONS = ["query", "page", "country", "device", "date"];
const WINDOWS = [7, 28, 90];

// Search Console lags roughly two days behind, so the window never runs to today.
const isoDaysAgo = (days) => new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);

/**
 * Reads Search Console performance for the properties the connected Google
 * account can see. Admin-only: the connector token belongs to the builder.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("google_search_console");

    const sitesRes = await fetch(`${WEBMASTERS}/sites`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!sitesRes.ok) {
      console.error("getSearchPerformance: sites lookup failed", sitesRes.status);
      return Response.json({ error: `Search Console returned ${sitesRes.status}` }, { status: 502 });
    }

    const sitesJson = await sitesRes.json();
    const sites = (sitesJson.siteEntry || []).map((s) => ({
      site_url: s.siteUrl,
      permission: s.permissionLevel,
    }));

    // An account with no verified property gets an empty list, not an error.
    if (body.action === "sites" || sites.length === 0) {
      return Response.json({ sites, site_url: null, rows: [], totals: null });
    }

    const siteUrl = sites.some((s) => s.site_url === body.site_url)
      ? body.site_url
      : sites[0].site_url;

    const dimension = DIMENSIONS.includes(body.dimension) ? body.dimension : "query";
    const days = WINDOWS.includes(Number(body.days)) ? Number(body.days) : 28;
    const rowLimit = Math.min(Math.max(Number(body.row_limit) || 25, 1), 200);
    const startDate = isoDaysAgo(days);
    const endDate = isoDaysAgo(2);

    const query = (payload) =>
      fetch(`${WEBMASTERS}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000),
      });

    // The dimension rows and the overall totals are independent reads.
    const [rowsRes, totalsRes] = await Promise.all([
      query({ startDate, endDate, dimensions: [dimension], rowLimit }),
      query({ startDate, endDate, rowLimit: 1 }),
    ]);

    if (!rowsRes.ok) {
      console.error("getSearchPerformance: query failed", rowsRes.status, await rowsRes.text());
      return Response.json({ error: `Search Console returned ${rowsRes.status}` }, { status: 502 });
    }

    const rowsJson = await rowsRes.json();
    const totalsJson = totalsRes.ok ? await totalsRes.json() : { rows: [] };

    const shape = (r) => ({
      key: (r.keys || [])[0] ?? "",
      clicks: r.clicks || 0,
      impressions: r.impressions || 0,
      ctr: r.ctr || 0,
      position: r.position || 0,
    });

    return Response.json({
      sites,
      site_url: siteUrl,
      dimension,
      days,
      start_date: startDate,
      end_date: endDate,
      totals: totalsJson.rows?.[0] ? shape(totalsJson.rows[0]) : null,
      rows: (rowsJson.rows || []).map(shape),
    });
  } catch (error) {
    console.error("getSearchPerformance failed", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}