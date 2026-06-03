import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@17.5.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const stripe = new Stripe(Deno.env.get('Stripe'));
        const { price_id, success_url, cancel_url, metadata } = await req.json();

        if (!price_id) {
            return Response.json({ error: 'price_id is required' }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price: price_id, quantity: 1 }],
            mode: 'subscription',
            success_url: success_url || `${new URL(req.url).origin}/BusinessDashboard?sub_success=true`,
            cancel_url: cancel_url || `${new URL(req.url).origin}/BusinessDashboard`,
            customer_email: user.email,
            metadata: {
                user_id: user.id,
                user_email: user.email,
                ...metadata,
            },
        });

        return Response.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('createSubscriptionSession error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});