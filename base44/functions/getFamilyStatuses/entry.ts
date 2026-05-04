import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const statuses = [];

    // Branch 1: Family members I created who have linked accounts
    // Use user-scoped query — only returns records created_by this user (RLS)
    const myFamilyMembers = await base44.entities.FamilyMember.filter({ created_by: user.email });

    for (const fm of myFamilyMembers) {
      if (!fm.linked_user_id) continue;

      // Use service role ONLY to check if the linked user exists and get their status.
      // We never return raw email/contact info — only name, relationship, and status.
      const linkedUsers = await base44.asServiceRole.entities.User.filter({ id: fm.linked_user_id });
      if (linkedUsers.length === 0) continue;

      const linkedUser = linkedUsers[0];
      const profiles = await base44.asServiceRole.entities.UserProfile.filter({
        created_by: linkedUser.email
      });

      if (profiles.length > 0) {
        statuses.push({
          name: fm.name,           // User-supplied name, not the linked user's PII
          relationship: fm.relationship,
          status: profiles[0].current_status || 'unknown',
          status_updated_at: profiles[0].status_updated_at,
          // Never expose: email, phone, address, coordinates of linked user
        });
      }
    }

    // Branch 2: Users who have listed ME as their emergency contact
    // Use service role to look up reverse relationships, but filter output strictly
    const reverseLinks = await base44.asServiceRole.entities.FamilyMember.filter({
      emergency_contact: user.email
    });

    for (const fm of reverseLinks) {
      // Verify this person explicitly opted in to share their status (linked_user_id set)
      if (!fm.linked_user_id) continue;

      const profiles = await base44.asServiceRole.entities.UserProfile.filter({
        created_by: fm.created_by
      });

      if (profiles.length > 0) {
        statuses.push({
          name: fm.name,
          relationship: 'emergency contact for',
          status: profiles[0].current_status || 'unknown',
          status_updated_at: profiles[0].status_updated_at,
          // Never expose raw email, location, or contact details
        });
      }
    }

    return Response.json({ statuses });

  } catch (error) {
    console.error('Error fetching family statuses:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});