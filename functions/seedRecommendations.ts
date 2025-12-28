import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        // Check if recommendations already exist
        const existing = await base44.entities.ProductRecommendation.list();
        if (existing.length > 0) {
            return Response.json({ 
                message: 'Recommendations already exist',
                count: existing.length 
            });
        }

        // Go Bag Recommendations
        const goBagRecs = [
            {
                item_name: "Premium 72-Hour Emergency Food Kit",
                category: "food",
                cache_type: "go_bag",
                description: "Complete 3-day food supply with variety of meals",
                quantity: 1,
                price_cents: 4999,
                priority: 100,
                active: true
            },
            {
                item_name: "Emergency Water Pouches (12 pack)",
                category: "water",
                cache_type: "go_bag",
                description: "Lightweight 4oz water pouches, 5-year shelf life",
                quantity: 12,
                price_cents: 1499,
                priority: 95,
                active: true
            },
            {
                item_name: "Comprehensive First Aid Kit (200pc)",
                category: "medical",
                cache_type: "go_bag",
                description: "Complete medical supplies for emergencies",
                quantity: 1,
                price_cents: 3499,
                priority: 90,
                active: true
            },
            {
                item_name: "Emergency Crank Radio with Flashlight",
                category: "communication",
                cache_type: "go_bag",
                description: "Hand-crank powered NOAA weather radio",
                quantity: 1,
                price_cents: 2999,
                priority: 85,
                active: true
            },
            {
                item_name: "Emergency Sleeping Bag (Thermal)",
                category: "clothing",
                cache_type: "go_bag",
                description: "Compact thermal sleeping bag for warmth",
                quantity: 2,
                price_cents: 1999,
                priority: 80,
                active: true
            },
            {
                item_name: "Multi-Tool Survival Kit",
                category: "tools",
                cache_type: "go_bag",
                description: "Includes pliers, knife, screwdriver, can opener",
                quantity: 1,
                price_cents: 2499,
                priority: 75,
                active: true
            },
            {
                item_name: "Portable Phone Charger (20000mAh)",
                category: "communication",
                cache_type: "go_bag",
                description: "High-capacity power bank for devices",
                quantity: 1,
                price_cents: 2999,
                priority: 70,
                active: true
            },
            {
                item_name: "Emergency Whistles (2-pack)",
                category: "tools",
                cache_type: "go_bag",
                description: "Loud safety whistles for signaling",
                quantity: 2,
                price_cents: 899,
                priority: 65,
                active: true
            }
        ];

        // Automobile Recommendations
        const autoRecs = [
            {
                item_name: "Roadside Emergency Kit",
                category: "tools",
                cache_type: "automobile",
                description: "Includes jumper cables, flares, first aid",
                quantity: 1,
                price_cents: 4999,
                priority: 100,
                active: true
            },
            {
                item_name: "Emergency Road Flares (6-pack)",
                category: "tools",
                cache_type: "automobile",
                description: "Bright LED flares visible for miles",
                quantity: 6,
                price_cents: 2499,
                priority: 95,
                active: true
            },
            {
                item_name: "Portable Tire Inflator",
                category: "tools",
                cache_type: "automobile",
                description: "12V air compressor with pressure gauge",
                quantity: 1,
                price_cents: 3499,
                priority: 90,
                active: true
            },
            {
                item_name: "Boxed Emergency Water (12 pack)",
                category: "water",
                cache_type: "automobile",
                description: "Long-lasting boxed water for vehicles",
                quantity: 12,
                price_cents: 1999,
                priority: 85,
                active: true
            },
            {
                item_name: "Emergency Thermal Blankets (4-pack)",
                category: "clothing",
                cache_type: "automobile",
                description: "Compact mylar blankets retain body heat",
                quantity: 4,
                price_cents: 1299,
                priority: 80,
                active: true
            },
            {
                item_name: "Collapsible Snow Shovel",
                category: "tools",
                cache_type: "automobile",
                description: "Portable shovel for winter emergencies",
                quantity: 1,
                price_cents: 1999,
                priority: 75,
                active: true
            },
            {
                item_name: "Car Emergency Fire Extinguisher",
                category: "tools",
                cache_type: "automobile",
                description: "5-lb ABC-type extinguisher with mount",
                quantity: 1,
                price_cents: 2999,
                priority: 70,
                active: true
            },
            {
                item_name: "Emergency Food Bars (12-pack)",
                category: "food",
                cache_type: "automobile",
                description: "High-calorie energy bars, 5-year shelf life",
                quantity: 12,
                price_cents: 1499,
                priority: 65,
                active: true
            }
        ];

        // Create all recommendations
        const allRecs = [...goBagRecs, ...autoRecs];
        await base44.entities.ProductRecommendation.bulkCreate(allRecs);

        return Response.json({ 
            success: true,
            message: 'Product recommendations seeded successfully',
            created: allRecs.length,
            breakdown: {
                go_bag: goBagRecs.length,
                automobile: autoRecs.length
            }
        });

    } catch (error) {
        console.error("Error seeding recommendations:", error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});