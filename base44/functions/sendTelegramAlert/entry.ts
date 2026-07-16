import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { message, event_type, original_event_time, alert_id, user_email, secret, chat_id } = body;

    // Internal/automated calls pass the AUTOMATION_SECRET; otherwise the caller
    // must be authenticated and may only send to themselves (useful for testing).
    let targetEmail = user_email;
    if (secret && secret === Deno.env.get("AUTOMATION_SECRET")) {
      // internal call — use provided user_email
    } else {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      targetEmail = user.email;
    }

    if (!targetEmail) {
      return Response.json({ error: 'user_email is required for internal alert calls' }, { status: 400 });
    }

    const eventTime = original_event_time || new Date().toISOString();
    const eventDate = new Date(eventTime);
    const correlationId = alert_id || crypto.randomUUID();

    // Use chat_id directly if provided by the calling function (avoids re-lookup
    // and issues with created_by not being queryable in some SDK versions).
    // Otherwise fall back to profile lookup by email.
    let telegramChatId = chat_id;

    if (!telegramChatId) {
      const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by: targetEmail });
      if (profiles.length === 0) {
        return Response.json({ delivered: false, reason: 'no_profile' });
      }
      telegramChatId = profiles[0].telegram_chat_id;
    }

    // If the user hasn't connected Telegram, record a failed delivery attempt and exit
    if (!telegramChatId) {
      await base44.asServiceRole.entities.Notification.create({
        title: `${event_type || 'Alert'} (undelivered — Telegram not connected)`,
        message: message || '',
        type: 'alert',
        recipient_email: targetEmail,
        alert_id: correlationId,
        original_event_time: eventTime,
        delivery_attempts: 1,
        delivery_channel: 'telegram',
        delivery_status: 'failed'
      });
      return Response.json({ delivered: false, reason: 'telegram_not_connected' });
    }

    // Find an existing notification for this alert (retry tracking)
    let notification = null;
    if (alert_id) {
      const existing = await base44.asServiceRole.entities.Notification.filter({
        alert_id,
        recipient_email: targetEmail
      });
      if (existing.length > 0) notification = existing[0];
    }

    const attempts = (notification?.delivery_attempts || 0) + 1;

    // Build the metadata-rich message — using HTML parse_mode to avoid
    // Markdown parse errors when alert text contains *, _, [ etc. (common in NWS alerts)
    function escapeHtml(text) {
      return (text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    const formattedTime = eventDate.toISOString().replace('T', ' ').substring(0, 16) + ' UTC';
    const ageHours = (Date.now() - eventDate.getTime()) / (1000 * 60 * 60);

    let stalenessHtml = '';
    if (ageHours > 6) {
      stalenessHtml = `\n\n⚠️ <b>STALE ALERT:</b> This notification is ${Math.round(ageHours)} hours old. Information may be out of date — check the RallyPack app for current status.`;
    } else if (ageHours > 1) {
      stalenessHtml = `\n\n⚠️ Note: This notification is ${Math.round(ageHours)} hour(s) old. Verify current status in the RallyPack app.`;
    }

    const telegramText = `🚨 <b>EMERGENCY ALERT</b>\n━━━━━━━━━━━━━\n<b>Type:</b> ${escapeHtml(event_type || 'Alert')}\n<b>Valid as of:</b> ${escapeHtml(formattedTime)}\n<b>Delivery attempt:</b> ${attempts}\n\n${escapeHtml(message || '')}${stalenessHtml}\n\n<i>Always verify current status in the RallyPack app.</i>`;

    // Send via Telegram Bot API
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const tgResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: telegramText,
        parse_mode: 'HTML'
      })
    });

    // Handle non-JSON responses gracefully (e.g. 502 Bad Gateway returns plain text)
    let tgData;
    const contentType = tgResponse.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      tgData = await tgResponse.json();
    } else {
      const rawBody = await tgResponse.text();
      tgData = { ok: false, description: `HTTP ${tgResponse.status}: ${rawBody.substring(0, 300)}` };
    }

    const recordResult = async (status, telegramMessageId) => {
      if (notification) {
        await base44.asServiceRole.entities.Notification.update(notification.id, {
          delivery_attempts: attempts,
          delivery_status: status,
          ...(telegramMessageId ? { telegram_message_id: telegramMessageId } : {}),
          read: false
        });
      } else {
        await base44.asServiceRole.entities.Notification.create({
          title: `${event_type || 'Alert'}${status === 'failed' ? ' (failed)' : ''}`,
          message: message || '',
          type: 'alert',
          recipient_email: targetEmail,
          alert_id: correlationId,
          original_event_time: eventTime,
          delivery_attempts: attempts,
          delivery_channel: 'telegram',
          delivery_status: status,
          ...(telegramMessageId ? { telegram_message_id: telegramMessageId } : {})
        });
      }
    };

    if (tgData.ok) {
      await recordResult('delivered', String(tgData.result.message_id));
      return Response.json({ delivered: true, message_id: tgData.result.message_id, attempts });
    } else {
      await recordResult('failed');
      return Response.json({ delivered: false, reason: 'telegram_api_error', error: tgData.description, attempts });
    }
  } catch (error) {
    console.error('sendTelegramAlert error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});