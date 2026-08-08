import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { need_id } = body;
    if (!need_id) return Response.json({ error: 'need_id is required' }, { status: 400 });

    // Get the need
    const need = await base44.asServiceRole.entities.OrganizationNeed.get(need_id);
    if (!need) return Response.json({ error: 'Need not found' }, { status: 404 });
    if (need.status !== 'open') return Response.json({ error: 'This need is no longer open for claiming' }, { status: 400 });

    // Don't allow claiming your own need
    if (need.posted_by_email === user.email) {
      return Response.json({ error: 'You cannot claim your own need' }, { status: 400 });
    }

    // Get the claimer's organization name
    let claimerOrg = user.email;
    try {
      const subs = await base44.asServiceRole.entities.BusinessSubscription.filter({ owner_email: user.email });
      if (subs && subs.length > 0 && subs[0].organization_name) {
        claimerOrg = subs[0].organization_name;
      }
    } catch (e) {
      // fall back to email
    }

    // Update the need to claimed
    await base44.asServiceRole.entities.OrganizationNeed.update(need_id, {
      status: 'claimed',
      claimed_by_org: claimerOrg,
      claimed_by_email: user.email,
      claimed_at: new Date().toISOString(),
    });

    // Notify the asking business that their need was claimed
    const contactEmail = need.contact_email || need.posted_by_email;
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: contactEmail,
        subject: `${claimerOrg} has claimed your need: ${need.need_title}`,
        body: `Hello ${need.organization_name},\n\n${claimerOrg} (${user.email}) has claimed your posted need on the RallyPack Needs Board.\n\nNeed: ${need.need_title}\nDescription: ${need.need_description}\n\nPlease contact them directly to coordinate:\n  Email: ${user.email}\n\nOnce the need is fulfilled, you can mark it as filled or remove it from the Needs Board in your Business Dashboard.\n\n— RallyPack`,
      });
    } catch (e) {
      // Email may fail if recipient is not a registered user — still mark as claimed
    }

    return Response.json({
      success: true,
      claimed_by: claimerOrg,
      contact_email: contactEmail,
      contact_phone: need.contact_phone || null,
    });
  } catch (error) {
    console.error('claimOrganizationNeed error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});