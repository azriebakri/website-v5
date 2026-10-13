// /api/resume (owner only)
//   GET   → { draft, savedAt, published, publishedAt, isSeed }
//   PUT   { data } → saves the draft
// /api/resume/publish (owner only)
//   POST  { data } → saves the draft and makes it the public version at /resume.pdf
import { currentUser } from '../lib/auth.mjs';
import { error, isSameOrigin, json, readJson } from '../lib/http.mjs';
import { normalizeResume } from '../lib/model.mjs';
import { seedResume } from '../lib/seed.mjs';
import { readDraft, readPublished, writeDraft, writePublished } from '../lib/store.mjs';

export default async (req) => {
  const email = await currentUser(req);
  if (!email) return error(401, 'Sign in to edit your résumé.');

  const isPublish = new URL(req.url).pathname.endsWith('/publish');

  if (req.method === 'GET' && !isPublish) {
    const [draft, published] = await Promise.all([readDraft(), readPublished()]);
    return json({
      draft: normalizeResume(draft?.data ?? published?.data ?? seedResume),
      savedAt: draft?.savedAt ?? null,
      published: published ? normalizeResume(published.data) : null,
      publishedAt: published?.publishedAt ?? null,
      isSeed: !draft && !published,
    });
  }

  if (!isSameOrigin(req)) return error(403, 'Requests must come from this site.');

  let body;
  try {
    body = await readJson(req);
  } catch (e) {
    return error(e.status || 400, e.message);
  }
  if (!body || typeof body.data !== 'object') return error(400, 'Send the résumé as { data }.');
  const data = normalizeResume(body.data);

  if (req.method === 'PUT' && !isPublish) {
    const { savedAt } = await writeDraft(data);
    return json({ savedAt });
  }

  if (req.method === 'POST' && isPublish) {
    const { savedAt } = await writeDraft(data);
    const { publishedAt } = await writePublished(data);
    return json({ savedAt, publishedAt, published: data });
  }

  return error(405, 'Method not allowed.');
};

export const config = { path: ['/api/resume', '/api/resume/publish'] };
