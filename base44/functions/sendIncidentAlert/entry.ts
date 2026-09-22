import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

// Emails an organization's opted-in members an incident alert.
// The recipient list is resolved server-side from the subscription, so the caller
// can never point the alert at arbitrary addresses.

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const subscriptionId = body.subscription_id;
    if (!subscriptionId) {
      return Response.json({ error: 'subscription_id is required' }, { status: 400 });
    }

    const subs = await base44.asServiceRole.entities.BusinessSubscription.filter({ id: subscriptionId });
    const subscription = subs[0];
    if (!subscription) {
      return Response.json({ error: 'Organization not found' }, { status: 404 });
    }

    const isOwner =
      subscription.created_by_id === user.id || subscription.owner_email === user.email;
    if (!isOwner && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const members = await base44.asServiceRole.entities.OrganizationMember.filter({
      subscription_id: subscriptionId,
    });
    const toNotify = members.filter(
      (m) => m.notify_on_evacuation && m.status !== 'inactive' && m.email,
    );

    const orgName = subscription.organization_name || 'Your Organization';
    const areaNote = body.postal_code
      ? `This alert is targeted to the ${body.postal_code} area and neighboring postal codes.`
      : '';
    const messageText =
      String(body.message || '').trim() ||
      'Please be aware of an active incident in your area. Follow all instructions from local emergency services.';

    let sent = 0;
    for (const member of toNotify) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: member.email,
          subject: `⚠️ INCIDENT ALERT — ${orgName}`,
          body: `Dear ${member.full_name || member.email},\n\nThis is an incident alert from ${orgName}.\n\n${messageText}\n\n${areaNote}\n\nStay safe and monitor official channels for updates.\n\n— ${subscription.organization_name || 'Emergency Response Team'}`,
        });
        sent++;
      } catch (e) {
        console.error('Incident alert email failed for', member.email, e);
      }
    }

    return Response.json({ sent, total: toNotify.length });
  } catch (error) {
    console.error('sendIncidentAlert error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}