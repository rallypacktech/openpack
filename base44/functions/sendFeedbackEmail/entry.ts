import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { escapeHtml } from '../../shared/reminderUtils.ts';
import { claimContactSlot } from '../../shared/contactThrottle.ts';

// Delivers a beta feedback submission to the RallyPack team.
// The recipient is fixed server-side so the form can never be used as a mail relay.
// Every user-supplied value is HTML-escaped before it reaches the email body.

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
    const sessionId = String(body.session_id || '').trim().slice(0, 100);

    if (!subject || !message) {
      return Response.json({ error: 'Subject and message are required' }, { status: 400 });
    }
    if (!sessionId) {
      return Response.json({ error: 'A session id is required' }, { status: 400 });
    }

    // This endpoint is public and unauthenticated, so cap how much mail a burst can
    // generate before anything is sent. The submission is recorded first and the cap
    // re-checked with it included, so parallel callers can't slip past together.
    const claim = await claimContactSlot(base44.asServiceRole, {
      kind: 'feedback',
      name: subject,
      email,
      message,
      session_id: sessionId,
    });
    if (!claim.ok) {
      return Response.json({ error: claim.error }, { status: 429 });
    }

    const label = type.charAt(0).toUpperCase() + type.slice(1);

    // Strip CR/LF from the value used in the subject line to prevent header injection.
    const subjectLine = subject.replace(/[\r\n]+/g, ' ').trim();
    const safeMessage = escapeHtml(message).replace(/\r?\n/g, '<br>');

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: FEEDBACK_EMAIL,
      subject: `[RallyPack Feedback \u2013 ${label}] ${subjectLine}`,
      body: `<p>Feedback Type: ${escapeHtml(type)}</p><p>From: ${escapeHtml(email || 'Anonymous')}</p><p>${safeMessage}</p>`,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('sendFeedbackEmail error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}