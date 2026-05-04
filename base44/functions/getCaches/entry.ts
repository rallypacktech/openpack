import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's own caches directly
    const userOwnCaches = await base44.entities.EmergencyCache.filter({
      created_by: user.email
    });

    // Resolve pack sharing: only allow viewing caches of users who have EXPLICITLY
    // added this user as an emergency contact in their FamilyMember records.
    // We look this up as the authenticated user — the RLS on FamilyMember already
    // limits results to records where emergency_contact == user.email.
    const packFamilyMembers = await base44.entities.FamilyMember.filter({
      emergency_contact: user.email
    });

    // Strictly whitelist the set of allowed pack-owner emails
    const allowedPackEmails = new Set(packFamilyMembers.map(fm => fm.created_by));

    // Fetch pack caches one owner at a time (never use service role for this)
    let packCaches = [];
    for (const ownerEmail of allowedPackEmails) {
      // Skip self to avoid duplicates
      if (ownerEmail === user.email) continue;
      const ownerCaches = await base44.entities.EmergencyCache.filter({
        created_by: ownerEmail
      });
      // Strip sensitive location fields from pack members' caches before returning
      packCaches.push(
        ...ownerCaches.map(c => ({
          id: c.id,
          name: c.name,
          location: c.location,
          cache_type: c.cache_type,
          description: c.description,
          created_by: c.created_by,
          _shared: true,
        }))
      );
    }

    return Response.json({ caches: [...userOwnCaches, ...packCaches] });

  } catch (error) {
    console.error("Error fetching caches:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});