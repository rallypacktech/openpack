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

    // Get user's own meet spots
    const userOwnSpots = await base44.entities.MeetSpot.filter({
      created_by: user.email
    });
    
    // Get pack member meet spots if any
    let packSpots = [];
    if (packOwnerEmails.length > 0) {
      const allPackSpots = await Promise.all(
        packOwnerEmails.map(email => 
          base44.entities.MeetSpot.filter({ created_by: email })
        )
      );
      packSpots = allPackSpots.flat();
    }
    
    const userSpots = [...userOwnSpots, ...packSpots];

    return Response.json({ spots: userSpots });

  } catch (error) {
    console.error("Error fetching meet spots:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});