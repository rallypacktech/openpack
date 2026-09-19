// Allow-list for post-payment redirect URLs.
//
// Stripe sends the buyer to success_url / cancel_url right after a real checkout, so an
// unvalidated caller-supplied value is an open redirect into a phishing page that mimics
// the app's own checkout result screens. Shared by every function that creates a session.

// The app's canonical published origin. Used as the base for the fallback redirect — the
// request URL points at the internal function dispatcher, which serves no app pages.
export const APP_ORIGIN = 'https://rally2-7d79debb.base44.app';

const ALLOWED_REDIRECT_HOSTS = new Set(['rallypack.org', 'www.rallypack.org']);

export function isAllowedRedirect(url) {
  if (typeof url !== 'string' || url.length > 2048) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    return ALLOWED_REDIRECT_HOSTS.has(host) || host.endsWith('.base44.app');
  } catch {
    return false;
  }
}

// The caller's URL when it points at the app itself, otherwise a safe in-app path.
export function safeRedirect(url, fallbackPath) {
  return isAllowedRedirect(url) ? url : `${APP_ORIGIN}${fallbackPath}`;
}