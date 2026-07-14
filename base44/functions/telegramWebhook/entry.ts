import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    // Self-register this function's URL as the Telegram webhook (idempotent)
    // req.url is the public dispatcher URL for this function
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    try {
      await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: req.url, allowed_updates: ["message"] })
      });
    } catch (e) {
      console.error('Webhook self-registration failed:', e);
    }

    const body = await req.json();

    // Telegram sends updates with an update_id and a message object
    if (body.update_id !== undefined && body.message) {
      const msg = body.message;
      const text = msg.text || '';
      const chatId = msg.chat?.id;
      const fromUser = msg.from;

      const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
      const base44 = createClientFromRequest(req);

      const reply = async (textToSend, markdown = false) => {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: textToSend,
            ...(markdown ? { parse_mode: 'Markdown' } : {})
          })
        });
      };

      // Handle /start command (with or without connection token)
      if (text.startsWith('/start')) {
        const parts = text.split(' ');
        const token = parts.length > 1 ? parts[1].trim() : '';

        if (token) {
          // Find the profile that issued this connect token (service role — webhook is unauthenticated)
          const profiles = await base44.asServiceRole.entities.UserProfile.filter({
            telegram_connect_token: token
          });

          if (profiles.length > 0) {
            const profile = profiles[0];
            await base44.asServiceRole.entities.UserProfile.update(profile.id, {
              telegram_chat_id: String(chatId),
              telegram_username: fromUser?.username || ''
            });

            await reply(
              `✅ *Connected to RallyPack!*\n\nYou'll receive emergency alerts here (evacuations, shelter openings).\n\nThis is a free, best-effort channel. Each alert includes the original timestamp and a delivery attempt number so you can judge if information may be stale. Always verify current status in the RallyPack app.`,
              true
            );
          } else {
            await reply(`Connection token not found or already used. Please open RallyPack Settings and tap "Connect Telegram" to get a fresh link.`);
          }
        } else {
          await reply(`Welcome to RallyPack Emergency Alerts! To connect this Telegram account to your RallyPack profile, open Settings in the RallyPack app and tap "Connect Telegram."`);
        }
      }

      return Response.json({ success: true });
    }

    // Health check endpoint
    return Response.json({ status: 'ok' });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});