import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Haversine distance calculation (in kilometers)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Convert bearing in degrees to a 16-point compass direction (north, northeast, etc.)
function getCompassBearing(lat1, lon1, lat2, lon2) {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
    Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  bearing = (bearing + 360) % 360;
  const dirs = ['north', 'north-northeast', 'northeast', 'east-northeast', 'east', 'east-southeast', 'southeast', 'south-southeast', 'south', 'south-southwest', 'southwest', 'west-southwest', 'west', 'west-northwest', 'northwest', 'north-northwest'];
  return dirs[Math.round(bearing / 22.5) % 16];
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

    // Get all users with profiles and valid locations
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({});
    
    // Get active wildfires
    const wildfiresResponse = await base44.functions.invoke('getTexasWildfires');
    const wildfires = wildfiresResponse.data.wildfires || [];

    const alertsToCreate = [];

    for (const profile of profiles) {
      if (!profile.latitude || !profile.longitude) continue;
      
      // Check alert preferences
      const alertSettings = profile.alert_settings || {};
      const wildfireEnabled = alertSettings.wildfire !== false;
      const alertRadius = alertSettings.wildfire_radius_km || 80;
      
      if (!wildfireEnabled) continue;

      // Find nearby wildfires
      for (const fire of wildfires) {
        if (!fire.latitude || !fire.longitude) continue;
        
        const distance = calculateDistance(
          profile.latitude,
          profile.longitude,
          fire.latitude,
          fire.longitude
        );

        if (distance <= alertRadius) {
          // Check if we already created this alert
          const existingAlerts = await base44.asServiceRole.entities.Notification.filter({
            created_by: profile.created_by,
            title: `Wildfire Alert: ${fire.name}`
          });

          if (existingAlerts.length === 0) {
            // Look up nearest meet spot for evacuation direction guidance
            let meetSpotGuidance = '';
            try {
              const spots = await base44.asServiceRole.entities.MeetSpot.filter({ created_by: profile.created_by });
              if (spots.length > 0 && profile.latitude && profile.longitude) {
                const nearest = spots
                  .filter(s => s.latitude && s.longitude)
                  .map(s => ({ ...s, dist: calculateDistance(profile.latitude, profile.longitude, s.latitude, s.longitude) }))
                  .sort((a, b) => a.dist - b.dist)[0];
                if (nearest) {
                  const dir = getCompassBearing(profile.latitude, profile.longitude, nearest.latitude, nearest.longitude);
                  meetSpotGuidance = ` Head ${Math.round(nearest.dist)} km ${dir} to "${nearest.name || 'your meeting spot'}".`;
                }
              }
            } catch (e) { /* best effort */ }

            alertsToCreate.push({
              created_by: profile.created_by,
              title: `Wildfire Alert: ${fire.name}`,
              message: `Active wildfire ${Math.round(distance)} km from your location in ${fire.county} County. ${Math.round((Number(fire.acres) || 0) * 0.4047)} hectares, ${fire.containment}% contained.\n\nIf local authorities issue an evacuation order, this is serious — grab your go-bag and leave immediately. Head to your designated meeting spot${meetSpotGuidance}. If you haven't set one up yet, do it now at rallypack.tech/Resources. Text your family where you're going (texts use less bandwidth than calls). Follow official evacuation routes only.`,
              type: 'alert',
              read: false,
              metadata: {
                wildfire_id: fire.id,
                distance_km: Math.round(distance),
                county: fire.county,
                acres: fire.acres
              }
            });
          }
        }
      }
    }

    // Bulk create alerts
    if (alertsToCreate.length > 0) {
      await base44.asServiceRole.entities.Notification.bulkCreate(alertsToCreate);
    }

    return Response.json({
      success: true,
      alertsCreated: alertsToCreate.length,
      wildfiresChecked: wildfires.length,
      profilesChecked: profiles.length
    });
  } catch (error) {
    console.error('Error checking wildfire alerts:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});