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
      prompt: `Look up the product with UPC/barcode: ${barcode}. 
      
      Provide the product name, appropriate emergency cache category, and typical expiration/shelf life information if applicable.
      
      For category, choose the most appropriate from: water, food, medical, tools, clothing, documents, communication, hygiene, other
      
      For expiration, if the product has a typical shelf life, provide it in days (e.g., 730 for 2 years). If unknown or indefinite, return null.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          category: { 
            type: "string",
            enum: ["water", "food", "medical", "tools", "clothing", "documents", "communication", "hygiene", "other"]
          },
          shelf_life_days: { 
            type: ["number", "null"],
            description: "Typical shelf life in days, or null if unknown/indefinite"
          },
          description: { type: "string" }
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