import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

// Delivers a footer contact-form message to the RallyPack team.
// The recipient is fixed server-side so the form can never be used as a mail relay.

const CONTACT_EMAIL = 'beta@rallypack.tech';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const name = String(body.name || '').trim().slice(0, 120);
    const email = String(body.email || '').trim().slice(0, 200);
    const message = String(body.message || '').trim().slice(0, 5000);

    if (!name || !message) {
      return Response.json({ error: 'Name and message are required' }, { status: 400 });
    }

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: CONTACT_EMAIL,
      subject: `RallyPack Contact: ${name}`,
      body: `From: ${name} <${email}>\n\n${message}`,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('sendContactMessage error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}