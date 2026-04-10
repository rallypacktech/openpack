import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Authentication required' }, { status: 401 });
        }

        // Fetch user data for personalization
        const [familyMembers, pets, userProfiles] = await Promise.all([
            base44.entities.FamilyMember.list(),
            base44.entities.Pet.list(),
            base44.entities.UserProfile.list()
        ]);

        const userProfile = userProfiles[0];
        const climateZone = userProfile?.climate_zone || 'temperate';

        // Count adults and children
        const adults = familyMembers.filter(m => (m.age || 18) >= 18).length + 1; // +1 for user
        const children = familyMembers.filter(m => (m.age || 18) < 18).length;
        
        // Count cats and dogs
        const cats = pets.filter(p => p.species === 'cat').length;
        const dogs = pets.filter(p => p.species === 'dog').length;

        // Check if recommendations already exist
        const existing = await base44.entities.ProductRecommendation.list();
        if (existing.length > 0) {
            return Response.json({ 
                message: 'Recommendations already exist',
                count: existing.length 
            });
        }

        // Static Go Bag Recommendations
        const goBagRecs = [
            {
                item_name: "Water (1 gallon per person per day)",
                category: "water",
                cache_type: "go_bag",
                description: "At least 3-day supply for evacuation, 2 weeks for home",
                quantity: 3,
                price_cents: 1299,
                stripe_product_id: "prod_sample_water",
                priority: 100,
                active: true
            },
            {
                item_name: "Non-perishable food (3-day supply)",
                category: "food",
                cache_type: "go_bag",
                description: "Ready-to-eat meals, canned goods, energy bars",
                quantity: 1,
                price_cents: 4999,
                stripe_product_id: "prod_sample_food",
                priority: 95,
                active: true
            },
            {
                item_name: "Battery-powered or hand crank radio (NOAA)",
                category: "communication",
                cache_type: "go_bag",
                description: "Emergency radio with weather alerts",
                quantity: 1,
                price_cents: 2999,
                stripe_product_id: "prod_sample_radio",
                priority: 90,
                active: true
            },
            {
                item_name: "Extra batteries",
                category: "tools",
                cache_type: "go_bag",
                description: "Various sizes for all devices",
                quantity: 1,
                price_cents: 1999,
                stripe_product_id: "prod_sample_batteries",
                priority: 80,
                active: true
            },
            {
                item_name: "Whistle (to signal for help)",
                category: "tools",
                cache_type: "go_bag",
                description: "Loud emergency whistle for each person",
                quantity: 2,
                price_cents: 899,
                stripe_product_id: "prod_sample_whistle",
                priority: 75,
                active: true
            },
            {
                item_name: "Dust mask",
                category: "hygiene",
                cache_type: "go_bag",
                description: "N95 masks to filter contaminated air",
                quantity: 4,
                price_cents: 1499,
                stripe_product_id: "prod_sample_masks",
                priority: 70,
                active: true
            },
            {
                item_name: "Plastic sheeting and duct tape",
                category: "tools",
                cache_type: "go_bag",
                description: "For shelter-in-place scenarios",
                quantity: 1,
                price_cents: 1999,
                stripe_product_id: "prod_sample_sheeting",
                priority: 65,
                active: true
            },
            {
                item_name: "Moist towelettes and garbage bags",
                category: "hygiene",
                cache_type: "go_bag",
                description: "Personal sanitation supplies",
                quantity: 1,
                price_cents: 1299,
                stripe_product_id: "prod_sample_sanitation",
                priority: 60,
                active: true
            },
            {
                item_name: "Wrench or pliers",
                category: "tools",
                cache_type: "go_bag",
                description: "To turn off utilities if needed",
                quantity: 1,
                price_cents: 1799,
                stripe_product_id: "prod_sample_wrench",
                priority: 55,
                active: true
            },
            {
                item_name: "Manual can opener",
                category: "tools",
                cache_type: "go_bag",
                description: "For canned food",
                quantity: 1,
                price_cents: 599,
                stripe_product_id: "prod_sample_opener",
                priority: 50,
                active: true
            },
            {
                item_name: "Cell phone with chargers and backup battery",
                category: "communication",
                cache_type: "go_bag",
                description: "Portable power bank 20000mAh",
                quantity: 1,
                price_cents: 2999,
                stripe_product_id: "prod_sample_charger",
                priority: 45,
                active: true
            },
            {
                item_name: "Waterproof matches",
                category: "tools",
                cache_type: "go_bag",
                description: "Essential for fire starting in wet conditions",
                quantity: 1,
                price_cents: 799,
                stripe_product_id: "prod_sample_matches",
                priority: 40,
                active: true
            },
            {
                item_name: "Firestarter stick",
                category: "tools",
                cache_type: "go_bag",
                description: "Reliable fire starting tool",
                quantity: 1,
                price_cents: 1299,
                stripe_product_id: "prod_sample_firestarter",
                priority: 39,
                active: true
            }
        ];

        // Dynamic Go Bag Recommendations
        const dynamicGoBagRecs = [];

        // Emergency hammock for each adult and child
        const totalPeople = adults + children;
        if (totalPeople > 0) {
            dynamicGoBagRecs.push({
                item_name: "Emergency hammock",
                category: "other",
                cache_type: "go_bag",
                description: `Lightweight emergency hammock (${totalPeople} needed)`,
                quantity: totalPeople,
                price_cents: 1999,
                stripe_product_id: "prod_sample_hammock",
                priority: 38,
                active: true
            });
        }

        // Neon collar/harness and leash for each cat or dog
        const totalCatsAndDogs = cats + dogs;
        if (totalCatsAndDogs > 0) {
            dynamicGoBagRecs.push({
                item_name: "Neon collar or harness and leash",
                category: "other",
                cache_type: "go_bag",
                description: `High-visibility pet collar/harness with leash (${totalCatsAndDogs} needed)`,
                quantity: totalCatsAndDogs,
                price_cents: 1499,
                stripe_product_id: "prod_sample_pet_collar",
                priority: 37,
                active: true
            });
        }

        // Nail clippers if any family members
        if (familyMembers.length > 0) {
            dynamicGoBagRecs.push({
                item_name: "Nail clippers",
                category: "hygiene",
                cache_type: "go_bag",
                description: "Essential grooming tool for emergency kits",
                quantity: 1,
                price_cents: 599,
                stripe_product_id: "prod_sample_nail_clippers",
                priority: 36,
                active: true
            });
        }

        // Pet nail clippers if any pets
        if (pets.length > 0) {
            dynamicGoBagRecs.push({
                item_name: "Pet nail clippers",
                category: "other",
                cache_type: "go_bag",
                description: "Specialized nail clippers for pets",
                quantity: 1,
                price_cents: 899,
                stripe_product_id: "prod_sample_pet_nail_clippers",
                priority: 35,
                active: true
            });
        }

        // Climate-specific first aid additions
        if (climateZone === 'cold') {
            dynamicGoBagRecs.push({
                item_name: "Emergency blanket (for first aid kit)",
                category: "medical",
                cache_type: "go_bag",
                description: "Thermal blanket for cold weather emergencies",
                quantity: 2,
                price_cents: 999,
                stripe_product_id: "prod_sample_thermal_blanket",
                priority: 34,
                active: true
            });
        } else if (climateZone === 'warm') {
            dynamicGoBagRecs.push({
                item_name: "Snake bite kit (for first aid kit)",
                category: "medical",
                cache_type: "go_bag",
                description: "Essential for warm climate areas with snake presence",
                quantity: 1,
                price_cents: 1899,
                stripe_product_id: "prod_sample_snake_kit",
                priority: 34,
                active: true
            });
        }

        // Automobile Recommendations (unchanged)
        const autoRecs = [
            {
                item_name: "Jumper cables",
                category: "tools",
                cache_type: "automobile",
                description: "Heavy-duty cables for dead battery",
                quantity: 1,
                price_cents: 2999,
                stripe_product_id: "prod_sample_jumper",
                priority: 100,
                active: true
            },
            {
                item_name: "Flashlight with extra batteries",
                category: "tools",
                cache_type: "automobile",
                description: "Bright LED flashlight for roadside emergencies",
                quantity: 1,
                price_cents: 1999,
                stripe_product_id: "prod_sample_flashlight",
                priority: 95,
                active: true
            },
            {
                item_name: "Road flares or reflective triangles",
                category: "tools",
                cache_type: "automobile",
                description: "Warning devices for visibility",
                quantity: 3,
                price_cents: 2499,
                stripe_product_id: "prod_sample_flares",
                priority: 90,
                active: true
            },
            {
                item_name: "Bottled water",
                category: "water",
                cache_type: "automobile",
                description: "Emergency drinking water supply",
                quantity: 4,
                price_cents: 999,
                stripe_product_id: "prod_sample_auto_water",
                priority: 80,
                active: true
            },
            {
                item_name: "Non-perishable snacks",
                category: "food",
                cache_type: "automobile",
                description: "Energy bars and dried foods",
                quantity: 1,
                price_cents: 1499,
                stripe_product_id: "prod_sample_auto_snacks",
                priority: 75,
                active: true
            },
            {
                item_name: "Blanket or emergency thermal blanket",
                category: "clothing",
                cache_type: "automobile",
                description: "Stay warm in cold weather breakdowns",
                quantity: 2,
                price_cents: 1999,
                stripe_product_id: "prod_sample_blanket",
                priority: 70,
                active: true
            },
            {
                item_name: "Jack and lug wrench",
                category: "tools",
                cache_type: "automobile",
                description: "Essential for tire changes",
                quantity: 1,
                price_cents: 3999,
                stripe_product_id: "prod_sample_jack",
                priority: 65,
                active: true
            },
            {
                item_name: "Spare tire (properly inflated)",
                category: "tools",
                cache_type: "automobile",
                description: "Full-size or compact spare",
                quantity: 1,
                price_cents: 8999,
                stripe_product_id: "prod_sample_spare",
                priority: 60,
                active: true
            },
            {
                item_name: "Emergency phone charger",
                category: "communication",
                cache_type: "automobile",
                description: "Car USB adapter and cables",
                quantity: 1,
                price_cents: 1999,
                stripe_product_id: "prod_sample_car_charger",
                priority: 55,
                active: true
            }
        ];

        // Combine all recommendations
        const allRecs = [...goBagRecs, ...dynamicGoBagRecs, ...autoRecs];
        await base44.entities.ProductRecommendation.bulkCreate(allRecs);

        return Response.json({ 
            success: true,
            message: 'Product recommendations seeded successfully',
            created: allRecs.length,
            breakdown: {
                go_bag: goBagRecs.length + dynamicGoBagRecs.length,
                go_bag_static: goBagRecs.length,
                go_bag_dynamic: dynamicGoBagRecs.length,
                automobile: autoRecs.length
            },
            personalization: {
                adults,
                children,
                cats,
                dogs,
                climate_zone: climateZone
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