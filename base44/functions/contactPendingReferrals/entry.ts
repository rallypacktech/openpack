import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

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
                mailto_url: null,
                message: 'No pending referrals to contact.'
            });
        }

        // Deduplicate emails (some referrals share an address)
        const seenEmails = new Set();
        const uniqueEmails = [];
        for (const r of pending) {
            const email = (r.referee_email || '').trim();
            if (email && !seenEmails.has(email.toLowerCase())) {
                seenEmails.add(email.toLowerCase());
                uniqueEmails.push(email);
            }
        }

        const quizUrl = `${origin}/ReadinessQuiz`;
        const businessUrl = `${origin}/BusinessOnboarding`;
        const learnUrl = `${origin}/LearnMore`;

        const subject = 'Help your community prepare for emergencies with RallyPack';
        const body = [
            'Hello,',
            '',
            'The RallyPack Team thought your business would benefit from our free emergency preparedness resources.',
            '',
            'RallyPack is a free, open-source emergency preparedness platform that helps families and households build go-bags, evacuation plans, and emergency supply caches. As a trusted business, you can point your customers to resources that could save lives.',
            '',
            'Take the Free Readiness Quiz: ' + quizUrl,
            'Explore Business Accounts: ' + businessUrl,
            'Learn More: ' + learnUrl,
            '',
            'RallyPack is free and open-source. No account is required to access preparedness guides and checklists.',
            '',
            'Stay safe,',
            'The RallyPack Team',
            '',
            '—',
            '© 2026 RallyPack · MIT License · GDPR & CCPA Compliant',
            'In emergencies, always call your local emergency services first.'
        ].join('\n');

        const mailtoUrl = `mailto:?bcc=${uniqueEmails.map(e => encodeURIComponent(e)).join(',')}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        // Update all pending referrals to contacted
        const ids = pending.map(r => r.id);
        await base44.asServiceRole.entities.BusinessReferral.bulkUpdate(
            ids.map(id => ({ id, status: 'contacted' }))
        );

        return Response.json({
            success: true,
            total: pending.length,
            unique_emails: uniqueEmails.length,
            mailto_url: mailtoUrl,
            message: `${pending.length} referrals marked as contacted. Click "Open Email" to send the BCC email to ${uniqueEmails.length} unique addresses.`
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});