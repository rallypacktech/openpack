import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@17.5.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
        const { price_id, success_url, cancel_url, customer_email, metadata } = await req.json();

        if (!price_id) {
            return Response.json({ error: 'price_id is required' }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price: price_id, quantity: 1 }],
            mode: 'subscription',
            subscription_data: { trial_period_days: 7 },
            success_url: success_url || `${new URL(req.url).origin}/BusinessDashboard?sub_success=true&sid={CHECKOUT_SESSION_ID}`,
            cancel_url: cancel_url || `${new URL(req.url).origin}/BusinessDashboard`,
            customer_email,
            metadata: {
                base44_app_id: Deno.env.get('BASE44_APP_ID'),
                user_email: customer_email,
                ...metadata,
            },
        });

        return Response.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('createSubscriptionSession error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});