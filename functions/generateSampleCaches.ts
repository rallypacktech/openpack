import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Authentication required' }, { status: 401 });
        }

        // Create three sample caches
        const caches = [
            {
                name: "Sample Go Bag",
                location: "Front Closet",
                description: "Quick-grab emergency bag for evacuations"
            },
            {
                name: "Sample Automobile Kit",
                location: "Car Trunk",
                description: "Emergency supplies for vehicle breakdowns"
            },
            {
                name: "Sample Home Cache",
                location: "Basement",
                description: "Shelter-in-place supplies for extended emergencies"
            }
        ];

        const createdCaches = await base44.entities.EmergencyCache.bulkCreate(caches);

        // Add starter items to Go Bag
        const goBagItems = [
            { cache_id: createdCaches[0].id, item_name: "Water bottles (3 gallons)", quantity: 3, category: "water" },
            { cache_id: createdCaches[0].id, item_name: "Energy bars", quantity: 12, category: "food" },
            { cache_id: createdCaches[0].id, item_name: "Emergency radio", quantity: 1, category: "communication" },
            { cache_id: createdCaches[0].id, item_name: "Flashlight", quantity: 2, category: "tools" }
        ];

        // Add starter items to Automobile Kit
        const autoItems = [
            { cache_id: createdCaches[1].id, item_name: "Jumper cables", quantity: 1, category: "tools" },
            { cache_id: createdCaches[1].id, item_name: "Flashlight", quantity: 1, category: "tools" },
            { cache_id: createdCaches[1].id, item_name: "Road flares", quantity: 3, category: "tools" },
            { cache_id: createdCaches[1].id, item_name: "Bottled water", quantity: 4, category: "water" }
        ];

        // Add starter items to Home Cache
        const homeItems = [
            { cache_id: createdCaches[2].id, item_name: "Water (5 gallons)", quantity: 5, category: "water" },
            { cache_id: createdCaches[2].id, item_name: "Canned goods", quantity: 20, category: "food" },
            { cache_id: createdCaches[2].id, item_name: "Manual can opener", quantity: 1, category: "tools" },
            { cache_id: createdCaches[2].id, item_name: "Batteries", quantity: 24, category: "tools" }
        ];

        await base44.entities.CacheItem.bulkCreate([...goBagItems, ...autoItems, ...homeItems]);

        return Response.json({ 
            success: true,
            message: 'Sample caches created successfully',
            caches: createdCaches.map(c => ({ id: c.id, name: c.name }))
        });

    } catch (error) {
        console.error("Error creating sample caches:", error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});