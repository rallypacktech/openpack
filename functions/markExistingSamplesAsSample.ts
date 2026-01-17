import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all caches that look like samples (have "SAMPLE" in the name)
    const allCaches = await base44.asServiceRole.entities.EmergencyCache.list();
    const sampleCaches = allCaches.filter(cache => 
      cache.name.includes('SAMPLE') && !cache.is_sample
    );

    // Update them to mark as samples
    const updates = await Promise.all(
      sampleCaches.map(cache => 
        base44.asServiceRole.entities.EmergencyCache.update(cache.id, { is_sample: true })
      )
    );

    return Response.json({ 
      success: true,
      updated: updates.length,
      message: `Marked ${updates.length} existing sample caches as samples`
    });

  } catch (error) {
    console.error("Error marking samples:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});