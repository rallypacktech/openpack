import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { geoFieldsFromProfile, clearReadinessMapCache } from '../../shared/readinessProfileGeo.ts';

// Places quiz results that were claimed by a registered account but saved
// without a location. Their account's postal code is used so the taker appears
// in the readiness map rankings at county/territory, state/province and country.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Load all quiz results (paginated to avoid truncation)
    const results = [];
    const LIMIT = 500;
    let skip = 0;
    while (true) {
      const batch = await base44.asServiceRole.entities.QuizResult.list('-created_date', LIMIT, skip);
      results.push(...batch);
      if (batch.length < LIMIT) break;
      skip += LIMIT;
    }

    // `force` re-places results that already carry a location — used to correct
    // ones resolved before the country hint was available.
    const body = await req.json().catch(() => ({}));
    const force = body?.force === true;

    const candidates = results.filter(
      (r) => r.is_registered_user && r.user_email && (force || !r.postal_code)
    );

    if (candidates.length === 0) {
      return Response.json({
        success: true,
        candidates: 0,
        updated: 0,
        skipped: 0,
        message: 'Every converted quiz result already has a location.',
      });
    }

    // Match the quiz email to its account, then to that account's profile
    const users = await base44.asServiceRole.entities.User.list();
    const userByEmail = {};
    for (const u of users) {
      if (u.email) userByEmail[u.email.toLowerCase()] = u;
    }

    const profiles = await base44.asServiceRole.entities.UserProfile.list('-created_date', 500);
    const profileByUser = {};
    for (const p of profiles) {
      if (p.created_by_id) profileByUser[p.created_by_id] = p;
    }

    let updated = 0;
    const skipped = [];

    for (const r of candidates) {
      const account = userByEmail[(r.user_email || '').toLowerCase()];
      const profile = account ? profileByUser[account.id] : null;

      if (!profile?.postal_code) {
        skipped.push({ id: r.id, reason: 'no_account_postal_code' });
        continue;
      }

      const geo = await geoFieldsFromProfile(profile);
      if (!geo) {
        skipped.push({ id: r.id, reason: 'geocode_failed' });
        continue;
      }

      await base44.asServiceRole.entities.QuizResult.update(r.id, geo);
      updated++;
    }

    if (updated > 0) await clearReadinessMapCache(base44);

    return Response.json({
      success: true,
      candidates: candidates.length,
      updated,
      skipped: skipped.length,
      skipped_details: skipped,
      message: `${updated} quiz result(s) placed from their account postal code. ${skipped.length} skipped.`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}