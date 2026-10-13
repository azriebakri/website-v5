// The résumé document shape, and a normalizer that keeps stored data in that
// shape whatever the client sends.
//
// {
//   name, headline,
//   contact: { location, phone, email, website },
//   sections: [
//     { id, type: 'text',    title, body },
//     { id, type: 'tags',    title, items: [string] },
//     { id, type: 'list',    title, items: [string] },
//     { id, type: 'entries', title, items: [Entry] },
//   ]
// }
// Entry = { id, title, subtitle, dates, description, bullets: [string], outcome, projects: [Entry] }
// (projects are one level deep; a project's own `projects` is always empty)

export const SECTION_TYPES = ['text', 'tags', 'list', 'entries'];

const LIMITS = { short: 300, long: 6000, items: 200, sections: 40 };

const str = (v, max = LIMITS.short) => (typeof v === 'string' ? v : v == null ? '' : String(v)).slice(0, max);

const arr = (v, max = LIMITS.items) => (Array.isArray(v) ? v.slice(0, max) : []);

let counter = 0;
export function newId(prefix = 'x') {
  counter = (counter + 1) % 1e6;
  return `${prefix}${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

const id = (v, prefix) => (typeof v === 'string' && /^[\w-]{1,40}$/.test(v) ? v : newId(prefix));

function normalizeEntry(e, depth = 0) {
  e = e && typeof e === 'object' ? e : {};
  return {
    id: id(e.id, 'e'),
    title: str(e.title),
    subtitle: str(e.subtitle),
    dates: str(e.dates, 80),
    description: str(e.description, LIMITS.long),
    bullets: arr(e.bullets).map((b) => str(b, 1500)),
    outcome: str(e.outcome, LIMITS.long),
    projects: depth === 0 ? arr(e.projects, 30).map((p) => normalizeEntry(p, 1)) : [],
  };
}

function normalizeSection(s) {
  s = s && typeof s === 'object' ? s : {};
  const type = SECTION_TYPES.includes(s.type) ? s.type : 'text';
  const base = { id: id(s.id, 's'), type, title: str(s.title, 120) };
  if (type === 'text') return { ...base, body: str(s.body, LIMITS.long) };
  if (type === 'entries') return { ...base, items: arr(s.items, 60).map((e) => normalizeEntry(e)) };
  return { ...base, items: arr(s.items).map((t) => str(t, 300)) };
}

export function normalizeResume(input) {
  const r = input && typeof input === 'object' ? input : {};
  const c = r.contact && typeof r.contact === 'object' ? r.contact : {};
  return {
    name: str(r.name, 120),
    headline: str(r.headline, 200),
    contact: {
      location: str(c.location, 120),
      phone: str(c.phone, 60),
      email: str(c.email, 160),
      website: str(c.website, 200),
    },
    sections: arr(r.sections, LIMITS.sections).map(normalizeSection),
  };
}
