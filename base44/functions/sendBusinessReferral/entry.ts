import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        let user = null;
        try { user = await base44.auth.me(); } catch { /* anonymous referral allowed */ }

        const body = await req.json().catch(() => ({}));
        const { referee_email, referee_name, organization_name, message } = body;

        if (!referee_email) {
            return Response.json({ error: 'Business email is required' }, { status: 400 });
        }

        const referrer_name = body.referrer_name || user?.full_name || '';
        const referrer_email = body.referrer_email || user?.email || '';

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
            referee_name: referee_name || '',
            organization_name: organization_name || '',
            referrer_name,
            referrer_email,
            message: message || '',
            status: 'pending'
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
                        </table>
                        ${safe_message ? `<p style="font-style: italic; color: #555;">"${safe_message}"</p>` : ''}
                        <p style="font-size: 12px; color: #8A8577;">Review and follow up in the RallyPack admin dashboard.</p>
                    </div>
                `;
                for (const email of adminEmails) {
                    try {
                        await base44.integrations.Core.SendEmail({
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
        return Response.json({ error: error.message }, { status: 500 });
    }
});