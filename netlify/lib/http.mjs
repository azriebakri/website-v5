// Small helpers shared by the Netlify functions.

const MAX_BODY_BYTES = 256 * 1024;

export function json(data, init = {}) {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function error(status, message) {
  return json({ error: message }, { status });
}

export function parseCookies(req) {
  const out = {};
  const header = req.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const name = part.slice(0, i).trim();
    if (name) out[name] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

// Requests that change data must come from this site. Browsers always send
// Origin on cross-site POST/PUT/DELETE, so a mismatch means another site.
export function isSameOrigin(req) {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(req.url).host;
  } catch {
    return false;
  }
}

export async function readJson(req) {
  const type = req.headers.get('content-type') || '';
  if (!type.includes('application/json')) {
    throw Object.assign(new Error('Send the request body as JSON.'), { status: 415 });
  }
  const text = await req.text();
  if (text.length > MAX_BODY_BYTES) {
    throw Object.assign(new Error('The résumé is too large to save.'), { status: 413 });
  }
  try {
    return JSON.parse(text);
  } catch {
    throw Object.assign(new Error('The request body is not valid JSON.'), { status: 400 });
  }
}
