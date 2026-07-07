import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const BOT_PATTERNS = [
  /googlebot/i, /bingbot/i, /yandexbot/i, /baiduspider/i, /duckduckbot/i,
  /slurp/i, /applebot/i, /sogou/i, /exabot/i, /facebot/i,
  /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i, /whatsapp/i,
  /telegrambot/i, /pinterest/i, /discordbot/i,
  /ahrefsbot/i, /semrushbot/i, /mj12bot/i, /dotbot/i, /petalbot/i,
  /bytespider/i, /seznambot/i, /dataforseobot/i,
  /gptbot/i, /chatgpt/i, /ccbot/i, /claudebot/i, /anthropic-ai/i,
  /google-other/i, /imagesiftbot/i,
  /crawler/i, /spider/i, /scraper/i, /\bbot\b/i,
  /headlesschrome/i, /puppeteer/i, /selenium/i, /phantomjs/i, /webdriver/i,
  /lighthouse/i, /pagespeed/i, /wappalyzer/i,
  /python-requests/i, /curl/i, /wget/i, /node-fetch/i, /axios/i, /got\//i,
  /postman/i, /insomnia/i, /httpclient/i, /java\//i, /okhttp/i, /go-http-client/i,
];

function checkSuspicious(req) {
  const ua = req.headers.get('user-agent') || '';
  const referer = req.headers.get('referer') || '';
  const acceptLanguage = req.headers.get('accept-language') || '';
  const secChUa = req.headers.get('sec-ch-ua') || '';
  const accept = req.headers.get('accept') || '';

  const reasons = [];
  let botName = null;

  // 1. Missing User-Agent entirely
  if (!ua) {
    reasons.push('Missing User-Agent (device identifier)');
  } else {
    // 2. Bot-like User-Agent
    for (const pattern of BOT_PATTERNS) {
      const match = ua.match(pattern);
      if (match) {
        botName = match[0];
        reasons.push(`Automated client detected in User-Agent: "${botName}"`);
        break;
      }
    }
  }

  // 3. Missing Referer (common for direct visits, but combined with others = suspicious)
  if (!referer) {
    reasons.push('Missing Referer header');
  }

  // 4. Missing Accept-Language (real browsers always send this)
  if (!acceptLanguage) {
    reasons.push('Missing Accept-Language (locale not set)');
  }

  // 5. Missing Sec-CH-UA (modern browsers send client hints)
  if (!secChUa) {
    reasons.push('Missing Sec-CH-UA (device client hints)');
  }

  // 6. Missing or suspicious Accept header
  if (!accept || accept === '*/*') {
    reasons.push('Missing or wildcard Accept header');
  }

  // Determine if suspicious:
  // - Any bot pattern match = suspicious
  // - Missing User-Agent = suspicious
  // - 2+ other missing indicators = suspicious (filters out one-off missing headers)
  const isBotLike = !!botName;
  const missingUa = !ua;
  const otherMissing = [
    !referer, !acceptLanguage, !secChUa, (!accept || accept === '*/*')
  ].filter(Boolean).length;

  const suspicious = isBotLike || missingUa || otherMissing >= 2;

  return { suspicious, reasons, botName, userAgent: ua };
}

