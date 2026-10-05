import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { COUNTRY_NAMES, COVERAGE_YEARS } from '../../shared/wildfireCountries.ts';

const COUNTRIES = COUNTRY_NAMES;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const codes = Object.keys(COUNTRIES);
    const byCountry = {};
    let totalIncidents = 0;
    let totalHectares = 0;
    const territoriesSet = new Set();
    let mostRecent = null;

    // Read the incident collection once with cursor pagination (a few reads) and group in
    // memory. The previous one-filter-per-country approach fired ~200 reads per run, which
    // exhausted the app's entity rate limit — and took unrelated requests down with it.
    const allIncidents = [];
    let cursor;
    let hasMore = true;
    let pages = 0;
    while (hasMore && pages < 40) {
      const page = await base44.asServiceRole.entities.WildfireIncident.filter(
        {},
        {
          sort: '-start_date',
          limit: 500,
          fields: ['country_code', 'hectares_burned', 'source', 'admin1_name', 'start_date', 'is_merged_away'],
          ...(cursor ? { cursor } : {}),
        },
      );
      console.log('DEBUG page shape', { isArray: Array.isArray(page), items: page?.items?.length, has_more: page?.has_more, keys: Array.isArray(page) ? null : Object.keys(page || {}) });
      allIncidents.push(...(page.items || []));
      cursor = page.next_cursor;
      hasMore = !!page.has_more && !!cursor;
      pages++;
    }

    // Seed every known country so zero-incident countries are represented accurately.
    for (const code of codes) {
      const coverage = {};
      COVERAGE_YEARS.forEach((y) => (coverage[y] = 0));
      byCountry[code] = {
        country_name: COUNTRIES[code],
        count: 0,
        hectares: 0,
        last_incident_date: null,
        coverage,
        sources: [],
      };
    }

    const sourceSets = {};
    for (const inc of allIncidents) {
      if (inc.is_merged_away) continue;
      const bucket = byCountry[inc.country_code];
      if (!bucket) continue;
      bucket.count++;
      bucket.hectares += inc.hectares_burned || 0;
      if (inc.source) (sourceSets[inc.country_code] = sourceSets[inc.country_code] || new Set()).add(inc.source);
      if (inc.admin1_name) territoriesSet.add(inc.admin1_name);
      if (inc.start_date) {
        const y = parseInt(String(inc.start_date).substring(0, 4), 10);
        if (bucket.coverage[y] !== undefined) bucket.coverage[y]++;
        if (!bucket.last_incident_date || inc.start_date > bucket.last_incident_date) {
          bucket.last_incident_date = inc.start_date;
        }
      }
      totalIncidents++;
      totalHectares += inc.hectares_burned || 0;
      if (inc.start_date && (!mostRecent || inc.start_date > mostRecent)) mostRecent = inc.start_date;
    }

    for (const code of codes) {
      const bucket = byCountry[code];
      bucket.hectares = Math.round(bucket.hectares);
      bucket.sources = Array.from(sourceSets[code] || []).sort();
    }

    // Last refresh per country from import logs (captures runs that created 0 incidents too)
    const lastRefresh = {};
    try {
      const logs = await base44.asServiceRole.entities.WildfireImportLog.list('-imported_at', 500);
      for (const log of logs) {
        if (!log.country_code) continue;
        const prev = lastRefresh[log.country_code];
        if (!prev || (log.imported_at && new Date(log.imported_at) > new Date(prev))) {
          lastRefresh[log.country_code] = log.imported_at;
        }
      }
    } catch (e) {
      // WildfireImportLog may not exist yet on first run — skip gracefully
    }

    return Response.json({
      _debug: {
        pages,
        fetched: allIncidents.length,
        firstKeys: allIncidents[0] ? Object.keys(allIncidents[0]) : null,
        first: allIncidents[0] || null,
      },
      totals: {
        total_incidents: totalIncidents,
        total_hectares: Math.round(totalHectares),
        distinct_territories: territoriesSet.size,
        most_recent_date: mostRecent,
      },
      by_country: byCountry,
      last_refresh: lastRefresh,
      coverage_years: COVERAGE_YEARS,
    });
  } catch (error) {
    console.error('getWildfireStats error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}