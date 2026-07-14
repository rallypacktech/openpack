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

    // Try multiple URL formats to find the correct one
    const appId = Deno.env.get("BASE44_APP_ID");
    const urlsToTest = [
      `https://app--${appId}.base44.app/functions/telegramWebhook`,
      `https://app--${appId}.base44.app/api/functions/telegramWebhook`,
      `https://app--${appId}.base44.app/functions/telegramwebhook`,
    ];

    const results = [];
    for (const url of urlsToTest) {
      // Test with a simple GET/fetch to see if the URL resolves
      const testRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      results.push({
        url,
        status: testRes.status,
        body: await testRes.text().catch(() => 'no body')
      });
    }

    // Set webhook to the first URL and check
    const setRes = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: urlsToTest[0], allowed_updates: ["message"] })
    });
    const setData = await setRes.json();

    const infoRes2 = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
    const infoData2 = await infoRes2.json();

    return Response.json({
      url_tests: results,
      setWebhook_result: setData,
      updated_webhook: {
        url: infoData2.result?.url,
        pending_update_count: infoData2.result?.pending_update_count,
        last_error_date: infoData2.result?.last_error_date,
        last_error_message: infoData2.result?.last_error_message,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});