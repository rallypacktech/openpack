import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

// Sends an admin-authored PR letter from the PR letter tool. Admin-only, so the
// outreach endpoint cannot be reached by app users.

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const to = String(body.to || '').trim();
    const subject = String(body.subject || '').trim().slice(0, 300);
    const letter = String(body.body || '').trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return Response.json({ error: 'A valid recipient email is required' }, { status: 400 });
    }
    if (!subject || !letter) {
      return Response.json({ error: 'Subject and letter body are required' }, { status: 400 });
    }

    await base44.asServiceRole.integrations.Core.SendEmail({ to, subject, body: letter });

    return Response.json({ success: true });
  } catch (error) {
    console.error('sendPrLetterEmail error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}