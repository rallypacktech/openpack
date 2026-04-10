import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user already has SAMPLE caches
        const existingCaches = await base44.entities.EmergencyCache.filter({ created_by: user.email });
        const hasSampleCaches = existingCaches.some(cache => cache.name.includes('SAMPLE'));
        
        if (hasSampleCaches) {
            return Response.json({ 
                message: 'Sample caches already exist for this user',
                created: false 
            });
        }

        // Create SAMPLE Go Bag cache
        const goBagCache = await base44.entities.EmergencyCache.create({
            name: 'SAMPLE Go Bag',
            location: 'Bedroom Closet',
            description: 'A basic 72-hour emergency kit for quick evacuation'
        });

        // Create SAMPLE Automobile cache
        const autoCache = await base44.entities.EmergencyCache.create({
            name: 'SAMPLE Automobile',
            location: 'Car Trunk',
            description: 'Emergency supplies for vehicle breakdowns and roadside emergencies'
        });

        // Minimal starter items - most shown as recommendations
        const goBagItems = [
            { item_name: 'Flashlight', quantity: 2, category: 'tools', notes: 'Basic LED flashlight' },
            { item_name: 'Local maps', quantity: 1, category: 'documents', notes: 'Paper maps of area' }
        ];

        const automobileItems = [
            { item_name: 'Ice scraper and snow brush', quantity: 1, category: 'tools', notes: 'Basic winter tool' },
            { item_name: 'Tire pressure gauge', quantity: 1, category: 'tools', notes: 'Manual gauge' }
        ];

        // Add items to Go Bag
        const goBagItemsWithCache = goBagItems.map(item => ({
            ...item,
            cache_id: goBagCache.id
        }));
        await base44.entities.CacheItem.bulkCreate(goBagItemsWithCache);

        // Add items to Automobile cache
        const autoItemsWithCache = automobileItems.map(item => ({
            ...item,
            cache_id: autoCache.id
        }));
        await base44.entities.CacheItem.bulkCreate(autoItemsWithCache);

        return Response.json({ 
            success: true,
            message: 'Sample caches created successfully',
            caches: [goBagCache, autoCache],
            items_created: {
                go_bag: goBagItemsWithCache.length,
                automobile: autoItemsWithCache.length
            }
        });

    } catch (error) {
        console.error("Error creating sample caches:", error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});