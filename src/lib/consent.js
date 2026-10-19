// Analytics consent. Nothing third-party loads and no tracking event fires until
// the visitor has explicitly agreed.

const KEY = "rallypack_analytics_consent";
export const CONSENT_EVENT = "rallypack:consent";

export function getConsent() {
  try {
    return localStorage.getItem(KEY);
  } catch (_e) {
    return null;
  }
}

export function hasConsent() {
  return getConsent() === "granted";
}

export function setConsent(value) {
  try {
    localStorage.setItem(KEY, value);
  } catch (_e) {
    /* storage unavailable — the banner will simply show again */
  }
  try {
    window.dispatchEvent(new Event(CONSENT_EVENT));
  } catch (_e) {
    /* non-fatal */
  }
}

export function subscribeConsent(handler) {
  window.addEventListener(CONSENT_EVENT, handler);
  return () => window.removeEventListener(CONSENT_EVENT, handler);
}