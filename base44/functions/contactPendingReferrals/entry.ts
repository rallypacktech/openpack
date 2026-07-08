import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const AUDIENCE_CONFIG = {
    general: {
        label: 'General Preparedness',
        learnPath: '/LearnMore',
        subject: 'Help your community prepare for emergencies with RallyPack',
        intro: 'RallyPack is a free, open-source emergency preparedness platform that helps families and households build go-bags, evacuation plans, and emergency supply caches. As a trusted local business, you can point your customers to resources that could save lives.',
    },
    equine: {
        label: 'Equine Emergency Preparedness',
        learnPath: '/equine',
        subject: 'Equine emergency preparedness — a free resource for your clients',
        intro: 'RallyPack offers free, species-specific emergency preparedness resources for horse owners — including evacuation planning, trailer logistics, Coggins test tracking, and emergency feed protocols. As an equine business, you can help your clients protect their horses when disasters strike.',
    },
    canine: {
        label: 'Canine Emergency Preparedness',
        learnPath: '/canine',
        subject: 'Canine emergency preparedness — a free resource for your clients',
        intro: 'RallyPack offers free, species-specific emergency preparedness resources for dog owners — including transport planning, medical record storage, 72-hour supply kits, and shelter logistics. As a canine-focused business, you can help your clients keep their dogs safe during emergencies.',
    },
    feline: {
        label: 'Feline Emergency Preparedness',
        learnPath: '/feline',
        subject: 'Feline emergency preparedness — a free resource for your clients',
        intro: 'RallyPack offers free, species-specific emergency preparedness resources for cat owners — including carrier training, medical records, and shelter logistics. As a feline-focused business, you can help your clients protect their cats during disasters.',
    },
    infant: {
        label: 'Infant Emergency Preparedness',
        learnPath: '/infant',
        subject: 'Infant emergency preparedness — a free resource for your clients',
        intro: 'RallyPack offers free emergency preparedness resources for parents of infants — including formula and supply checklists, medical record storage, and evacuation planning. As a business serving families with infants, you can help your clients protect their youngest during emergencies.',
    },
    avian: {
        label: 'Avian Emergency Preparedness',
        learnPath: '/avian',
        subject: 'Avian emergency preparedness — a free resource for your clients',
        intro: 'RallyPack offers free, species-specific emergency preparedness resources for bird owners — including respiratory safety, transport containers, and temperature control. As an avian-focused business, you can help your clients protect their birds during disasters.',
    },
    reptile: {
        label: 'Reptile Emergency Preparedness',
        learnPath: '/reptile',
        subject: 'Reptile emergency preparedness — a free resource for your clients',
        intro: 'RallyPack offers free, species-specific emergency preparedness resources for reptile owners — including temperature control, transport containers, and food supply planning. As a reptile-focused business, you can help your clients protect their reptiles during disasters.',
    },
    livestock: {
        label: 'Livestock Emergency Preparedness',
        learnPath: '/livestock',
        subject: 'Livestock emergency preparedness — a free resource for your clients',
        intro: 'RallyPack offers free, species-specific emergency preparedness resources for livestock owners — including evacuation logistics, trailer capacity planning, and destination coordination. As a livestock-focused business, you can help your clients protect their animals during disasters.',
    },
};

