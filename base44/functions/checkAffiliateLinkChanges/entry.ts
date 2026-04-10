import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // Get all active product recommendations with affiliate links
        const recommendations = await base44.asServiceRole.entities.ProductRecommendation.filter({
            active: true
        });

        const recommendationsWithLinks = recommendations.filter(rec => rec.affiliate_link);

        const suggestionsCreated = [];
        const errors = [];

        for (const rec of recommendationsWithLinks) {
            try {
                // Use LLM to scrape current product details from affiliate link
                const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
                    prompt: `Visit this product link and extract the current product information:
                    
${rec.affiliate_link}

Extract the following details:
- Product name/title
- Current price (convert to cents, e.g., $19.99 = 1999)
- Main product image URL
- Brief description (1-2 sentences)

Return accurate, up-to-date information from the live page.`,
                    add_context_from_internet: true,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            price_cents: { type: "number" },
                            image_url: { type: "string" },
                            description: { type: "string" }
                        },
                        required: ["name"]
                    }
                });

                // Check if there are significant differences
                const hasChanges = 
                    llmResponse.name !== rec.item_name ||
                    (llmResponse.price_cents && llmResponse.price_cents !== rec.price_cents) ||
                    (llmResponse.image_url && llmResponse.image_url !== rec.image_url) ||
                    (llmResponse.description && llmResponse.description !== rec.description);

                if (hasChanges) {
                    // Create suggestion
                    const suggestion = await base44.asServiceRole.entities.ProductRecommendationSuggestion.create({
                        original_recommendation_id: rec.id,
                        suggested_item_name: llmResponse.name || rec.item_name,
                        suggested_category: rec.category,
                        suggested_cache_type: rec.cache_type,
                        suggested_image_url: llmResponse.image_url || rec.image_url,
                        suggested_price_cents: llmResponse.price_cents || rec.price_cents,
                        suggested_description: llmResponse.description || rec.description,
                        suggested_quantity: rec.quantity,
                        suggested_fema_regions: rec.fema_regions,
                        suggested_disaster_types: rec.disaster_types,
                        suggested_family_member_types: rec.family_member_types,
                        suggested_affiliate_link: rec.affiliate_link,
                        status: "pending",
                        suggested_by: "LLM Automation"
                    });

                    suggestionsCreated.push(suggestion.id);
                }
            } catch (error) {
                errors.push({
                    recommendation_id: rec.id,
                    error: error.message
                });
            }
        }

        return Response.json({
            success: true,
            suggestions_created: suggestionsCreated.length,
            errors: errors.length,
            details: { suggestionsCreated, errors }
        });

    } catch (error) {
        console.error("Error checking affiliate links:", error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});