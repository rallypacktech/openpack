import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const body = await req.json();
    const {
      session_id, user_email, score, score_level, region,
      county_plan, experienced_disaster, felt_prepared,
      meeting_spot, supplies, plan_documented, insurance,
      is_registered_user, is_bot, bot_name
    } = body;

    if (score === undefined || score === null) {
      return Response.json({ error: 'Score is required' }, { status: 400 });
    }

    // Dedup: if a result already exists for this session_id, skip creation.
    // This ensures each bot (stable session_id from UA) only gets 1 result,
    // and humans (session_id from localStorage) don't create duplicates across sessions.
    if (session_id) {
      const existing = await base44.asServiceRole.entities.QuizResult.filter({ session_id });
      if (existing.length > 0) {
        return Response.json({ saved: false, reason: 'duplicate', existing_id: existing[0].id });
      }
    }

    const record = await base44.asServiceRole.entities.QuizResult.create({
      session_id: session_id || null,
      user_email: user_email || null,
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
      is_registered_user: is_registered_user || false,
      is_bot: is_bot || false,
      bot_name: bot_name || null,
    });

    return Response.json({ saved: true, id: record.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});