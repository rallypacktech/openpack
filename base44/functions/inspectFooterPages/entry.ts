import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const INSPECT = "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect";
// The URL Inspection API is quota-limited (2000/day), so a single run is capped.
const MAX_PATHS = 40;
const BATCH = 5;

/**
 * Asks Search Console what it currently thinks of each footer page — indexed
 * or not, and why. Admin-only, and read-only.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const siteUrl = String(body.site_url || "");
    const paths = Array.isArray(body.paths) ? body.paths.slice(0, MAX_PATHS) : [];
    if (!siteUrl || !paths.length) {
      return Response.json({ error: "site_url and paths are required" }, { status: 400 });
    }

    // A domain property ("sc-domain:example.com") carries no origin, so one is derived.
    const base = siteUrl.startsWith("sc-domain:")
      ? `https://${siteUrl.slice("sc-domain:".length)}/`
      : siteUrl;

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("google_search_console");

    const inspectOne = async (path) => {
      let inspectionUrl;
      try {
        inspectionUrl = new URL(path, base).toString();
      } catch (_e) {
        return { path, error: "Not a valid page path" };
      }

      try {
        const res = await fetch(INSPECT, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ inspectionUrl, siteUrl }),
          signal: AbortSignal.timeout(20000),
        });
        const json = await res.json();

        if (!res.ok) {
          return { path, url: inspectionUrl, error: json?.error?.message || `HTTP ${res.status}` };
        }

        const s = json?.inspectionResult?.indexStatusResult || {};
        return {
          path,
          url: inspectionUrl,
          verdict: s.verdict || null,
          coverage_state: s.coverageState || null,
          indexing_state: s.indexingState || null,
          robots_txt_state: s.robotsTxtState || null,
          page_fetch_state: s.pageFetchState || null,
          last_crawl_time: s.lastCrawlTime || null,
          google_canonical: s.googleCanonical || null,
          user_canonical: s.userCanonical || null,
        };
      } catch (error) {
        return { path, url: inspectionUrl, error: error.message };
      }
    };

    const results = [];
    for (let i = 0; i < paths.length; i += BATCH) {
      results.push(...(await Promise.all(paths.slice(i, i + BATCH).map(inspectOne))));
    }

    return Response.json({ site_url: siteUrl, results });
  } catch (error) {
    console.error("inspectFooterPages failed", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}