function buildReferralEmailHtml(config, origin) {
    const learnUrl = `${origin}${config.learnPath}`;
    const quizUrl = `${origin}/ReadinessQuiz`;
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

              <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:20px;font-weight:600;color:#1c1c1a;">${config.label}</h2>

              <p style="margin:0 0 16px;font-size:15px;color:#1c1c1a;">Hello,</p>

              <p style="margin:0 0 16px;font-size:15px;color:#1c1c1a;">
                The RallyPack Team thought your business would benefit from our free ${config.label.toLowerCase()} resources.
              </p>

              <p style="margin:0 0 20px;font-size:15px;color:#1c1c1a;">
                ${config.intro}
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="padding-bottom:12px;">
                    <a href="${learnUrl}" style="display:inline-block;background-color:#d64a2e;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:4px;">Learn More &rarr;</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:12px;">
                    <a href="${quizUrl}" style="display:inline-block;background-color:#1c1c1a;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:4px;">Take the Free Readiness Quiz</a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <a href="${businessUrl}" style="display:inline-block;background-color:#f5f0e8;color:#1c1c1a;font-size:14px;font-weight:500;text-decoration:none;padding:12px 28px;border-radius:4px;border:1px solid #d8d2c6;">Explore Business Accounts</a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px;font-size:13px;color:#6b6b66;">
                RallyPack is free and open-source. No account is required to access preparedness guides and checklists.
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
    const quizUrl = `${origin}/ReadinessQuiz`;
    const businessUrl = `${origin}/BusinessOnboarding`;
    return [
        'Hello,',
        '',
        'The RallyPack Team thought your business would benefit from our free ' + config.label.toLowerCase() + ' resources.',
        '',
        config.intro,
        '',
        'Learn More: ' + learnUrl,
        'Take the Free Readiness Quiz: ' + quizUrl,
        'Explore Business Accounts: ' + businessUrl,
        '',
        'RallyPack is free and open-source. No account is required to access preparedness guides and checklists.',
        '',
        'Stay safe,',
        'RallyPack Team',
        '',
        '—',
        '© 2026 RallyPack · MIT License · GDPR & CCPA Compliant',
        'In emergencies, always call your local emergency services first.'
    ].join('\n');
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
        if (user.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const origin = req.headers.get('origin') || req.headers.get('x-forwarded-origin') ||
            `https://${req.headers.get('host') || 'rallypack.base44.com'}`;

        // Fetch all pending referrals
        const pending = await base44.asServiceRole.entities.BusinessReferral.filter({ status: 'pending' });

        if (pending.length === 0) {
            return Response.json({
                success: true,
                total: 0,
                per_audience: [],
                message: 'No pending referrals to contact.'
            });
        }

        // Group unique emails by audience_type
        const groups = {};
        for (const r of pending) {
            const email = (r.referee_email || '').trim();
            if (!email) continue;
            const key = AUDIENCE_CONFIG[r.audience_type] ? r.audience_type : 'general';
            if (!groups[key]) groups[key] = new Set();
            groups[key].add(email.toLowerCase());
        }

        let sendEmailAvailable = true; // flipped false once the platform blocks an external address
        const perAudience = [];
        let totalSent = 0;
        let totalFallback = 0;

        for (const [audienceKey, emailSet] of Object.entries(groups)) {
            const config = AUDIENCE_CONFIG[audienceKey];
            const emails = Array.from(emailSet);
            const html = buildReferralEmailHtml(config, origin);
            const text = buildReferralEmailText(config, origin);

            const sent = [];
            const failed = [];

            for (const email of emails) {
                if (sendEmailAvailable) {
                    try {
                        await base44.asServiceRole.integrations.Core.SendEmail({
                            to: email,
                            subject: config.subject,
                            body: html,
                            from_name: 'RallyPack'
                        });
                        sent.push(email);
                        continue;
                    } catch (emailError) {
                        const msg = (emailError.message || '').toLowerCase();
                        if (msg.includes('outside the app') || msg.includes('users outside')) {
                            // Platform-wide restriction on external addresses — stop attempting
                            sendEmailAvailable = false;
                        }
                    }
                }
                failed.push(email);
            }

            let mailtoUrl = null;
            if (failed.length > 0) {
                mailtoUrl = `mailto:?bcc=${failed.map(e => encodeURIComponent(e)).join(',')}&subject=${encodeURIComponent(config.subject)}&body=${encodeURIComponent(text)}`;
            }

            totalSent += sent.length;
            totalFallback += failed.length;
            perAudience.push({
                audience: config.label,
                audience_key: audienceKey,
                subject: config.subject,
                sent_count: sent.length,
                fallback_count: failed.length,
                mailto_url: mailtoUrl
            });
        }

        // Mark all pending referrals as contacted
        const ids = pending.map(r => r.id);
        await base44.asServiceRole.entities.BusinessReferral.bulkUpdate(
            ids.map(id => ({ id, status: 'contacted' }))
        );

        const groupsNeedingManual = perAudience.filter(g => g.mailto_url).length;
        const message = totalSent > 0 && groupsNeedingManual === 0
            ? `${totalSent} referral email(s) sent automatically. All ${pending.length} marked as contacted.`
            : `${totalSent} sent automatically. ${totalFallback} require your email client (${groupsNeedingManual} audience group(s)). All ${pending.length} marked as contacted.`;

        return Response.json({
            success: true,
            total: pending.length,
            sent_automatically: totalSent,
            needs_manual: totalFallback,
            per_audience: perAudience,
            message
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});