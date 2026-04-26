import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Uses LLM + web context to suggest specific real nearby places as meet spots
 * for directions the user is missing coverage in.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
    const profile = profiles[0];

    if (!profile?.latitude || !profile?.longitude) {
      return Response.json({ suggestions: [], message: 'Add your home address in Settings first.' });
    }

    const meetSpots = await base44.entities.MeetSpot.filter({ created_by: user.email });
    const pets = await base44.entities.Pet.filter({ created_by: user.email });
    const hasPets = pets.length > 0;

    // Determine covered directions
    const getDirection = (lat, lon) => {
      const latDiff = lat - profile.latitude;
      const lonDiff = lon - profile.longitude;
      if (Math.abs(latDiff) > Math.abs(lonDiff)) return latDiff > 0 ? 'North' : 'South';
      return lonDiff > 0 ? 'East' : 'West';
    };

    const coveredDirections = new Set();
    meetSpots.forEach(spot => {
      if (spot.latitude && spot.longitude) {
        coveredDirections.add(getDirection(spot.latitude, spot.longitude));
      }
    });

    const allDirections = ['North', 'South', 'East', 'West'];
    const missingDirections = allDirections.filter(d => !coveredDirections.has(d));

    if (missingDirections.length === 0) {
      return Response.json({ suggestions: [], message: 'Great! You have coverage in all directions.' });
    }

    const locationDesc = [
      profile.city,
      profile.state_province,
      profile.country,
    ].filter(Boolean).join(', ');

    const prompt = `You are an emergency preparedness advisor helping someone in ${locationDesc} (coordinates: ${profile.latitude}, ${profile.longitude}).

They need emergency meet spot suggestions in these directions from their home: ${missingDirections.join(', ')}.
${hasPets ? 'They have pets — prioritize pet-friendly locations.' : ''}
${profile.fema_region ? `They are in FEMA ${profile.fema_region}.` : ''}

For each missing direction, suggest 2 specific, real types of locations that work well as emergency rally points in typical US neighborhoods/cities.
Include practical advice on what makes a good meet spot in that direction.
Be actionable and specific — name real categories of places (e.g. "24-hour Walmart", "public library", "fire station", "community park").`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          suggestions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                direction: { type: 'string' },
                place_type: { type: 'string', description: 'e.g. "Public Library", "Fire Station"' },
                why: { type: 'string', description: 'Why this is a good meet spot' },
                search_tip: { type: 'string', description: 'How to find one nearby, e.g. Google Maps search query' },
                pet_friendly: { type: 'boolean' },
              },
            },
          },
        },
      },
    });

    return Response.json({
      suggestions: result.suggestions || [],
      missingDirections,
      coveredDirections: Array.from(coveredDirections),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});