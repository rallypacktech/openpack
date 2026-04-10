import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { barcode } = await req.json();

    if (!barcode) {
      return Response.json({ error: 'Barcode is required' }, { status: 400 });
    }

    // Use LLM with internet context to look up product details
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Look up the EXACT product with UPC/barcode: ${barcode}
      
      CRITICAL INSTRUCTIONS FOR PRODUCT NAME:
      - Find the SPECIFIC product, not just the brand
      - For store brands (CVS Health, Walgreens, Equate, etc.), include BOTH the brand AND the specific item type
      - BAD: "CVS Health" or "Walgreens Brand"
      - GOOD: "CVS Health Ibuprofen 200mg" or "Walgreens Alcohol Prep Pads"
      - For example: If it's CVS Health bandages, return "CVS Health Adhesive Bandages" not just "CVS Health"
      - Include key details like strength (200mg), count (50ct), or type (non-stick pads)
      
      SEARCH STRATEGY:
      1. Search for the exact barcode/UPC in product databases
      2. Look for the manufacturer's product listing
      3. Check retail websites (CVS.com, Walgreens.com, Amazon, Target) for this exact UPC
      4. Extract the FULL product title from the search results
      
      For category, choose the most appropriate:
      - "hygiene" for: soaps, shampoo, body wash, deodorant, toothpaste, lotions, personal care
      - "medical" for: medications, first aid supplies, bandages, pain relievers, vitamins, health aids
      - "food" for: food items, snacks, beverages (non-water)
      - "water" for: bottled water only
      - "tools" for: hardware, equipment, flashlights, batteries
      - "clothing" for: apparel items
      - "communication" for: radios, phones, chargers
      - "other" for: anything that doesn't fit above
      
      For shelf_life_days, provide typical unopened shelf life: food (365-1095), medical supplies (730-1825), hygiene (730-1095), water (365-730). Null for indefinite items.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          name: { 
            type: "string",
            description: "The FULL product name including brand and specific product type"
          },
          category: { 
            type: "string",
            enum: ["water", "food", "medical", "tools", "clothing", "documents", "communication", "hygiene", "other"]
          },
          shelf_life_days: { 
            type: ["number", "null"],
            description: "Typical unopened shelf life in days from today"
          },
          description: { 
            type: "string",
            description: "Brief product description including size/count if available"
          }
        },
        required: ["name", "category"]
      }
    });

    return Response.json({
      success: true,
      product: result
    });

  } catch (error) {
    console.error("Error looking up barcode:", error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});