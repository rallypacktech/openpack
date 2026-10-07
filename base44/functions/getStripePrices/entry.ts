import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@17.5.0';
import { readCachedPayload, writeCachedPayload } from '../../shared/reportCache.ts';

// Public, unauthenticated endpoint: the subscription pricing shown on the public
// pricing pages. It spends the app's Stripe secret key, so the result is
// snapshotted — anonymous traffic is served the snapshot instead of amplifying
// into unlimited Stripe API calls.
const CACHE_KEY = 'stripe_prices';
const TTL_MS = 60 * 60 * 1000; // 1 hour

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const sr = base44.asServiceRole;

        const cached = await readCachedPayload(sr, CACHE_KEY, TTL_MS);
        if (cached) return Response.json(cached);

        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

        // Fetch all active prices with their product info
        const prices = await stripe.prices.list({
            active: true,
            expand: ['data.product'],
            limit: 100,
        });

        // Return structured price data
        const priceData = prices.data
            .filter(p => p.product && !p.product.deleted)
            .map(p => ({
                id: p.id,
                unit_amount: p.unit_amount,
                currency: p.currency,
                recurring: p.recurring,
                product: {
                    id: p.product.id,
                    name: p.product.name,
                    description: p.product.description,
                    metadata: p.product.metadata,
                },
            }));

        const payload = { prices: priceData };
        await writeCachedPayload(sr, CACHE_KEY, payload);

        return Response.json(payload);
    } catch (error) {
        console.error('getStripePrices error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});