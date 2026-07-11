import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow admin access or service-role (scheduled) — this is read-only public data
    const srBase44 = base44.asServiceRole;

    // Fetch ALL active NWS alerts nationwide — filter client-side for map relevance
    const alertsRes = await fetch(
      'https://api.weather.gov/alerts/active?status=actual&message_type=alert,update',
      { headers: { 'User-Agent': 'RallyPack/1.0 (gearup@rallypack.org)', Accept: 'application/geo+json' } }
    );

    if (!alertsRes.ok) {
      return Response.json({ error: `NWS API returned ${alertsRes.status}` }, { status: 502 });
    }

    const alertsData = await alertsRes.json();
    const features = alertsData.features || [];

    // High-priority events worth showing on the national incident map
    const relevantEvents = [
      'Flood Warning', 'Flash Flood Warning', 'Flood Watch', 'Flash Flood Watch',
      'Tornado Warning', 'Tornado Watch',
      'Severe Thunderstorm Warning',
      'Hurricane Warning', 'Hurricane Watch',
      'Tropical Storm Warning', 'Tropical Storm Watch',
      'Tsunami Warning',
      'Extreme Wind Warning',
      'Blizzard Warning', 'Winter Storm Warning',
      'Evacuation Immediate', 'Shelter in Place Warning',
      'Civil Emergency Message',
      'Red Flag Warning',
      'Fire Warning',
    ];

    const alerts = [];

    for (const feature of features) {
      const props = feature.properties || {};
      const event = props.event || '';

      // Must be in our relevant list OR extreme severity
      const isRelevant = relevantEvents.some(e => event.includes(e));
      const isExtreme = props.severity === 'Extreme';
      if (!isRelevant && !isExtreme) continue;

      // Extract coordinates from geometry
      let latitude = null;
      let longitude = null;
      const coords = feature.geometry?.coordinates;

      if (feature.geometry?.type === 'Point' && coords) {
        longitude = coords[0];
        latitude = coords[1];
      } else if (feature.geometry?.type === 'Polygon' && coords?.[0]) {
        // Use the polygon centroid's first point as a rough location
        const ring = coords[0];
        longitude = ring[0][0];
        latitude = ring[0][1];
      }

      // If no geometry, try to parse from areaDesc (we can't geocode server-side reliably)
      // Skip alerts without coordinates — the map needs a pin location
      if (!latitude || !longitude) continue;

      alerts.push({
        id: props.id,
        event,
        headline: props.headline || event,
        description: props.description || '',
        areaDesc: props.areaDesc || '',
        severity: props.severity || 'Unknown',
        urgency: props.urgency || 'Unknown',
        sent: props.sent || null,
        effective: props.effective || null,
        onset: props.onset || null,
        expires: props.expires || null,
        latitude,
        longitude,
      });
    }

    // Sort: Extreme/Severe severity first, then by most recently sent
    const severityRank = { Extreme: 0, Severe: 1, Moderate: 2, Minor: 3, Unknown: 4 };
    alerts.sort((a, b) => {
      const sr = (severityRank[a.severity] ?? 5) - (severityRank[b.severity] ?? 5);
      if (sr !== 0) return sr;
      return new Date(b.sent || 0).getTime() - new Date(a.sent || 0).getTime();
    });

    return Response.json({
      alerts,
      total: alerts.length,
      fetched_at: new Date().toISOString(),
      source: 'NWS API - api.weather.gov/alerts/active',
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});