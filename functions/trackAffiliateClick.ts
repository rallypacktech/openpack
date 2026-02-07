import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recommendationId, productName, affiliateLink } = await req.json();

    // Track the click
    await base44.analytics.track({
      eventName: 'affiliate_link_clicked',
      properties: {
        recommendation_id: recommendationId,
        product_name: productName,
        user_email: user.email
      }
    });

    // Return the affiliate link for redirect
    return Response.json({ 
      success: true,
      redirectUrl: affiliateLink 
    });
  } catch (error) {
    console.error('Error tracking affiliate click:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});