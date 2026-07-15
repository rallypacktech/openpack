import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { XMLParser } from 'npm:fast-xml-parser@4.5.1';

// Fetches international CAP (Common Alerting Protocol) alerts from official
// national meteorological/agencies worldwide via WMO SWIC and MeteoAlarm feeds.
// Covers countries NOT served by the NWS (US) or AEMET (Spain) APIs.
// Filters for: severity Extreme/Severe (critical alerts & warnings) + evacuation notices.
// Where feeds don't expose CAP severity (WMO SWIC RSS), takes all messages and
// filters by keywords in the title (warning, evacuation, severe, extreme, etc.).

const parser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  attributeNamePrefix: '@_',
});

// Curated list of international CAP feeds from WMO Severe Weather Information Centre
// and MeteoAlarm (EUMETNET). These are the same feeds aggregated by the IFRC Alert Hub.
const CAP_FEEDS = [
  // North America (non-US)
  { country: 'Canada', code: 'CA', url: 'https://rss.naad-adna.pelmorex.com/', format: 'atom' },
  // South America
  { country: 'Brazil', code: 'BR', url: 'https://apiprevmet3.inmet.gov.br/avisos/rss', format: 'rss' },
  { country: 'Argentina', code: 'AR', url: 'https://ssl.smn.gob.ar/CAP/AR.php', format: 'rss' },
  { country: 'Chile', code: 'CL', url: 'https://archivos.meteochile.gob.cl/portaldmc/rss/rss.php', format: 'rss' },
  // Asia
  { country: 'Australia', code: 'AU', url: 'https://severeweather.wmo.int/v2/cap-alerts/au-bom-en/rss.xml', format: 'rss' },
  { country: 'China', code: 'CN', url: 'https://severeweather.wmo.int/v2/cap-alerts/cn-cma-xx/rss.xml', format: 'rss' },
  // Europe (MeteoAlarm — CAP severity available)
  { country: 'Germany', code: 'DE', url: 'https://feeds.meteoalarm.org/feeds/meteoalarm-legacy-atom-germany', format: 'meteoalarm' },
  { country: 'France', code: 'FR', url: 'https://feeds.meteoalarm.org/feeds/meteoalarm-legacy-atom-france', format: 'meteoalarm' },
  { country: 'Italy', code: 'IT', url: 'https://feeds.meteoalarm.org/feeds/meteoalarm-legacy-atom-italy', format: 'meteoalarm' },
  { country: 'Netherlands', code: 'NL', url: 'https://feeds.meteoalarm.org/feeds/meteoalarm-legacy-atom-netherlands', format: 'meteoalarm' },
  { country: 'United Kingdom', code: 'GB', url: 'https://feeds.meteoalarm.org/feeds/meteoalarm-legacy-atom-united-kingdom', format: 'meteoalarm' },
  { country: 'Portugal', code: 'PT', url: 'https://feeds.meteoalarm.org/feeds/meteoalarm-legacy-atom-portugal', format: 'meteoalarm' },
  { country: 'Austria', code: 'AT', url: 'https://feeds.meteoalarm.org/feeds/meteoalarm-legacy-atom-austria', format: 'meteoalarm' },
  { country: 'Switzerland', code: 'CH', url: 'https://feeds.meteoalarm.org/feeds/meteoalarm-legacy-atom-switzerland', format: 'meteoalarm' },
];

const CRITICAL_SEVERITIES = ['extreme', 'severe'];
// Keywords for feeds without CAP severity field — catches warnings, evacuations, emergencies
const CRITICAL_KEYWORDS = /warning|evacuat|severe|extreme|emergency|flood|storm|fire|hurricane|tornado|tsunami|blizzard|heatwave|heat wave|gale|cyclone|typhoon|drought|avalanche|landslide|aviso|alerta|emergencia|emergência|inundacion|inundación|tempestade|tormenta|incendio|incêndio|peligro|perigo|calor extremo|frio extremo|frío extremo|vendaval|ventisca|ciclon|ciclone|tifon|tifão|seca|sequia|sequía|deslizamiento|deslizamento/i;

function getNotifType(severity) {
  const s = (severity || '').toLowerCase();
  if (s === 'extreme') return 'alert';
  if (s === 'severe') return 'warning';
  return 'info';
}

// Parse a CAP feed (RSS or Atom) and extract alerts
function parseFeed(xml, format) {
  try {
    const parsed = parser.parse(xml);
    const alerts = [];

    let items = null;
    if (format === 'rss') {
      items = parsed?.rss?.channel?.item;
    } else if (format === 'atom' || format === 'meteoalarm') {
      items = parsed?.feed?.entry;
    }

    if (!items) return [];
    if (!Array.isArray(items)) items = [items];

    for (const item of items) {
      if (format === 'meteoalarm') {
        // MeteoAlarm Atom with CAP namespace — severity/event available directly
        alerts.push({
          id: item.identifier || item.id || item.link?.['@_href'] || '',
          event: item.event || item.title || '',
          severity: item.severity || '',
          urgency: item.urgency || '',
          area: item.areaDesc || '',
          description: item.title || item.event || '',
          date: item.sent || item.updated || item.published || '',
          expires: item.expires || '',
        });
      } else if (format === 'rss') {
        // WMO SWIC RSS — no CAP severity in feed, use title keywords
        alerts.push({
          id: item.guid || item.link || item.title || '',
          event: item.title || '',
          severity: '', // not available in RSS — will filter by keywords
          urgency: '',
          area: '',
          description: item.description || item.title || '',
          date: item.pubDate || '',
          expires: '',
        });
      } else if (format === 'atom') {
        // Canada NAAD Atom — title + georss, no CAP severity
        alerts.push({
          id: item.id || item.link?.['@_href'] || item.title || '',
          event: item.title || '',
          severity: '',
          urgency: '',
          area: '',
          description: item.title || item.summary || '',
          date: item.updated || item.published || '',
          expires: '',
        });
      }
    }

    return alerts.filter(a => a.event || a.description);
  } catch (e) {
    return [];
  }
}

