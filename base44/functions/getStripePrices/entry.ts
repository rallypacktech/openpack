import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { readCachedPayload } from '../../shared/reportCache.ts';

// Public, unauthenticated endpoint: the subscription pricing shown on the public
// pricing pages.
//
// It serves the snapshot that refreshStripePrices writes on a schedule and never
// calls Stripe itself, so anonymous traffic cannot spend the app's Stripe key at
// all. The snapshot is accepted even when it is stale — a public request must not
// fall back to a paid API call, and the scheduled refresh keeps it current.
const CACHE_KEY = 'stripe_prices';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const cached = await readCachedPayload(base44.asServiceRole, CACHE_KEY, MAX_AGE_MS);
        return Response.json(cached || { prices: [] });
    } catch (error) {
        console.error('getStripePrices error:', error);
        return Response.json({ prices: [] });
    }
});