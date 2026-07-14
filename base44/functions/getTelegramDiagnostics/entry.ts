import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");

    // Get current webhook info
    const infoRes = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
    const infoData = await infoRes.json();

    return Response.json({
      webhook_info: {
        url: infoData.result?.url,
        pending_update_count: infoData.result?.pending_update_count,
        last_error_date: infoData.result?.last_error_date,
        last_error_message: infoData.result?.last_error_message,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});