function shouldInclude(alert) {
  // If CAP severity is available, filter by Extreme/Severe
  const sev = (alert.severity || '').toLowerCase();
  if (sev && CRITICAL_SEVERITIES.includes(sev)) return true;

  // If no severity, include if title/description matches critical keywords
  if (!sev) {
    const text = `${alert.event || ''} ${alert.description || ''}`;
    return CRITICAL_KEYWORDS.test(text);
  }

  // Has severity but not critical — exclude
  return false;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Authorization: admin user OR valid automation secret (for scheduled jobs)
    const automationSecret = Deno.env.get("AUTOMATION_SECRET");
    const providedSecret = req.headers.get("x-automation-secret");
    let isAuthorized = false;
    if (automationSecret && providedSecret) {
      const a = new TextEncoder().encode(automationSecret);
      const b = new TextEncoder().encode(providedSecret);
      if (a.length === b.length) {
        let diff = 0;
        for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
        isAuthorized = diff === 0;
      }
    }
    if (!isAuthorized) {
      const user = await base44.auth.me();
      isAuthorized = user && user.role === 'admin';
    }
    if (!isAuthorized) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const sr = base44.asServiceRole;

    // 1. Load all user profiles
    const profiles = await sr.entities.UserProfile.list();
    if (profiles.length === 0) {
      return Response.json({ message: 'No profiles found.', processed: 0 });
    }

    // 2. Load existing CAP notifications for dedup
    const existingNotifs = await sr.entities.Notification.list();
    const existingKeys = new Set(
      existingNotifs
        .filter(n => n.title && n.title.startsWith('[cap_'))
        .map(n => {
          const match = n.title.match(/^\[cap_([^\]]+)\]/);
          return match ? `cap_${match[1]}` : null;
        })
        .filter(Boolean)
    );

    // 3. Fetch all feeds in parallel (15s timeout each)
    const feedResults = await Promise.allSettled(
      CAP_FEEDS.map(async feed => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        try {
          const res = await fetch(feed.url, {
            signal: controller.signal,
            headers: { 'User-Agent': 'RallyPack/1.0 (gearup@rallypack.org)' },
          });
          clearTimeout(timeout);
          if (!res.ok) return { feed, alerts: [], error: `HTTP ${res.status}` };
          const xml = await res.text();
          return { feed, alerts: parseFeed(xml, feed.format) };
        } catch (e) {
          clearTimeout(timeout);
          return { feed, alerts: [], error: e.message };
        }
      })
    );

    let totalCreated = 0;
    let totalAlertsFound = 0;
    const errors = [];
    const feedStats = [];

    // 4. Process alerts from each feed
    for (const result of feedResults) {
      if (result.status !== 'fulfilled') continue;
      const { feed, alerts, error } = result.value;

      if (error) {
        errors.push({ feed: feed.country, error });
        feedStats.push({ country: feed.country, fetched: 0, filtered: 0, error });
        continue;
      }

      // Filter for critical alerts, warnings, and evacuation notices
      const filtered = alerts.filter(shouldInclude);
      totalAlertsFound += filtered.length;
      feedStats.push({ country: feed.country, fetched: alerts.length, filtered: filtered.length });

      // Match to users by country
      const matchedProfiles = profiles.filter(p => {
        const userCountry = (p.country || '').toLowerCase().trim();
        const userCountries = p.emergency_countries || [];
        return userCountry === feed.country.toLowerCase() ||
               userCountry === feed.code.toLowerCase() ||
               userCountries.includes(feed.code);
      });

      if (matchedProfiles.length === 0) continue;

      for (const alert of filtered) {
        const alertId = (alert.id || `${feed.code}_${alert.event}`.replace(/\s+/g, '_')).slice(0, 80);
        const key = `cap_${alertId}`;
        if (existingKeys.has(key)) continue;

        // Skip expired
        if (alert.expires && new Date(alert.expires) < new Date()) continue;

        for (const profile of matchedProfiles) {
          try {
            const type = getNotifType(alert.severity);
            const desc = (alert.description || alert.event || 'International emergency alert').slice(0, 300);
            const areaNote = alert.area ? `\nArea: ${alert.area}` : '';
            const sevNote = alert.severity ? `\nSeverity: ${alert.severity}` : '';
            const expiresNote = alert.expires ? ` Expires: ${new Date(alert.expires).toLocaleString()}.` : '';

            await sr.entities.Notification.create({
              title: `[cap_${alertId}] ${feed.country}: ${alert.event || 'Emergency Alert'}`.slice(0, 200),
              message: (`${desc}${areaNote}${sevNote}${expiresNote}`).slice(0, 500),
              type,
              read: false,
              created_by: profile.created_by,
              recipient_email: profile.created_by,
              original_event_time: alert.date || new Date().toISOString(),
              delivery_channel: 'in_app',
              delivery_status: 'delivered',
            });
            totalCreated++;
          } catch (e) {
            errors.push({ profile_id: profile.id, error: e.message });
          }
        }
        existingKeys.add(key);
      }
    }

    return Response.json({
      success: true,
      profiles_total: profiles.length,
      feeds_checked: CAP_FEEDS.length,
      alerts_found: totalAlertsFound,
      notifications_created: totalCreated,
      feed_stats: feedStats,
      errors,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});