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