import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Broadcasts a user's "I'm Safe" or "Need Help" status to family members
// via the user's selected channels: email, Telegram, Discord webhook.
// For Threads and Signal (no bot API), returns share links with pre-filled text.

// Validates that a webhook URL is a legitimate Discord webhook endpoint.
// Prevents SSRF: users could otherwise point discord_webhook_url at internal
// services (loopback, link-local, cloud metadata endpoints).
function isSafeDiscordWebhookUrl(url) {
  if (typeof url !== 'string' || url.length > 2048) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    if (!['discord.com', 'discordapp.com'].includes(parsed.hostname)) return false;
    if (!parsed.pathname.startsWith('/api/webhooks/')) return false;
    if (parsed.username || parsed.password) return false;
    return true;
  } catch {
    return false;
  }
}

const FROM_EMAIL = 'RallyPack <no-reply@rallypack.org>';

function isQuotaError(status, errorMessage) {
  if (status === 429) return true;
  const lower = (errorMessage || '').toLowerCase();
  return lower.includes('limit') || lower.includes('quota') || lower.includes('exceeded') || lower.includes('rate');
}

async function sendViaResend(to, subject, html, text, base44) {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) throw new Error('RESEND_API_KEY not set');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html, text })
  });
  if (!response.ok) {
    const errorBody = await response.text();
    if (isQuotaError(response.status, errorBody)) {
      await base44.asServiceRole.entities.EmailQueue.create({
        recipient_email: to,
        subject,
        html_body: html,
        text_body: text,
        from_name: FROM_EMAIL,
        source_function: 'sendStatusAlert',
        status: 'pending',
        queued_at: new Date().toISOString(),
      });
      return { queued: true };
    }
    throw new Error(`Resend API error (${response.status}): ${errorBody}`);
  }
  return await response.json();
}

