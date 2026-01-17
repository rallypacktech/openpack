import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's location from profile to show nearby shelters
    const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
    const userState = profiles.length > 0 ? profiles[0].state_province : null;

    // Fetch all shelters, optionally filter by state
    let shelters;
    if (userState) {
      shelters = await base44.entities.Shelter.filter({ state: userState });
    } else {
      shelters = await base44.entities.Shelter.list('-created_date', 50);
    }

    // Calculate distance if user has coordinates
    if (profiles.length > 0 && profiles[0].latitude && profiles[0].longitude) {
      const userLat = profiles[0].latitude;
      const userLon = profiles[0].longitude;

      shelters = shelters.map(shelter => {
        if (shelter.latitude && shelter.longitude) {
          // Calculate distance using Haversine formula (in miles)
          const R = 3959; // Earth's radius in miles
          const dLat = (shelter.latitude - userLat) * Math.PI / 180;
          const dLon = (shelter.longitude - userLon) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(userLat * Math.PI / 180) * Math.cos(shelter.latitude * Math.PI / 180) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;

          return {
            ...shelter,
            distance: Math.round(distance * 10) / 10 // Round to 1 decimal
          };
        }
        return shelter;
      }).sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
    }

    return Response.json({
      shelters,
      userState
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});