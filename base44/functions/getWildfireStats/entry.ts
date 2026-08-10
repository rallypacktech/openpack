import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Union of all countries the admin dashboard can import wildfire history for.
const COUNTRIES = {
  ES: 'Spain', PT: 'Portugal', GR: 'Greece', IT: 'Italy', FR: 'France',
  HR: 'Croatia', BG: 'Bulgaria', CY: 'Cyprus', CZ: 'Czech Republic', EE: 'Estonia',
  FI: 'Finland', DE: 'Germany', HU: 'Hungary', LV: 'Latvia', LT: 'Lithuania',
  PL: 'Poland', RO: 'Romania', SK: 'Slovakia', SE: 'Sweden', CH: 'Switzerland',
  TR: 'Turkey', LB: 'Lebanon',
  US: 'United States', AU: 'Australia', CA: 'Canada', BR: 'Brazil', AR: 'Argentina',
  CL: 'Chile', ZA: 'South Africa', ID: 'Indonesia', RU: 'Russia', MX: 'Mexico',
  CO: 'Colombia', BO: 'Bolivia', NZ: 'New Zealand', MN: 'Mongolia', KZ: 'Kazakhstan',
  IN: 'India', CN: 'China', TH: 'Thailand', VN: 'Vietnam', PH: 'Philippines',
  NG: 'Nigeria', KE: 'Kenya', TZ: 'Tanzania', PE: 'Peru', EC: 'Ecuador',
  VE: 'Venezuela', PY: 'Paraguay', UY: 'Uruguay', MZ: 'Mozambique', AO: 'Angola',
  ZM: 'Zambia', ZW: 'Zimbabwe', BW: 'Botswana', NA: 'Namibia',
};

const COVERAGE_YEARS = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

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
        for (const inc of incs) {
          count++;
          hectares += inc.hectares_burned || 0;
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