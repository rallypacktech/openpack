import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile for FEMA region
    const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
    const userProfile = profiles[0];

    // Get family members and pets
    const [familyMembers, pets, existingCaches] = await Promise.all([
      base44.entities.FamilyMember.filter({ created_by: user.email }),
      base44.entities.Pet.filter({ created_by: user.email }),
      base44.entities.EmergencyCache.list()
    ]);

    // Check if user already has sample caches
    const hasSampleCaches = existingCaches.some(cache => 
      cache.created_by === user.email && cache.name.includes('SAMPLE')
    );

    if (hasSampleCaches) {
      return Response.json({ error: 'Sample caches already exist' }, { status: 400 });
    }

    // Create sample caches
    const goBag = await base44.entities.EmergencyCache.create({
      name: "SAMPLE Go Bag",
      location: "Front Closet",
      description: "72-hour emergency kit for quick evacuation"
    });

    const autoBag = await base44.entities.EmergencyCache.create({
      name: "SAMPLE Automobile",
      location: "Trunk",
      description: "Emergency supplies kept in vehicle"
    });

    // Base items for everyone
    const baseGoItems = [
      { item_name: "Water bottles (1 gallon per person)", quantity: 3, category: "water" },
      { item_name: "Non-perishable food (3-day supply)", quantity: 1, category: "food" },
      { item_name: "First aid kit", quantity: 1, category: "medical" },
      { item_name: "Flashlight with batteries", quantity: 1, category: "tools" },
      { item_name: "Emergency blanket", quantity: 1, category: "other" },
      { item_name: "Portable phone charger", quantity: 1, category: "communication" }
    ];

    const baseAutoItems = [
      { item_name: "Jumper cables", quantity: 1, category: "tools" },
      { item_name: "Tire pressure gauge", quantity: 1, category: "tools" },
      { item_name: "Basic tool kit", quantity: 1, category: "tools" },
      { item_name: "Emergency flares", quantity: 3, category: "other" },
      { item_name: "Water bottles", quantity: 6, category: "water" },
      { item_name: "Granola bars", quantity: 12, category: "food" }
    ];

    // Add region-specific items
    if (userProfile?.fema_region) {
      const region = userProfile.fema_region;
      
      if (['California', 'Southwest', 'Pacific Northwest', 'Rocky Mountain'].includes(region)) {
        baseGoItems.push({ item_name: "N95 respirator masks (wildfire smoke)", quantity: 4, category: "medical" });
        baseAutoItems.push({ item_name: "Fire extinguisher", quantity: 1, category: "tools" });
      }
      
      if (['Gulf Coast', 'Southeast', 'Texas'].includes(region)) {
        baseGoItems.push({ item_name: "Waterproof document pouch", quantity: 1, category: "documents" });
        baseGoItems.push({ item_name: "Rain poncho", quantity: 2, category: "clothing" });
        baseAutoItems.push({ item_name: "Emergency tow strap", quantity: 1, category: "tools" });
      }
      
      if (['Midwest', 'Northeast', 'Alaska'].includes(region)) {
        baseGoItems.push({ item_name: "Thermal blankets", quantity: 2, category: "clothing" });
        baseGoItems.push({ item_name: "Hand warmers", quantity: 6, category: "other" });
        baseAutoItems.push({ item_name: "Ice scraper", quantity: 1, category: "tools" });
      }
    }

    // Add pet-specific items
    if (pets.length > 0) {
      pets.forEach(pet => {
        const petType = pet.species.toLowerCase();
        baseGoItems.push({ 
          item_name: `${pet.name}'s food (3-day supply)`, 
          quantity: 1, 
          category: "food",
          notes: `For ${petType}`
        });
        
        if (petType === 'dog') {
          baseGoItems.push({ 
            item_name: `Leash and collar for ${pet.name}`, 
            quantity: 1, 
            category: "other" 
          });
        } else if (petType === 'cat') {
          baseGoItems.push({ 
            item_name: `Carrier for ${pet.name}`, 
            quantity: 1, 
            category: "other" 
          });
        }
      });
    }

    // Create cache items
    await Promise.all([
      ...baseGoItems.map(item => 
        base44.entities.CacheItem.create({ ...item, cache_id: goBag.id })
      ),
      ...baseAutoItems.map(item => 
        base44.entities.CacheItem.create({ ...item, cache_id: autoBag.id })
      )
    ]);

    // Generate initial recommendations based on what's missing
    const allRecommendations = await base44.entities.ProductRecommendation.filter({ active: true });
    
    // Create notifications for missing critical items
    const criticalItems = [];
    
    if (familyMembers.length > 1) {
      criticalItems.push({
        title: 'Family Communication Plan',
        message: `You have ${familyMembers.length + 1} family members. Make sure everyone knows your emergency meet spots and contact information.`,
        type: 'warning'
      });
    }

    if (pets.length > 0) {
      criticalItems.push({
        title: 'Pet Emergency Records',
        message: 'Keep copies of vaccination records, recent photos, and microchip numbers in your emergency documents.',
        type: 'info'
      });
    }

    await Promise.all(
      criticalItems.map(notif => 
        base44.entities.Notification.create(notif)
      )
    );

    return Response.json({ 
      success: true,
      message: 'Sample caches created with location-specific and family-tailored items'
    });

  } catch (error) {
    console.error("Error generating sample caches:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});