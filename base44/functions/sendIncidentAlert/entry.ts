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

    const isAdmin = user.role === 'admin';
    const isOwner =
      subscription.created_by_id === user.id || subscription.owner_email === user.email;
    if (!isOwner && !isAdmin) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Entitlement: only an active subscription whose plan allows alert sending may
    // dispatch branded incident alerts. Without this a self-created trial account
    // could send attacker-written "INCIDENT ALERT" mail under RallyPack's brand.
    if (
      !isAdmin &&
      ((subscription.status !== 'active' && subscription.status !== 'trialing') ||
        !subscription.alert_sending_enabled)
    ) {
      return Response.json({ error: 'Your organization subscription does not allow alert sending' }, { status: 403 });
    }

    const members = await base44.asServiceRole.entities.OrganizationMember.filter({
      subscription_id: subscriptionId,
    });

    // Recipients are restricted to registered RallyPack accounts. A member row is
    // only an address someone typed in, so on its own it must never be enough to
    // make the app deliver branded emergency mail to an outside mailbox.
    const allUsers = await base44.asServiceRole.entities.User.list();
    const registeredEmails = new Set(
      allUsers.filter((u) => u.email).map((u) => u.email.toLowerCase()),
    );
    const seenEmails = new Set();
    const toNotify = [];
    for (const member of members) {
      if (!member.notify_on_evacuation || member.status === 'inactive' || !member.email) continue;
      const key = String(member.email).trim().toLowerCase();
      if (!key || seenEmails.has(key) || !registeredEmails.has(key)) continue;
      seenEmails.add(key);
      toNotify.push(member);
    }

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