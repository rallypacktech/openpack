import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { message, event_type } = body;

    if (!message || !message.trim()) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    // Check if this user is authorized to send delegated alerts
    const delegations = await base44.asServiceRole.entities.AlertDelegation.filter({
      authorized_email: user.email,
      is_active: true
    });

    if (delegations.length === 0) {
      return Response.json({ error: 'Not authorized to send delegated alerts' }, { status: 403 });
    }

    const delegation = delegations[0];

    // Verify the delegation was actually granted by an admin and that the
    // referenced subscription is entitled to send alerts, so a forged or stale
    // delegation row cannot be used to broadcast to an organization's members.
    if (!delegation.granted_by) {
      return Response.json({ error: 'Delegation is missing an admin grant' }, { status: 403 });
    }
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
    const adminEmails = new Set(admins.map(a => (a.email || '').toLowerCase()).filter(Boolean));
    if (!adminEmails.has(delegation.granted_by.toLowerCase())) {
      return Response.json({ error: 'Delegation was not granted by an admin' }, { status: 403 });
    }
    const subs = await base44.asServiceRole.entities.BusinessSubscription.filter({ id: delegation.subscription_id });
    const subscription = subs.length > 0 ? subs[0] : null;
    if (!subscription || (subscription.status !== 'active' && subscription.status !== 'trialing') || !subscription.alert_sending_enabled) {
      return Response.json({ error: 'Organization subscription does not allow alert sending' }, { status: 403 });
    }

    const AUTOMATION_SECRET = Deno.env.get("AUTOMATION_SECRET");
    const eventTime = new Date().toISOString();
    const alertId = crypto.randomUUID();

    // Find the organization's members
    const members = await base44.asServiceRole.entities.OrganizationMember.filter({
      subscription_id: delegation.subscription_id
    });

    let delivered = 0;
    let failed = 0;
    let noTelegram = 0;
    const results = [];

    for (const member of members) {
      if (!member.email) continue;
      try {
        const result = await base44.asServiceRole.functions.invoke('sendTelegramAlert', {
          message: message.trim(),
          event_type: event_type || `${delegation.organization_name} Alert`,
          original_event_time: eventTime,
          alert_id: alertId,
          user_email: member.email,
          secret: AUTOMATION_SECRET
        });

        const data = result.data || result;
        if (data.delivered) {
          delivered++;
        } else if (data.reason === 'telegram_not_connected') {
          noTelegram++;
        } else {
          failed++;
        }
        results.push({ email: member.email, ...data });
      } catch (err) {
        failed++;
        results.push({ email: member.email, error: err.message });
      }
    }

    return Response.json({
      success: true,
      organization: delegation.organization_name,
      total_members: members.length,
      delivered,
      failed,
      no_telegram: noTelegram,
      results
    });
  } catch (error) {
    console.error('sendDelegatedTelegramAlert error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});