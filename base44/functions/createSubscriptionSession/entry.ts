import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@17.5.0';
import { safeRedirect } from '../../shared/redirectAllowlist.ts';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // Business subscription checkout is only available to signed-in accounts.
        const user = await base44.auth.me().catch(() => null);
        if (!user?.email) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
        const { price_id, success_url, cancel_url, metadata } = await req.json();

        if (!price_id) {
            return Response.json({ error: 'price_id is required' }, { status: 400 });
        }

        // Only pass through the metadata fields the app actually uses. Caller-supplied
        // values must never override platform-set keys such as base44_app_id or user_email.
        const safeMetadata: Record<string, string> = {};
        if (typeof metadata?.tier === 'string') safeMetadata.tier = metadata.tier.slice(0, 64);
        if (typeof metadata?.organization_name === 'string') {
            safeMetadata.organization_name = metadata.organization_name.slice(0, 200);
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price: price_id, quantity: 1 }],
            mode: 'subscription',
            allow_promotion_codes: true,
            subscription_data: {
                trial_period_days: 7,
                metadata: { base44_app_id: Deno.env.get('BASE44_APP_ID') },
            },
            success_url: safeRedirect(success_url, '/BusinessDashboard?sub_success=true&sid={CHECKOUT_SESSION_ID}'),
            cancel_url: safeRedirect(cancel_url, '/BusinessDashboard'),
            // Always the authenticated account's email — never a caller-supplied value.
            customer_email: user.email,
            metadata: {
                base44_app_id: Deno.env.get('BASE44_APP_ID'),
                user_email: user.email,
                ...safeMetadata,
            },
        });

        return Response.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('createSubscriptionSession error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});