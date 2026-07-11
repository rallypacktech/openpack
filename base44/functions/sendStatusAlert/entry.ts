import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Broadcasts a user's "I'm Safe" or "Need Help" status to family members
// via the user's selected channels: email, Telegram, Discord webhook.
// For Threads and Signal (no bot API), returns share links with pre-filled text.

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
    if (channels.includes('email')) {
      const emailRecipients = familyMembers
        .map(m => m.emergency_contact)
        .filter(e => e && e.includes('@'));

      for (const email of emailRecipients) {
        try {
          await base44.integrations.Core.SendEmail({
            to: email,
            subject: `${emoji} RallyPack: ${userName} — ${statusText}`,
            body: `${messageBody}\n\nThis is an automated status alert from RallyPack.`,
          });
          results.email.push({ to: email, delivered: true });
        } catch (e) {
          results.email.push({ to: email, delivered: false, error: e.message });
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