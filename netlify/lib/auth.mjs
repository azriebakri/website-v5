// Google sign-in verification and signed session cookies, using only Node's
// built-in crypto.
import { createHmac, createPublicKey, timingSafeEqual, verify as verifySignature } from 'node:crypto';
import { parseCookies } from './http.mjs';
import { sessionSecret } from './store.mjs';

const GOOGLE_CERTS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const GOOGLE_ISSUERS = new Set(['accounts.google.com', 'https://accounts.google.com']);
const DEFAULT_OWNER = 'mohamad.azriebakri@gmail.com';
const SESSION_COOKIE = 'resume_session';
const SESSION_DAYS = 7;
const CLOCK_SKEW_S = 60;

export function googleClientId() {
  return (process.env.GOOGLE_CLIENT_ID || '').trim();
}

// Comma-separated list of Google accounts allowed to edit. Defaults to the owner.
export function allowedEmails() {
  const raw = process.env.ALLOWED_EMAILS || DEFAULT_OWNER;
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

const b64urlJson = (part) => JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));

// ---- Google ID tokens -------------------------------------------------------

let certCache = { keys: null, expires: 0 };

async function googleKeys() {
  if (certCache.keys && Date.now() < certCache.expires) return certCache.keys;
  const res = await fetch(GOOGLE_CERTS_URL);
  if (!res.ok) throw new Error(`Could not load Google signing keys (${res.status})`);
  const { keys } = await res.json();
  const maxAge = Number(/max-age=(\d+)/.exec(res.headers.get('cache-control') || '')?.[1] || 3600);
  certCache = { keys, expires: Date.now() + Math.min(maxAge, 86400) * 1000 };
  return keys;
}

/**
 * Verify a Google Identity Services credential (an RS256 JWT).
 * Returns the token's claims, or throws with a reason.
 * `options.keys` replaces Google's published keys (used in tests).
 */
export async function verifyGoogleIdToken(token, { clientId, keys, now = Date.now() } = {}) {
  if (!clientId) throw new Error('Google sign-in is not configured');
  const parts = String(token || '').split('.');
  if (parts.length !== 3) throw new Error('Malformed token');
  const [h, p, s] = parts;
  let header, claims;
  try {
    header = b64urlJson(h);
    claims = b64urlJson(p);
  } catch {
    throw new Error('Malformed token');
  }
  if (header.alg !== 'RS256') throw new Error('Unexpected token algorithm');

  const jwks = keys || (await googleKeys());
  const jwk = jwks.find((k) => k.kid === header.kid);
  if (!jwk) throw new Error('Unknown signing key');
  const ok = verifySignature(
    'RSA-SHA256',
    Buffer.from(`${h}.${p}`),
    createPublicKey({ key: jwk, format: 'jwk' }),
    Buffer.from(s, 'base64url'),
  );
  if (!ok) throw new Error('Bad signature');

  const nowS = Math.floor(now / 1000);
  if (!GOOGLE_ISSUERS.has(claims.iss)) throw new Error('Wrong issuer');
  const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!aud.includes(clientId)) throw new Error('Token is for a different app');
  if (typeof claims.exp !== 'number' || claims.exp + CLOCK_SKEW_S < nowS) throw new Error('Token expired');
  if (typeof claims.iat === 'number' && claims.iat - CLOCK_SKEW_S > nowS) throw new Error('Token issued in the future');
  if (claims.email_verified !== true && claims.email_verified !== 'true') throw new Error('Email not verified');
  if (!claims.email) throw new Error('Token has no email');
  return claims;
}

// ---- Session cookie (HS256 JWT) ----------------------------------------------

function hmac(secret, data) {
  return createHmac('sha256', secret).update(data).digest('base64url');
}

export function signSession(email, secret, now = Date.now()) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const iat = Math.floor(now / 1000);
  const body = Buffer.from(
    JSON.stringify({ sub: email, iat, exp: iat + SESSION_DAYS * 86400 }),
  ).toString('base64url');
  return `${header}.${body}.${hmac(secret, `${header}.${body}`)}`;
}

export function verifySession(token, secret, now = Date.now()) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  const expected = Buffer.from(hmac(secret, `${h}.${p}`));
  const given = Buffer.from(s);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const claims = b64urlJson(p);
    if (typeof claims.exp !== 'number' || claims.exp < Math.floor(now / 1000)) return null;
    return claims;
  } catch {
    return null;
  }
}

export function sessionCookie(token) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}`;
}

export function clearedSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

/** Returns the signed-in owner's email, or null. */
export async function currentUser(req) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!token) return null;
  const claims = verifySession(token, await sessionSecret());
  if (!claims) return null;
  const email = String(claims.sub || '').toLowerCase();
  // Re-check the allowlist so removing an address revokes access at once.
  return allowedEmails().includes(email) ? email : null;
}
