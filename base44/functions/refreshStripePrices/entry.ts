import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import Stripe from 'npm:stripe@17.5.0';
import { writeCachedPayload } from '../../shared/reportCache.ts';
import { isAutomationRequest } from '../../shared/automationAuth.ts';

// Refreshes the public pricing snapshot from Stripe.
//
// getStripePrices serves this snapshot and never calls Stripe itself, so a stranger
// hitting the public pricing endpoint can no longer spend the app's Stripe key —
// only the scheduled refresh, or an admin, can reach Stripe at all.
const CACHE_KEY = 'stripe_prices';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Scheduled workflow runs arrive with the automation secret in a header; an
    // admin can also run this by hand from the dashboard.
    if (!isAutomationRequest(req, body)) {
      const user = await base44.auth.me().catch(() => null);
      if (user?.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    // Fetch all active prices with their product info
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
      limit: 100,
    });

    const priceData = prices.data
      .filter((p) => p.product && !p.product.deleted)
      .map((p) => ({
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

    await writeCachedPayload(base44.asServiceRole, CACHE_KEY, { prices: priceData });

    return Response.json({ success: true, prices: priceData.length });
  } catch (error) {
    console.error('refreshStripePrices error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}