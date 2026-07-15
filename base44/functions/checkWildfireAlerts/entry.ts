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
            alertsToCreate.push({
              created_by: profile.created_by,
              title: `Wildfire Alert: ${fire.name}`,
              message: `Active wildfire ${Math.round(distance)} km from your location in ${fire.county} County. ${Math.round((Number(fire.acres) || 0) * 0.4047)} hectares, ${fire.containment}% contained. Stay alert and follow local authorities.`,
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