function buildStatusEmailHtml(emoji, userName, statusText, messageBody) {
  const isSafe = statusText.includes('safe');
  const accentColor = isSafe ? '#16a34a' : '#dc2626';
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>RallyPack Status Alert</title></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Inter,DM Sans,Arial,sans-serif;color:#1c1c1a;line-height:1.6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #d8d2c6;max-width:600px;">
        <tr>
          <td style="background:${accentColor};padding:24px 40px;text-align:center;">
            <p style="margin:0;font-size:28px;">${emoji}</p>
            <h1 style="margin:8px 0 0;font-family:Georgia,serif;font-size:22px;font-weight:700;color:#ffffff;">${statusText}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 16px;font-size:15px;color:#1c1c1a;">${messageBody.replace(/\n/g, '<br>')}</p>
            <p style="margin:0;font-size:14px;color:#6b6b66;">This is an automated status alert from RallyPack.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#1c1c1a;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#ffffff;opacity:0.5;">&copy; 2026 RallyPack &middot; MIT License &middot; GDPR &amp; CCPA Compliant</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { status, rally_spot_name, latitude, longitude } = await req.json();
    // status: "safe" | "needs_assistance"

    // 1. Load user profile + family members
    const [profiles, familyMembers] = await Promise.all([
      base44.entities.UserProfile.filter({ created_by: user.email }),
      base44.entities.FamilyMember.filter({ created_by: user.email }),
    ]);
    const profile = profiles[0];
    if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });

    const channels = profile.status_alert_channels || ['email'];
    const userName = profile.display_name || user.full_name || user.email;
    const isSafe = status === 'safe';
    const emoji = isSafe ? '✅' : '🆘';
    const statusText = isSafe ? "I'm safe" : 'I need assistance';
    const rallyNote = rally_spot_name ? ` — rallying at ${rally_spot_name}` : '';
    const locationNote = latitude && longitude ? `\nLocation: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : '';
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC';

    const messageBody = `${emoji} ${userName} says: ${statusText}${rallyNote}\nTime: ${timestamp}${locationNote}`;

    const results = { email: [], telegram: [], discord: null, share_links: {} };

    // 2. EMAIL — send to family members with email addresses
    //    Registered RallyPack users → Base44 SendEmail
    //    Non-user emergency contacts → Resend (external delivery)
    if (channels.includes('email')) {
      const emailRecipients = familyMembers
        .map(m => m.emergency_contact)
        .filter(e => e && e.includes('@'));

      if (emailRecipients.length > 0) {
        const allUsers = await base44.asServiceRole.entities.User.list();
        const registeredEmails = new Set(
          allUsers.filter(u => u.email).map(u => u.email.toLowerCase())
        );

        for (const email of emailRecipients) {
          const isRegistered = registeredEmails.has(email.toLowerCase());
          try {
            if (isRegistered) {
              await base44.integrations.Core.SendEmail({
                to: email,
                subject: `${emoji} RallyPack: ${userName} — ${statusText}`,
                body: `${messageBody}\n\nThis is an automated status alert from RallyPack.`,
              });
              results.email.push({ to: email, delivered: true, channel: 'base44' });
            } else {
              const subject = `${emoji} RallyPack: ${userName} — ${statusText}`;
              const html = buildStatusEmailHtml(emoji, userName, statusText, messageBody);
              const text = `${messageBody}\n\nThis is an automated status alert from RallyPack.`;
              const result = await sendViaResend(email, subject, html, text, base44);
              results.email.push({
                to: email,
                delivered: !result.queued,
                queued: result.queued || false,
                channel: 'resend',
              });
            }
          } catch (e) {
            results.email.push({ to: email, delivered: false, error: e.message });
          }
        }
      }
    }

    // 3. TELEGRAM — send to family members who are linked RallyPack users with telegram_chat_id
    if (channels.includes('telegram')) {
      const linkedMembers = familyMembers.filter(m => m.linked_user_id && m.link_status === 'accepted');
      const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
      if (botToken && linkedMembers.length > 0) {
        // Look up each linked family member's profile for their telegram_chat_id
        for (const member of linkedMembers) {
          try {
            const familyProfiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by: member.emergency_contact });
            const fp = familyProfiles[0];
            if (fp?.telegram_chat_id) {
              const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: fp.telegram_chat_id, text: messageBody, parse_mode: 'Markdown' }),
              });
              const tgData = await tgRes.json();
              results.telegram.push({ to: member.name, delivered: tgData.ok, error: tgData.ok ? null : tgData.description });
            }
          } catch (e) {
            results.telegram.push({ to: member.name, delivered: false, error: e.message });
          }
        }
      }
    }

    // 4. DISCORD — post to webhook URL if configured
    if (channels.includes('discord') && profile.discord_webhook_url) {
      if (!isSafeDiscordWebhookUrl(profile.discord_webhook_url)) {
        results.discord = { delivered: false, error: 'invalid_discord_webhook_url' };
      } else {
      try {
        const color = isSafe ? 3066993 : 15158332; // green : red
        const dcRes = await fetch(profile.discord_webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'RallyPack Safety Beacon',
            embeds: [{
              title: `${emoji} ${statusText}`,
              description: `${userName} broadcast their status via RallyPack.`,
              color,
              fields: rally_spot_name ? [{ name: 'Rally Point', value: rally_spot_name, inline: true }] : [],
              footer: { text: `RallyPack · ${timestamp}` },
            }],
          }),
        });
        const dcData = await dcRes.text();
        results.discord = { delivered: dcRes.ok, status: dcRes.status };
      } catch (e) {
        results.discord = { delivered: false, error: e.message };
      }
      }
    }

    // 5. THREADS & SIGNAL — return share links (no bot API available)
    const shareText = encodeURIComponent(messageBody);
    if (channels.includes('threads')) {
      // Threads uses the Instagram-based share scheme; this opens the app with pre-filled text
      results.share_links.threads = `https://threads.net/intent/post?text=${shareText}`;
    }
    if (channels.includes('signal')) {
      // Signal share link
      results.share_links.signal = `https://signal.me/#message=${shareText}`;
    }

    // 6. Always create an in-app FamilyMessage record (existing behavior)
    await base44.entities.FamilyMessage.create({
      sender_id: user.id,
      receiver_id: 'family',
      content: messageBody,
      message_type: isSafe ? 'status_safe' : 'status_needs_assistance',
      read_by: [user.id],
    });

    return Response.json({ success: true, results });
  } catch (error) {
    console.error('sendStatusAlert error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});