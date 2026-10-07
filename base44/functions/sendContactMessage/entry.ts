import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { escapeHtml } from '../../shared/reminderUtils.ts';
import { checkContactThrottle } from '../../shared/contactThrottle.ts';

// Delivers a footer contact-form message to the RallyPack team.
// The recipient is fixed server-side so the form can never be used as a mail relay.
// Every user-supplied value is HTML-escaped before it reaches the email body.

const CONTACT_EMAIL = 'beta@rallypack.tech';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const name = String(body.name || '').trim().slice(0, 120);
    const email = String(body.email || '').trim().slice(0, 200);
    const message = String(body.message || '').trim().slice(0, 5000);
    const sessionId = String(body.session_id || '').trim().slice(0, 100);

    if (!name || !message) {
      return Response.json({ error: 'Name and message are required' }, { status: 400 });
    }
    if (!sessionId) {
      return Response.json({ error: 'A session id is required' }, { status: 400 });
    }

    // This endpoint is public and unauthenticated, so cap how much mail a burst can
    // generate before anything is stored or sent.
    const throttle = await checkContactThrottle(base44.asServiceRole, sessionId);
    if (!throttle.ok) {
      return Response.json({ error: throttle.error }, { status: 429 });
    }

    await base44.asServiceRole.entities.ContactMessage.create({
      kind: 'contact',
      name,
      email,
      message,
      session_id: sessionId,
    });

    // Strip CR/LF from the value used in the subject line to prevent header injection.
    const subjectName = name.replace(/[\r\n]+/g, ' ').trim();
    const safeMessage = escapeHtml(message).replace(/\r?\n/g, '<br>');

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: CONTACT_EMAIL,
      subject: `RallyPack Contact: ${subjectName}`,
      body: `<p>From: ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p><p>${safeMessage}</p>`,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('sendContactMessage error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}