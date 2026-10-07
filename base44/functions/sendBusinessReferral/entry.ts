import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Public business-referral form. It is deliberately open to signed-out visitors, so
// this handler bounds how much mail and how many records a burst can generate, and
// caps the size of every field before anything is stored or emailed.
const EMAIL_PATTERN = /^[^\s@,;<>"']+@[^\s@,;<>"']+\.[^\s@,;<>"']+$/;
const MAX_PER_EMAIL_PER_DAY = 3;
const MAX_TOTAL_PER_DAY = 50;
const FIELD_LIMITS = {
    referee_email: 320,
    referee_name: 200,
    organization_name: 200,
    referrer_name: 200,
    referrer_email: 320,
    message: 2000,
};

function clean(value, max) {
    return String(value ?? '').trim().slice(0, max);
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        let user = null;
        try { user = await base44.auth.me(); } catch { /* anonymous referral allowed */ }

        const body = await req.json().catch(() => ({}));

        const referee_email = clean(body.referee_email, FIELD_LIMITS.referee_email);
        const referee_name = clean(body.referee_name, FIELD_LIMITS.referee_name);
        const organization_name = clean(body.organization_name, FIELD_LIMITS.organization_name);
        const message = clean(body.message, FIELD_LIMITS.message);
        const referrer_name = clean(body.referrer_name || user?.full_name, FIELD_LIMITS.referrer_name);
        const referrer_email = clean(body.referrer_email || user?.email, FIELD_LIMITS.referrer_email);
        const audience_type = clean(body.audience_type, 60) || 'general';

        if (!EMAIL_PATTERN.test(referee_email)) {
            return Response.json({ error: 'A valid business email is required' }, { status: 400 });
        }

        // Abuse controls. This endpoint is anonymous, so cap both how many referrals a
        // single address can generate and how many the public form can produce in a
        // day. Without this a script could flood every admin inbox and pollute the
        // referral pipeline that the outreach automations later process.
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const totalToday = await base44.asServiceRole.entities.BusinessReferral.count({
            source: 'public_form',
            created_date: { $gte: oneDayAgo },
        });
        if (totalToday >= MAX_TOTAL_PER_DAY) {
            return Response.json({ error: 'Too many referrals submitted right now — please try again later.' }, { status: 429 });
        }
        const sameEmailToday = await base44.asServiceRole.entities.BusinessReferral.count({
            source: 'public_form',
            referee_email,
            created_date: { $gte: oneDayAgo },
        });
        if (sameEmailToday >= MAX_PER_EMAIL_PER_DAY) {
            return Response.json({ error: 'This business has already been referred recently.' }, { status: 429 });
        }

        // HTML-escape all user-provided fields to prevent injection in email templates
        const escapeHtml = (str) => {
            if (str == null) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        };
        const safe_organization = escapeHtml(organization_name);
        const safe_referee_name = escapeHtml(referee_name);
        const safe_referee_email = escapeHtml(referee_email);
        const safe_message = escapeHtml(message);
        const safe_referrer_name = escapeHtml(referrer_name);
        const safe_referrer_email = escapeHtml(referrer_email);

        // Store the referral so admins can follow up
        const referral = await base44.asServiceRole.entities.BusinessReferral.create({
            referee_email,
            referee_name,
            organization_name,
            referrer_name,
            referrer_email,
            message,
            audience_type,
            status: 'pending',
            source: 'public_form'
        });

        // Notify admins who have accounts in the app
        try {
            const admins = await base44.asServiceRole.entities.User.list();
            const adminEmails = admins.filter(u => u.role === 'admin' && u.email).map(u => u.email);
            if (adminEmails.length > 0) {
                const emailBody = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1C1C1A;">
                        <h1 style="color: #D64A2E; font-size: 24px;">New Business Referral</h1>
                        <p style="font-size: 16px;">A new business referral has been submitted:</p>
                        <table style="font-size: 14px; line-height: 1.8; border-collapse: collapse; margin: 16px 0;">
                            <tr><td style="font-weight: bold; padding-right: 12px;">Business:</td><td>${safe_organization || 'N/A'}</td></tr>
                            <tr><td style="font-weight: bold; padding-right: 12px;">Contact:</td><td>${safe_referee_name || 'N/A'}</td></tr>
                            <tr><td style="font-weight: bold; padding-right: 12px;">Email:</td><td>${safe_referee_email}</td></tr>
                            <tr><td style="font-weight: bold; padding-right: 12px;">Referred by:</td><td>${safe_referrer_name || 'Anonymous'} (${safe_referrer_email || 'no email'})</td></tr>
                            <tr><td style="font-weight: bold; padding-right: 12px;">Audience:</td><td>${escapeHtml(audience_type || 'general')}</td></tr>
                        </table>
                        ${safe_message ? `<p style="font-style: italic; color: #555;">"${safe_message}"</p>` : ''}
                        <p style="font-size: 12px; color: #8A8577;">Review and follow up in the RallyPack admin dashboard.</p>
                    </div>
                `;
                for (const email of adminEmails) {
                    try {
                        await base44.asServiceRole.integrations.Core.SendEmail({
                            to: email,
                            subject: 'New Business Referral: ' + (safe_organization || safe_referee_email),
                            body: emailBody,
                            from_name: 'RallyPack'
                        });
                    } catch (e) { /* skip individual failures */ }
                }
            }
        } catch (e) { /* notification failure shouldn't block the referral */ }

        return Response.json({ success: true, referral_id: referral.id, message: 'Referral submitted' });
    } catch (error) {
        console.error('sendBusinessReferral error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});