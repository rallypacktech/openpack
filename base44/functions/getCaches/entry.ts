import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get family members where current user is emergency contact
    const packFamilyMembers = await base44.entities.FamilyMember.filter({
      emergency_contact: user.email
    });
    const packOwnerEmails = packFamilyMembers.map(fm => fm.created_by);

    // Get user's own caches
    const userOwnCaches = await base44.entities.EmergencyCache.filter({
      created_by: user.email
    });
    
    // Get pack member caches if any
    let packCaches = [];
    if (packOwnerEmails.length > 0) {
      const allPackCaches = await Promise.all(
        packOwnerEmails.map(email => 
          base44.entities.EmergencyCache.filter({ created_by: email })
        )
      );
      packCaches = allPackCaches.flat();
    }
    
    const userCaches = [...userOwnCaches, ...packCaches];

    return Response.json({ caches: userCaches });

  } catch (error) {
    console.error("Error fetching caches:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});