import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { state, latitude, longitude } = await req.json();

    const shelters = [];
    let source = [];

    // Try FEMA Disaster Declarations API to find active disasters
    try {
      const femaUrl = 'https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries?$filter=declarationDate%20ge%20%272024-01-01%27&$top=50';
      
      const femaResponse = await fetch(femaUrl, {
        headers: { 'Accept': 'application/json' }
      });

      if (femaResponse.ok) {
        const femaData = await femaResponse.json();
        source.push('FEMA Disaster Declarations API');

        // Process active disasters
        if (femaData.DisasterDeclarationsSummaries) {
          for (const disaster of femaData.DisasterDeclarationsSummaries.slice(0, 10)) {
            if (state && disaster.state !== state) continue;

            const shelter = {
              name: `${disaster.declarationTitle} Relief Center`,
              address: 'Multiple locations',
              city: disaster.designatedArea || 'Various',
              state: disaster.state || state || 'Multiple States',
              zip_code: '',
              is_open: true,
              disaster_type: disaster.incidentType || 'Emergency',
              data_source: 'FEMA',
              external_id: disaster.disasterNumber,
              capacity: 200,
              current_occupancy: 0,
              pets_allowed: true,
              medical_services: true,
              phone: '1-800-621-3362', // FEMA helpline
              opened_date: disaster.declarationDate
            };

            shelters.push(shelter);
          }
        }
      }
    } catch (error) {
      console.error('FEMA API error:', error);
    }

    // Try getting coordinates from OpenStreetMap if we have state but no coordinates
    if (!latitude && state && shelters.length > 0) {
      try {
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?state=${encodeURIComponent(state)}&country=USA&format=json&limit=1`;
        const geocodeResponse = await fetch(geocodeUrl, {
          headers: { 'User-Agent': 'RallyPack/1.0' }
        });
        
        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json();
          if (geocodeData.length > 0) {
            shelters.forEach(shelter => {
              shelter.latitude = parseFloat(geocodeData[0].lat);
              shelter.longitude = parseFloat(geocodeData[0].lon);
            });
          }
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      }
    }

    // Save shelters to database
    let savedCount = 0;
    for (const shelter of shelters) {
      try {
        // Check if shelter already exists
        const existing = await base44.asServiceRole.entities.Shelter.filter({
          external_id: shelter.external_id
        });

        if (existing.length === 0) {
          await base44.asServiceRole.entities.Shelter.create(shelter);
          savedCount++;
        }
      } catch (error) {
        console.error('Error saving shelter:', error);
      }
    }

    return Response.json({
      success: true,
      message: `Fetched ${shelters.length} shelters, saved ${savedCount} new ones`,
      shelters: shelters,
      sources: source
    });

  } catch (error) {
    console.error('Error in fetchActiveShelters:', error);
    return Response.json({
      error: error.message,
      details: 'Failed to fetch emergency shelters from external APIs'
    }, { status: 500 });
  }
});