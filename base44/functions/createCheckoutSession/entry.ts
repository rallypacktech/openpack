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

        const { items, cache_id, success_url, cancel_url } = await req.json();

        if (!items || items.length === 0) {
            return Response.json({ error: 'No items provided' }, { status: 400 });
        }

        // Build line items for Stripe
        const lineItems = items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.item_name,
                    description: item.description || '',
                },
                unit_amount: item.price_cents,
            },
            quantity: item.quantity || 1,
        }));

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
                recommendation_ids: JSON.stringify(items.map(i => i.id))
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