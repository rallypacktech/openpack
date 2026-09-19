import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { handler_name, handler_email, pet_names, owner_name } = body;

    if (!handler_email) {
      return Response.json({ error: 'Handler email is required' }, { status: 400 });
    }

    // Only invite handlers the caller has actually registered on their own account.
    // Without this ownership check the function is an open relay for RallyPack-branded
    // email to any arbitrary address.
    const registered = await base44.entities.AuthorizedHandler.filter({
      email: String(handler_email).trim().toLowerCase(),
      created_by_id: user.id,
    });
    if (registered.length === 0) {
      return Response.json(
        { error: 'Handler is not in your authorized handlers list' },
        { status: 403 },
      );
    }

    const safe = (str) => {
      if (str == null) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const safeOwner = safe(owner_name || user?.full_name || 'A RallyPack user');
    const safeHandler = safe(handler_name || '');
    const safePets = safe(pet_names || 'your animals');
    const signupUrl = 'https://www.rallypack.org/register';

    const subject = `${safeOwner} chose you as an emergency contact for ${safePets}`;
    const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're an authorized animal handler</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f2ed;font-family:Arial,Helvetica,sans-serif;color:#1C1C1A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f2ed;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;">
          <tr>
            <td style="background-color:#1C1C1A;padding:24px 32px;">
              <h1 style="margin:0;font-size:22px;color:#ffffff;font-weight:700;">RallyPack</h1>
              <p style="margin:4px 0 0;font-size:13px;color:#b8b3a8;">Emergency Preparedness</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px;font-size:20px;color:#1C1C1A;line-height:1.4;">
                ${safeOwner} chose you as an emergency contact for their pet${pet_names && pet_names.includes(',') ? 's' : ''} ${safePets}.
              </h2>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#4a4a48;">
                ${safeOwner} has listed you as an authorized handler for ${safePets}. This means if their animal${pet_names && pet_names.includes(',') ? 's are' : ' is'} ever left at a shelter, boarding facility, or needs care during an emergency, you are on the approved list of people allowed to interact with and handle ${safePets}.
              </p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4a4a48;">
                Sign up to build your emergency plan and to have access to ${safePets}'s plan — including evacuation info, medical notes, and meeting spots.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:8px;">
                    <a href="${signupUrl}" style="display:inline-block;background-color:#D64A2E;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 32px;border-radius:6px;">Sign Up on RallyPack</a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#8A8577;">
                If you already have a RallyPack account, just sign in with <strong>${safe(handler_email)}</strong> to see the shared plan.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f5f2ed;padding:20px 32px;border-top:1px solid #e0ddd5;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#8A8577;">
                RallyPack — Free, open-source emergency preparedness.<br>
                You received this email because ${safeOwner} added you as an authorized animal handler. If this was a mistake, you can ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await base44.integrations.Core.SendEmail({
      // Send to the registered address, not the raw request value.
      to: registered[0].email,
      subject,
      html: htmlBody,
      from_name: 'RallyPack'
    });

    return Response.json({ success: true, message: 'Invite email sent' });
  } catch (error) {
    console.error('inviteAuthorizedHandler error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}