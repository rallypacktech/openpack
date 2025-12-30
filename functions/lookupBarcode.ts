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
      prompt: `Look up the EXACT product for UPC/barcode: ${barcode}
      
      CRITICAL: Verify the actual product type carefully. Look up multiple sources if needed. DO NOT guess or assume - find the real product information.
      
      Return:
      1. The ACTUAL PRODUCT NAME with brand (e.g., "Yankee Candle Vanilla", "Dove Bar Soap")
      2. A brief description of what the product actually is
      3. The correct category based on what the product ACTUALLY is:
         - "hygiene" for: soaps, shampoo, body wash, deodorant, toothpaste, lotions, personal care items
         - "medical" for: medications, first aid supplies, bandages
         - "food" for: food items, snacks, beverages (non-water)
         - "water" for: bottled water only
         - "tools" for: hardware, equipment, flashlights, batteries, candles, matches, lighters
         - "clothing" for: apparel items
         - "communication" for: radios, phones, chargers
         - "other" for: anything that doesn't fit above
      4. Typical shelf life from manufacture date in days (food: 365-1095, hygiene: 730-1095, candles: null, tools: null)`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          name: { 
            type: "string",
            description: "The actual product name with brand"
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
            description: "Brief product description"
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