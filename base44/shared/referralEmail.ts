// Single source of truth for every RallyPack referral email.
//
// The multi-audience outreach (contactPendingReferrals), the weekly general
// catch-up (sendGeneralEmailCatchup) and the daily HOA outreach (hoaOutreach)
// all render through here, so the two-option call to action — free for
// residents/members vs. the paid business dashboard — stays identical across
// every audience and only has to be edited once.

export const FROM_EMAIL = 'RallyPack <no-reply@rallypack.org>';
export const ORIGIN = 'https://rallypack.org';

export const BUSINESS_PATH = '/BusinessOnboarding';
export const READINESS_MAP_PATH = '/readiness-map';

export const READINESS_MAP_CTA = 'See how prepared you are compared to the rest of the world';

export const DEFAULT_OPENER =
  'The RallyPack Team thought your organization would benefit from RallyPack — free preparedness resources you can share, and a business dashboard for the operational side.';

export const DEFAULT_FREE = {
  title: 'Free — for your members, staff and neighbors',
  body: 'RallyPack is free and open-source. Anyone can build go-bags, document evacuation plans, log emergency supply caches, get real-time hazard alerts, and see how their neighborhood ranks on the Readiness Map. No cost, and no account required.',
};

export const DEFAULT_BUSINESS = {
  title: 'Paid — for your organization',
  body: 'If your organization wants the business side — tracking first aid kits, AEDs, staff certifications and fire equipment across every location, with expiry reminders, documented evacuation plans and team-wide emergency alerts — that is a paid plan. Every feature is free for 7 days, then pick the plan that fits.',
};

export function escapeHtml(str: any) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// The free option is the audience's own landing page, except for audiences whose
// configured path is a business page — those point at the Readiness Map instead,
// since the free option must never send someone to the paid flow.
export function freeOption(config: any, origin: string = ORIGIN) {
  const rawPath = config.freePath || config.learnPath || READINESS_MAP_PATH;
  const path = rawPath.indexOf(BUSINESS_PATH) === 0 ? READINESS_MAP_PATH : rawPath;
  const isMap = path === READINESS_MAP_PATH;
  return {
    title: config.freeTitle || DEFAULT_FREE.title,
    body: config.freeBody || DEFAULT_FREE.body,
    ctaLabel: config.freeCtaLabel || (isMap ? READINESS_MAP_CTA : 'Explore the free resources'),
    url: origin + path,
  };
}

export function businessOption(config: any, origin: string = ORIGIN) {
  return {
    title: config.businessTitle || DEFAULT_BUSINESS.title,
    body: config.businessBody || DEFAULT_BUSINESS.body,
    ctaLabel: config.businessCtaLabel || 'Explore business accounts',
    url: origin + BUSINESS_PATH,
  };
}

