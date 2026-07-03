import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile for location
    const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
    const profile = profiles[0];

    if (!profile || !profile.latitude || !profile.longitude) {
      return Response.json({ 
        recommendations: [],
        message: "Add your address in Settings to get personalized meet spot recommendations"
      });
    }

    // Get existing meet spots to analyze coverage
    const meetSpots = await base44.entities.MeetSpot.filter({ created_by: user.email });

    const userLat = profile.latitude;
    const userLon = profile.longitude;

    // Calculate cardinal directions from home
    const getDirection = (lat, lon) => {
      const latDiff = lat - userLat;
      const lonDiff = lon - userLon;
      
      if (Math.abs(latDiff) > Math.abs(lonDiff)) {
        return latDiff > 0 ? 'N' : 'S';
      } else {
        return lonDiff > 0 ? 'E' : 'W';
      }
    };

    // Analyze coverage
    const coveredDirections = new Set();
    meetSpots.forEach(spot => {
      if (spot.latitude && spot.longitude) {
        const direction = getDirection(spot.latitude, spot.longitude);
        coveredDirections.add(direction);
      }
    });

    const allDirections = ['N', 'S', 'E', 'W'];
    const missingDirections = allDirections.filter(d => !coveredDirections.has(d));

    // Generate recommendations
    const recommendations = [];

    // Recommend based on FEMA region
    const femaGuidance = {
      'Region I': ['Community centers in higher elevation areas', 'Schools away from coastal zones'],
      'Region II': ['Public parks with open space', 'Schools in safer neighborhoods'],
      'Region III': ['Community centers', 'Shopping center parking lots'],
      'Region IV': ['Schools on higher ground', 'Community centers away from flood zones'],
      'Region V': ['Public libraries', 'Community centers with storm shelters'],
      'Region VI': ['Schools with storm shelters', 'Public buildings with basements'],
      'Region VII': ['Community centers', 'Public buildings with storm shelters'],
      'Region VIII': ['Schools in valley areas', 'Community centers'],
      'Region IX': ['Open parks away from buildings', 'Schools in seismically safe areas'],
      'Region X': ['Community centers', 'Public parks on stable ground']
    };

    const regionalRecs = femaGuidance[profile.fema_region] || ['Community centers', 'Public parks', 'Schools'];

    // Add directional coverage recommendations
    if (missingDirections.length > 0) {
      recommendations.push({
        type: 'coverage',
        title: 'Improve Directional Coverage',
        description: `FEMA recommends having meet spots in all cardinal directions. You're missing spots to the ${missingDirections.join(', ')}.`,
        suggestions: [
          `Find a safe location ${missingDirections[0] === 'N' ? 'north' : missingDirections[0] === 'S' ? 'south' : missingDirections[0] === 'E' ? 'east' : 'west'} of your home`,
          'Look for community centers, parks, or schools',
          'Choose locations 0.8-3 km from home'
        ]
      });
    }

    // Add regional recommendations
    recommendations.push({
      type: 'regional',
      title: `${profile.fema_region ? profile.fema_region + ' ' : 'Regional '}Recommendations`,
      description: 'Based on common disasters in your region, consider these types of locations:',
      suggestions: regionalRecs
    });

    // Distance recommendations
    const hasClose = meetSpots.some(spot => {
      if (!spot.latitude || !spot.longitude) return false;
      const distance = calculateDistance(userLat, userLon, spot.latitude, spot.longitude);
      return distance < 0.8;
    });

    const hasFar = meetSpots.some(spot => {
      if (!spot.latitude || !spot.longitude) return false;
      const distance = calculateDistance(userLat, userLon, spot.latitude, spot.longitude);
      return distance > 3;
    });

    if (!hasClose) {
      recommendations.push({
        type: 'distance',
        title: 'Add a Nearby Meet Spot',
        description: 'Have at least one spot within walking distance (0.4-0.8 km)',
        suggestions: [
          'Neighbor\'s house',
          'Corner store or mailbox',
          'Nearby park or playground'
        ]
      });
    }

    if (!hasFar) {
      recommendations.push({
        type: 'distance',
        title: 'Add a Distant Meet Spot',
        description: 'Have at least one spot outside your immediate neighborhood (2+ miles)',
        suggestions: [
          'Friend or family member\'s house in another area',
          'Community center in adjacent neighborhood',
          'Public building or landmark'
        ]
      });
    }

    return Response.json({
      recommendations,
      coverage: {
        covered: Array.from(coveredDirections),
        missing: missingDirections
      }
    });

  } catch (error) {
    console.error('Error generating meet spot recommendations:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// Calculate distance in kilometers between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}