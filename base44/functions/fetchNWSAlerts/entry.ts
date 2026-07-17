import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Map NWS event severity to our notification type
function getNotificationType(severity, urgency) {
  if (urgency === 'Immediate' || severity === 'Extreme') return 'alert';
  if (severity === 'Severe' || urgency === 'Expected') return 'warning';
  return 'info';
}

// Deduplicate: build a unique key from the NWS alert ID
function alertKey(nwsId) {
  return `nws_${nwsId}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow admin-triggered runs OR scheduled (no user context)
    // For scheduled runs we use service role throughout
    const srBase44 = base44.asServiceRole;

    // 1. Load all user profiles that have coordinates
    const profiles = await srBase44.entities.UserProfile.list();
    const located = profiles.filter(p => p.latitude && p.longitude);

    if (located.length === 0) {
      return Response.json({ message: 'No profiles with coordinates found.', processed: 0 });
    }

    // 2. Build per-user-per-event-type cooldown map (4h) to truncate repeating warnings.
    const COOLDOWN_MS = 4 * 60 * 60 * 1000;
    const nowMs = Date.now();
    const existingNotifs = await srBase44.entities.Notification.list();
    const recentEventMap = new Map(); // key: `${userEmail}__${eventLower}` -> createdMs

    for (const n of existingNotifs) {
      const email = n.recipient_email || n.created_by;
      if (!email) continue;
      const createdMs = n.created_date ? new Date(n.created_date).getTime() : 0;
      if (!createdMs || nowMs - createdMs > COOLDOWN_MS) continue;

      let eventType = null;
      if (n.alert_id && n.alert_id.startsWith('nws_event:')) {
        eventType = n.alert_id.substring('nws_event:'.length).toLowerCase();
      }
      if (!eventType) continue;

      const mapKey = `${email}__${eventType}`;
      const prev = recentEventMap.get(mapKey);
      if (!prev || createdMs > prev) recentEventMap.set(mapKey, createdMs);
    }

    let totalCreated = 0;
    const errors = [];

    // 3. Process each user profile
    for (const profile of located) {
      try {
        // NWS points API to get the forecast zone for this lat/lon
        const pointsRes = await fetch(
          `https://api.weather.gov/points/${profile.latitude.toFixed(4)},${profile.longitude.toFixed(4)}`,
          { headers: { 'User-Agent': 'RallyPack/1.0 (gearup@rallypack.org)', Accept: 'application/geo+json' } }
        );

        if (!pointsRes.ok) {
          // NWS doesn't cover non-US locations — skip silently
          continue;
        }

        const pointsData = await pointsRes.json();
        const county = pointsData.properties?.county;
        const forecastZone = pointsData.properties?.forecastZone;

        if (!county && !forecastZone) continue;

        // 4. Fetch active alerts for this location
        const alertsRes = await fetch(
          `https://api.weather.gov/alerts/active?point=${profile.latitude.toFixed(4)},${profile.longitude.toFixed(4)}&status=actual&message_type=alert,update`,
          { headers: { 'User-Agent': 'RallyPack/1.0 (gearup@rallypack.org)', Accept: 'application/geo+json' } }
        );

        if (!alertsRes.ok) continue;

        const alertsData = await alertsRes.json();
        const features = alertsData.features || [];

        // 5. Filter for high-priority events we care about
        const relevantEvents = [
          'Flood Warning', 'Flood Watch', 'Flash Flood Warning', 'Flash Flood Watch',
          'Tornado Warning', 'Tornado Watch',
          'Severe Thunderstorm Warning', 'Severe Thunderstorm Watch',
          'Hurricane Warning', 'Hurricane Watch',
          'Tropical Storm Warning', 'Tropical Storm Watch',
          'Tsunami Warning', 'Tsunami Watch',
          'Extreme Wind Warning',
          'Winter Storm Warning', 'Winter Storm Watch',
          'Blizzard Warning',
          'Earthquake Warning',
          'Evacuation Immediate', 'Shelter in Place Warning',
          'Civil Emergency Message', 'Law Enforcement Warning',
          '911 Telephone Outage',
        ];

        for (const feature of features) {
          const props = feature.properties || {};
          const nwsId = props.id;
          const event = props.event || '';
          const severity = props.severity || 'Unknown';
          const urgency = props.urgency || 'Unknown';
          const headline = props.headline || props.event || 'Emergency Alert';
          const description = props.description || props.event || '';
          const expires = props.expires;

          // Skip if not in our relevant list
          if (!relevantEvents.some(e => event.includes(e.split(' ')[0]))) {
            const isHighPriority = severity === 'Extreme' || severity === 'Severe' || urgency === 'Immediate';
            if (!isHighPriority) continue;
          }

          // Check if alert is still valid (not expired)
          if (expires && new Date(expires) < new Date()) continue;

          const eventLower = (event || 'alert').toLowerCase();
          const userEmail = profile.created_by;

          // Truncate repeating warnings — skip if user received this event type within 4h
          if (recentEventMap.has(`${userEmail}__${eventLower}`)) continue;

          const type = getNotificationType(severity, urgency);
          const shortDesc = description.split('\n')[0].slice(0, 300);
          const expiresNote = expires ? ` Expires: ${new Date(expires).toLocaleString()}.` : '';

          // Build notification — embed NWS ID in title for dedup
          const notifData = {
            title: `[nws_${nwsId}] ${headline}`.slice(0, 200),
            message: (shortDesc + expiresNote).slice(0, 500) || `${event} in your area.`,
            type,
            read: false,
            created_by: userEmail,
            recipient_email: userEmail,
            alert_id: `nws_event:${event}`,
          };

          await srBase44.entities.Notification.create(notifData);
          recentEventMap.set(`${userEmail}__${eventLower}`, nowMs);
          totalCreated++;
        }
      } catch (profileErr) {
        errors.push({ profile_id: profile.id, error: profileErr.message });
      }
    }

    return Response.json({
      success: true,
      profiles_checked: located.length,
      alerts_created: totalCreated,
      errors,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});