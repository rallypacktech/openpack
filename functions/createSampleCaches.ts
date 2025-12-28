import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user already has SAMPLE caches
        const existingCaches = await base44.entities.EmergencyCache.list();
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

        // Go Bag items based on ready.gov
        const goBagItems = [
            { item_name: 'Water (1 gallon per person per day)', quantity: 3, category: 'water' },
            { item_name: 'Non-perishable food (3-day supply)', quantity: 9, category: 'food' },
            { item_name: 'Battery-powered or hand crank radio', quantity: 1, category: 'communication' },
            { item_name: 'NOAA Weather Radio with tone alert', quantity: 1, category: 'communication' },
            { item_name: 'Flashlight', quantity: 2, category: 'tools' },
            { item_name: 'First aid kit', quantity: 1, category: 'medical' },
            { item_name: 'Extra batteries', quantity: 12, category: 'tools' },
            { item_name: 'Whistle to signal for help', quantity: 2, category: 'tools' },
            { item_name: 'Dust mask', quantity: 4, category: 'hygiene' },
            { item_name: 'Plastic sheeting and duct tape', quantity: 1, category: 'tools' },
            { item_name: 'Moist towelettes', quantity: 2, category: 'hygiene' },
            { item_name: 'Garbage bags and plastic ties', quantity: 10, category: 'hygiene' },
            { item_name: 'Wrench or pliers', quantity: 1, category: 'tools' },
            { item_name: 'Manual can opener', quantity: 1, category: 'tools' },
            { item_name: 'Local maps', quantity: 1, category: 'documents' },
            { item_name: 'Cell phone with chargers', quantity: 1, category: 'communication' },
            { item_name: 'Backup battery/power bank', quantity: 1, category: 'communication' },
            { item_name: 'Prescription medications', quantity: 1, category: 'medical', notes: 'Update regularly' },
            { item_name: 'Non-prescription pain relievers', quantity: 1, category: 'medical' },
            { item_name: 'Cash or travelers checks', quantity: 1, category: 'documents', notes: '$200 in small bills' },
            { item_name: 'Important family documents', quantity: 1, category: 'documents', notes: 'Waterproof container' },
            { item_name: 'Sleeping bag or blanket', quantity: 2, category: 'clothing' },
            { item_name: 'Complete change of clothing', quantity: 2, category: 'clothing' },
            { item_name: 'Fire extinguisher', quantity: 1, category: 'tools' },
            { item_name: 'Matches in waterproof container', quantity: 1, category: 'tools' },
            { item_name: 'Feminine supplies', quantity: 1, category: 'hygiene' },
            { item_name: 'Mess kits and utensils', quantity: 1, category: 'food' },
            { item_name: 'Paper and pencil', quantity: 1, category: 'documents' }
        ];

        // Automobile items
        const autoItems = [
            { item_name: 'Roadside flares or reflective triangles', quantity: 6, category: 'tools' },
            { item_name: 'Jumper cables', quantity: 1, category: 'tools' },
            { item_name: 'Tire pressure gauge', quantity: 1, category: 'tools' },
            { item_name: 'Tire repair kit and pump', quantity: 1, category: 'tools' },
            { item_name: 'Jack and lug wrench', quantity: 1, category: 'tools' },
            { item_name: 'Boxed water or bottled water', quantity: 6, category: 'water' },
            { item_name: 'Non-perishable snacks', quantity: 5, category: 'food', notes: 'Granola bars, trail mix' },
            { item_name: 'Blankets or sleeping bag', quantity: 2, category: 'clothing' },
            { item_name: 'Extra warm clothes', quantity: 2, category: 'clothing' },
            { item_name: 'First aid kit', quantity: 1, category: 'medical' },
            { item_name: 'Flashlight with extra batteries', quantity: 1, category: 'tools' },
            { item_name: 'Multi-tool or Swiss Army knife', quantity: 1, category: 'tools' },
            { item_name: 'Duct tape', quantity: 1, category: 'tools' },
            { item_name: 'Paper towels', quantity: 1, category: 'hygiene' },
            { item_name: 'Fire extinguisher (5-lb, ABC type)', quantity: 1, category: 'tools' },
            { item_name: 'Ice scraper and snow brush', quantity: 1, category: 'tools' },
            { item_name: 'Shovel (collapsible)', quantity: 1, category: 'tools' },
            { item_name: 'Sand or kitty litter (for traction)', quantity: 1, category: 'tools' },
            { item_name: 'Phone charger (car adapter)', quantity: 1, category: 'communication' },
            { item_name: 'Emergency contact list', quantity: 1, category: 'documents' },
            { item_name: 'Road maps', quantity: 1, category: 'documents' },
            { item_name: 'Whistle', quantity: 1, category: 'tools' }
        ];

        // Add items to Go Bag
        const goBagItemsWithCache = goBagItems.map(item => ({
            ...item,
            cache_id: goBagCache.id
        }));
        await base44.entities.CacheItem.bulkCreate(goBagItemsWithCache);

        // Add items to Automobile cache
        const autoItemsWithCache = autoItems.map(item => ({
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