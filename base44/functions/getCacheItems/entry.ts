import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const cacheId = body.cacheId;

    if (!cacheId) {
      return Response.json({ error: 'Cache ID required' }, { status: 400 });
    }

    // Strict ownership verification: only the cache owner or an admin may view items.
    // RLS already enforces owner-only reads on EmergencyCache; this explicit check is defense-in-depth.
    const allCaches = await base44.entities.EmergencyCache.list();
    const cache = allCaches.find(c => c.id === cacheId);

    if (!cache) {
      return Response.json({ error: 'Cache not found' }, { status: 404 });
    }

    if (cache.created_by !== user.email && user.role !== 'admin') {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get cache items
    const items = await base44.entities.CacheItem.filter({ cache_id: cacheId });

    return Response.json({ 
      items,
      isOwner: cache.created_by === user.email
    });

  } catch (error) {
    console.error("Error fetching cache items:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});