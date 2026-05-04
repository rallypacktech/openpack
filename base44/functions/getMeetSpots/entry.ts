import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's own meet spots
    const userOwnSpots = await base44.entities.MeetSpot.filter({
      created_by: user.email
    });

    // Pack sharing: only users who have explicitly added this user as emergency contact
    // RLS on FamilyMember already scopes this to records where emergency_contact == user.email
    const packFamilyMembers = await base44.entities.FamilyMember.filter({
      emergency_contact: user.email
    });

    const allowedPackEmails = new Set(packFamilyMembers.map(fm => fm.created_by));

    let packSpots = [];
    for (const ownerEmail of allowedPackEmails) {
      if (ownerEmail === user.email) continue;
      const ownerSpots = await base44.entities.MeetSpot.filter({
        created_by: ownerEmail
      });
      // Return meet spot coordinates but strip the owner's personal identifiers
      packSpots.push(
        ...ownerSpots.map(s => ({
          id: s.id,
          name: s.name,
          address: s.address,
          latitude: s.latitude,
          longitude: s.longitude,
          description: s.description,
          is_primary: s.is_primary,
          // Do NOT expose created_by — GPS + email = PII linkage risk
          _shared: true,
        }))
      );
    }

    return Response.json({ spots: [...userOwnSpots, ...packSpots] });

  } catch (error) {
    console.error("Error fetching meet spots:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});