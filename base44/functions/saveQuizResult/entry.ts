import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { getClientIp, geolocateByIp, geolocateByAddress } from '../../shared/readinessGeo.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const body = await req.json();
    const {
      session_id, score, score_level, region,
      county_plan, experienced_disaster, felt_prepared,
      meeting_spot, supplies, plan_documented, insurance,
      is_bot, bot_name
    } = body;

    if (score === undefined || score === null) {
      return Response.json({ error: 'Score is required' }, { status: 400 });
    }

    // Verify identity before associating an email — never trust client-supplied emails.
    let verifiedEmail = null;
    let is_registered_user = false;
    let profile = null;
    try {
      const user = await base44.auth.me();
      if (user?.email) {
        verifiedEmail = user.email;
        is_registered_user = true;
        // Load the user's profile for address-based geolocation
        try {
          const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: user.id });
          if (profiles.length > 0) profile = profiles[0];
        } catch (_) {}
      }
    } catch (_) {
      // Anonymous quiz taker (human or bot) — no email associated.
    }

    // Dedup: if a result already exists for this session_id, skip creation.
    if (session_id) {
      const existing = await base44.asServiceRole.entities.QuizResult.filter({ session_id });
      if (existing.length > 0) {
        return Response.json({ saved: false, reason: 'duplicate', existing_id: existing[0].id });
      }
    }

    // Geolocate: profile address for logged-in users, IP for anonymous.
    // Bots are excluded from map aggregation so their geolocation is irrelevant.
    let geo = null;
    if (!is_bot) {
      if (profile && (profile.country || profile.state_province || profile.city || profile.postal_code)) {
        geo = await geolocateByAddress(profile);
      }
      if (!geo || (!geo.latitude && !geo.country_name)) {
        const ip = getClientIp(req);
        geo = await geolocateByIp(ip);
      }
    }

    const record = await base44.asServiceRole.entities.QuizResult.create({
      session_id: session_id || null,
      user_email: verifiedEmail,
      score,
      score_level: score_level || null,
      region: region || null,
      county_plan: county_plan || null,
      experienced_disaster: experienced_disaster || null,
      felt_prepared: felt_prepared || null,
      meeting_spot: meeting_spot || null,
      supplies: supplies || null,
      plan_documented: plan_documented || null,
      insurance: insurance || null,
      is_registered_user,
      is_bot: is_bot || false,
      bot_name: bot_name || null,
      country_code: geo?.country_code || null,
      country_name: geo?.country_name || null,
      admin1_name: geo?.admin1_name || null,
      admin2_name: geo?.admin2_name || null,
      postal_code: geo?.postal_code || null,
      latitude: geo?.latitude || null,
      longitude: geo?.longitude || null,
    });

    return Response.json({ saved: true, id: record.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}