// Renders the résumé document (see model.mjs) to an A4 PDF with pdf-lib.
import { PDFDocument, PDFString, StandardFonts, rgb } from 'pdf-lib';

const PAGE = [595.28, 841.89]; // A4 in points
const MARGIN = { top: 52, bottom: 54, left: 54, right: 54 };
const CONTENT_W = PAGE[0] - MARGIN.left - MARGIN.right;

// The site's palette.
const INK = rgb(0x1b / 255, 0x1e / 255, 0x22 / 255);
const MUTED = rgb(0x64 / 255, 0x6b / 255, 0x73 / 255);
const ACCENT = rgb(0x2b / 255, 0x46 / 255, 0xd8 / 255);
const RULE = rgb(0xdc / 255, 0xdf / 255, 0xda / 255);

const BODY = { size: 9.5, leading: 13.6 };

const REPLACEMENTS = {
  '→': '->', '←': '<-', '≤': '<=', '≥': '>=', '−': '-',
  ' ': ' ', ' ': ' ', ' ': ' ', ' ': ' ', '​': '', '﻿': '',
  '\t': ' ',
};

export function pdfFileName(data) {
  const base = String(data?.name || 'Resume')
    .normalize('NFKD')
    .replace(/[^\x20-\x7e]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base || 'Resume'}-Resume.pdf`;
}

export async function renderResumePdf(data) {
  const doc = await PDFDocument.create();
  const name = data.name?.trim() || 'Résumé';
  doc.setTitle(`${name} – Résumé`);
  doc.setAuthor(name);
  doc.setSubject('Résumé');
  doc.setCreator('azriebakri.com');
  doc.setProducer('azriebakri.com');
  doc.setLanguage('en');

  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const charset = new Set(regular.getCharacterSet());

  // Fonts here use WinAnsi encoding; swap anything outside it for a close match.
  const clean = (text) => {
    let out = '';
    for (const ch of String(text ?? '')) {
      if (ch in REPLACEMENTS) out += REPLACEMENTS[ch];
      else if (ch.codePointAt(0) < 32) continue;
      else if (charset.has(ch.codePointAt(0))) out += ch;
      else {
        const base = ch.normalize('NFKD').replace(/[̀-ͯ]/g, '');
        out += base && [...base].every((c) => charset.has(c.codePointAt(0))) ? base : '?';
      }
    }
    return out;
  };

  const pages = [];
  let page;
  let y;
  const newPage = () => {
    page = doc.addPage(PAGE);
    pages.push(page);
    y = PAGE[1] - MARGIN.top;
  };
  const ensure = (height) => {
    if (y - height < MARGIN.bottom) newPage();
  };
  const gap = (h) => {
    if (y < PAGE[1] - MARGIN.top) y -= h; // no gaps at the top of a page
  };

  const wrap = (text, font, size, width) => {
    const lines = [];
    for (const rawLine of String(text).split('\n')) {
      const words = clean(rawLine).trim().split(/ +/).filter(Boolean);
      let line = '';
      for (let word of words) {
        // Break words longer than the line on their own.
        while (font.widthOfTextAtSize(word, size) > width && word.length > 1) {
          let cut = word.length - 1;
          while (cut > 1 && font.widthOfTextAtSize(word.slice(0, cut), size) > width) cut--;
          if (line) {
            lines.push(line);
            line = '';
          }
          lines.push(word.slice(0, cut));
          word = word.slice(cut);
        }
        const next = line ? `${line} ${word}` : word;
        if (font.widthOfTextAtSize(next, size) <= width) line = next;
        else {
          lines.push(line);
          line = word;
        }
      }
      lines.push(line);
    }
    return lines;
  };

  // Draws one line in a box `leading` tall and returns its baseline.
  const line = (text, { font = regular, size = BODY.size, leading = BODY.leading, x = MARGIN.left, color = INK } = {}) => {
    ensure(leading);
    const baseline = y - (leading - size) / 2 - size * 0.78;
    if (text) page.drawText(text, { x, y: baseline, size, font, color });
    y -= leading;
    return baseline;
  };

  const addLink = (x, baseline, width, size, uri) => {
    const ctx = doc.context;
    const annot = ctx.obj({
      Type: 'Annot',
      Subtype: 'Link',
      Rect: [x, baseline - size * 0.25, x + width, baseline + size * 0.85],
      Border: [0, 0, 0],
      A: { Type: 'Action', S: 'URI', URI: PDFString.of(uri) },
    });
    page.node.addAnnot(ctx.register(annot));
  };

  const paragraphs = (text, style = {}) => {
    const blocks = String(text || '')
      .split(/\n\s*\n/)
      .map((b) => b.trim())
      .filter(Boolean);
    const font = style.font || regular;
    const size = style.size || BODY.size;
    const indent = style.indent || 0;
    blocks.forEach((block, i) => {
      if (i) gap(5);
      for (const l of wrap(block, font, size, CONTENT_W - indent)) line(l, { ...style, x: MARGIN.left + indent });
    });
  };

  const bullets = (items) => {
    const indent = 11;
    for (const item of items.map((b) => b.trim()).filter(Boolean)) {
      const lines = wrap(item, regular, BODY.size, CONTENT_W - indent);
      lines.forEach((l, i) => {
        const baseline = line(l, { x: MARGIN.left + indent });
        if (i === 0) page.drawText('•', { x: MARGIN.left + 1.5, y: baseline, size: BODY.size, font: regular, color: MUTED });
      });
      gap(2.5);
    }
  };

  const label = (text) => {
    gap(3);
    line(text, { font: bold, size: 9, leading: 13, color: INK });
  };

  // ---- Header ----------------------------------------------------------------
  newPage();
  for (const l of wrap(data.name || '', bold, 23, CONTENT_W)) line(l, { font: bold, size: 23, leading: 27 });
  if (data.headline?.trim()) {
    gap(1);
    for (const l of wrap(data.headline, regular, 11.5, CONTENT_W)) line(l, { size: 11.5, leading: 15, color: MUTED });
  }

  const c = data.contact || {};
  const website = (c.website || '').trim();
  const segments = [
    { text: c.location },
    { text: c.phone, link: c.phone ? `tel:${c.phone.replace(/[^\d+]/g, '')}` : '' },
    { text: c.email, link: c.email ? `mailto:${c.email.trim()}` : '' },
    { text: website.replace(/^https?:\/\//, '').replace(/\/$/, ''), link: /^https?:\/\//.test(website) ? website : website ? `https://${website}` : '' },
  ]
    .map((s) => ({ ...s, text: clean((s.text || '').trim()) }))
    .filter((s) => s.text);
  if (segments.length) {
    gap(4);
    const size = 9.25;
    const sep = '   |   ';
    const sepW = regular.widthOfTextAtSize(sep, size);
    let x = MARGIN.left;
    let baseline = line('', { size, leading: 13 });
    segments.forEach((s, i) => {
      const w = regular.widthOfTextAtSize(s.text, size);
      if (i && x + sepW + w > MARGIN.left + CONTENT_W) {
        x = MARGIN.left;
        baseline = line('', { size, leading: 13 });
      } else if (i) {
        page.drawText(sep, { x, y: baseline, size, font: regular, color: RULE });
        x += sepW;
      }
      page.drawText(s.text, { x, y: baseline, size, font: regular, color: MUTED });
      if (s.link) addLink(x, baseline, w, size, s.link);
      x += w;
    });
  }

  // ---- Sections --------------------------------------------------------------
  const entry = (e, sub = false) => {
    const titleSize = sub ? 9.75 : 10.25;
    const dates = clean((e.dates || '').trim());
    const datesSize = 9;
    const datesW = dates ? regular.widthOfTextAtSize(dates, datesSize) : 0;
    const titleLines = wrap(e.title || '', bold, titleSize, CONTENT_W - (datesW ? datesW + 16 : 0)).filter(Boolean);
    ensure(14 * Math.max(titleLines.length, 1) + BODY.leading * 2);
    const first = line(titleLines[0] || '', { font: bold, size: titleSize, leading: 14 });
    if (dates) page.drawText(dates, { x: MARGIN.left + CONTENT_W - datesW, y: first, size: datesSize, font: regular, color: MUTED });
    for (const l of titleLines.slice(1)) line(l, { font: bold, size: titleSize, leading: 14 });
    if (e.subtitle?.trim()) for (const l of wrap(e.subtitle, regular, 9.25, CONTENT_W)) line(l, { size: 9.25, leading: 13, color: MUTED });

    const hasDescription = Boolean(e.description?.trim());
    const items = (e.bullets || []).filter((b) => b.trim());
    if (hasDescription) {
      gap(3);
      paragraphs(e.description);
    }
    if (items.length) {
      if (hasDescription) label('Key deliverables');
      else gap(3);
      bullets(items);
    }
    if (e.outcome?.trim()) {
      label('Outcome');
      paragraphs(e.outcome);
    }
    for (const p of e.projects || []) {
      gap(9);
      entry(p, true);
    }
  };

  const hasContent = (s) =>
    s.type === 'text' ? Boolean(s.body?.trim()) : (s.items || []).some((i) => (typeof i === 'string' ? i.trim() : i.title?.trim() || i.description?.trim() || i.bullets?.some((b) => b.trim())));

  for (const s of data.sections || []) {
    if (!hasContent(s)) continue;
    gap(17);
    if (s.title?.trim()) {
      ensure(15 + 10 + BODY.leading * 2);
      line(clean(s.title.trim()), { font: bold, size: 10.5, leading: 15, color: ACCENT });
      y -= 2.5;
      page.drawLine({ start: { x: MARGIN.left, y }, end: { x: MARGIN.left + CONTENT_W, y }, thickness: 0.6, color: RULE });
      y -= 8;
    }
    if (s.type === 'text') paragraphs(s.body);
    else if (s.type === 'tags') paragraphs(s.items.map((t) => t.trim()).filter(Boolean).join(', '));
    else if (s.type === 'list') for (const item of s.items.map((t) => t.trim()).filter(Boolean)) for (const l of wrap(item, regular, BODY.size, CONTENT_W)) line(l);
    else if (s.type === 'entries') {
      s.items.forEach((e, i) => {
        if (i) gap(11);
        entry(e);
      });
    }
  }

  // ---- Page numbers ----------------------------------------------------------
  if (pages.length > 1) {
    pages.forEach((p, i) => {
      const text = `${i + 1} / ${pages.length}`;
      const w = regular.widthOfTextAtSize(text, 8);
      p.drawText(text, { x: MARGIN.left + CONTENT_W - w, y: MARGIN.bottom - 26, size: 8, font: regular, color: MUTED });
    });
  }

  return doc.save();
}
