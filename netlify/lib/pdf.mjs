// Renders the résumé document (see model.mjs) to an A4 PDF with pdf-lib,
// styled after the website: paper background, ink text, cobalt accents.
//
// Layout is measured before it is drawn, so a section or entry that won't fit
// in the space left on a page starts on the next page instead of splitting.
// Only blocks taller than a whole page are split (between projects first).
import { PDFDocument, PDFString, StandardFonts, popGraphicsState, pushGraphicsState, rgb, setCharacterSpacing } from 'pdf-lib';

const PAGE = [595.28, 841.89]; // A4 in points
const MARGIN = { top: 54, bottom: 56, left: 56, right: 56 };
const CONTENT_W = PAGE[0] - MARGIN.left - MARGIN.right;
const PAGE_TOP = PAGE[1] - MARGIN.top;
const FULL_H = PAGE_TOP - MARGIN.bottom;

const hex = (h) => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);

// The website's palette.
const PAPER = hex('#f6f7f5');
const SURFACE = hex('#ffffff');
const INK = hex('#1b1e22');
const MUTED = hex('#646b73');
const RULE = hex('#dcdfda');
const ACCENT = hex('#2b46d8');

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

  // ---- Page state ------------------------------------------------------------
  // In a dry run nothing is drawn; y still advances so heights can be measured.
  const pages = [];
  let page;
  let y = PAGE_TOP;
  let dry = false;

  const newPage = () => {
    page = doc.addPage(PAGE);
    pages.push(page);
    page.drawRectangle({ x: 0, y: 0, width: PAGE[0], height: PAGE[1], color: PAPER });
    y = PAGE_TOP;
  };
  const atTop = () => y >= PAGE_TOP;
  const ensure = (height) => {
    if (!dry && y - height < MARGIN.bottom) newPage();
  };
  const gap = (h) => {
    if (dry || !atTop()) y -= h; // no gaps at the top of a page
  };

  const measure = (fn) => {
    const saved = { y, dry };
    dry = true;
    y = 1e6;
    fn();
    const height = 1e6 - y;
    ({ y, dry } = saved);
    return height;
  };

  /**
   * Draw `fn` without splitting it across pages when possible: if it doesn't
   * fit in the space left, start a new page. If it's taller than a whole page,
   * run `fallback` (which can keep smaller pieces together) instead.
   */
  const keep = (fn, gapBefore = 0, fallback = fn) => {
    if (dry) {
      gap(gapBefore);
      fn();
      return;
    }
    const height = measure(fn);
    const needed = height + (atTop() ? 0 : gapBefore);
    if (y - needed >= MARGIN.bottom) {
      gap(gapBefore);
      fn();
    } else if (height <= FULL_H) {
      newPage();
      fn();
    } else {
      gap(gapBefore);
      fallback();
    }
  };

  // ---- Drawing primitives ----------------------------------------------------
  const text = (str, opts) => {
    if (!dry && str) page.drawText(str, opts);
  };

  const wrap = (str, font, size, width) => {
    const lines = [];
    for (const rawLine of String(str).split('\n')) {
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
  const line = (str, { font = regular, size = BODY.size, leading = BODY.leading, x = MARGIN.left, color = INK } = {}) => {
    ensure(leading);
    const baseline = y - (leading - size) / 2 - size * 0.78;
    text(str, { x, y: baseline, size, font, color });
    y -= leading;
    return baseline;
  };

  const addLink = (x, baseline, width, size, uri) => {
    if (dry) return;
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

  // A pill: rounded rectangle with fully round ends.
  const pill = (x, top, width, height, { fill, border }) => {
    if (dry) return;
    const r = height / 2;
    const path = `M ${r} 0 H ${width - r} A ${r} ${r} 0 0 1 ${width - r} ${height} H ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`;
    page.drawSvgPath(path, { x, y: top, color: fill, borderColor: border, borderWidth: 0.6 });
  };

  const paragraphs = (str, style = {}) => {
    const blocks = String(str || '')
      .split(/\n\s*\n/)
      .map((b) => b.trim())
      .filter(Boolean);
    const font = style.font || regular;
    const size = style.size || BODY.size;
    blocks.forEach((block, i) => {
      if (i) gap(5);
      for (const l of wrap(block, font, size, CONTENT_W)) line(l, style);
    });
  };

  const bullets = (items) => {
    const indent = 11;
    for (const item of items.map((b) => b.trim()).filter(Boolean)) {
      const lines = wrap(item, regular, BODY.size, CONTENT_W - indent);
      lines.forEach((l, i) => {
        const baseline = line(l, { x: MARGIN.left + indent });
        if (i === 0) text('•', { x: MARGIN.left + 1.5, y: baseline, size: BODY.size, font: regular, color: ACCENT });
      });
      gap(2.5);
    }
  };

  const label = (str) => {
    gap(3);
    line(str, { font: bold, size: 9, leading: 13 });
  };

  const tags = (items) => {
    const size = 8.75;
    const padX = 7;
    const h = 15;
    const rowGap = 5;
    const colGap = 5;
    const words = items.map((t) => clean(t.trim())).filter(Boolean);
    let x = MARGIN.left;
    let rowTop = null;
    const startRow = () => {
      if (rowTop !== null) y -= rowGap;
      ensure(h);
      rowTop = y;
      y -= h;
      x = MARGIN.left;
    };
    startRow();
    for (const word of words) {
      const w = Math.min(regular.widthOfTextAtSize(word, size) + padX * 2, CONTENT_W);
      if (x > MARGIN.left && x + w > MARGIN.left + CONTENT_W) startRow();
      pill(x, rowTop, w, h, { fill: SURFACE, border: RULE });
      text(word, { x: x + padX, y: rowTop - h / 2 - size * 0.34, size, font: regular, color: INK });
      x += w + colGap;
    }
  };

  // ---- Header ----------------------------------------------------------------
  newPage();
  if (!dry) page.pushOperators(pushGraphicsState(), setCharacterSpacing(-0.5));
  for (const l of wrap(data.name || '', bold, 24, CONTENT_W)) line(l, { font: bold, size: 24, leading: 28 });
  if (!dry) page.pushOperators(popGraphicsState());

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
    { text: website.replace(/^https?:\/\//, '').replace(/\/$/, ''), link: /^https?:\/\//.test(website) ? website : website ? `https://${website}` : '', accent: true },
  ]
    .map((s) => ({ ...s, text: clean((s.text || '').trim()) }))
    .filter((s) => s.text);
  if (segments.length) {
    gap(5);
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
        text(sep, { x, y: baseline, size, font: regular, color: RULE });
        x += sepW;
      }
      text(s.text, { x, y: baseline, size, font: regular, color: s.accent ? ACCENT : MUTED });
      if (s.link) addLink(x, baseline, w, size, s.link);
      x += w;
    });
  }

  // ---- Sections --------------------------------------------------------------
  const entryHead = (e, sub) => {
    const titleSize = sub ? 9.75 : 10.25;
    const dates = clean((e.dates || '').trim());
    const datesSize = 9;
    const datesW = dates ? regular.widthOfTextAtSize(dates, datesSize) : 0;
    const titleLines = wrap(e.title || '', bold, titleSize, CONTENT_W - (datesW ? datesW + 16 : 0)).filter(Boolean);
    const first = line(titleLines[0] || '', { font: bold, size: titleSize, leading: 14 });
    if (dates) text(dates, { x: MARGIN.left + CONTENT_W - datesW, y: first, size: datesSize, font: regular, color: MUTED });
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
  };

  // An entry and its projects. Kept whole when it fits on a page; otherwise
  // the entry stays with its first project and each later project is kept whole.
  const entry = (e, sub = false) => {
    const projects = sub ? [] : e.projects || [];
    if (!projects.length) return entryHead(e, sub);
    keep(() => {
      entryHead(e, sub);
      gap(9);
      entry(projects[0], true);
    });
    projects.slice(1).forEach((p) => keep(() => entry(p, true), 9));
  };

  const sectionTitle = (s) => {
    if (!s.title?.trim()) return;
    line(clean(s.title.trim()), { font: bold, size: 10.5, leading: 15, color: ACCENT });
    y -= 2.5;
    if (!dry) page.drawLine({ start: { x: MARGIN.left, y }, end: { x: MARGIN.left + CONTENT_W, y }, thickness: 0.6, color: RULE });
    y -= 8;
  };

  const sectionBody = (s) => {
    if (s.type === 'text') paragraphs(s.body);
    else if (s.type === 'tags') tags(s.items);
    else if (s.type === 'list') {
      for (const item of s.items.map((t) => t.trim()).filter(Boolean)) for (const l of wrap(item, regular, BODY.size, CONTENT_W)) line(l);
    } else if (s.type === 'entries') {
      s.items.forEach((e, i) => keep(() => entry(e), i ? 11 : 0));
    }
  };

  const hasContent = (s) =>
    s.type === 'text'
      ? Boolean(s.body?.trim())
      : (s.items || []).some((i) => (typeof i === 'string' ? i.trim() : i.title?.trim() || i.description?.trim() || i.bullets?.some((b) => b.trim())));

  for (const s of data.sections || []) {
    if (!hasContent(s)) continue;
    const whole = () => {
      sectionTitle(s);
      sectionBody(s);
    };
    // A section too tall for one page keeps its title with its first entry,
    // then keeps each later entry whole.
    const split = () => {
      if (s.type !== 'entries') return whole();
      const items = s.items;
      keep(() => {
        sectionTitle(s);
        entry(items[0]);
      });
      items.slice(1).forEach((e) => keep(() => entry(e), 11));
    };
    keep(whole, 18, split);
  }

  // ---- Page numbers ----------------------------------------------------------
  if (pages.length > 1) {
    pages.forEach((p, i) => {
      const str = `${i + 1} / ${pages.length}`;
      const w = regular.widthOfTextAtSize(str, 8);
      p.drawText(str, { x: MARGIN.left + CONTENT_W - w, y: MARGIN.bottom - 28, size: 8, font: regular, color: MUTED });
    });
  }

  return doc.save();
}
