import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Get or create profile
    const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
    let profile = profiles.length > 0 ? profiles[0] : null;

    // Generate a connect token if the profile doesn't have one yet
    const token = profile?.telegram_connect_token || crypto.randomUUID();

    if (!profile) {
      profile = await base44.entities.UserProfile.create({
        telegram_connect_token: token
      });
    } else if (!profile.telegram_connect_token) {
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