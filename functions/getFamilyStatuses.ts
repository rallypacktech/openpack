import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get family members where user is the creator
    const myFamilyMembers = await base44.entities.FamilyMember.filter({ created_by: user.email });
    
    // Get family members where user is linked as emergency contact
    const linkedFamilyMembers = await base44.asServiceRole.entities.FamilyMember.filter({ 
      linked_user_id: user.id 
    });

    const statuses = [];

    // Get statuses of my family members who have accounts
    for (const fm of myFamilyMembers) {
      if (fm.linked_user_id) {
        const linkedUser = await base44.asServiceRole.entities.User.filter({ id: fm.linked_user_id });
        if (linkedUser.length > 0) {
          const profile = await base44.asServiceRole.entities.UserProfile.filter({ 
            created_by: linkedUser[0].email 
          });
          if (profile.length > 0) {
            statuses.push({
              name: fm.name,
              relationship: fm.relationship,
              status: profile[0].current_status || 'unknown',
              status_updated_at: profile[0].status_updated_at
            });
          }
        }
      }
    }

    // Get statuses of users who have me as emergency contact
    for (const fm of linkedFamilyMembers) {
      const creatorUser = await base44.asServiceRole.entities.User.filter({ email: fm.created_by });
      if (creatorUser.length > 0) {
        const profile = await base44.asServiceRole.entities.UserProfile.filter({ 
          created_by: fm.created_by 
        });
        if (profile.length > 0) {
          statuses.push({
            name: creatorUser[0].full_name,
            relationship: 'emergency contact for',
            status: profile[0].current_status || 'unknown',
            status_updated_at: profile[0].status_updated_at
          });
        }
      }
    }

    return Response.json({ statuses });
  } catch (error) {
    console.error('Error fetching family statuses:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});