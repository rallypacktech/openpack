import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { geoFieldsFromProfile, clearReadinessMapCache } from '../../shared/readinessProfileGeo.ts';

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

    // The account may already hold a postal code (entered during sign-up or in
    // settings). Use it to place a result saved before the taker signed up, so
    // they appear in the readiness map rankings by county, state and country.
    let profile = null;
    try {
      const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: user.id });
      if (profiles.length > 0) profile = profiles[0];
    } catch (_) { /* profile lookup is best-effort */ }

    let located = 0;
    for (const r of unlinked) {
      const patch = { user_email: user.email, is_registered_user: true };
      if (!r.postal_code && profile?.postal_code) {
        const geo = await geoFieldsFromProfile(profile);
        if (geo) {
          Object.assign(patch, geo);
          located++;
        }
      }
      await base44.asServiceRole.entities.QuizResult.update(r.id, patch);
    }

    if (located > 0) await clearReadinessMapCache(base44);

    return Response.json({ linked: unlinked.length, matched: results.length, located });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}