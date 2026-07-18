import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    // 1. Fetch active NWS fire-related alerts
    const FIRE_EVENTS = ['Red Flag Warning', 'Fire Warning', 'Evacuation Immediate'];
    const alertsRes = await fetch(
      'https://api.weather.gov/alerts/active?status=actual&message_type=alert,update',
      { headers: { 'User-Agent': 'RallyPack/1.0 (gearup@rallypack.org)', Accept: 'application/geo+json' } }
    );

    let nwsFireAlerts = [];
    if (alertsRes.ok) {
      const alertsData = await alertsRes.json();
      nwsFireAlerts = (alertsData.features || []).filter(f => {
        const event = f.properties?.event || '';
        return FIRE_EVENTS.some(e => event.includes(e));
      }).map(f => {
        const props = f.properties || {};
        let latitude = null, longitude = null;
        const coords = f.geometry?.coordinates;
        if (f.geometry?.type === 'Point' && coords) {
          longitude = coords[0]; latitude = coords[1];
        } else if (f.geometry?.type === 'Polygon' && coords?.[0]) {
          longitude = coords[0][0][0]; latitude = coords[0][0][1];
        }
        return {
          id: props.id,
          event: props.event,
          headline: props.headline || props.event,
          areaDesc: props.areaDesc || '',
          severity: props.severity || 'Unknown',
          sent: props.sent || null,
          expires: props.expires || null,
          description: (props.description || '').substring(0, 500),
          latitude, longitude,
        };
      }).filter(a => a.latitude && a.longitude);
    }

    // 2. Fetch recent US WildfireIncident records (last 90 days)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const allIncidents = await base44.asServiceRole.entities.WildfireIncident.filter({ country_code: 'US' });
    const dbIncidents = allIncidents.filter(i => {
      if (!i.start_date) return false;
      return new Date(i.start_date) > ninetyDaysAgo;
    });

    // 3. Compare using haversine distance
    function haversine(lat1, lon1, lat2, lon2) {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    const MATCH_RADIUS_KM = 100;
    const nwsOnly = [];
    const matchedDbIds = new Set();

    for (const alert of nwsFireAlerts) {
      let matched = false;
      for (const inc of dbIncidents) {
        if (inc.latitude && inc.longitude) {
          const dist = haversine(alert.latitude, alert.longitude, inc.latitude, inc.longitude);
          if (dist <= MATCH_RADIUS_KM) {
            matched = true;
            matchedDbIds.add(inc.id);
            break;
          }
        }
      }
      if (!matched) {
        nwsOnly.push(alert);
      }
    }

    // DB incidents with no matching NWS alert (uncontained fires not in NWS)
    const dbOnly = dbIncidents.filter(inc =>
      inc.latitude && inc.longitude && !matchedDbIds.has(inc.id) && !inc.containment_date
    );

    return Response.json({
      success: true,
      summary: {
        nws_fire_alerts: nwsFireAlerts.length,
        db_recent_incidents: dbIncidents.length,
        matched: matchedDbIds.size,
        nws_only: nwsOnly.length,
        db_only: dbOnly.length,
      },
      nws_only: nwsOnly.slice(0, 50),
      db_only: dbOnly.slice(0, 50).map(i => ({
        id: i.id,
        incident_name: i.incident_name,
        admin1_name: i.admin1_name,
        admin2_name: i.admin2_name,
        start_date: i.start_date,
        acres_burned: i.acres_burned,
        hectares_burned: i.hectares_burned,
        source: i.source,
        severity: i.severity,
        latitude: i.latitude,
        longitude: i.longitude,
      })),
      match_radius_km: MATCH_RADIUS_KM,
      fetched_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('compareIncidentSources error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});