import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { geolocateByPostalCode } from '../../shared/readinessGeo.ts';
import { detectBotFromUserAgent } from '../../shared/botDetection.ts';

const SCORE_LEVELS = new Set(['Not Ready', 'Gaps That Put You at Risk', 'A Solid Foundation']);
const SHORT_TEXT_MAX = 60;

function shortText(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > SHORT_TEXT_MAX) return null;
  if (/[\u0000-\u001f\u007f]/.test(trimmed)) return null;
  return trimmed;
}

function cleanPostal(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().toUpperCase();
  if (!trimmed || trimmed.length > 12) return null;
  return /^[A-Z0-9][A-Z0-9 -]*$/.test(trimmed) ? trimmed : null;
}

function cleanCountryCode(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(trimmed) ? trimmed : null;
}

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
      postal_code, country_code
    } = body;

    // These rows drive the public readiness map and the milestone statistics,
    // so validate every stored value instead of persisting the body verbatim.
    const numericScore = Number(score);
    if (!Number.isFinite(numericScore) || numericScore < 0 || numericScore > 100) {
      return Response.json({ error: 'A score between 0 and 100 is required' }, { status: 400 });
    }
    const cleanScore = Math.round(numericScore);
    const cleanSessionId = shortText(session_id);
    const cleanScoreLevel = SCORE_LEVELS.has(score_level) ? score_level : null;
    const cleanPostalCode = cleanPostal(postal_code);
    const cleanCountry = cleanCountryCode(country_code);

    // Bot status is decided server-side from the request's User-Agent — the
    // client flag can no longer mark a script as human and poison the public
    // readiness map. A client that *self-identifies* as a bot is still honoured,
    // so nothing that was filtered out before is counted as a human now.
    const detected = detectBotFromUserAgent(req.headers.get('user-agent'));
    const clientSaysBot = body.is_bot === true;
    const is_bot = detected.isBot || clientSaysBot;
    const bot_name = detected.botName || (clientSaysBot ? shortText(body.bot_name) : null);

    // Verify identity before associating an email — never trust client-supplied emails.
    let verifiedEmail = null;
    let is_registered_user = false;
    let profile = null;
    try {
      const user = await base44.auth.me();
      if (user?.email) {
        verifiedEmail = user.email;
        is_registered_user = true;
        // Load the user's profile so a saved postal code can stand in when the
        // quiz taker skipped the location step.
        try {
          const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: user.id });
          if (profiles.length > 0) profile = profiles[0];
        } catch (_) {}
      }
    } catch (_) {
      // Anonymous quiz taker (human or bot) — no email associated.
    }

    // Dedup: if a result already exists for this session_id, don't create a second
    // one. If the taker has since signed up, claim the existing record instead —
    // that is what turns a pre-signup quiz into a tracked conversion.
    if (cleanSessionId) {
      const existing = await base44.asServiceRole.entities.QuizResult.filter({ session_id: cleanSessionId });
      if (existing.length > 0) {
        const prior = existing[0];
        if (verifiedEmail && !prior.is_registered_user) {
          await base44.asServiceRole.entities.QuizResult.update(prior.id, {
            user_email: verifiedEmail,
            is_registered_user: true,
          });
          return Response.json({ saved: false, reason: 'linked', existing_id: prior.id });
        }
        return Response.json({ saved: false, reason: 'duplicate', existing_id: prior.id });
      }
    }

    // Geolocate from the postal code the taker entered, falling back to the
    // signed-in user's saved postal code. Never from IP or a free-text address.
    // Bots are excluded from map aggregation so their location is irrelevant.
    let geo = null;
    if (!is_bot) {
      let postal = cleanPostalCode;
      if (!postal && profile?.postal_code) {
        postal = cleanPostal(profile.postal_code);
      }
      if (postal) {
        geo = await geolocateByPostalCode(postal, cleanCountry);
      }
    }

    const record = await base44.asServiceRole.entities.QuizResult.create({
      session_id: cleanSessionId,
      user_email: verifiedEmail,
      score: cleanScore,
      score_level: cleanScoreLevel,
      region: shortText(region),
      county_plan: shortText(county_plan),
      experienced_disaster: shortText(experienced_disaster),
      felt_prepared: shortText(felt_prepared),
      meeting_spot: shortText(meeting_spot),
      supplies: shortText(supplies),
      plan_documented: shortText(plan_documented),
      insurance: shortText(insurance),
      is_registered_user,
      is_bot,
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