import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { suggestionId, overrides } = await req.json();

        if (!suggestionId) {
            return Response.json({ error: 'suggestionId is required' }, { status: 400 });
        }

        // Get the suggestion
        const suggestions = await base44.asServiceRole.entities.ProductRecommendationSuggestion.list();
        let suggestion = suggestions.find(s => s.id === suggestionId);
        if (!suggestion) return Response.json({ error: 'Suggestion not found' }, { status: 404 });
        // Apply any admin overrides before approving
        if (overrides && Object.keys(overrides).length > 0) {
          await base44.asServiceRole.entities.ProductRecommendationSuggestion.update(suggestionId, overrides);
          suggestion = { ...suggestion, ...overrides };
        }

        // If original_recommendation_id exists, try to update it. If not found, fall through to create.
        let updated = false;
        if (suggestion.original_recommendation_id) {
            try {
                await base44.asServiceRole.entities.ProductRecommendation.update(
                    suggestion.original_recommendation_id,
                    {
                        item_name: suggestion.suggested_item_name,
                        category: suggestion.suggested_category,
                        cache_type: suggestion.suggested_cache_type,
                        image_url: suggestion.suggested_image_url,
                        price_cents: suggestion.suggested_price_cents,
                        description: suggestion.suggested_description,
                        quantity: suggestion.suggested_quantity,
                        fema_regions: suggestion.suggested_fema_regions,
                        disaster_types: suggestion.suggested_disaster_types,
                        family_member_types: suggestion.suggested_family_member_types,
                        affiliate_link: suggestion.suggested_affiliate_link,
                        active: true
                    }
                );
                updated = true;
            } catch (e) {
                // Original recommendation was deleted — fall through to create a new one
            }
        }
        if (!updated) {
            await base44.asServiceRole.entities.ProductRecommendation.create({
                item_name: suggestion.suggested_item_name,
                category: suggestion.suggested_category,
                cache_type: suggestion.suggested_cache_type,
                image_url: suggestion.suggested_image_url,
                price_cents: suggestion.suggested_price_cents,
                description: suggestion.suggested_description,
                quantity: suggestion.suggested_quantity,
                fema_regions: suggestion.suggested_fema_regions || [],
                disaster_types: suggestion.suggested_disaster_types || [],
                family_member_types: suggestion.suggested_family_member_types || [],
                affiliate_link: suggestion.suggested_affiliate_link,
                active: true,
                priority: 0
            });
        }

        // Mark suggestion as approved
        await base44.asServiceRole.entities.ProductRecommendationSuggestion.update(
            suggestionId,
            { status: "approved" }
        );

        return Response.json({
            success: true,
            message: 'Suggestion approved and product recommendation updated'
        });

    } catch (error) {
        console.error("Error approving suggestion:", error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});