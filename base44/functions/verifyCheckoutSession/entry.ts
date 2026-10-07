import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import Stripe from 'npm:stripe@17.5.0';

// Fulfils a product checkout. The browser can only hand over a Stripe session id —
// the session is retrieved and verified server-side (paid, complete, and belonging
// to the caller), so no client-supplied parameter can mark items as purchased
// without a real payment behind it.

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const sessionId = body?.session_id;
    if (!sessionId || typeof sessionId !== 'string') {
      return Response.json({ error: 'session_id is required' }, { status: 400 });
    }

    const stripeKey = Deno.env.get('Stripe') || Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return Response.json({ error: 'Payment provider not configured' }, { status: 500 });
    }
    const stripe = new Stripe(stripeKey);

    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (e) {
      console.error('verifyCheckoutSession retrieve failed:', e.message);
      return Response.json({ error: 'Checkout session not found' }, { status: 404 });
    }

    // The session must actually be paid and complete, and must belong to the caller.
    if (session.payment_status !== 'paid' || session.status !== 'complete') {
      return Response.json({ error: 'Payment has not been completed' }, { status: 402 });
    }
    if (session.metadata?.user_id !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const cacheId = String(session.metadata?.cache_id || '');
    if (!cacheId) {
      return Response.json({ error: 'Checkout session is missing its cache' }, { status: 400 });
    }

    let recIds = [];
    try {
      const parsed = JSON.parse(session.metadata?.recommendation_ids || '[]');
      if (Array.isArray(parsed)) {
        recIds = parsed.filter((id) => typeof id === 'string').slice(0, 100);
      }
    } catch (e) {
      recIds = [];
    }

    // The cache must belong to the caller — the user-scoped read applies the app's
    // ownership rules, so another user's cache id cannot be used to grant items.
    let cache = null;
    try {
      cache = await base44.entities.EmergencyCache.get(cacheId);
    } catch (e) {
      cache = null;
    }
    if (!cache) return Response.json({ error: 'Forbidden' }, { status: 403 });

    // Load the products named in the verified session metadata.
    const products = await Promise.all(
      recIds.map((id) => base44.entities.ProductRecommendation.get(id).catch(() => null)),
    );

    // Fulfilment is idempotent — a page refresh must not duplicate inventory.
    const existing = await base44.entities.UserCacheProgress.filter({ cache_id: cacheId });
    const alreadyPurchased = new Set(
      existing.filter((p) => p.status === 'purchased').map((p) => p.recommendation_id),
    );

    let itemCount = 0;
    let totalCents = 0;
    for (const rec of products) {
      if (!rec) continue;
      const quantity = rec.quantity || 1;
      totalCents += (rec.price_cents || 0) * quantity;
      if (alreadyPurchased.has(rec.id)) continue;

      await base44.entities.UserCacheProgress.create({
        cache_id: cacheId,
        recommendation_id: rec.id,
        status: 'purchased',
        purchased_at: new Date().toISOString(),
      });

      await base44.entities.CacheItem.create({
        cache_id: cacheId,
        item_name: rec.item_name,
        quantity,
        category: rec.category,
        notes: 'Purchased via Stripe checkout',
      });
      itemCount++;
    }

    return Response.json({
      success: true,
      cache_id: cacheId,
      item_count: itemCount,
      total_cents: totalCents,
    });
  } catch (error) {
    console.error('verifyCheckoutSession error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}