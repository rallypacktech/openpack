import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import {
    buildReferralEmailHtml,
    buildReferralEmailText,
    sendViaResend,
} from '../../shared/referralEmail.ts';

// Built-in fallbacks per audience. Every email renders through the shared
// referralEmail builder, which presents the two options explicitly:
//   Option 1 (free)  — personal/household preparedness for residents, members,
//                      staff and clients.
//   Option 2 (paid)  — the business dashboard (kits, AEDs, certifications,
//                      inspections, team alerts).
// The `learnPath` below is the FREE option's landing page; the paid option
// always points at /BusinessOnboarding. When an audience's path is a business
// page, the free option falls back to the Readiness Map automatically.
const AUDIENCE_CONFIG = {
    general: {
        label: 'Workplace Preparedness',
        learnPath: '/readiness-map',
        subject: 'Free for your team — and a first month free on the business dashboard',
        intro: 'RallyPack gives your business one place to stay inspection-ready: log first aid kits across every floor, AEDs, staff CPR/first aid certifications and fire equipment checks, and get reminded before anything expires. That is the paid side — and your first month is on us with the code below.\n\nThe free side is for your people: anyone can look up how their county, territory, state, province or country ranks for emergency preparedness, and build a go-bag and evacuation plan at no cost.',
        voucherLabel: 'First month free',
        voucherNote: 'Your first month of the Professional plan is on us.',
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
    wildfire: {
        label: 'Wildfire Preparedness',
        learnPath: '/wildfire',
        subject: 'Is your community ready for wildfire season? A free resource from RallyPack',
        intro: 'RallyPack provides free, real-time wildfire alerts, go-bag checklists, and evacuation planning tools for families in fire-prone areas. Whether you\'re a business in a high-risk region or serve clients who are, share this resource to help your community prepare before a fire starts.',
        voucherLabel: 'Free year for wildfire partners',
        voucherNote: 'Your first year of the Professional plan is on us.',
    },
    flood: {
        label: 'Flood Preparedness',
        learnPath: '/flood',
        subject: 'Flood season is coming — free preparedness resources for your community',
        intro: 'RallyPack provides free flood preparedness guides, emergency supply checklists, and shelter-in-place vs. evacuation guidance for families in flood-prone areas. Help your employees or clients know what to do before floodwaters rise.',
    },
    hurricane: {
        label: 'Hurricane Preparedness',
        learnPath: '/hurricane',
        subject: 'Hurricane season preparedness — a free resource for your team and community',
        intro: 'RallyPack offers free hurricane preparedness resources including evacuation planning, go-bag checklists, and real-time storm alerts. As a business in a coastal or storm-prone area, you can help your employees and clients plan ahead before the season peaks.',
    },
    tornado: {
        label: 'Tornado Preparedness',
        learnPath: '/tornado',
        subject: 'Tornado season alert — free preparedness resources for your community',
        intro: 'RallyPack provides free tornado preparedness guidance including shelter-in-place protocols, family communication plans, and emergency supply checklists. Share this resource with your team or community to help everyone know what to do when a tornado warning sounds.',
    },
    hoa: {
        label: 'Homeowner Association (HOA)',
        learnPath: '/readiness-map',
        subject: 'Free for every resident — and a first month free on the HOA business plan',
        opener: 'The RallyPack Team thought your neighborhood would benefit from a free emergency preparedness resource you can share with every resident.',
        intro: 'RallyPack is a free, open-source emergency preparedness platform. Every one of your members can build go-bags, document evacuation plans, and log emergency supply caches at no cost — and the Readiness Map shows each resident how their neighborhood ranks against the rest of the world.\n\nIf the association itself wants the business side, the first month is on us with the code below.',
        freeTitle: 'Free — for every member of your association',
        freeBody: 'RallyPack is free for all of your residents. They can build go-bags, document evacuation plans, log emergency supply caches, get real-time hazard alerts, and see how prepared their neighborhood is compared to the rest of the world. No cost, and no account required.',
        freeCtaLabel: 'See how prepared you are compared to the rest of the world',
        businessTitle: 'Paid — for the association',
        businessBody: 'If the HOA wants the business side — tracking first aid kits, AEDs, staff certifications and fire equipment across every location, with expiry reminders, documented evacuation plans and association-wide emergency alerts — that is a paid plan. Your first month is free with the code below.',
        businessCtaLabel: 'Start the business plan — first month free',
        voucherCode: 'FIRSTMONTHFREE',
        voucherLabel: 'First month free',
        voucherNote: 'Your first month of the RallyPack business plan is on us — try every business feature, then decide.',
    },
    commercial_property: {
        label: 'Commercial Property Preparedness',
        learnPath: '/BusinessOnboarding',
        subject: 'Fire safety readiness & emergency tracking for your properties',
        intro: 'RallyPack helps commercial landlords and office park managers stay inspection-ready across every building — track first aid kits by floor with automatic expiry alerts, document evacuation plans and assembly points, maintain your floor warden roster, and send emergency notifications to tenants and staff. One dashboard proves every property is compliant.',
        businessCtaLabel: 'Explore business accounts — 7 days free',
    },
    insurance_broker: {
        label: 'Commercial Insurance Broker Preparedness',
        learnPath: '/BusinessOnboarding',
        subject: 'A value-add preparedness tool for your commercial clients',
        intro: 'RallyPack helps your commercial clients stay inspection-ready and disaster-prepared — tracking first aid kits and expiry dates across every floor, documenting evacuation plans and assembly points, and maintaining floor warden rosters. Clients who stay compliant file fewer claims. Share RallyPack as a free preparedness resource that adds value at every policy review.',
        businessCtaLabel: 'Explore business accounts — 7 days free',
    },
    fire_marshal: {
        label: 'Fire Safety',
        learnPath: '/BusinessOnboarding',
        subject: 'A free year of RallyPack — and a request for your inspection expertise',
        intro: 'We built RallyPack with input from the fire service: a dashboard where a business logs its first aid kits, AED units, batteries, pads, staff CPR/first aid/AED certifications, and fire equipment inspections, and gets reminded before anything expires. The goal is that nothing lapses between inspections — no dead AED batteries, no out-of-date pads, no expired certifications.\n\nWe would like your candid feedback on whether this actually helps a building prepare for an inspection, and what you would want a business to have ready when you walk in. In return, your first year of the Professional plan is free.',
        voucherLabel: 'Free year for fire safety teams',
        voucherNote: 'Your first year of the Professional plan is on us.',
        businessCtaLabel: 'Start the free year — no card required',
    },
};

async function loadTemplates(base44) {
    const result = {};
    for (const [key, config] of Object.entries(AUDIENCE_CONFIG)) {
        result[key] = { ...config };
    }
    try {
        const templates = await base44.asServiceRole.entities.EmailTemplate.list();
        for (const t of templates) {
            if (result[t.audience_key]) {
                result[t.audience_key] = {
                    ...result[t.audience_key],
                    label: t.label || result[t.audience_key].label,
                    learnPath: t.learn_path || result[t.audience_key].learnPath,
                    subject: t.subject || result[t.audience_key].subject,
                    intro: t.intro || result[t.audience_key].intro,
                    voucherCode: t.voucher_code || result[t.audience_key].voucherCode || '',
                };
            }
        }
    } catch (e) { /* use defaults */ }
    return result;
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