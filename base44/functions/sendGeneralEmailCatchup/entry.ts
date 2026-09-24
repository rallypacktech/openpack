import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import {
    buildReferralEmailHtml,
    buildReferralEmailText,
    sendViaResend,
} from '../../shared/referralEmail.ts';

// Weekly catch-up that sends the general referral email to any referral that
// hasn't received it yet. Renders through the shared referralEmail builder, so
// the two-option CTA matches every other referral email.

const DEFAULT_GENERAL_CONFIG = {
    label: 'Workplace Preparedness',
    learnPath: '/readiness-map',
    subject: 'Free for your team — and a first month free on the business dashboard',
    intro: 'RallyPack gives your business one place to stay inspection-ready: log first aid kits across every floor, AEDs, staff CPR/first aid certifications and fire equipment checks, and get reminded before anything expires. That is the paid side — and your first month is on us with the code below.\n\nThe free side is for your people: anyone can look up how their county, territory, state, province or country ranks for emergency preparedness, and build a go-bag and evacuation plan at no cost.',
    voucherCode: 'FIRSTMONTHFREE',
    voucherLabel: 'First month free',
    voucherNote: 'Your first month of the Professional plan is on us.',
};

async function loadGeneralTemplate(base44) {
    try {
        const templates = await base44.asServiceRole.entities.EmailTemplate.filter({ audience_key: 'general' });
        if (templates.length > 0) {
            const t = templates[0];
            return {
                ...DEFAULT_GENERAL_CONFIG,
                label: t.label || DEFAULT_GENERAL_CONFIG.label,
                learnPath: t.learn_path || DEFAULT_GENERAL_CONFIG.learnPath,
                subject: t.subject || DEFAULT_GENERAL_CONFIG.subject,
                intro: t.intro || DEFAULT_GENERAL_CONFIG.intro,
                voucherCode: t.voucher_code || DEFAULT_GENERAL_CONFIG.voucherCode,
            };
        }
    } catch (e) { /* fall through to default */ }
    return DEFAULT_GENERAL_CONFIG;
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // Auth: require AUTOMATION_SECRET (scheduled automations) or authenticated admin
        const automationSecret = Deno.env.get("AUTOMATION_SECRET");
        const headerSecret = req.headers.get("x-automation-secret") || req.headers.get("automation-secret");
        if (!(headerSecret && automationSecret && headerSecret === automationSecret)) {
            let user;
            try { user = await base44.auth.me(); } catch (_) { user = null; }
            if (!user || user.role !== 'admin') {
                return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        const config = await loadGeneralTemplate(base44);
        const html = buildReferralEmailHtml(config);
        const text = buildReferralEmailText(config);

        // Find referrals that haven't received the general email yet
        const allReferrals = await base44.asServiceRole.entities.BusinessReferral.filter({});
        const needsGeneral = allReferrals.filter(r =>
            !r.general_email_sent && r.status !== 'archived' && r.referee_email && !r.bounced
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
        let queued = 0;
        const errors = [];

        for (const r of needsGeneral) {
            const email = (r.referee_email || '').trim().toLowerCase();
            if (!email || seenEmails.has(email)) continue;
            seenEmails.add(email);

            try {
                const result = await sendViaResend(email, config.subject, html, text, base44, 'sendGeneralEmailCatchup');
                if (result.queued) {
                    queued++;
                } else {
                    contactedIds.push(r.id);
                    sent++;
                }
            } catch (e) {
                failed++;
                errors.push({ email, error: e.message });
                await base44.asServiceRole.entities.BusinessReferral.update(r.id, { bounced: true }).catch(() => {});
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
            queued,
            failed,
            total: needsGeneral.length,
            message: `${sent} general email(s) sent. ${queued} queued (Resend cap). ${failed} failed.`,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});