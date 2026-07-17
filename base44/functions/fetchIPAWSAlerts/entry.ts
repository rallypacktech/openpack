import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Fetches ALL active US alerts nationally from the NWS CAP API in a single call.
// Covers all 50 US states + territories — includes IPAWS-originated events like
// "Evacuation Immediate", "Shelter in Place Warning", "Civil Emergency Message".
// Filters for: severity Extreme/Severe (critical alerts & warnings) + evacuation notices.
// Note: The OpenFEMA IPAWS Archived Alerts API endpoint was unavailable (404) at build time;
// this NWS national feed is the closest publicly accessible equivalent and includes
// the same IPAWS event taxonomy.

const NWS_API = 'https://api.weather.gov/alerts/active?status=actual&message_type=alert,update';

// Map full US state names to 2-letter codes so profiles storing "Texas" match
// NWS area descriptions that use "TX".
const US_STATE_CODE = {
  alabama: 'al', alaska: 'ak', arizona: 'az', arkansas: 'ar', california: 'ca',
  colorado: 'co', connecticut: 'ct', delaware: 'de', 'district of columbia': 'dc',
  florida: 'fl', georgia: 'ga', hawaii: 'hi', idaho: 'id', illinois: 'il',
  indiana: 'in', iowa: 'ia', kansas: 'ks', kentucky: 'ky', louisiana: 'la',
  maine: 'me', maryland: 'md', massachusetts: 'ma', michigan: 'mi', minnesota: 'mn',
  mississippi: 'ms', missouri: 'mo', montana: 'mt', nebraska: 'ne', nevada: 'nv',
  'new hampshire': 'nh', 'new jersey': 'nj', 'new mexico': 'nm', 'new york': 'ny',
  'north carolina': 'nc', 'north dakota': 'nd', ohio: 'oh', oklahoma: 'ok', oregon: 'or',
  pennsylvania: 'pa', 'rhode island': 'ri', 'south carolina': 'sc', 'south dakota': 'sd',
  tennessee: 'tn', texas: 'tx', utah: 'ut', vermont: 'vt', virginia: 'va',
  washington: 'wa', 'west virginia': 'wv', wisconsin: 'wi', wyoming: 'wy',
  'puerto rico': 'pr', 'u.s. virgin islands': 'vi', guam: 'gu',
};

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

// Haversine distance in km between two lat/lon points
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Extract a representative lat/lon from an NWS alert's GeoJSON geometry
function getAlertCenter(feature) {
  const geom = feature.geometry;
  if (!geom) return null;
  if (geom.type === 'Point' && geom.coordinates) {
    return { lat: geom.coordinates[1], lon: geom.coordinates[0] };
  }
  if (geom.type === 'Polygon' && geom.coordinates?.[0]) {
    const ring = geom.coordinates[0];
    if (ring.length === 0) return null;
    let sumLat = 0, sumLon = 0;
    for (const [lon, lat] of ring) { sumLat += lat; sumLon += lon; }
    return { lat: sumLat / ring.length, lon: sumLon / ring.length };
  }
  return null;
}

// Map NWS event names to the user's alert_settings key
function eventToAlertKey(event) {
  const e = (event || '').toLowerCase();
  if (e.includes('tornado')) return 'tornado';
  if (e.includes('flood')) return 'flood';
  if (e.includes('hurricane') || e.includes('tropical') || e.includes('tsunami')) return 'hurricane';
  if (e.includes('thunderstorm') || e.includes('severe') || e.includes('wind') || e.includes('winter') || e.includes('blizzard')) return 'severe_weather';
  if (e.includes('fire') || e.includes('red flag')) return 'wildfire';
  if (e.includes('earthquake')) return 'earthquake';
  return null;
}

