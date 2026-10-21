import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// How long a freshly issued connect link stays usable. Long enough to open
// Telegram and send the message, short enough that a leaked link goes stale.
const CONNECT_TOKEN_TTL_MS = 30 * 60 * 1000;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Get or create profile
    const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
    let profile = profiles.length > 0 ? profiles[0] : null;

    // The connect link is a bearer credential for the user's alert channel, so the
    // token is minted fresh on every request — rotating any previous one — and
    // carries its own expiry as "<expiryMs>-<uuid>". telegramWebhook enforces that
    // expiry and clears the token on the first successful pairing, so a leaked
    // link cannot be replayed.
    const token = `${Date.now() + CONNECT_TOKEN_TTL_MS}-${crypto.randomUUID()}`;

    if (!profile) {
      profile = await base44.entities.UserProfile.create({
        telegram_connect_token: token
      });
    } else {
      await base44.entities.UserProfile.update(profile.id, { telegram_connect_token: token });
      profile.telegram_connect_token = token;
    }

    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");

    // Webhook URL is self-registered by the telegramWebhook function itself,
    // so we don't need to set it here (req.url uses hash-based dispatcher URLs,
    // so string replacement of function names doesn't work).

    // Look up the bot's username to build the deep link
    const meResponse = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const meData = await meResponse.json();

    if (!meData.ok) {
      return Response.json({ error: 'Could not reach Telegram bot. Verify the TELEGRAM_BOT_TOKEN secret is set correctly.' }, { status: 500 });
    }

    const botUsername = meData.result.username;
    const connectUrl = `https://t.me/${botUsername}?start=${token}`;

    return Response.json({
      connect_url: connectUrl,
      bot_username: botUsername,
      already_connected: !!profile.telegram_chat_id,
      telegram_username: profile.telegram_username || null
    });
  } catch (error) {
    console.error('getTelegramConnectLink error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});