import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recommendationId, purchaseAmount, orderNumber } = await req.json();

    if (!recommendationId || !purchaseAmount) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Track the purchase
    await base44.analytics.track({
      eventName: 'affiliate_purchase_completed',
      properties: {
        recommendation_id: recommendationId,
        purchase_amount: purchaseAmount,
        order_number: orderNumber || null,
        user_email: user.email
      }
    });

    // Update or create UserCacheProgress
    const recommendation = await base44.entities.ProductRecommendation.filter({ id: recommendationId });
    if (recommendation.length > 0) {
      const rec = recommendation[0];
      
      // Check if user has caches
      const caches = await base44.entities.EmergencyCache.filter({ created_by: user.email });
      if (caches.length > 0) {
        // Find existing progress or create new
        const existing = await base44.entities.UserCacheProgress.filter({
          created_by: user.email,
          recommendation_id: recommendationId
        });

        if (existing.length > 0) {
          await base44.entities.UserCacheProgress.update(existing[0].id, {
            status: 'purchased',
            purchased_at: new Date().toISOString()
          });
        } else {
          await base44.entities.UserCacheProgress.create({
            cache_id: caches[0].id,
            recommendation_id: recommendationId,
            status: 'purchased',
            purchased_at: new Date().toISOString()
          });
        }
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error recording purchase:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});