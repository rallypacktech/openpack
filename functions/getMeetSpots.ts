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

    // Get all meet spots
    const allSpots = await base44.entities.MeetSpot.list();
    
    // Filter meet spots by ownership or pack membership
    const userSpots = allSpots.filter(spot => 
      spot.created_by === user.email || packOwnerEmails.includes(spot.created_by)
    );

    return Response.json({ spots: userSpots });

  } catch (error) {
    console.error("Error fetching meet spots:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});