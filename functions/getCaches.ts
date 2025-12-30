import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all family members where current user is emergency contact
    const allFamilyMembers = await base44.entities.FamilyMember.list();
    const packOwnerEmails = allFamilyMembers
      .filter(fm => fm.emergency_contact === user.email)
      .map(fm => fm.created_by);

    // Get all caches
    const allCaches = await base44.entities.EmergencyCache.list();
    
    // Filter caches by ownership or pack membership
    const userCaches = allCaches.filter(cache => 
      cache.created_by === user.email || packOwnerEmails.includes(cache.created_by)
    );

    return Response.json({ caches: userCaches });

  } catch (error) {
    console.error("Error fetching caches:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});