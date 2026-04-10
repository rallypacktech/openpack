import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // Get all existing product recommendations
        const recommendations = await base44.asServiceRole.entities.ProductRecommendation.list();

        const suggestions = recommendations.map(rec => ({
            original_recommendation_id: rec.id,
            suggested_item_name: rec.item_name,
            suggested_category: rec.category,
            suggested_cache_type: rec.cache_type,
            suggested_image_url: rec.image_url,
            suggested_price_cents: rec.price_cents,
            suggested_description: rec.description,
            suggested_quantity: rec.quantity,
            suggested_fema_regions: rec.fema_regions,
            suggested_disaster_types: rec.disaster_types,
            suggested_family_member_types: rec.family_member_types,
            suggested_affiliate_link: rec.affiliate_link,
            status: "pending",
            suggested_by: "Admin Import"
        }));

        await base44.asServiceRole.entities.ProductRecommendationSuggestion.bulkCreate(suggestions);

        return Response.json({
            success: true,
            message: `Converted ${suggestions.length} existing recommendations to pending suggestions`
        });

    } catch (error) {
        console.error("Error converting recommendations:", error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});