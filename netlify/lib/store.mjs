// Storage for the résumé and the session secret, using Netlify Blobs.
// Stores are site-wide, so every deploy reads and writes the same data.
import { getStore } from '@netlify/blobs';

function resumeStore() {
  return getStore({ name: 'resume', consistency: 'strong' });
}

function authStore() {
  return getStore({ name: 'auth', consistency: 'strong' });
}

export async function readDraft() {
  return resumeStore().get('draft', { type: 'json' });
}

export async function writeDraft(data) {
  const record = { data, savedAt: new Date().toISOString() };
  await resumeStore().setJSON('draft', record);
  return record;
}

export async function readPublished() {
  return resumeStore().get('published', { type: 'json' });
}

export async function writePublished(data) {
  const record = { data, publishedAt: new Date().toISOString() };
  await resumeStore().setJSON('published', record);
  return record;
}

// Random secret used to sign session cookies. Created on first use so the
// site needs no extra environment variable; SESSION_SECRET overrides it.
export async function sessionSecret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  const store = authStore();
  const existing = await store.get('session-secret', { type: 'text' });
  if (existing) return existing;
  const bytes = new Uint8Array(48);
  crypto.getRandomValues(bytes);
  const secret = Buffer.from(bytes).toString('base64url');
  await store.set('session-secret', secret);
  // Read back so two first-time requests racing agree on one secret.
  return (await store.get('session-secret', { type: 'text' })) || secret;
}
