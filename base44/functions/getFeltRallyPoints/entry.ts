import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { latitude, longitude } = await req.json();

    const FELT_API_KEY = Deno.env.get('FELT_API_KEY');
    const FELT_MAP_ID = Deno.env.get('FELT_MAP');

    if (!FELT_API_KEY || !FELT_MAP_ID) {
      return Response.json({ 
        error: 'Felt API not configured',
        rallyPoints: [],
        mapId: FELT_MAP_ID || null
      }, { status: 200 });
    }

    // Get map layers
    const layersResponse = await fetch(
      `https://felt.com/api/v2/maps/${FELT_MAP_ID}/layers`,
      {
        headers: {
          'Authorization': `Bearer ${FELT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!layersResponse.ok) {
      console.error('Failed to fetch Felt layers');
      return Response.json({ 
        rallyPoints: [],
        mapId: FELT_MAP_ID
      });
    }

    const layersData = await layersResponse.json();
    
    // Find rally points layer
    const rallyLayer = layersData.data?.find(layer => 
      layer.name?.toLowerCase().includes('rally') ||
      layer.name?.toLowerCase().includes('meet')
    );

    if (!rallyLayer) {
      return Response.json({ 
        rallyPoints: [],
        mapId: FELT_MAP_ID
      });
    }

    // Get features from the layer
    const featuresResponse = await fetch(
      `https://felt.com/api/v2/maps/${FELT_MAP_ID}/layers/${rallyLayer.id}/features`,
      {
        headers: {
          'Authorization': `Bearer ${FELT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!featuresResponse.ok) {
      console.error('Failed to fetch Felt features');
      return Response.json({ 
        rallyPoints: [],
        mapId: FELT_MAP_ID
      });
    }

    const featuresData = await featuresResponse.json();

    // Extract rally points
    const rallyPoints = featuresData.features?.map(feature => {
      const coords = feature.geometry?.type === 'Point' 
        ? feature.geometry.coordinates 
        : null;
      
      return {
        name: feature.properties?.name || feature.properties?.title || 'Rally Point',
        address: feature.properties?.address || feature.properties?.location || '',
        latitude: coords ? coords[1] : null,
        longitude: coords ? coords[0] : null,
        description: feature.properties?.description || ''
      };
    }).filter(point => point.latitude && point.longitude) || [];

    // Calculate distances if user location provided
    if (latitude && longitude) {
      rallyPoints.forEach(point => {
        const R = 6371; // Earth radius in kilometers
        const lat1 = latitude * Math.PI / 180;
        const lat2 = point.latitude * Math.PI / 180;
        const deltaLat = (point.latitude - latitude) * Math.PI / 180;
        const deltaLon = (point.longitude - longitude) * Math.PI / 180;

        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                  Math.cos(lat1) * Math.cos(lat2) *
                  Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        point.distance = R * c;
      });

      // Sort by distance and limit to 10 closest
      rallyPoints.sort((a, b) => a.distance - b.distance);
      rallyPoints.splice(10);
    }

    return Response.json({ 
      rallyPoints,
      mapId: FELT_MAP_ID
    });
  } catch (error) {
    console.error('Error in getFeltRallyPoints:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});