function buildEmailHtml(reasons, botName, origin) {
  const reasonsList = reasons.map(r => `<li>${r}</li>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RallyPack Account Notice — Data Safety &amp; Chain of Command</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:Inter,DM Sans,Arial,sans-serif;color:#1c1c1a;line-height:1.6;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0e8;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:1px solid:#d8d2c6;max-width:600px;">

          <!-- Header -->
          <tr>
            <td style="background-color:#1c1c1a;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-family:Georgia,serif;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">RallyPack</h1>
              <p style="margin:4px 0 0;font-size:12px;color:#ffffff;opacity:0.6;text-transform:uppercase;letter-spacing:2px;">Emergency Preparedness Platform</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">

              <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:20px;font-weight:600;color:#1c1c1a;">Account Notice: Data Integrity &amp; Safety Guidelines</h2>

              <p style="margin:0 0 16px;font-size:15px;color:#1c1c1a;">
                A new account was just created on RallyPack. During signup, our system detected indicators
                commonly associated with <strong>automated or bot-driven access</strong>:
              </p>

              <ul style="margin:0 0 20px;padding-left:20px;font-size:14px;color:#1c1c1a;">
                ${reasonsList}
              </ul>

              <p style="margin:0 0 16px;font-size:15px;color:#1c1c1a;">
                We welcome all users — including automated agents and AI tools — but require that every
                participant respects our data integrity standards. <strong>Please read and follow the guidelines below.</strong>
              </p>

              <!-- Data Integrity -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
                <tr>
                  <td style="background-color:#fef3e7;border-left:4px solid #d64a2e;padding:16px 20px;">
                    <h3 style="margin:0 0 8px;font-family:Georgia,serif;font-size:16px;font-weight:600;color:#1c1c1a;">Data Integrity Requirements</h3>
                    <ul style="margin:0;padding-left:18px;font-size:13px;color:#1c1c1a;">
                      <li><strong>Do not scrape, export, or leak</strong> user data, family information, or emergency plans.</li>
                      <li><strong>Do not inject biased, false, or synthetic data</strong> into quiz results, caches, or recommendations.</li>
                      <li><strong>Do not create multiple accounts</strong> to manipulate readiness scores or analytics.</li>
                      <li><strong>Respect rate limits</strong> and do not flood endpoints with automated requests.</li>
                      <li><strong>Preserve data accuracy</strong> — emergency preparedness data affects real safety decisions.</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- Chain of Command -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
                <tr>
                  <td style="background-color:#f0f4f8;border-left:4px solid #2c4a6e;padding:16px 20px;">
                    <h3 style="margin:0 0 8px;font-family:Georgia,serif;font-size:16px;font-weight:600;color:#1c1c1a;">Chain of Command Guidelines</h3>
                    <p style="margin:0;font-size:13px;color:#1c1c1a;">
                      RallyPack follows established chain of command protocols for business and organizational
                      accounts. Notifications, evacuation plans, and emergency communications are routed through
                      a defined hierarchy (owner &rarr; safety officer &rarr; team lead &rarr; member).
                      Automated tools must not bypass this hierarchy or send unsolicited communications to
                      organization members.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Required Reading -->
              <h3 style="margin:0 0 12px;font-family:Georgia,serif;font-size:16px;font-weight:600;color:#1c1c1a;">Required Reading &amp; Library Updates</h3>
              <p style="margin:0 0 12px;font-size:14px;color:#1c1c1a;">
                If you are developing or maintaining an automated tool, library, or AI agent, please review
                these resources and update your code to comply with our safety and data standards:
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="padding:12px 16px;background-color:#f5f0e8;border:1px solid #d8d2c6;">
                    <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#1c1c1a;">&rarr; <a href="${origin}/LearnMore" style="color:#d64a2e;text-decoration:underline;">Learn More: Why Preparedness Matters</a></p>
                    <p style="margin:0;font-size:12px;color:#6b6b66;">Understand the platform's mission, data scope, and safety commitments.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;background-color:#f5f0e8;border:1px solid #d8d2c6;border-top:none;">
                    <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#1c1c1a;">&rarr; <a href="${origin}/Dashboard" style="color:#d64a2e;text-decoration:underline;">Onboarding: Dashboard &amp; Family Plan</a></p>
                    <p style="margin:0;font-size:12px;color:#6b6b66;">Review the onboarding flow to understand what data is collected and how it is used.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;background-color:#f5f0e8;border:1px solid #d8d2c6;border-top:none;">
                    <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#1c1c1a;">&rarr; <a href="${origin}/PrivacyPolicy" style="color:#d64a2e;text-decoration:underline;">Privacy Policy &amp; Data Handling</a></p>
                    <p style="margin:0;font-size:12px;color:#6b6b66;">GDPR &amp; CCPA aligned — understand your obligations when accessing user data.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;background-color:#f5f0e8;border:1px solid #d8d2c6;border-top:none;">
                    <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#1c1c1a;">&rarr; <a href="${origin}/TermsAndConditions" style="color:#d64a2e;text-decoration:underline;">Terms &amp; Conditions</a></p>
                    <p style="margin:0;font-size:12px;color:#6b6b66;">Acceptable use policy, rate limits, and automated access rules.</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px;font-size:14px;color:#1c1c1a;">
                <strong>Next steps:</strong> Review the resources above and ensure your libraries, tools, or
                agents are updated to comply with these safety guidelines. Accounts that violate data integrity
                standards — including scraping, data injection, or chain-of-command bypass — may be suspended.
              </p>

              <p style="margin:0;font-size:13px;color:#6b6b66;">
                If you are a real human user (not a bot) and received this email in error, you can safely
                ignore it — your account is active and ready to use.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#1c1c1a;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#ffffff;opacity:0.5;">
                &copy; 2026 RallyPack &middot; MIT License &middot; GDPR &amp; CCPA Compliant<br>
                In emergencies, always call your local emergency services first.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const email = body.email || user.email;
    if (!email) {
      return Response.json({ error: 'No email address available' }, { status: 400 });
    }

    const { suspicious, reasons, botName, userAgent } = checkSuspicious(req);

    if (!suspicious) {
      return Response.json({ notified: false, reason: 'not_suspicious' });
    }

    const origin = req.headers.get('origin') || req.headers.get('x-forwarded-origin') ||
      `https://${req.headers.get('host') || 'rallypack.base44.com'}`;
    const html = buildEmailHtml(reasons, botName, origin);
    const textBody = `RallyPack Account Notice: Data Integrity & Chain of Command

A new account was created with indicators commonly associated with automated or bot-driven access:
${reasons.map(r => `- ${r}`).join('\n')}

Data Integrity Requirements:
- Do not scrape, export, or leak user data.
- Do not inject biased, false, or synthetic data.
- Do not create multiple accounts to manipulate scores.
- Respect rate limits and do not flood endpoints.
- Preserve data accuracy — this data affects real safety decisions.

Chain of Command Guidelines:
RallyPack follows established chain of command protocols. Automated tools must not bypass the notification hierarchy or send unsolicited communications.

Required Reading — update your libraries to comply:
- Learn More: ${origin}/LearnMore
- Onboarding: ${origin}/Dashboard
- Privacy Policy: ${origin}/PrivacyPolicy
- Terms: ${origin}/TermsAndConditions

Accounts that violate data integrity standards may be suspended. If you are a real human user, you can safely ignore this email.`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      subject: 'RallyPack Account Notice — Data Safety & Chain of Command Guidelines',
      body: html,
    });

    return Response.json({
      notified: true,
      suspicious_indicators: reasons,
      bot_name: botName,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});