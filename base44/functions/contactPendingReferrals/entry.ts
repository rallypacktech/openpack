import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import {
    loadTemplates,
    buildReferralEmailHtml,
    buildReferralEmailText,
    sendViaResend,
} from '../../shared/referralEmail.ts';

// Audience configs and their EmailTemplate overrides live in the shared
// referralEmail module — the single source of truth every referral sender uses.

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
        const { referral_ids } = body;

        const origin = 'https://rallypack.org';

        // Fetch referrals: specific IDs if provided (for resend), otherwise all pending
        let referrals;
        if (referral_ids && Array.isArray(referral_ids) && referral_ids.length > 0) {
            referrals = [];
            for (const id of referral_ids) {
                try {
                    const r = await base44.asServiceRole.entities.BusinessReferral.get(id);
                    if (r) referrals.push(r);
                } catch (e) { /* skip not found */ }
            }
        } else {
            referrals = await base44.asServiceRole.entities.BusinessReferral.filter({ status: 'pending' });
        }

        if (referrals.length === 0) {
            return Response.json({
                success: true,
                total: 0,
                sent_automatically: 0,
                needs_manual: 0,
                contacted_count: 0,
                per_audience: [],
                message: 'No referrals to contact.'
            });
        }

        // Load email templates from entity (with fallback to built-in defaults)
        const templates = await loadTemplates(base44);

        // Group unique emails by audience_type, and track referral IDs per group
        const groups = {};
        const emailToReferralIds = {};

        for (const r of referrals) {
            const email = (r.referee_email || '').trim().toLowerCase();
            if (!email) continue;
            const key = templates[r.audience_type] ? r.audience_type : 'general';
            if (!groups[key]) groups[key] = new Set();
            groups[key].add(email);
            const mapKey = `${key}:${email}`;
            if (!emailToReferralIds[mapKey]) emailToReferralIds[mapKey] = [];
            emailToReferralIds[mapKey].push(r.id);
        }

        const perAudience = [];
        const contactedIds = [];
        let totalSent = 0;
        let totalFailed = 0;

        for (const [audienceKey, emailSet] of Object.entries(groups)) {
            const config = templates[audienceKey];
            const emails = Array.from(emailSet);
            const html = buildReferralEmailHtml(config, origin);
            const text = buildReferralEmailText(config, origin);

            const sent = [];
            const failed = [];
            let queuedCount = 0;

            for (const email of emails) {
                try {
                    const result = await sendViaResend(email, config.subject, html, text, base44, 'contactPendingReferrals');
                    if (result.queued) {
                        queuedCount++;
                    } else {
                        sent.push(email);
                        const mapKey = `${audienceKey}:${email}`;
                        contactedIds.push(...(emailToReferralIds[mapKey] || []));
                    }
                } catch (e) {
                    failed.push({ email, error: e.message });
                }
            }

            // Build mailto fallback only for emails that failed
            let mailtoUrl = null;
            if (failed.length > 0) {
                mailtoUrl = `mailto:?bcc=${failed.map(f => encodeURIComponent(f.email)).join(',')}&subject=${encodeURIComponent(config.subject)}&body=${encodeURIComponent(text)}`;
            }

            totalSent += sent.length;
            totalFailed += failed.length;
            perAudience.push({
                audience: config.label,
                audience_key: audienceKey,
                subject: config.subject,
                sent_count: sent.length,
                queued_count: queuedCount,
                fallback_count: failed.length,
                mailto_url: mailtoUrl,
                errors: failed.map(f => ({ email: f.email, error: f.error }))
            });
        }

        // Mark referrals as contacted where Resend succeeded
        if (contactedIds.length > 0) {
            await base44.asServiceRole.entities.BusinessReferral.bulkUpdate(
                contactedIds.map(id => ({ id, status: 'contacted' }))
            );
        }

        const groupsNeedingManual = perAudience.filter(g => g.mailto_url).length;
        const message = totalFailed === 0
            ? `${totalSent} referral email(s) sent via Resend. ${contactedIds.length} marked as contacted.`
            : `${totalSent} sent via Resend (${contactedIds.length} contacted). ${totalFailed} failed (${groupsNeedingManual} group(s) need manual send).`;

        return Response.json({
            success: true,
            total: referrals.length,
            sent_automatically: totalSent,
            needs_manual: totalFailed,
            contacted_count: contactedIds.length,
            per_audience: perAudience,
            message
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});