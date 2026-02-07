import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch active wildfire incidents from Texas A&M Forest Service ArcGIS
    // This queries their public feature service for current year wildfires
    const currentYear = new Date().getFullYear();
    const url = `https://services.arcgis.com/RPq7dvluE1pN5S2u/arcgis/rest/services/Current_Year_Wildfire_Statistics/FeatureServer/0/query`;
    
    const params = new URLSearchParams({
      where: `YEAR=${currentYear} AND STATUS='Active'`,
      outFields: '*',
      f: 'json',
      returnGeometry: 'true'
    });

    const response = await fetch(`${url}?${params}`);
    const data = await response.json();

    if (!data.features) {
      return Response.json({ wildfires: [] });
    }

    // Transform to our format
    const wildfires = data.features.map(feature => {
      const attrs = feature.attributes;
      const geom = feature.geometry;
      
      return {
        id: attrs.OBJECTID || attrs.INCIDENT_NUMBER,
        name: attrs.INCIDENT_NAME,
        county: attrs.COUNTY,
        acres: attrs.ACRES,
        containment: attrs.PERCENT_CONTAINED || 0,
        status: attrs.STATUS,
        startDate: attrs.DISCOVERY_DATE,
        latitude: geom?.y || geom?.latitude,
        longitude: geom?.x || geom?.longitude,
        cause: attrs.CAUSE,
        fuelType: attrs.FUEL_TYPE
      };
    });

    return Response.json({ wildfires });
  } catch (error) {
    console.error('Error fetching wildfires:', error);
    return Response.json({ 
      error: error.message,
      wildfires: [] 
    }, { status: 500 });
  }
});