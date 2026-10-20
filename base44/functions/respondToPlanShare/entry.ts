import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// A family member accepting or declining shared access to someone else's plan.
//
// The invited person cannot update the owner's FamilyMember record under row
// level security — the owner does — so the answer has to be recorded here,
// after checking that the caller really is the person the share was offered to.
// Accepting links their account to the owner's plan; it never copies the plan,
// so both people keep their own records and the owner can revoke at any time.

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const memberId = String(body.family_member_id || '').trim();
    const action = String(body.action || '').trim();

    if (!memberId) {
      return Response.json({ error: 'family_member_id is required' }, { status: 400 });
    }
    if (action !== 'accept' && action !== 'decline') {
      return Response.json({ error: "action must be 'accept' or 'decline'" }, { status: 400 });
    }

    let member;
    try {
      member = await base44.asServiceRole.entities.FamilyMember.get(memberId);
    } catch (_e) {
      return Response.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Only the invited address may answer — and only for a share still open.
    const invitedEmail = String(member.emergency_contact || '').trim().toLowerCase();
    const myEmail = String(user.email || '').trim().toLowerCase();
    if (!invitedEmail || invitedEmail !== myEmail) {
      return Response.json({ error: 'This invitation is not addressed to you' }, { status: 403 });
    }
    if (member.link_status === 'accepted' && member.linked_user_id && member.linked_user_id !== user.id) {
      return Response.json({ error: 'This plan is already shared with another account' }, { status: 409 });
    }

    const now = new Date().toISOString();
    const patch =
      action === 'accept'
        ? { linked_user_id: user.id, link_status: 'accepted', responded_at: now }
        : { linked_user_id: '', link_status: 'declined', responded_at: now };

    await base44.asServiceRole.entities.FamilyMember.update(memberId, patch);

    return Response.json({
      success: true,
      status: patch.link_status,
      message:
        action === 'accept'
          ? 'Shared access accepted. You can open their plan whenever you need it.'
          : 'Shared access declined. Nothing was linked.',
    });
  } catch (error) {
    console.error('respondToPlanShare error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}