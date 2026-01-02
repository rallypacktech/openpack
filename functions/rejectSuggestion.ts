import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { suggestionId } = await req.json();

        if (!suggestionId) {
            return Response.json({ error: 'suggestionId is required' }, { status: 400 });
        }

        await base44.asServiceRole.entities.ProductRecommendationSuggestion.update(
            suggestionId,
            { status: "rejected" }
        );

        return Response.json({
            success: true,
            message: 'Suggestion rejected'
        });

    } catch (error) {
        console.error("Error rejecting suggestion:", error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});