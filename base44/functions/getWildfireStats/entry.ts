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

    // Page per-country so every country is fully counted (no global list cap)
    // and zero-incident countries are represented accurately.
    const CHUNK = 10;
    for (let i = 0; i < codes.length; i += CHUNK) {
      const chunk = codes.slice(i, i + CHUNK);
      const results = await Promise.all(chunk.map(async (code) => {
        const incs = await base44.asServiceRole.entities.WildfireIncident.filter({ country_code: code });
        return { code, incs };
      }));
      for (const { code, incs } of results) {
        const coverage = {};
        COVERAGE_YEARS.forEach((y) => (coverage[y] = 0));
        let count = 0;
        let hectares = 0;
        let lastDate = null;
        const sourceSet = new Set();
        for (const inc of incs) {
          count++;
          hectares += inc.hectares_burned || 0;
          if (inc.source) sourceSet.add(inc.source);
          if (inc.admin1_name) territoriesSet.add(inc.admin1_name);
          if (inc.start_date) {
            const y = parseInt(String(inc.start_date).substring(0, 4), 10);
            if (coverage[y] !== undefined) coverage[y]++;
            if (!lastDate || inc.start_date > lastDate) lastDate = inc.start_date;
          }
        }
        byCountry[code] = {
          country_name: COUNTRIES[code],
          count,
          hectares: Math.round(hectares),
          last_incident_date: lastDate,
          coverage,
          sources: Array.from(sourceSet).sort(),
        };
        totalIncidents += count;
        totalHectares += hectares;
        if (lastDate && (!mostRecent || lastDate > mostRecent)) mostRecent = lastDate;
      }
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