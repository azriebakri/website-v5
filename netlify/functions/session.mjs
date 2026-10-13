// /api/session
//   GET     → { configured, clientId, signedIn, email }
//   POST    { credential } → verifies the Google sign-in and sets the session cookie
//   DELETE  → signs out
import {
  allowedEmails,
  clearedSessionCookie,
  currentUser,
  googleClientId,
  sessionCookie,
  signSession,
  verifyGoogleIdToken,
} from '../lib/auth.mjs';
import { error, isSameOrigin, json, readJson } from '../lib/http.mjs';
import { sessionSecret } from '../lib/store.mjs';

export default async (req) => {
  const clientId = googleClientId();

  if (req.method === 'GET') {
    const email = await currentUser(req);
    return json({ configured: Boolean(clientId), clientId, signedIn: Boolean(email), email });
  }

  if (!isSameOrigin(req)) return error(403, 'Requests must come from this site.');

  if (req.method === 'DELETE') {
    return json({ signedIn: false }, { headers: { 'Set-Cookie': clearedSessionCookie() } });
  }

  if (req.method === 'POST') {
    if (!clientId) return error(503, 'Google sign-in is not set up yet. Add GOOGLE_CLIENT_ID in Netlify.');
    let body;
    try {
      body = await readJson(req);
    } catch (e) {
      return error(e.status || 400, e.message);
    }
    let claims;
    try {
      claims = await verifyGoogleIdToken(body.credential, { clientId });
    } catch (e) {
      console.warn('Rejected Google credential:', e.message);
      return error(401, 'Google sign-in could not be verified. Try signing in again.');
    }
    const email = String(claims.email).toLowerCase();
    if (!allowedEmails().includes(email)) {
      return error(403, `${email} can't edit this résumé. Sign in with the site owner's Google account.`);
    }
    const token = signSession(email, await sessionSecret());
    return json({ signedIn: true, email }, { headers: { 'Set-Cookie': sessionCookie(token) } });
  }

  return error(405, 'Method not allowed.');
};

export const config = { path: '/api/session' };
