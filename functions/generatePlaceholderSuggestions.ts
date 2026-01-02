import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const suggestions = [];

        // American Red Cross recommendations
        const redCrossItems = [
            { name: "Water - 1 gallon per person per day", category: "water", cache: "general", qty: 14, org: "American Red Cross", family: ["person"] },
            { name: "Non-perishable food (3-day supply)", category: "food", cache: "general", qty: 1, org: "American Red Cross", family: ["person"] },
            { name: "Battery-powered or hand crank radio", category: "communication", cache: "go_bag", qty: 1, org: "American Red Cross", family: ["person"] },
            { name: "Flashlight with extra batteries", category: "tools", cache: "go_bag", qty: 2, org: "American Red Cross", family: ["person"] },
            { name: "First aid kit (comprehensive)", category: "medical", cache: "general", qty: 1, org: "American Red Cross", family: ["person"] },
            { name: "7-day supply of medications", category: "medical", cache: "go_bag", qty: 1, org: "American Red Cross", family: ["person"] },
            { name: "Multi-purpose tool", category: "tools", cache: "go_bag", qty: 1, org: "American Red Cross", family: ["person"] },
            { name: "Sanitation and personal hygiene items", category: "hygiene", cache: "general", qty: 1, org: "American Red Cross", family: ["person"] },
            { name: "Copies of important documents", category: "documents", cache: "go_bag", qty: 1, org: "American Red Cross", family: ["person"] },
            { name: "Cell phone with chargers and backup battery", category: "communication", cache: "go_bag", qty: 1, org: "American Red Cross", family: ["person"] },
            { name: "Emergency blanket (mylar)", category: "clothing", cache: "go_bag", qty: 2, org: "American Red Cross", family: ["person"] },
            { name: "Local maps", category: "documents", cache: "automobile", qty: 1, org: "American Red Cross", family: ["person"] },
            { name: "Whistle to signal for help", category: "tools", cache: "go_bag", qty: 1, org: "American Red Cross", family: ["person"] },
            { name: "Dust mask to filter contaminated air", category: "medical", cache: "go_bag", qty: 5, org: "American Red Cross", family: ["person"] },
            { name: "Plastic sheeting and duct tape", category: "tools", cache: "general", qty: 1, org: "American Red Cross", family: ["person"] },
            { name: "Moist towelettes", category: "hygiene", cache: "go_bag", qty: 20, org: "American Red Cross", family: ["person"] },
            { name: "Garbage bags and plastic ties", category: "hygiene", cache: "general", qty: 10, org: "American Red Cross", family: ["person"] },
            { name: "Wrench or pliers to turn off utilities", category: "tools", cache: "general", qty: 1, org: "American Red Cross", family: ["person"] },
            { name: "Manual can opener", category: "tools", cache: "go_bag", qty: 1, org: "American Red Cross", family: ["person"] },
            { name: "Pet food and water (3-day supply)", category: "food", cache: "general", qty: 1, org: "American Red Cross", family: ["dog", "cat", "other"] },
        ];

        // REI Co-op / Outdoor preparedness
        const reiItems = [
            { name: "Sleeping bag (temperature rated)", category: "clothing", cache: "go_bag", qty: 1, org: "REI Co-op", family: ["person"] },
            { name: "Tent or emergency shelter", category: "tools", cache: "general", qty: 1, org: "REI Co-op", family: ["person"] },
            { name: "Water purification tablets", category: "water", cache: "go_bag", qty: 50, org: "REI Co-op", family: ["person"] },
            { name: "Portable water filter", category: "water", cache: "go_bag", qty: 1, org: "REI Co-op", family: ["person"] },
            { name: "Fire starter kit", category: "tools", cache: "go_bag", qty: 1, org: "REI Co-op", family: ["person"] },
            { name: "Waterproof matches", category: "tools", cache: "go_bag", qty: 2, org: "REI Co-op", family: ["person"] },
            { name: "Headlamp with extra batteries", category: "tools", cache: "go_bag", qty: 1, org: "REI Co-op", family: ["person"] },
            { name: "Solar charger for devices", category: "communication", cache: "go_bag", qty: 1, org: "REI Co-op", family: ["person"] },
            { name: "Paracord (50 feet)", category: "tools", cache: "go_bag", qty: 1, org: "REI Co-op", family: ["person"] },
            { name: "Emergency poncho", category: "clothing", cache: "go_bag", qty: 2, org: "REI Co-op", family: ["person"] },
            { name: "Trekking poles (for evacuation)", category: "tools", cache: "general", qty: 2, org: "REI Co-op", family: ["person"] },
            { name: "Backpack (65L evacuation pack)", category: "tools", cache: "go_bag", qty: 1, org: "REI Co-op", family: ["person"] },
            { name: "Insulated water bottle", category: "water", cache: "go_bag", qty: 2, org: "REI Co-op", family: ["person"] },
            { name: "Trail mix and energy bars", category: "food", cache: "go_bag", qty: 12, org: "REI Co-op", family: ["person"] },
            { name: "Camping cookware set", category: "tools", cache: "general", qty: 1, org: "REI Co-op", family: ["person"] },
        ];

        // NOAA / Weather preparedness
        const noaaItems = [
            { name: "NOAA Weather Radio (battery/crank)", category: "communication", cache: "general", qty: 1, org: "NOAA", family: ["person"] },
            { name: "Emergency weather alert radio", category: "communication", cache: "automobile", qty: 1, org: "NOAA", family: ["person"] },
            { name: "Lightning detector", category: "tools", cache: "general", qty: 1, org: "NOAA", family: ["person"], disasters: ["thunderstorm"] },
            { name: "Tornado safety kit", category: "tools", cache: "general", qty: 1, org: "NOAA", family: ["person"], disasters: ["tornado"] },
            { name: "Hurricane shutters or plywood", category: "tools", cache: "general", qty: 4, org: "NOAA", family: ["person"], disasters: ["hurricane"] },
            { name: "Sandbags for flooding", category: "tools", cache: "general", qty: 10, org: "NOAA", family: ["person"], disasters: ["flood"] },
            { name: "Sump pump (battery backup)", category: "tools", cache: "general", qty: 1, org: "NOAA", family: ["person"], disasters: ["flood"] },
            { name: "Winter storm car kit", category: "tools", cache: "automobile", qty: 1, org: "NOAA", family: ["person"], disasters: ["winter_storm"] },
            { name: "Ice scraper and snow brush", category: "tools", cache: "automobile", qty: 1, org: "NOAA", family: ["person"], disasters: ["winter_storm"] },
            { name: "Rock salt or sand for traction", category: "tools", cache: "automobile", qty: 1, org: "NOAA", family: ["person"], disasters: ["winter_storm"] },
        ];

        // FEMA recommendations
        const femaItems = [
            { name: "Emergency whistle (loud)", category: "tools", cache: "go_bag", qty: 2, org: "FEMA", family: ["person"] },
            { name: "Signal mirror", category: "tools", cache: "go_bag", qty: 1, org: "FEMA", family: ["person"] },
            { name: "Glow sticks", category: "tools", cache: "go_bag", qty: 10, org: "FEMA", family: ["person"] },
            { name: "Emergency contact card", category: "documents", cache: "go_bag", qty: 5, org: "FEMA", family: ["person"] },
            { name: "Cash and coins (small bills)", category: "documents", cache: "go_bag", qty: 1, org: "FEMA", family: ["person"] },
            { name: "Credit card and ATM card", category: "documents", cache: "go_bag", qty: 1, org: "FEMA", family: ["person"] },
            { name: "Prescription eyeglasses (spare)", category: "medical", cache: "go_bag", qty: 1, org: "FEMA", family: ["person"] },
            { name: "Infant formula and diapers", category: "food", cache: "general", qty: 1, org: "FEMA", family: ["person"] },
            { name: "Pet leash and carrier", category: "tools", cache: "general", qty: 1, org: "FEMA", family: ["dog", "cat", "other"] },
            { name: "Pet vaccination records", category: "documents", cache: "go_bag", qty: 1, org: "FEMA", family: ["dog", "cat", "bird", "other"] },
            { name: "Family and pet photos (for ID)", category: "documents", cache: "go_bag", qty: 1, org: "FEMA", family: ["person"] },
            { name: "Sleeping bag per person", category: "clothing", cache: "general", qty: 1, org: "FEMA", family: ["person"] },
            { name: "Change of clothing per person", category: "clothing", cache: "go_bag", qty: 1, org: "FEMA", family: ["person"] },
            { name: "Sturdy shoes or boots", category: "clothing", cache: "go_bag", qty: 1, org: "FEMA", family: ["person"] },
            { name: "Fire extinguisher (ABC type)", category: "tools", cache: "general", qty: 1, org: "FEMA", family: ["person"] },
            { name: "Waterproof/fireproof document container", category: "documents", cache: "general", qty: 1, org: "FEMA", family: ["person"] },
        ];

        // Code3 / First responder recommendations
        const code3Items = [
            { name: "Trauma shears", category: "medical", cache: "go_bag", qty: 1, org: "Code3", family: ["person"] },
            { name: "Israeli bandage (pressure bandage)", category: "medical", cache: "go_bag", qty: 3, org: "Code3", family: ["person"] },
            { name: "Tourniquet (CAT or SOFTT)", category: "medical", cache: "go_bag", qty: 2, org: "Code3", family: ["person"] },
            { name: "Hemostatic gauze (QuikClot)", category: "medical", cache: "go_bag", qty: 2, org: "Code3", family: ["person"] },
            { name: "Chest seal (vented)", category: "medical", cache: "go_bag", qty: 2, org: "Code3", family: ["person"] },
            { name: "Nasopharyngeal airway", category: "medical", cache: "go_bag", qty: 1, org: "Code3", family: ["person"] },
            { name: "Emergency blanket (heavy-duty)", category: "medical", cache: "go_bag", qty: 2, org: "Code3", family: ["person"] },
            { name: "CPR face shield", category: "medical", cache: "go_bag", qty: 2, org: "Code3", family: ["person"] },
            { name: "Sam splint", category: "medical", cache: "go_bag", qty: 1, org: "Code3", family: ["person"] },
            { name: "Nitrile gloves (box)", category: "medical", cache: "general", qty: 1, org: "Code3", family: ["person"] },
            { name: "Emergency oxygen kit", category: "medical", cache: "general", qty: 1, org: "Code3", family: ["person"] },
            { name: "AED (Automated External Defibrillator)", category: "medical", cache: "general", qty: 1, org: "Code3", family: ["person"] },
            { name: "Stretcher or backboard", category: "medical", cache: "general", qty: 1, org: "Code3", family: ["person"] },
            { name: "Two-way radios (FRS/GMRS)", category: "communication", cache: "general", qty: 4, org: "Code3", family: ["person"] },
            { name: "High-visibility safety vest", category: "clothing", cache: "automobile", qty: 2, org: "Code3", family: ["person"] },
        ];

        // Best Friends Animal Society / Pet preparedness
        const petItems = [
            { name: "Pet first aid kit", category: "medical", cache: "general", qty: 1, org: "Best Friends Animal Society", family: ["dog", "cat", "other"] },
            { name: "Pet medications (2-week supply)", category: "medical", cache: "go_bag", qty: 1, org: "Best Friends Animal Society", family: ["dog", "cat", "bird", "other"] },
            { name: "Pet carrier (airline approved)", category: "tools", cache: "general", qty: 1, org: "Best Friends Animal Society", family: ["dog", "cat", "bird", "other"] },
            { name: "Pet food (2-week supply)", category: "food", cache: "general", qty: 1, org: "Best Friends Animal Society", family: ["dog", "cat", "bird", "other"] },
            { name: "Pet water bowls (collapsible)", category: "water", cache: "go_bag", qty: 2, org: "Best Friends Animal Society", family: ["dog", "cat", "other"] },
            { name: "Pet waste bags", category: "hygiene", cache: "go_bag", qty: 50, org: "Best Friends Animal Society", family: ["dog", "cat"] },
            { name: "Pet toys and comfort items", category: "other", cache: "go_bag", qty: 2, org: "Best Friends Animal Society", family: ["dog", "cat", "bird", "other"] },
            { name: "Extra leash and collar with ID tag", category: "tools", cache: "go_bag", qty: 1, org: "Best Friends Animal Society", family: ["dog", "cat"] },
            { name: "Pet microchip documentation", category: "documents", cache: "go_bag", qty: 1, org: "Best Friends Animal Society", family: ["dog", "cat", "other"] },
            { name: "Recent pet photo for identification", category: "documents", cache: "go_bag", qty: 1, org: "Best Friends Animal Society", family: ["dog", "cat", "bird", "other"] },
            { name: "Pet-friendly hotel list", category: "documents", cache: "go_bag", qty: 1, org: "Best Friends Animal Society", family: ["dog", "cat", "bird", "other"] },
            { name: "Muzzle (for injured pets)", category: "medical", cache: "general", qty: 1, org: "Best Friends Animal Society", family: ["dog"] },
            { name: "Pet blanket or bed", category: "other", cache: "general", qty: 1, org: "Best Friends Animal Society", family: ["dog", "cat", "other"] },
            { name: "Cat litter and portable litter box", category: "hygiene", cache: "general", qty: 1, org: "Best Friends Animal Society", family: ["cat"] },
            { name: "Bird cage cover", category: "tools", cache: "general", qty: 1, org: "Best Friends Animal Society", family: ["bird"] },
            { name: "Bird travel carrier", category: "tools", cache: "go_bag", qty: 1, org: "Best Friends Animal Society", family: ["bird"] },
            { name: "Pet calming supplements", category: "medical", cache: "go_bag", qty: 1, org: "Best Friends Animal Society", family: ["dog", "cat", "other"] },
        ];

        // Additional general items
        const additionalItems = [
            { name: "N95 respirator masks", category: "medical", cache: "go_bag", qty: 10, org: "CDC", family: ["person"] },
            { name: "Hand sanitizer (large bottle)", category: "hygiene", cache: "general", qty: 2, org: "CDC", family: ["person"] },
            { name: "Soap and cleaning supplies", category: "hygiene", cache: "general", qty: 1, org: "CDC", family: ["person"] },
            { name: "Bleach (unscented)", category: "hygiene", cache: "general", qty: 1, org: "EPA", family: ["person"] },
            { name: "Paper towels and tissues", category: "hygiene", cache: "general", qty: 4, org: "Red Cross", family: ["person"] },
            { name: "Toilet paper", category: "hygiene", cache: "general", qty: 8, org: "Red Cross", family: ["person"] },
            { name: "Feminine hygiene products", category: "hygiene", cache: "general", qty: 1, org: "Red Cross", family: ["person"] },
            { name: "Personal hygiene items", category: "hygiene", cache: "go_bag", qty: 1, org: "Red Cross", family: ["person"] },
            { name: "Sunscreen (SPF 30+)", category: "hygiene", cache: "go_bag", qty: 1, org: "Red Cross", family: ["person"] },
            { name: "Insect repellent", category: "hygiene", cache: "go_bag", qty: 1, org: "Red Cross", family: ["person"] },
            { name: "Books, games, puzzles for entertainment", category: "other", cache: "general", qty: 3, org: "Red Cross", family: ["person"] },
            { name: "Paper and pencils", category: "documents", cache: "go_bag", qty: 1, org: "Red Cross", family: ["person"] },
            { name: "Needles and thread", category: "tools", cache: "general", qty: 1, org: "Red Cross", family: ["person"] },
            { name: "Plastic utensils", category: "tools", cache: "go_bag", qty: 12, org: "Red Cross", family: ["person"] },
            { name: "Paper cups and plates", category: "tools", cache: "general", qty: 20, org: "Red Cross", family: ["person"] },
            { name: "Aluminum foil", category: "tools", cache: "general", qty: 1, org: "Red Cross", family: ["person"] },
            { name: "Plastic storage containers", category: "tools", cache: "general", qty: 5, org: "Red Cross", family: ["person"] },
            { name: "Household chlorine bleach", category: "hygiene", cache: "general", qty: 1, org: "Red Cross", family: ["person"] },
            { name: "Medicine dropper", category: "medical", cache: "go_bag", qty: 1, org: "Red Cross", family: ["person"] },
            { name: "Fire extinguisher training manual", category: "documents", cache: "general", qty: 1, org: "NFPA", family: ["person"] },
            { name: "Emergency escape ladder", category: "tools", cache: "general", qty: 1, org: "NFPA", family: ["person"], disasters: ["fire"] },
            { name: "Smoke detector (battery backup)", category: "tools", cache: "general", qty: 3, org: "NFPA", family: ["person"] },
            { name: "Carbon monoxide detector", category: "tools", cache: "general", qty: 2, org: "NFPA", family: ["person"] },
            { name: "Emergency flares (road)", category: "tools", cache: "automobile", qty: 3, org: "NHTSA", family: ["person"] },
            { name: "Jumper cables", category: "tools", cache: "automobile", qty: 1, org: "AAA", family: ["person"] },
            { name: "Tire pressure gauge", category: "tools", cache: "automobile", qty: 1, org: "AAA", family: ["person"] },
            { name: "Tire inflator or sealant", category: "tools", cache: "automobile", qty: 1, org: "AAA", family: ["person"] },
            { name: "Emergency road reflectors", category: "tools", cache: "automobile", qty: 3, org: "NHTSA", family: ["person"] },
            { name: "Tow strap", category: "tools", cache: "automobile", qty: 1, org: "AAA", family: ["person"] },
            { name: "Shovel (folding)", category: "tools", cache: "automobile", qty: 1, org: "AAA", family: ["person"] },
            { name: "Work gloves (heavy duty)", category: "clothing", cache: "general", qty: 2, org: "OSHA", family: ["person"] },
            { name: "Safety goggles", category: "tools", cache: "general", qty: 2, org: "OSHA", family: ["person"] },
            { name: "Respirator mask (P100)", category: "medical", cache: "general", qty: 2, org: "OSHA", family: ["person"], disasters: ["wildfire"] },
            { name: "Emergency ladder (rope)", category: "tools", cache: "general", qty: 1, org: "Fire Dept", family: ["person"] },
            { name: "Crowbar or pry bar", category: "tools", cache: "general", qty: 1, org: "FEMA", family: ["person"] },
            { name: "Axe or hatchet", category: "tools", cache: "general", qty: 1, org: "FEMA", family: ["person"] },
            { name: "Rope (100 feet)", category: "tools", cache: "general", qty: 1, org: "FEMA", family: ["person"] },
            { name: "Tarps (heavy duty)", category: "tools", cache: "general", qty: 2, org: "FEMA", family: ["person"] },
            { name: "Bungee cords (assorted)", category: "tools", cache: "general", qty: 10, org: "REI", family: ["person"] },
            { name: "Zip ties (assorted)", category: "tools", cache: "general", qty: 50, org: "REI", family: ["person"] },
            { name: "Carabiners (locking)", category: "tools", cache: "general", qty: 5, org: "REI", family: ["person"] },
            { name: "Work boots (steel toe)", category: "clothing", cache: "general", qty: 1, org: "OSHA", family: ["person"] },
            { name: "Rain gear (jacket and pants)", category: "clothing", cache: "go_bag", qty: 1, org: "REI", family: ["person"] },
            { name: "Winter hat and gloves", category: "clothing", cache: "go_bag", qty: 1, org: "Red Cross", family: ["person"] },
            { name: "Sunglasses (UV protection)", category: "clothing", cache: "go_bag", qty: 1, org: "Red Cross", family: ["person"] },
            { name: "Sewing kit", category: "tools", cache: "general", qty: 1, org: "Red Cross", family: ["person"] },
            { name: "Duct tape (multiple rolls)", category: "tools", cache: "general", qty: 3, org: "FEMA", family: ["person"] },
            { name: "Superglue", category: "tools", cache: "go_bag", qty: 1, org: "REI", family: ["person"] },
            { name: "Zip-lock bags (gallon)", category: "tools", cache: "general", qty: 20, org: "Red Cross", family: ["person"] },
            { name: "Heavy-duty trash bags", category: "hygiene", cache: "general", qty: 20, org: "Red Cross", family: ["person"] },
            { name: "5-gallon water containers", category: "water", cache: "general", qty: 2, org: "Red Cross", family: ["person"] },
            { name: "Water storage tablets", category: "water", cache: "general", qty: 1, org: "EPA", family: ["person"] },
            { name: "Camping stove with fuel", category: "tools", cache: "general", qty: 1, org: "REI", family: ["person"] },
            { name: "Propane or butane canisters", category: "tools", cache: "general", qty: 4, org: "REI", family: ["person"] },
            { name: "Mess kit or camping dishes", category: "tools", cache: "general", qty: 1, org: "REI", family: ["person"] },
            { name: "Cooler (for perishables)", category: "food", cache: "general", qty: 1, org: "Red Cross", family: ["person"] },
            { name: "Ice packs (reusable)", category: "food", cache: "general", qty: 4, org: "Red Cross", family: ["person"] },
            { name: "Thermometer (indoor/outdoor)", category: "tools", cache: "general", qty: 1, org: "NOAA", family: ["person"] },
        ];

        // Combine all items
        const allItems = [
            ...redCrossItems,
            ...reiItems,
            ...noaaItems,
            ...femaItems,
            ...code3Items,
            ...petItems,
            ...additionalItems
        ];

        // Convert to suggestion format
        for (const item of allItems) {
            suggestions.push({
                original_recommendation_id: null,
                suggested_item_name: item.name,
                suggested_category: item.category,
                suggested_cache_type: item.cache,
                suggested_quantity: item.qty,
                suggested_family_member_types: item.family,
                suggested_disaster_types: item.disasters || [],
                suggested_fema_regions: [],
                status: "pending",
                suggested_by: "System Import",
                source_organization: item.org
            });
        }

        await base44.asServiceRole.entities.ProductRecommendationSuggestion.bulkCreate(suggestions);

        return Response.json({
            success: true,
            message: `Created ${suggestions.length} placeholder product suggestions from emergency preparedness organizations`
        });

    } catch (error) {
        console.error("Error generating placeholders:", error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});