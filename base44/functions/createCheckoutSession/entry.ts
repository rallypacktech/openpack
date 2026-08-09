import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@17.5.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const stripe = new Stripe(Deno.env.get('Stripe'));
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { items, cache_id, success_url, cancel_url, metadata } = await req.json();

        if (!Array.isArray(items) || items.length === 0) {
            return Response.json({ error: 'No items provided' }, { status: 400 });
        }

        // Resolve canonical prices and details server-side from ProductRecommendation
        // to prevent client-side price tampering. Never trust client-supplied price_cents.
        const productIds = items.map(i => i?.id).filter(Boolean);
        const products = await Promise.all(
            productIds.map(id =>
                base44.entities.ProductRecommendation.get(id).catch(() => null)
            )
        );
        const productMap = new Map(
            products.filter(Boolean).map(p => [p.id, p])
        );

        const lineItems = [];
        for (const item of items) {
            const id = item?.id;
            if (!id) {
                return Response.json({ error: 'Each item requires a valid product id.' }, { status: 400 });
            }
            const product = productMap.get(id);
            if (!product) {
                return Response.json({ error: `Item ${id} not found.` }, { status: 400 });
            }
            if (product.active === false) {
                return Response.json({ error: `Item "${product.item_name}" is no longer available.` }, { status: 400 });
            }
            const quantity = Math.max(1, Math.min(99, Math.floor(Number(item.quantity) || 1)));
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.item_name,
                        description: product.description || '',
                    },
                    unit_amount: Math.max(0, Math.round(product.price_cents || 0)),
                },
                quantity,
            });
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: success_url,
            cancel_url: cancel_url,
            customer_email: user.email,
            metadata: {
                user_id: user.id,
                cache_id: cache_id,
                recommendation_ids: JSON.stringify(items.map(i => i.id)),
                ...(metadata || {})
            }
        });

        return Response.json({ 
            sessionId: session.id,
            url: session.url 
        });

    } catch (error) {
        console.error("Stripe checkout error:", error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});