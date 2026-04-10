import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Authentication required' }, { status: 401 });
        }

        // Fetch current medical/first aid recommendations
        const recommendations = await base44.entities.ProductRecommendation.filter({ 
            category: "medical",
            active: true 
        });

        // Fetch user profile to determine climate zone
        const userProfiles = await base44.entities.UserProfile.list();
        const climateZone = userProfiles[0]?.climate_zone || 'temperate';

        // Create base first aid items for all categories
        const firstAidItems = [
            {
                name: "Adhesive bandages (various sizes)",
                category: "adults",
                quantity: 50,
                owned: false,
                notes: "Assorted sizes for cuts and scrapes"
            },
            {
                name: "Sterile gauze pads",
                category: "adults",
                quantity: 10,
                owned: false,
                notes: "4x4 inch pads"
            },
            {
                name: "Medical tape",
                category: "adults",
                quantity: 2,
                owned: false
            },
            {
                name: "Antiseptic wipes",
                category: "adults",
                quantity: 20,
                owned: false
            },
            {
                name: "Antibiotic ointment",
                category: "adults",
                quantity: 2,
                owned: false
            },
            {
                name: "Pain relievers (ibuprofen/acetaminophen)",
                category: "adults",
                quantity: 1,
                owned: false,
                notes: "Check expiration dates regularly"
            },
            {
                name: "Tweezers",
                category: "adults",
                quantity: 1,
                owned: false
            },
            {
                name: "Scissors (medical)",
                category: "adults",
                quantity: 1,
                owned: false
            },
            {
                name: "Instant cold pack",
                category: "adults",
                quantity: 2,
                owned: false
            },
            {
                name: "Children's pain reliever",
                category: "youth",
                quantity: 1,
                owned: false,
                notes: "Age-appropriate dosing"
            },
            {
                name: "Pediatric bandages (character designs)",
                category: "youth",
                quantity: 20,
                owned: false
            },
            {
                name: "Pet wound spray",
                category: "pets",
                quantity: 1,
                owned: false
            },
            {
                name: "Pet gauze wrap",
                category: "pets",
                quantity: 2,
                owned: false
            }
        ];

        // Add climate-specific items
        if (climateZone === 'cold') {
            firstAidItems.push({
                name: "Emergency thermal blanket",
                category: "adults",
                quantity: 2,
                owned: false,
                notes: "For cold weather emergencies"
            });
        } else if (climateZone === 'warm') {
            firstAidItems.push({
                name: "Snake bite kit",
                category: "adults",
                quantity: 1,
                owned: false,
                notes: "Essential for warm climates with snake presence"
            });
        }

        await base44.entities.FirstAidItem.bulkCreate(firstAidItems);

        return Response.json({ 
            success: true,
            message: 'Sample first aid items created successfully',
            created: firstAidItems.length,
            climate_zone: climateZone
        });

    } catch (error) {
        console.error("Error creating sample first aid items:", error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});