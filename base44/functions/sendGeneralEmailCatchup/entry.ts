import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const FROM_EMAIL = 'RallyPack <no-reply@rallypack.org>';
const ORIGIN = 'https://rallypack.base44.com';

const DEFAULT_GENERAL_CONFIG = {
    label: 'Workplace Preparedness',
    learnPath: '/BusinessOnboarding',
    subject: 'Fire marshal compliance & emergency tracking for your business',
    intro: 'RallyPack helps businesses stay inspection-ready. Track first aid kits across every floor with automatic expiry alerts, document evacuation plans and assembly points, maintain your floor warden roster, and send emergency notifications to your whole team — all from one dashboard.',
};

async function loadGeneralTemplate(base44) {
    try {
        const templates = await base44.asServiceRole.entities.EmailTemplate.filter({ audience_key: 'general' });
        if (templates.length > 0) {
            const t = templates[0];
            return {
                label: t.label || DEFAULT_GENERAL_CONFIG.label,
                learnPath: t.learn_path || DEFAULT_GENERAL_CONFIG.learnPath,
                subject: t.subject || DEFAULT_GENERAL_CONFIG.subject,
                intro: t.intro || DEFAULT_GENERAL_CONFIG.intro,
            };
        }
    } catch (e) { /* fall through to default */ }
    return DEFAULT_GENERAL_CONFIG;
}

function buildReferralEmailHtml(config, origin) {
    const learnUrl = `${origin}${config.learnPath}`;
    const businessUrl = `${origin}/BusinessOnboarding`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.label} — RallyPack</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:Inter,DM Sans,Arial,sans-serif;color:#1c1c1a;line-height:1.6;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0e8;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:1px solid #d8d2c6;max-width:600px;">

          <tr>
            <td style="background-color:#1c1c1a;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-family:Georgia,serif;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">RallyPack</h1>
              <p style="margin:4px 0 0;font-size:12px;color:#ffffff;opacity:0.6;text-transform:uppercase;letter-spacing:2px;">Emergency Preparedness Platform</p>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 40px;">

              <h2 style="margin:0 0 8px;font-family:Georgia,serif;font-size:20px;font-weight:600;color:#1c1c1a;">${config.label}</h2>

              <p style="margin:0 0 16px;">
                <span style="display:inline-block;background-color:#f5f0e8;color:#1c1c1a;font-size:12px;font-weight:600;padding:4px 12px;border-radius:3px;border:1px solid #d8d2c6;">Audience: ${config.label}</span>
              </p>

              <p style="margin:0 0 16px;font-size:15px;color:#1c1c1a;">Hello,</p>

              <p style="margin:0 0 16px;font-size:15px;color:#1c1c1a;">
                The RallyPack Team thought your business would benefit from partnering with RallyPack on ${config.label.toLowerCase()} resources for your customers.
              </p>

              <p style="margin:0 0 20px;font-size:15px;color:#1c1c1a;">
                ${config.intro}
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="padding-bottom:12px;">
                    <a href="${businessUrl}" style="display:inline-block;background-color:#d64a2e;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:4px;">Explore Business Accounts &rarr;</a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <a href="${learnUrl}" style="display:inline-block;background-color:#1c1c1a;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:4px;">Learn More</a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px;font-size:13px;color:#6b6b66;">
                Business plans include multi-location kit tracking, expiry alerts, evacuation plan documentation, and emergency team notifications.
              </p>

              <p style="margin:0;font-size:14px;color:#1c1c1a;">
                Stay safe,<br>
                <strong>RallyPack Team</strong>
              </p>

            </td>
          </tr>

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

function buildReferralEmailText(config, origin) {
    const learnUrl = `${origin}${config.learnPath}`;
    const businessUrl = `${origin}/BusinessOnboarding`;
    return [
        'Hello,',
        '',
        'Audience: ' + config.label,
        '',
        'The RallyPack Team thought your business would benefit from partnering with RallyPack on ' + config.label.toLowerCase() + ' resources for your customers.',
        '',
        config.intro,
        '',
        'Explore Business Accounts: ' + businessUrl,
        'Learn More: ' + learnUrl,
        '',
        'Business plans include multi-location kit tracking, expiry alerts, evacuation plan documentation, and emergency team notifications.',
        '',
        'Stay safe,',
        'RallyPack Team',
        '',
        '—',
        '© 2026 RallyPack · MIT License · GDPR & CCPA Compliant',
        'In emergencies, always call your local emergency services first.'
    ].join('\n');
}

async function sendViaResend(to, subject, html, text) {
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
        throw new Error(`Resend API error (${response.status}): ${errorBody}`);
    }

    return await response.json();
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        const config = await loadGeneralTemplate(base44);
        const html = buildReferralEmailHtml(config, ORIGIN);
        const text = buildReferralEmailText(config, ORIGIN);

        // Find referrals that haven't received the general email yet
        const allReferrals = await base44.asServiceRole.entities.BusinessReferral.filter({});
        const needsGeneral = allReferrals.filter(r =>
            !r.general_email_sent && r.status !== 'archived' && r.referee_email
        );

        if (needsGeneral.length === 0) {
            return Response.json({
                success: true,
                sent: 0,
                failed: 0,
                total: 0,
                message: 'No referrals need the general email.'
            });
        }

        // Deduplicate by email — send once per unique address
        const seenEmails = new Set();
        const contactedIds = [];
        let sent = 0;
        let failed = 0;
        const errors = [];

        for (const r of needsGeneral) {
            const email = (r.referee_email || '').trim().toLowerCase();
            if (!email || seenEmails.has(email)) continue;
            seenEmails.add(email);

            try {
                await sendViaResend(email, config.subject, html, text);
                contactedIds.push(r.id);
                sent++;
            } catch (e) {
                failed++;
                errors.push({ email, error: e.message });
            }
        }

        // Mark all referrals for contacted emails as general_email_sent
        if (contactedIds.length > 0) {
            await base44.asServiceRole.entities.BusinessReferral.bulkUpdate(
                contactedIds.map(id => ({ id, general_email_sent: true }))
            );
        }

        return Response.json({
            success: true,
            sent,
            failed,
            total: needsGeneral.length,
            message: `${sent} general email(s) sent. ${failed} failed.`,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});