const DEFAULT_RADII = { wildfire: 80, severe_weather: 120, hurricane: 300, tornado: 80, flood: 40, earthquake: 150 };

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    // 1. Load all user profiles
    const profiles = await sr.entities.UserProfile.list();
    if (profiles.length === 0) {
      return Response.json({ message: 'No profiles found.', processed: 0 });
    }

    // 2. Build per-user-per-event-type cooldown map (4h) to truncate repeating warnings.
    //    A user receives at most one notification per event type per 4-hour window.
    //    After 4 hours, if the alert is still active, it will be re-sent.
    const COOLDOWN_MS = 4 * 60 * 60 * 1000;
    const nowMs = Date.now();
    const existingNotifs = await sr.entities.Notification.list();
    const recentEventMap = new Map(); // key: `${userEmail}__${eventLower}` -> createdMs

    const KNOWN_EVENTS = [
      'flash flood warning', 'flash flood watch',
      'flood warning', 'flood watch',
      'severe thunderstorm warning', 'severe thunderstorm watch',
      'tornado warning', 'tornado watch',
      'hurricane warning', 'hurricane watch',
      'tropical storm warning', 'tropical storm watch',
      'tsunami warning', 'tsunami watch',
      'extreme wind warning',
      'winter storm warning', 'winter storm watch',
      'blizzard warning',
      'evacuation immediate', 'shelter in place warning',
      'civil emergency message', 'law enforcement warning',
    ];

    for (const n of existingNotifs) {
      const email = n.recipient_email || n.created_by;
      if (!email) continue;
      const createdMs = n.created_date ? new Date(n.created_date).getTime() : 0;
      if (!createdMs || nowMs - createdMs > COOLDOWN_MS) continue;

      let eventType = null;
      if (n.alert_id && n.alert_id.startsWith('ipaws_event:')) {
        eventType = n.alert_id.substring('ipaws_event:'.length).toLowerCase();
      } else if (n.title) {
        const afterPrefix = n.title.replace(/^\[[^\]]+\]\s*/, '').toLowerCase();
        eventType = KNOWN_EVENTS.find(e => afterPrefix.startsWith(e)) || null;
      }
      if (!eventType) continue;

      const mapKey = `${email}__${eventType}`;
      const prev = recentEventMap.get(mapKey);
      if (!prev || createdMs > prev) recentEventMap.set(mapKey, createdMs);
    }

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
    let emailsSent = 0;
    let telegramPushed = 0;
    const AUTOMATION_SECRET = Deno.env.get("AUTOMATION_SECRET");
    const errors = [];
    const matchedAlerts = [];

    // 5. Match alerts to users by distance using their per-event-type radius settings
    const locatedProfiles = profiles.filter(p => p.latitude && p.longitude);

    for (const feature of filtered) {
      const props = feature.properties || {};
      const nwsId = props.id;

      // Skip expired alerts
      if (props.expires && new Date(props.expires) < new Date()) continue;

      const areaDesc = props.areaDesc || '';
      const alertCenter = getAlertCenter(feature);
      const eventKey = eventToAlertKey(props.event);
      const isEvac = isEvacNotice(props.event, props.headline);

      // Match users by distance — only those with coordinates and within their radius
      const matchedProfiles = locatedProfiles.filter(p => {
        const alertSettings = p.alert_settings || {};

        // Skip if this alert type is explicitly disabled
        if (eventKey && alertSettings[eventKey] === false) return false;

        // Determine the user's radius for this event type
        let radiusKm;
        if (eventKey) {
          radiusKm = alertSettings[`${eventKey}_radius_km`] || DEFAULT_RADII[eventKey] || 80;
        } else if (isEvac) {
          radiusKm = 50; // Evacuation notices: tight radius since they're location-specific
        } else {
          radiusKm = 80; // Default fallback
        }

        // Can't do distance matching without alert geometry — skip
        if (!alertCenter) return false;

        const dist = haversineKm(p.latitude, p.longitude, alertCenter.lat, alertCenter.lon);
        return dist <= radiusKm;
      });

      if (matchedProfiles.length === 0) continue;
      matchedAlerts.push({ event: props.event, severity: props.severity, area: areaDesc, matched: matchedProfiles.length });

      for (const profile of matchedProfiles) {
        try {
          const eventLower = (props.event || 'alert').toLowerCase();
          const userEmail = profile.created_by;

          // Truncate repeating warnings — skip if user received this event type within 4h
          if (recentEventMap.has(`${userEmail}__${eventLower}`)) continue;

          const type = getNotifType(props.severity);
          const shortDesc = (props.description || props.headline || props.event || '').split('\n')[0].slice(0, 300);
          const expiresNote = props.expires ? ` Expires: ${new Date(props.expires).toLocaleString()}.` : '';
          const instruction = props.instruction ? `\n${props.instruction.slice(0, 150)}` : '';
          const alertTitle = `[ipaws_${nwsId}] ${props.headline || props.event}`.slice(0, 200);
          const alertMessage = (`${shortDesc}${instruction}\n\nArea: ${areaDesc}\nSeverity: ${props.severity}${expiresNote}`).slice(0, 500);
          const wantsEmail = profile.notification_method === 'email' || profile.notification_method === 'both';
          const eventTime = props.sent || new Date().toISOString();

          await sr.entities.Notification.create({
            title: alertTitle,
            message: alertMessage,
            type,
            read: false,
            created_by: userEmail,
            recipient_email: userEmail,
            alert_id: `ipaws_event:${props.event}`,
            original_event_time: eventTime,
            delivery_channel: 'in_app',
            delivery_status: 'delivered',
          });
          totalCreated++;
          recentEventMap.set(`${userEmail}__${eventLower}`, nowMs);

          // Email delivery
          if (wantsEmail) {
            try {
              const emailSubject = `RallyPack Alert: ${props.event || 'Emergency Alert'}`;
              const emailBody = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;"><div style="max-width:600px;margin:0 auto;padding:20px;"><div style="background:#dc2626;color:#fff;padding:16px 20px;border-radius:8px 8px 0 0;"><p style="margin:0;font-size:12px;text-transform:uppercase;letter-spacing:1px;opacity:0.9;">RallyPack — Emergency Alert</p><h1 style="margin:4px 0 0 0;font-size:22px;font-weight:700;">${(props.headline || props.event || 'Emergency Alert').replace(/</g, '&lt;')}</h1></div><div style="background:#fff;padding:20px;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 8px 8px;"><div style="display:inline-block;background:#dc262620;color:#dc2626;padding:4px 12px;border-radius:4px;font-size:12px;font-weight:600;margin-bottom:16px;">${props.severity || 'Warning'}</div><p style="margin:0 0 10px 0;line-height:1.6;">${shortDesc.replace(/</g, '&lt;')}</p>${instruction ? `<p style="margin:0 0 10px 0;line-height:1.6;">${instruction.replace(/</g, '&lt;').replace(/\n/g, '<br>')}</p>` : ''}<p style="margin:0 0 10px 0;line-height:1.6;"><strong>Area:</strong> ${areaDesc.replace(/</g, '&lt;')}</p>${expiresNote ? `<p style="margin:0 0 10px 0;line-height:1.6;">${expiresNote}</p>` : ''}<hr style="border:none;border-top:1px solid #e4e4e7;margin:20px 0;"><p style="margin:0;font-size:12px;color:#71717a;">This alert was issued via RallyPack. Always verify current status in the RallyPack app.</p></div></div></body></html>`;
              await sr.integrations.Core.SendEmail({
                to: userEmail,
                subject: emailSubject,
                body: emailBody,
              });
              emailsSent++;
            } catch (emailErr) {
              errors.push({ profile_id: profile.id, channel: 'email', error: emailErr.message });
            }
          }

          // Telegram delivery
          if (profile.telegram_chat_id) {
            try {
              await sr.functions.invoke('sendTelegramAlert', {
                message: alertMessage,
                event_type: props.event || 'Emergency Alert',
                original_event_time: eventTime,
                user_email: userEmail,
                chat_id: profile.telegram_chat_id,
                secret: AUTOMATION_SECRET,
              });
              telegramPushed++;
            } catch (tgErr) {
              errors.push({ profile_id: profile.id, channel: 'telegram', error: tgErr.message });
            }
          }
        } catch (e) {
          errors.push({ profile_id: profile.id, error: e.message });
        }
      }
    }

    return Response.json({
      success: true,
      profiles_total: profiles.length,
      alerts_fetched: allAlerts.length,
      alerts_filtered: filtered.length,
      matched_alerts: matchedAlerts.length,
      notifications_created: totalCreated,
      emails_sent: emailsSent,
      telegram_pushed: telegramPushed,
      matched_alert_details: matchedAlerts.slice(0, 10),
      errors,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});