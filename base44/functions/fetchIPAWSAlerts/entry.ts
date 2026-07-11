import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Fetches ALL active US alerts nationally from the NWS CAP API in a single call.
// Covers all 50 US states + territories — includes IPAWS-originated events like
// "Evacuation Immediate", "Shelter in Place Warning", "Civil Emergency Message".
// Filters for: severity Extreme/Severe (critical alerts & warnings) + evacuation notices.
// Note: The OpenFEMA IPAWS Archived Alerts API endpoint was unavailable (404) at build time;
// this NWS national feed is the closest publicly accessible equivalent and includes
// the same IPAWS event taxonomy.

const NWS_API = 'https://api.weather.gov/alerts/active?status=actual&message_type=alert,update';

// Events that are evacuation / shelter notices regardless of severity
const EVAC_KEYWORDS = ['evacuation', 'shelter', 'civil emergency', 'law enforcement warning', 'take cover', 'seek shelter'];

function isEvacNotice(event, headline) {
  const text = `${event || ''} ${headline || ''}`.toLowerCase();
  return EVAC_KEYWORDS.some(k => text.includes(k));
}

function getNotifType(severity) {
  if (severity === 'Extreme') return 'alert';
  if (severity === 'Severe') return 'warning';
  return 'info';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    // 1. Load all user profiles
    const profiles = await sr.entities.UserProfile.list();
    if (profiles.length === 0) {
      return Response.json({ message: 'No profiles found.', processed: 0 });
    }

    // 2. Load existing IPAWS notifications for dedup
    const existingNotifs = await sr.entities.Notification.list();
    const existingKeys = new Set(
      existingNotifs
        .filter(n => n.title && n.title.startsWith('[ipaws_'))
        .map(n => {
          const match = n.title.match(/^\[ipaws_([^\]]+)\]/);
          return match ? `ipaws_${match[1]}` : null;
        })
        .filter(Boolean)
    );

    // 3. Fetch ALL active NWS alerts nationally (one call covers all US states)
    const res = await fetch(NWS_API, {
      headers: { 'User-Agent': 'RallyPack/1.0 (gearup@rallypack.org)', Accept: 'application/geo+json' },
    });
    if (!res.ok) {
      return Response.json({ error: `NWS API returned ${res.status}` }, { status: 502 });
    }
    const data = await res.json();
    const allAlerts = data?.features || [];

    // 4. Filter for critical alerts, critical warnings, and evacuation notices
    const filtered = allAlerts.filter(f => {
      const props = f.properties || {};
      const severity = props.severity || '';
      const isCritical = severity === 'Extreme' || severity === 'Severe';
      const isEvac = isEvacNotice(props.event, props.headline);
      return isCritical || isEvac;
    });

    let totalCreated = 0;
    const errors = [];
    const matchedAlerts = [];

    // 5. Match alerts to users by state
    for (const feature of filtered) {
      const props = feature.properties || {};
      const nwsId = props.id;
      const key = `ipaws_${nwsId}`;

      if (existingKeys.has(key)) continue;

      // Skip expired alerts
      if (props.expires && new Date(props.expires) < new Date()) continue;

      const areaDesc = props.areaDesc || '';
      const areaLower = areaDesc.toLowerCase();

      // Match users by state — areaDesc format: "Williamson County, TX; Travis County, TX" or "Texas"
      const matchedProfiles = profiles.filter(p => {
        const state = (p.state_province || '').toLowerCase().trim();
        const country = (p.country || '').toLowerCase().trim();
        const isUS = country === 'us' || country === 'united states' || country === 'usa' || country === '';
        if (!isUS || !state) return false;

        // Check for state code (e.g., ", tx") or full state name
        const stateCode = state.length === 2 ? state : '';
        return areaLower.includes(`, ${state}`) ||
               (stateCode && areaLower.includes(`, ${stateCode}`)) ||
               areaLower.includes(state);
      });

      if (matchedProfiles.length === 0) continue;
      matchedAlerts.push({ event: props.event, severity: props.severity, area: areaDesc, matched: matchedProfiles.length });

      for (const profile of matchedProfiles) {
        try {
          const type = getNotifType(props.severity);
          const shortDesc = (props.description || props.headline || props.event || '').split('\n')[0].slice(0, 300);
          const expiresNote = props.expires ? ` Expires: ${new Date(props.expires).toLocaleString()}.` : '';
          const instruction = props.instruction ? `\n${props.instruction.slice(0, 150)}` : '';

          await sr.entities.Notification.create({
            title: `[ipaws_${nwsId}] ${props.headline || props.event}`.slice(0, 200),
            message: (`${shortDesc}${instruction}\n\nArea: ${areaDesc}\nSeverity: ${props.severity}${expiresNote}`).slice(0, 500),
            type,
            read: false,
            created_by: profile.created_by,
            recipient_email: profile.created_by,
            original_event_time: props.sent || new Date().toISOString(),
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

    return Response.json({
      success: true,
      profiles_total: profiles.length,
      alerts_fetched: allAlerts.length,
      alerts_filtered: filtered.length,
      matched_alerts: matchedAlerts.length,
      notifications_created: totalCreated,
      matched_alert_details: matchedAlerts.slice(0, 10),
      errors,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});