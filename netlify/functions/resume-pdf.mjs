// /resume.pdf          GET  (public) → the published résumé as a PDF download.
//                       Until something is published, redirects to the original PDF.
// /api/resume/pdf      POST (owner only) { data } → PDF of the given draft.
import { currentUser } from '../lib/auth.mjs';
import { error, isSameOrigin, readJson } from '../lib/http.mjs';
import { normalizeResume } from '../lib/model.mjs';
import { pdfFileName, renderResumePdf } from '../lib/pdf.mjs';
import { readPublished } from '../lib/store.mjs';

const FALLBACK_PDF = '/assets/resume.pdf';

function pdfResponse(bytes, data, cache) {
  return new Response(bytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${pdfFileName(data)}"`,
      'Cache-Control': cache,
    },
  });
}

export default async (req) => {
  const { pathname } = new URL(req.url);

  if (pathname === '/resume.pdf') {
    if (req.method !== 'GET' && req.method !== 'HEAD') return error(405, 'Method not allowed.');
    const published = await readPublished();
    if (!published) return Response.redirect(new URL(FALLBACK_PDF, req.url), 302);
    const data = normalizeResume(published.data);
    return pdfResponse(await renderResumePdf(data), data, 'no-cache');
  }

  if (req.method !== 'POST') return error(405, 'Method not allowed.');
  if (!(await currentUser(req))) return error(401, 'Sign in to download your draft.');
  if (!isSameOrigin(req)) return error(403, 'Requests must come from this site.');
  let body;
  try {
    body = await readJson(req);
  } catch (e) {
    return error(e.status || 400, e.message);
  }
  const data = normalizeResume(body?.data);
  return pdfResponse(await renderResumePdf(data), data, 'no-store');
};

export const config = { path: ['/resume.pdf', '/api/resume/pdf'] };
