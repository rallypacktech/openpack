import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Claims readiness quiz results that were saved before the taker had an account.
// The quiz stores a stable session id in localStorage; after the user signs up
// the app calls this so the earlier anonymous result is attributed to the new
// account. This is what makes the quiz → signup conversion measurable.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    // Never trust a client-supplied email — link to the authenticated account only.
    const user = await base44.auth.me().catch(() => null);
    if (!user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { session_id } = await req.json().catch(() => ({}));
    if (!session_id) {
      return Response.json({ linked: 0 });
    }

    const results = await base44.asServiceRole.entities.QuizResult.filter({ session_id });
    const unlinked = results.filter((r) => !r.is_registered_user);

    for (const r of unlinked) {
      await base44.asServiceRole.entities.QuizResult.update(r.id, {
        user_email: user.email,
        is_registered_user: true,
      });
    }

    return Response.json({ linked: unlinked.length, matched: results.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}