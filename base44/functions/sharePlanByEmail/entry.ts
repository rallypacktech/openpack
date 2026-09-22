import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

// Emails a signed-in user's own emergency plan to an address they choose.
// Only the caller's own plan text is relayed — the endpoint cannot send arbitrary mail.

const PUBLIC_ORIGIN = 'https://rallypack.org';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const to = String(body.to || '').trim();
    const planText = String(body.plan_text || '').trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return Response.json({ error: 'A valid recipient email is required' }, { status: 400 });
    }
    if (!planText) {
      return Response.json({ error: 'Plan text is required' }, { status: 400 });
    }

    const name = user.full_name || 'A RallyPack user';

    await base44.asServiceRole.integrations.Core.SendEmail({
      to,
      subject: `${user.full_name || 'Someone'} shared their RallyPack Emergency Plan with you`,
      body: `Hi,\n\n${name} has shared their emergency preparedness plan with you.\n\n${planText}\n\nYou can create your own free plan at ${PUBLIC_ORIGIN}\n\nStay safe,\nRallyPack`,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('sharePlanByEmail error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}