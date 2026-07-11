import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Dispatches an approved alert submission to all organization members.
// Critical and custom alerts go to BOTH email and Telegram (bypassing user preferences).
// Non-critical alerts respect user notification_method settings.
// Creates Notification records for each delivery.

function buildEmailHtml(title, body, orgName, eventLevel) {
  const levelColor = eventLevel === 'critical' ? '#dc2626' : eventLevel === 'warning' ? '#ea580c' : eventLevel === 'watch' ? '#ca8a04' : '#2563eb';
  const levelLabel = eventLevel.charAt(0).toUpperCase() + eventLevel.slice(1);
  const bodyHtml = (body || '').split('\n').map(line => `<p style="margin:0 0 10px 0;line-height:1.6;">${line.replace(/</g, '&lt;')}</p>`).join('');
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:${levelColor};color:#fff;padding:16px 20px;border-radius:8px 8px 0 0;">
      <p style="margin:0;font-size:12px;text-transform:uppercase;letter-spacing:1px;opacity:0.9;">${orgName} \u2014 Emergency Alert</p>
      <h1 style="margin:4px 0 0 0;font-size:22px;font-weight:700;">${title}</h1>
    </div>
    <div style="background:#fff;padding:20px;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 8px 8px;">
      <div style="display:inline-block;background:${levelColor}20;color:${levelColor};padding:4px 12px;border-radius:4px;font-size:12px;font-weight:600;margin-bottom:16px;">${levelLabel}</div>
      ${bodyHtml}
      <hr style="border:none;border-top:1px solid #e4e4e7;margin:20px 0;">
      <p style="margin:0;font-size:12px;color:#71717a;">This alert was issued by <strong>${orgName}</strong> via RallyPack. Always verify current status in the RallyPack app.</p>
    </div>
  </div>
</body>
</html>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { submission_id } = body;

    if (!submission_id) {
      return Response.json({ error: 'submission_id is required' }, { status: 400 });
    }

    const submissions = await base44.asServiceRole.entities.AlertSubmission.filter({ id: submission_id });
    if (submissions.length === 0) {
      return Response.json({ error: 'Submission not found' }, { status: 404 });
    }

    const submission = submissions[0];

    // Verify the submission is approved
    if (submission.status !== 'approved') {
      return Response.json({ error: `Submission must be approved before dispatching (current: ${submission.status})` }, { status: 400 });
    }

    // Verify the calling user is authorized (either the submitter or an admin)
    const isAdmin = user.role === 'admin';
    const isSubmitter = submission.submitted_by_email === user.email;
    if (!isAdmin && !isSubmitter) {
      return Response.json({ error: 'You are not authorized to dispatch this alert' }, { status: 403 });
    }

    // Don't send twice
    if (submission.status === 'sent' || submission.sent_at) {
      return Response.json({ error: 'This alert has already been dispatched', delivery_summary: submission.delivery_summary }, { status: 400 });
    }

    // Get all org members
    const members = await base44.asServiceRole.entities.OrganizationMember.filter({
      subscription_id: submission.subscription_id,
    });

    const AUTOMATION_SECRET = Deno.env.get("AUTOMATION_SECRET");
    const eventTime = new Date().toISOString();
    const isCriticalOrCustom = submission.event_level === 'critical' || submission.incident_type === 'custom';

    let emailDelivered = 0;
    let telegramDelivered = 0;
    let inAppCreated = 0;
    let failed = 0;
    let noContact = 0;
    const results = [];

    const emailHtml = buildEmailHtml(submission.generated_title, submission.generated_body, submission.organization_name, submission.event_level);

    for (const member of members) {
      if (!member.email) continue;

      // Look up the member's profile for notification preferences + Telegram
      const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by: member.email });
      const profile = profiles.length > 0 ? profiles[0] : null;
      const notificationMethod = profile?.notification_method || 'both';
      const telegramConnected = !!profile?.telegram_chat_id;

      // Determine which channels to use
      let channels = [];
      if (isCriticalOrCustom) {
        // Critical and custom messages always go to BOTH email and Telegram
        channels.push('email');
        if (telegramConnected) channels.push('telegram');
        else channels.push('in_app'); // fallback if Telegram not connected
      } else {
        // Respect user notification settings
        if (notificationMethod === 'email') channels.push('email');
        else if (notificationMethod === 'in_app') channels.push('in_app');
        else {
          channels.push('email');
          channels.push('in_app');
        }
        // Also send to Telegram if connected
        if (telegramConnected) channels.push('telegram');
      }

      if (channels.length === 0) {
        noContact++;
        results.push({ email: member.email, error: 'no notification channel available' });
        continue;
      }

      const memberResult = { email: member.email, channels: {} };

      for (const channel of channels) {
        try {
          if (channel === 'email') {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: member.email,
              subject: submission.generated_title,
              body: emailHtml,
            });
            emailDelivered++;
            memberResult.channels.email = 'delivered';

            // Also create an in-app notification record
            await base44.asServiceRole.entities.Notification.create({
              title: submission.generated_title,
              message: submission.generated_body,
              type: submission.event_level === 'critical' ? 'alert' : 'warning',
              recipient_email: member.email,
              original_event_time: eventTime,
              delivery_channel: 'email',
              delivery_status: 'delivered',
              alert_id: submission.id,
              read: false,
            });
          } else if (channel === 'telegram') {
            const tgResult = await base44.asServiceRole.functions.invoke('sendTelegramAlert', {
              message: submission.generated_body,
              event_type: submission.generated_title,
              user_email: member.email,
              secret: AUTOMATION_SECRET,
              original_event_time: eventTime,
              alert_id: submission.id,
            });
            const tgData = tgResult.data || tgResult;
            if (tgData.delivered) {
              telegramDelivered++;
              memberResult.channels.telegram = 'delivered';
            } else {
              // Telegram failed — if critical/custom, fall back to in-app + email
              if (isCriticalOrCustom && !channels.includes('email')) {
                await base44.asServiceRole.integrations.Core.SendEmail({
                  to: member.email,
                  subject: submission.generated_title,
                  body: emailHtml,
                });
                emailDelivered++;
                memberResult.channels.email = 'delivered (telegram fallback)';
              }
              memberResult.channels.telegram = tgData.reason || 'failed';
              failed++;
            }
          } else if (channel === 'in_app') {
            await base44.asServiceRole.entities.Notification.create({
              title: submission.generated_title,
              message: submission.generated_body,
              type: submission.event_level === 'critical' ? 'alert' : 'warning',
              recipient_email: member.email,
              original_event_time: eventTime,
              delivery_channel: 'in_app',
              delivery_status: 'delivered',
              alert_id: submission.id,
              read: false,
            });
            inAppCreated++;
            memberResult.channels.in_app = 'delivered';
          }
        } catch (chErr) {
          failed++;
          memberResult.channels[channel] = chErr.message;
        }
      }
      results.push(memberResult);
    }

    const deliverySummary = JSON.stringify({
      total_members: members.length,
      email_delivered: emailDelivered,
      telegram_delivered: telegramDelivered,
      in_app_created: inAppCreated,
      failed,
      no_contact: noContact,
      dual_delivery: isCriticalOrCustom,
      sent_at: eventTime,
    });

    // Update submission
    await base44.asServiceRole.entities.AlertSubmission.update(submission_id, {
      status: 'sent',
      sent_at: eventTime,
      delivery_summary: deliverySummary,
    });

    return Response.json({
      success: true,
      total_members: members.length,
      email_delivered: emailDelivered,
      telegram_delivered: telegramDelivered,
      in_app_created: inAppCreated,
      failed,
      no_contact: noContact,
      dual_delivery: isCriticalOrCustom,
      results: results.slice(0, 50),
    });
  } catch (error) {
    console.error('sendApprovedAlert error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});