// Shared helpers for the scheduled reminder emails (business expiry + home safety).

export const DAY_MS = 24 * 60 * 60 * 1000;

// Constant-time comparison to avoid timing side-channels on the automation secret.
export function timingSafeEqual(a, b) {
  const enc = new TextEncoder();
  const bufA = enc.encode(String(a));
  const bufB = enc.encode(String(b));
  if (bufA.length !== bufB.length) return false;
  let diff = 0;
  for (let i = 0; i < bufA.length; i++) diff |= bufA[i] ^ bufB[i];
  return diff === 0;
}

export function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / DAY_MS);
}

// True when the request carries a valid automation secret (scheduled job) —
// otherwise the caller must be an authenticated admin.
export function isAutomationRequest(req, body) {
  const AUTOMATION_SECRET = Deno.env.get('AUTOMATION_SECRET');
  const headerSecret = req.headers.get('x-automation-secret') || req.headers.get('automation-secret');
  return Boolean(
    (AUTOMATION_SECRET && headerSecret && timingSafeEqual(headerSecret, AUTOMATION_SECRET)) ||
    (AUTOMATION_SECRET && body.automation_secret && timingSafeEqual(body.automation_secret, AUTOMATION_SECRET))
  );
}