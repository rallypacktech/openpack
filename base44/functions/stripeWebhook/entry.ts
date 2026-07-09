import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@17.5.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const stripe = new Stripe(Deno.env.get('Stripe'));
        const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

        const body = await req.text();
        const sig = req.headers.get('stripe-signature');

        if (!webhookSecret) {
            return Response.json({ error: 'Webhook secret not configured' }, { status: 500 });
        }
        if (!sig) {
            return Response.json({ error: 'Missing stripe-signature header' }, { status: 400 });
        }
        const event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);

        const { type, data } = event;

        // Helper: find or create BusinessSubscription by stripe customer/subscription IDs
        const syncSubscription = async (stripeSubId, stripeCustomerId, status, tierOverride) => {
            const subs = await base44.asServiceRole.entities.BusinessSubscription.filter({
                stripe_subscription_id: stripeSubId,
            });

            // Map Stripe status → our status enum
            const statusMap = {
                active: 'active',
                trialing: 'trialing',
                past_due: 'past_due',
                canceled: 'cancelled',
                unpaid: 'past_due',
                incomplete: 'trialing',
                incomplete_expired: 'cancelled',
            };
            const mappedStatus = statusMap[status] || 'trialing';

            if (subs.length > 0) {
                await base44.asServiceRole.entities.BusinessSubscription.update(subs[0].id, {
                    status: mappedStatus,
                    stripe_subscription_id: stripeSubId,
                    stripe_customer_id: stripeCustomerId,
                    ...(tierOverride ? { tier: tierOverride } : {}),
                });
            }
        };

        if (type === 'customer.subscription.created' || type === 'customer.subscription.updated') {
            const sub = data.object;
            // Determine tier from product metadata if available
            let tier = null;
            if (sub.items?.data?.length > 0) {
                const priceId = sub.items.data[0].price.id;
                const price = await stripe.prices.retrieve(priceId, { expand: ['product'] });
                tier = price.product?.metadata?.tier || null;
            }
            await syncSubscription(sub.id, sub.customer, sub.status, tier);
        }

        if (type === 'customer.subscription.deleted') {
            const sub = data.object;
            await syncSubscription(sub.id, sub.customer, 'canceled', null);
        }

        if (type === 'checkout.session.completed') {
            const session = data.object;
            if (session.mode === 'subscription' && session.subscription) {
                const sub = await stripe.subscriptions.retrieve(session.subscription, {
                    expand: ['items.data.price.product'],
                });
                const tier = sub.items?.data?.[0]?.price?.product?.metadata?.tier || null;
                const userEmail = session.customer_email || session.metadata?.user_email;

                // Try to find existing BusinessSubscription for this user
                const existing = await base44.asServiceRole.entities.BusinessSubscription.filter({
                    owner_email: userEmail,
                });
                if (existing.length > 0) {
                    await base44.asServiceRole.entities.BusinessSubscription.update(existing[0].id, {
                        status: 'active',
                        stripe_subscription_id: sub.id,
                        stripe_customer_id: sub.customer,
                        ...(tier ? { tier } : {}),
                        current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
                        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
                    });
                } else if (userEmail) {
                    await base44.asServiceRole.entities.BusinessSubscription.create({
                        owner_email: userEmail,
                        organization_name: session.metadata?.organization_name || userEmail,
                        status: 'active',
                        tier: tier || 'basic',
                        stripe_subscription_id: sub.id,
                        stripe_customer_id: sub.customer,
                        current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
                        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
                        max_first_aid_kits: 5,
                        max_members: 25,
                    });
                }
            }
        }

        return Response.json({ received: true });
    } catch (error) {
        console.error('stripeWebhook error:', error);
        return Response.json({ error: error.message }, { status: 400 });
    }
});