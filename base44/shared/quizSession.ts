// Signed quiz session tokens.
//
// saveQuizResult is a public, unauthenticated endpoint, and its rows drive the
// public readiness map and the milestone statistics. It used to trust a
// client-supplied session_id, so a script could mint unlimited unique ids and
// write fabricated scores straight into those public aggregates.
//
// The session id is now chosen and signed by the server. A caller cannot invent
// one, and because saveQuizResult dedupes on the session id, each issued session
// can only ever produce a single row. Issuance is itself bounded (see
// startQuizSession), which is what keeps fabricated volume finite.

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64UrlEncode(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(value) {
  const padded = value
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

/** Stable short id for a value — used to keep one row per recurring bot. */
export async function hashId(value) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
}

/** Returns "<payload>.<signature>" for a server-chosen session id. */
export async function signQuizSession(secret, sessionId) {
  const payload = base64UrlEncode(
    encoder.encode(JSON.stringify({ sid: sessionId, iat: Date.now() })),
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    await hmacKey(secret),
    encoder.encode(payload),
  );
  return `${payload}.${base64UrlEncode(new Uint8Array(signature))}`;
}

/**
 * Returns { sessionId } for a token this server signed and that is inside the
 * accepted age window, otherwise null. `minAgeMs` is a floor on how quickly a
 * freshly issued session may be spent — a person answering the quiz takes far
 * longer than the floor, so a caller posting in a tight loop is rejected.
 */
export async function verifyQuizSession(secret, token, { minAgeMs, maxAgeMs }) {
  if (typeof token !== 'string' || token.length > 512) return null;

  const parts = token.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  const [payload, signature] = parts;

  let valid = false;
  try {
    valid = await crypto.subtle.verify(
      'HMAC',
      await hmacKey(secret),
      base64UrlDecode(signature),
      encoder.encode(payload),
    );
  } catch (_) {
    return null;
  }
  if (!valid) return null;

  try {
    const { sid, iat } = JSON.parse(decoder.decode(base64UrlDecode(payload))) || {};
    if (typeof sid !== 'string' || !sid) return null;
    const age = Date.now() - Number(iat);
    if (!Number.isFinite(age) || age < minAgeMs || age > maxAgeMs) return null;
    return { sessionId: sid };
  } catch (_) {
    return null;
  }
}