export function buildReferralEmailHtml(config: any, origin: string = ORIGIN) {
  const free = freeOption(config, origin);
  const business = businessOption(config, origin);
  const opener = config.opener || DEFAULT_OPENER;
  const label = escapeHtml(config.label);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${label} — RallyPack</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:Inter,DM Sans,Arial,sans-serif;color:#1c1c1a;line-height:1.6;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0e8;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:1px solid #d8d2c6;max-width:600px;width:100%;">

          <tr>
            <td style="background-color:#1c1c1a;padding:32px 24px;text-align:center;">
              <h1 style="margin:0;font-family:Georgia,serif;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">RallyPack</h1>
              <p style="margin:4px 0 0;font-size:12px;color:#ffffff;opacity:0.6;text-transform:uppercase;letter-spacing:2px;">Emergency Preparedness Platform</p>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 24px;">

              <h2 style="margin:0 0 8px;font-family:Georgia,serif;font-size:20px;font-weight:600;color:#1c1c1a;">${label}</h2>

              <p style="margin:0 0 16px;">
                <span style="display:inline-block;background-color:#f5f0e8;color:#1c1c1a;font-size:12px;font-weight:600;padding:4px 12px;border-radius:3px;border:1px solid #d8d2c6;">Audience: ${label}</span>
              </p>

              <p style="margin:0 0 16px;font-size:15px;color:#1c1c1a;">Hello,</p>

              <p style="margin:0 0 16px;font-size:15px;color:#1c1c1a;">${opener}</p>

              <p style="margin:0 0 20px;font-size:15px;color:#1c1c1a;">${config.intro}</p>

              <p style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#6b6b66;">Your two options</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-collapse:separate;border-spacing:0 12px;">
                <tr>
                  <td style="border:1px solid #d8d2c6;border-left:4px solid #2f7a4f;background-color:#f7faf7;padding:18px 20px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#2f7a4f;">Option 1</p>
                    <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#1c1c1a;">${free.title}</p>
                    <p style="margin:0 0 14px;font-size:14px;color:#1c1c1a;">${free.body}</p>
                    <a href="${free.url}" style="display:inline-block;background-color:#2f7a4f;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:4px;">${free.ctaLabel} &rarr;</a>
                  </td>
                </tr>
                <tr>
                  <td style="border:1px solid #d8d2c6;border-left:4px solid #d64a2e;background-color:#fdf7f5;padding:18px 20px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#a83a20;">Option 2</p>
                    <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#1c1c1a;">${business.title}</p>
                    <p style="margin:0 0 14px;font-size:14px;color:#1c1c1a;">${business.body}</p>
                    <a href="${business.url}" style="display:inline-block;background-color:#d64a2e;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:4px;">${business.ctaLabel} &rarr;</a>
                  </td>
                </tr>
              </table>

              ${config.voucherCode ? `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background-color:#fff8e7;border:1px dashed #d64a2e;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#a83a20;">${config.voucherLabel || 'Voucher'}</p>
                    <p style="margin:0 0 8px;font-size:14px;color:#1c1c1a;">${config.voucherNote || ''} Enter this code in the promo code box at checkout:</p>
                    <p style="margin:0;font-family:'Courier New',monospace;font-size:20px;font-weight:700;letter-spacing:2px;color:#1c1c1a;">${escapeHtml(config.voucherCode)}</p>
                  </td>
                </tr>
              </table>` : ''}

              <p style="margin:0 0 16px;font-size:13px;color:#6b6b66;">
                Business plans include multi-location kit tracking, AED and certification expiry alerts, evacuation plan documentation, and emergency team notifications.
              </p>

              <p style="margin:0;font-size:14px;color:#1c1c1a;">
                Stay safe,<br>
                <strong>RallyPack Team</strong>
              </p>

            </td>
          </tr>

          <tr>
            <td style="background-color:#1c1c1a;padding:20px 24px;text-align:center;">
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

export function buildReferralEmailText(config: any, origin: string = ORIGIN) {
  const free = freeOption(config, origin);
  const business = businessOption(config, origin);
  const opener = config.opener || DEFAULT_OPENER;

  return [
    'Hello,',
    '',
    'Audience: ' + config.label,
    '',
    opener,
    '',
    config.intro,
    '',
    'YOUR TWO OPTIONS',
    '',
    'OPTION 1 — ' + free.title,
    free.body,
    free.ctaLabel + ': ' + free.url,
    '',
    'OPTION 2 — ' + business.title,
    business.body,
    business.ctaLabel + ': ' + business.url,
    '',
    ...(config.voucherCode ? [
      (config.voucherLabel || 'Voucher').toUpperCase() + ': ' + (config.voucherNote || ''),
      'Enter this code in the promo code box at checkout: ' + config.voucherCode,
      '',
    ] : []),
    'Business plans include multi-location kit tracking, AED and certification expiry alerts, evacuation plan documentation, and emergency team notifications.',
    '',
    'Stay safe,',
    'RallyPack Team',
    '',
    '—',
    '© 2026 RallyPack · MIT License · GDPR & CCPA Compliant',
    'In emergencies, always call your local emergency services first.'
  ].join('\n');
}

export function isQuotaError(status: number, errorMessage: string) {
  if (status === 429) return true;
  const lower = (errorMessage || '').toLowerCase();
  return lower.includes('limit') || lower.includes('quota') || lower.includes('exceeded') || lower.includes('rate');
}

export async function sendViaResend(
  to: string,
  subject: string,
  html: string,
  text: string,
  base44: any,
  sourceFunction: string
) {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) throw new Error('RESEND_API_KEY not set');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
      text
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    if (isQuotaError(response.status, errorBody) && base44) {
      await base44.asServiceRole.entities.EmailQueue.create({
        recipient_email: to,
        subject,
        html_body: html,
        text_body: text,
        from_name: FROM_EMAIL,
        source_function: sourceFunction,
        status: 'pending',
        queued_at: new Date().toISOString()
      });
      return { queued: true };
    }
    throw new Error(`Resend API error (${response.status}): ${errorBody}`);
  }

  return await response.json();
}