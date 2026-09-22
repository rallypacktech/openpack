import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

// Delivers a beta feedback submission to the RallyPack team.
// The recipient is fixed server-side so the form can never be used as a mail relay.

const FEEDBACK_EMAIL = 'beta@rallypack.tech';
const FEEDBACK_TYPES = ['general', 'bug', 'feature', 'rating'];

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const type = FEEDBACK_TYPES.includes(body.type) ? body.type : 'general';
    const subject = String(body.subject || '').trim().slice(0, 200);
    const message = String(body.message || '').trim().slice(0, 5000);
    const email = String(body.email || '').trim().slice(0, 200);

    if (!subject || !message) {
      return Response.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    const label = type.charAt(0).toUpperCase() + type.slice(1);

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: FEEDBACK_EMAIL,
      subject: `[RallyPack Feedback – ${label}] ${subject}`,
      body: `Feedback Type: ${type}\nFrom: ${email || 'Anonymous'}\n\n${message}`,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('sendFeedbackEmail error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}