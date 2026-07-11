import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Allows a business org user to contact the RallyPack admin team.
// Creates an in-app notification for admins and attempts to send an email.

const ADMIN_EMAIL = 'beta@rallypack.tech';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { subject, message, request_type, organization_name } = body;

    if (!subject?.trim() || !message?.trim()) {
      return Response.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    const typeLabel = request_type || 'General';
    const fullSubject = `[${typeLabel}] ${subject.trim()}`;
    const fullMessage = `From: ${user.full_name || user.email}\nOrganization: ${organization_name || 'N/A'}\nType: ${typeLabel}\n\n${message.trim()}`;

    // Create an in-app notification for admins
    try {
      await base44.asServiceRole.entities.Notification.create({
        title: fullSubject,
        message: fullMessage,
        type: 'info',
        recipient_email: ADMIN_EMAIL,
        original_event_time: new Date().toISOString(),
        delivery_channel: 'in_app',
        delivery_status: 'delivered',
        read: false,
      });
    } catch (e) {
      console.error('Failed to create admin notification:', e);
    }

    // Attempt to send email
    let emailSent = false;
    let emailError = null;
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: ADMIN_EMAIL,
        subject: fullSubject,
        body: fullMessage.replace(/\n/g, '<br>'),
      });
      emailSent = true;
    } catch (e) {
      emailError = e.message;
    }

    return Response.json({
      success: true,
      email_sent: emailSent,
      email_error: emailError,
      message: emailSent
        ? 'Your message has been sent to the RallyPack team.'
        : 'Your message has been logged. The RallyPack team will review it in the system monitor.',
    });
  } catch (error) {
    console.error('contactAdmin error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});