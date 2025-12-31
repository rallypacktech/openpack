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

    // Get all family members where current user is emergency contact
    const allFamilyMembers = await base44.entities.FamilyMember.list();
    const packOwnerEmails = allFamilyMembers
      .filter(fm => fm.emergency_contact === user.email)
      .map(fm => fm.created_by);

    // Get the cache to verify access
    const allCaches = await base44.entities.EmergencyCache.list();
    const cache = allCaches.find(c => c.id === cacheId);

    if (!cache) {
      return Response.json({ error: 'Cache not found' }, { status: 404 });
    }

    // Verify user has access to this cache
    if (cache.created_by !== user.email && !packOwnerEmails.includes(cache.created_by)) {
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