import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { latitude, longitude, radius = 25 } = await req.json();

    if (!latitude || !longitude) {
      return Response.json({ 
        error: 'Latitude and longitude required',
        rallyPoints: []
      }, { status: 400 });
    }

    // Use Overpass API (OpenStreetMap) to find parks, community centers, and public spaces
    // Query for parks, community centers, schools, and other potential rally points
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"="community_centre"](around:${radius * 1609.34},${latitude},${longitude});
        node["leisure"="park"](around:${radius * 1609.34},${latitude},${longitude});
        node["amenity"="public_building"](around:${radius * 1609.34},${latitude},${longitude});
        node["amenity"="shelter"](around:${radius * 1609.34},${latitude},${longitude});
        way["leisure"="park"](around:${radius * 1609.34},${latitude},${longitude});
        way["amenity"="community_centre"](around:${radius * 1609.34},${latitude},${longitude});
      );
      out center;
    `;

    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
    
    const response = await fetch(overpassUrl);
    
    if (!response.ok) {
      throw new Error('Overpass API request failed');
    }

    const data = await response.json();
    
    // Process results
    const rallyPoints = data.elements.map(element => {
      const lat = element.lat || element.center?.lat;
      const lon = element.lon || element.center?.lon;
      
      if (!lat || !lon) return null;

      // Calculate distance
      const R = 3958.8; // Earth radius in miles
      const lat1 = latitude * Math.PI / 180;
      const lat2 = lat * Math.PI / 180;
      const deltaLat = (lat - latitude) * Math.PI / 180;
      const deltaLon = (lon - longitude) * Math.PI / 180;

      const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      // Determine type
      let type = 'Public Space';
      if (element.tags.leisure === 'park') type = 'Park';
      else if (element.tags.amenity === 'community_centre') type = 'Community Center';
      else if (element.tags.amenity === 'shelter') type = 'Public Shelter';
      else if (element.tags.amenity === 'public_building') type = 'Public Building';

      return {
        name: element.tags.name || `${type} (unnamed)`,
        type: type,
        latitude: lat,
        longitude: lon,
        distance: distance,
        address: element.tags['addr:full'] || 
                 [element.tags['addr:street'], element.tags['addr:city']].filter(Boolean).join(', ') || 
                 'Address not available',
        description: element.tags.description || '',
        accessibility: element.tags.wheelchair === 'yes' ? 'Wheelchair accessible' : ''
      };
    }).filter(point => point !== null);

    // Sort by distance and limit to 20 closest
    rallyPoints.sort((a, b) => a.distance - b.distance);
    const limitedPoints = rallyPoints.slice(0, 20);

    return Response.json({ 
      rallyPoints: limitedPoints,
      total: limitedPoints.length,
      source: 'OpenStreetMap via Overpass API'
    });

  } catch (error) {
    console.error('Error in getCommunityRallyPoints:', error);
    return Response.json({ 
      error: error.message,
      rallyPoints: []
    }, { status: 500 });
  }
});