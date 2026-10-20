import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import {
    loadTemplates,
    buildReferralEmailHtml,
    buildReferralEmailText,
    sendViaResend,
    escapeHtml,
} from '../../shared/referralEmail.ts';

// Admin-initiated business referral.
//
// It renders through the same shared builder as the bulk outreach and delivers
// through the same Resend path, so a referral reaches any business address —
// not only people who already have a RallyPack account — and carries the
// identical two-option call to action every other audience gets. A send that
// genuinely fails still returns a ready-to-send mailto so nothing is lost.
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

        const body = await req.json().catch(() => ({}));
        const { referee_email, referee_name, organization_name, audience_type, message } = body;

        if (!referee_email) {
            return Response.json({ error: 'Business email is required' }, { status: 400 });
        }

        const templates = await loadTemplates(base44);
        const audienceKey = templates[audience_type] ? audience_type : 'general';
        const config = templates[audienceKey];

        // Hardcoded to prevent origin/host header spoofing — update if a custom domain is configured
        const origin = 'https://rallypack.org';

        // Store as pending; only mark contacted once the email actually goes out
        const referral = await base44.asServiceRole.entities.BusinessReferral.create({
            referee_email,
            referee_name: referee_name || '',
            organization_name: organization_name || '',
            referrer_name: user.full_name || '',
            referrer_email: user.email || '',
            message: message || '',
            audience_type: audienceKey,
            status: 'pending',
        });

        const html = buildReferralEmailHtml(config, origin, escapeHtml(message));
        const text = buildReferralEmailText(config, origin, message);

        let emailSent = false;
        let queued = false;
        let mailtoUrl = null;

        try {
            const result = await sendViaResend(
                referee_email,
                config.subject,
                html,
                text,
                base44,
                'adminReferBusiness'
            );
            if (result?.queued) {
                // Resend's daily ceiling was hit — the email is queued and goes
                // out with the next queue run, so it is not lost.
                queued = true;
            } else {
                emailSent = true;
                await base44.asServiceRole.entities.BusinessReferral.update(referral.id, { status: 'contacted' });
            }
        } catch (emailError) {
            console.error('adminReferBusiness send failed:', emailError);
            mailtoUrl = `mailto:${encodeURIComponent(referee_email)}?subject=${encodeURIComponent(config.subject)}&body=${encodeURIComponent(text)}`;
        }

        return Response.json({
            success: true,
            referral_id: referral.id,
            audience: config.label,
            email_sent: emailSent,
            queued,
            mailto_url: mailtoUrl,
            message: emailSent
                ? 'Referral email sent to ' + referee_email
                : queued
                ? 'Referral saved. The email is queued and will be delivered shortly.'
                : 'Referral saved. Open your email client to send the invite.',
        });
    } catch (error) {
        console.error('adminReferBusiness error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});