import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from 'base44:runtime';
import { hashId, signQuizSession } from '../../shared/quizSession.ts';

// Issues the signed session token that saveQuizResult requires.
//
// The readiness quiz is open to signed-out visitors, so this endpoint is public by
// design and there is no caller identity to check. What it does instead is choose
// the session id itself and sign it, and cap how many sessions can be issued in a
// day — so the number of rows a script can push into the public readiness map is
// bounded, rather than unlimited as it was when the caller supplied the id.
const MAX_SESSIONS_PER_DAY = 250;
const DAY_MS = 24 * 60 * 60 * 1000;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const body = await req.json().catch(() => ({}));

    // A client that self-identifies as a bot keeps a stable id, so repeated crawler
    // runs still collapse into one row. Those rows are flagged is_bot and excluded
    // from the public readiness map, so this cannot be used to poison it.
    let sessionId = crypto.randomUUID();
    if (body.is_bot === true) {
      const botId = String(body.bot_id || '').trim().slice(0, 200);
      if (botId) sessionId = 'bot_' + (await hashId(botId));
    }

    // The query is passed on its own — this SDK build returns an empty result when
    // filter() is handed an options object, so the day window lives in the query.
    const since = new Date(Date.now() - DAY_MS).toISOString();
    const page = await base44.asServiceRole.entities.QuizSession.filter({
      created_date: { $gte: since },
    });
    const issuedToday = Array.isArray(page) ? page : (page?.items || []);
    if (issuedToday.length >= MAX_SESSIONS_PER_DAY) {
      return Response.json(
        { error: 'The readiness quiz is temporarily unavailable — please try again later.' },
        { status: 429 },
      );
    }

    await base44.asServiceRole.entities.QuizSession.create({
      session_id: sessionId,
      issued_at: new Date().toISOString(),
      is_bot: body.is_bot === true,
    });

    const sessionToken = await signQuizSession(secrets.get('QUIZ_SESSION_SECRET'), sessionId);
    return Response.json({ session_id: sessionId, session_token: sessionToken });
  } catch (error) {
    console.error('startQuizSession error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}