// Shared abuse control for the public contact and feedback forms.
//
// Both endpoints are open to signed-out visitors and both send mail from the app's
// own mail account to a fixed team address, so the only thing standing between a
// script and unlimited outgoing email is a bound on how much can be sent in a day.
// Every submission is recorded so the rolling window can be counted.

const DAY_MS = 24 * 60 * 60 * 1000;

// How many messages one browser may send per day, and the ceiling for the whole app.
export const MAX_PER_SESSION_PER_DAY = 3;
export const MAX_TOTAL_PER_DAY = 30;

/**
 * Returns { ok: true } when the submission may proceed, otherwise { ok: false, error }.
 * `sr` is the service-role client — the counts must not be scoped to a signed-in user.
 */
export async function checkContactThrottle(sr, sessionId) {
  const since = new Date(Date.now() - DAY_MS).toISOString();

  // The query is passed on its own — this SDK build returns an empty result when
  // filter() is handed an options object, so the day window lives in the query.
  const page = await sr.entities.ContactMessage.filter({ created_date: { $gte: since } });
  const rows = Array.isArray(page) ? page : (page?.items || []);

  if (rows.length >= MAX_TOTAL_PER_DAY) {
    return { ok: false, error: 'Too many messages submitted right now — please try again later.' };
  }
  if (rows.filter((r) => r.session_id === sessionId).length >= MAX_PER_SESSION_PER_DAY) {
    return { ok: false, error: 'You have reached the daily message limit. Please try again tomorrow.' };
  }
  return { ok: true };
}