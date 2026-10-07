// Authenticates a platform-scheduled workflow run.
//
// Scheduled workflow invocations carry the automation secret in a request header;
// the body form is accepted too, for a direct invocation from a trusted caller.
// Every comparison of the secret is timing-safe, so it cannot be recovered by
// measuring how long a wrong value takes to reject.

export function timingSafeEqual(a, b) {
  const enc = new TextEncoder();
  const bufA = enc.encode(String(a));
  const bufB = enc.encode(String(b));
  if (bufA.length !== bufB.length) return false;
  let diff = 0;
  for (let i = 0; i < bufA.length; i++) {
    diff |= bufA[i] ^ bufB[i];
  }
  return diff === 0;
}

/** Constant-time check of a caller-supplied secret value against AUTOMATION_SECRET. */
export function matchesAutomationSecret(candidate) {
  const secret = Deno.env.get('AUTOMATION_SECRET');
  if (!secret) return false;
  return timingSafeEqual(candidate, secret);
}

/** True when the request proves it came from the app's own automation, not the public. */
export function isAutomationRequest(req, body) {
  const headerSecret =
    req.headers.get('x-automation-secret') || req.headers.get('automation-secret');
  return matchesAutomationSecret(headerSecret) || matchesAutomationSecret(body?.automation_secret);
}