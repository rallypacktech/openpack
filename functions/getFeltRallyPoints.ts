import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { latitude, longitude } = await req.json();
    
    const feltToken = Deno.env.get("base_recommendedRallyPoints");
    const feltMapId = Deno.env.get("FELT_MAP");
    
    if (!feltToken || !feltMapId) {
      return Response.json({ error: 'Felt configuration missing' }, { status: 500 });
    }

    // Fetch map layers
    const layersResponse = await fetch(
      `https://felt.com/api/v2/maps/${feltMapId}/layers`,
      {
        headers: {
          'Authorization': `Bearer ${feltToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!layersResponse.ok) {
      return Response.json({ error: 'Failed to fetch layers' }, { status: layersResponse.status });
    }

    const layers = await layersResponse.json();
    
    // Find rally points layer
    const rallyPointsLayer = layers.data?.find(layer => 
      layer.name?.toLowerCase().includes('rally') || 
      layer.name?.toLowerCase().includes('meet')
    );

    if (!rallyPointsLayer) {
      return Response.json({ rallyPoints: [] });
    }

    // Fetch features from the layer
    const featuresResponse = await fetch(
      `https://felt.com/api/v2/maps/${feltMapId}/layers/${rallyPointsLayer.id}/features`,
      {
        headers: {
          'Authorization': `Bearer ${feltToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!featuresResponse.ok) {
      return Response.json({ error: 'Failed to fetch features' }, { status: featuresResponse.status });
    }

    const features = await featuresResponse.json();
    
    // Parse rally points and calculate distance if user location provided
    const rallyPoints = (features.data || []).map(feature => {
      const coords = feature.geometry?.coordinates;
      const props = feature.properties || {};
      
      let distance = null;
      if (latitude && longitude && coords) {
        const [lng, lat] = coords;
        // Haversine formula for distance
        const R = 3959; // Earth radius in miles
        const dLat = (lat - latitude) * Math.PI / 180;
        const dLon = (lng - longitude) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        distance = R * c;
      }
      
      return {
        name: props.name || props.title || 'Unnamed Location',
        address: props.address || props.description || '',
        latitude: coords?.[1],
        longitude: coords?.[0],
        description: props.description || props.notes || '',
        distance: distance
      };
    });

    // Sort by distance if available
    if (latitude && longitude) {
      rallyPoints.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    }

    return Response.json({ 
      rallyPoints: rallyPoints.slice(0, 10), // Top 10 closest
      mapId: feltMapId 
    });

  } catch (error) {
    console.error("Error fetching Felt rally points:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});