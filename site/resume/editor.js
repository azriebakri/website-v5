// Résumé editor. Renders the résumé document as editable fields, autosaves
// the draft, downloads it as a PDF, and publishes it for the main page.

const BACKUP_KEY = 'resume-editor-backup';
const SAVE_DELAY_MS = 900;
const RETRY_DELAY_MS = 5000;

const $ = (id) => document.getElementById(id);
const els = {
  loading: $('loading'),
  signin: $('signin'),
  signinNote: $('signin-note'),
  googleButton: $('google-button'),
  signinError: $('signin-error'),
  workspace: $('workspace'),
  doc: $('doc'),
  publishState: $('publish-state'),
  actions: $('actions'),
  status: $('save-status'),
  download: $('download'),
  publish: $('publish'),
  signout: $('signout'),
  toast: $('toast'),
  toastText: $('toast-text'),
  toastAction: $('toast-action'),
};

const state = {
  session: null,
  email: null,
  doc: null,
  published: null,
  publishedAt: null,
  savedAt: null,
  dirty: false,
  saving: false,
  saveAgain: false,
  savePromise: null,
  saveTimer: null,
  sessionLost: false,
};

// ---- Utilities ---------------------------------------------------------------

function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k.includes('-') || !(k in el)) el.setAttribute(k, v === true ? '' : v);
    else el[k] = v;
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    el.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return el;
}

const ICONS = {
  up: '<path d="M4 10l4-4 4 4" />',
  down: '<path d="M4 6l4 4 4-4" />',
  trash: '<path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5" />',
  close: '<path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />',
};

function icon(name) {
  const span = document.createElement('span');
  span.setAttribute('aria-hidden', 'true');
  span.style.display = 'contents';
  span.innerHTML = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
  return span;
}

function iconBtn(name, label, onClick, { disabled = false, danger = false, fkey } = {}) {
  return h(
    'button',
    { type: 'button', class: `icon-btn${danger ? ' is-danger' : ''}`, 'aria-label': label, title: label, disabled, onclick: onClick, dataset: fkey ? { fkey } : undefined },
    icon(name),
  );
}

const uid = (prefix) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

// Key order matches the server's normalizer, so equal documents compare equal.
const newEntry = () => ({ id: uid('e'), title: '', subtitle: '', dates: '', description: '', bullets: [''], outcome: '', projects: [] });

function newSection(type) {
  const titles = { text: 'New section', entries: 'Experience', tags: 'Skills', list: 'List' };
  const base = { id: uid('s'), type, title: titles[type] };
  if (type === 'text') return { ...base, body: '' };
  if (type === 'entries') return { ...base, items: [newEntry()] };
  return { ...base, items: [] };
}

function canon(value) {
  if (Array.isArray(value)) return `[${value.map(canon).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${canon(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value ?? null);
}

const isDark = () => {
  const t = document.documentElement.dataset.theme;
  return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
};

function formatWhen(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch {
    return iso;
  }
}

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let message = '';
    try {
      message = (await res.json()).error;
    } catch {}
    throw Object.assign(new Error(message || `The server answered ${res.status}.`), { status: res.status });
  }
  return res;
}

// ---- Toast -------------------------------------------------------------------

let toastTimer;
function toast(text, { action, onAction, duration = 5000 } = {}) {
  clearTimeout(toastTimer);
  els.toastText.textContent = text;
  els.toastAction.hidden = !action;
  els.toastAction.textContent = action || '';
  els.toastAction.onclick = action
    ? () => {
        els.toast.hidden = true;
        onAction();
      }
    : null;
  els.toast.hidden = false;
  toastTimer = setTimeout(() => (els.toast.hidden = true), duration);
}

function setStatus(text, isError = false) {
  els.status.textContent = text;
  els.status.classList.toggle('is-error', isError);
}

// ---- Fields ------------------------------------------------------------------

function autosize(el) {
  if (el.tagName !== 'TEXTAREA') return;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}

function autosizeAll(root = els.doc) {
  root.querySelectorAll('textarea').forEach(autosize);
  root.querySelectorAll('input.f').forEach(fitInput);
}

// Single-line inputs size to their text (or placeholder) so they sit inline.
let measureCtx;
function fitInput(el) {
  if (!el.isConnected) return requestAnimationFrame(() => el.isConnected && fitInput(el));
  measureCtx ||= document.createElement('canvas').getContext('2d');
  const cs = getComputedStyle(el);
  measureCtx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const text = el.value || el.placeholder || ' ';
  const pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
  el.style.width = `${Math.ceil(measureCtx.measureText(text).width + pad + 2)}px`;
}

/**
 * An editable field bound to obj[key]. Textareas grow with their content and
 * read as plain text until hovered or focused.
 */
function field(obj, key, opts = {}) {
  const { cls = '', placeholder = '', label, multiline = false, optional = false, input = false, onEnter, onBackspaceEmpty, onChange, fkey } = opts;
  const el = input
    ? h('input', { type: 'text', class: `f ${cls}`, placeholder, 'aria-label': label || placeholder, dataset: { fkey } })
    : h('textarea', { class: `f ${cls}`, rows: 1, placeholder, 'aria-label': label || placeholder, spellcheck: true, dataset: { fkey } });
  if (optional) el.classList.add('optional');
  el.value = obj[key] ?? '';

  const fit = () => {
    if (optional) el.classList.toggle('is-empty', !el.value.trim());
    if (input) fitInput(el);
    else autosize(el);
  };
  fit();

  el.addEventListener('input', () => {
    if (!multiline && /\n/.test(el.value)) el.value = el.value.replace(/\n+/g, ' ');
    obj[key] = el.value;
    fit();
    onChange?.(el.value);
    changed();
  });
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !multiline) {
      e.preventDefault();
      onEnter?.(el);
    } else if (e.key === 'Backspace' && !el.value && onBackspaceEmpty) {
      e.preventDefault();
      onBackspaceEmpty();
    }
  });
  return el;
}

// Bullet points and list items: one growing field per row.
function rowsEditor(arr, { bullet, placeholder, label, keyPrefix }) {
  const wrap = h('div', { class: 'rows' });
  arr.forEach((_, i) => {
    const el = field(arr, i, {
      placeholder,
      label: `${label} ${i + 1}`,
      fkey: `${keyPrefix}:${i}`,
      onEnter: () => {
        arr.splice(i + 1, 0, '');
        rerender(`${keyPrefix}:${i + 1}`);
      },
      onBackspaceEmpty: () => {
        arr.splice(i, 1);
        rerender(i > 0 ? `${keyPrefix}:${i - 1}` : null);
      },
    });
    const remove = iconBtn('close', `Remove ${label.toLowerCase()} ${i + 1}`, () => {
      arr.splice(i, 1);
      rerender(arr.length ? `${keyPrefix}:${Math.max(i - 1, 0)}` : null);
    });
    wrap.append(h('div', { class: `row${bullet ? ' is-bullet' : ''}` }, el, remove));
  });
  return wrap;
}

function tagsEditor(sec) {
  const wrap = h('div', { class: 'tags' });
  const newKey = `${sec.id}:tag:new`;
  sec.items.forEach((t, i) => {
    const input = h('input', { type: 'text', value: t, size: Math.max(t.length, 2), 'aria-label': `Tag ${i + 1}`, dataset: { fkey: `${sec.id}:tag:${i}` } });
    input.addEventListener('input', () => {
      sec.items[i] = input.value;
      input.size = Math.max(input.value.length, 2);
      changed();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        wrap.querySelector('.tag-new')?.focus();
      } else if (e.key === 'Backspace' && !input.value) {
        e.preventDefault();
        sec.items.splice(i, 1);
        rerender(i > 0 ? `${sec.id}:tag:${i - 1}` : newKey);
      }
    });
    const remove = h('button', { type: 'button', 'aria-label': `Remove ${t || 'tag'}`, title: 'Remove', onclick: () => {
      sec.items.splice(i, 1);
      rerender(newKey);
    } }, icon('close'));
    wrap.append(h('span', { class: 'tag' }, input, remove));
  });

  const add = h('input', { type: 'text', class: 'tag-new', placeholder: 'Add a tag', 'aria-label': 'Add a tag', dataset: { fkey: newKey } });
  const commit = (refocus) => {
    const parts = add.value.split(',').map((s) => s.trim()).filter(Boolean);
    if (!parts.length) return;
    sec.items.push(...parts);
    add.value = '';
    if (refocus) rerender(newKey);
    else setTimeout(() => rerender(), 0); // after focus has moved on
  };
  add.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit(true);
    }
  });
  add.addEventListener('input', () => {
    if (add.value.includes(',')) commit(true);
  });
  add.addEventListener('blur', () => commit(false));
  wrap.append(add);
  return wrap;
}

// ---- Blocks ------------------------------------------------------------------

function headEditor(d) {
  const c = d.contact;
  const contactField = (key, placeholder) => field(c, key, { input: true, placeholder, label: placeholder, fkey: `contact:${key}` });
  return h(
    'header',
    { class: 'doc-head block' },
    field(d, 'name', { cls: 'f-name', placeholder: 'Your name', label: 'Name', fkey: 'name' }),
    field(d, 'headline', { cls: 'f-headline', placeholder: 'Headline, e.g. Software engineer (optional)', label: 'Headline', optional: true, fkey: 'headline' }),
    h('div', { class: 'contact' }, contactField('location', 'Location'), contactField('phone', 'Phone'), contactField('email', 'Email'), contactField('website', 'Website')),
  );
}

function entryEditor(list, idx, depth) {
  const e = list[idx];
  const kind = depth ? 'project' : 'entry';
  const base = `${depth ? 'p' : 'e'}:${e.id}`;

  const tools = h(
    'div',
    { class: 'tools' },
    iconBtn('up', `Move ${kind} up`, () => move(list, idx, -1), { disabled: idx === 0, fkey: `${base}:up` }),
    iconBtn('down', `Move ${kind} down`, () => move(list, idx, 1), { disabled: idx === list.length - 1, fkey: `${base}:down` }),
    iconBtn('trash', `Delete ${kind}`, () => removeWithUndo(list, idx, `${kind[0].toUpperCase()}${kind.slice(1)} deleted.`), { danger: true }),
  );

  const head = h(
    'div',
    { class: 'entry-head' },
    field(e, 'title', { cls: 'f-title', placeholder: depth ? 'Project name' : 'Role, Company', label: `${kind} title`, fkey: `${base}:title` }),
    field(e, 'dates', { cls: 'f-dates', placeholder: 'Dates', label: 'Dates', fkey: `${base}:dates` }),
  );

  const keyLabel = h('p', { class: 'mini-label' }, 'Key deliverables');
  const syncKeyLabel = () => (keyLabel.hidden = !(e.description.trim() && e.bullets.length));
  syncKeyLabel();

  const outcomeWrap = h('div', { class: 'optional outcome' });
  const syncOutcome = () => outcomeWrap.classList.toggle('is-empty', !e.outcome.trim());
  outcomeWrap.append(
    h('p', { class: 'mini-label' }, 'Outcome'),
    field(e, 'outcome', { cls: 'f-outcome', placeholder: 'What changed because of this work (optional)', label: 'Outcome', multiline: true, fkey: `${base}:outcome`, onChange: syncOutcome }),
  );
  syncOutcome();

  const adders = h(
    'div',
    { class: 'adders' },
    h('button', { type: 'button', class: 'text-btn', onclick: () => {
      e.bullets.push('');
      rerender(`${base}:b:${e.bullets.length - 1}`);
    } }, '+ Bullet'),
    depth === 0 &&
      h('button', { type: 'button', class: 'text-btn', onclick: () => {
        const p = newEntry();
        e.projects.push(p);
        rerender(`p:${p.id}:title`);
      } }, '+ Project'),
  );

  const block = h(
    'div',
    { class: 'entry block', dataset: { id: e.id } },
    tools,
    head,
    field(e, 'subtitle', { cls: 'f-subtitle', placeholder: 'Subtitle, e.g. school or team (optional)', label: 'Subtitle', optional: true, fkey: `${base}:subtitle` }),
    field(e, 'description', { cls: 'f-desc', placeholder: 'Short description (optional)', label: 'Description', multiline: true, optional: true, fkey: `${base}:description`, onChange: syncKeyLabel }),
    keyLabel,
    rowsEditor(e.bullets, { bullet: true, placeholder: 'What you did and the result', label: 'Bullet', keyPrefix: `${base}:b` }),
    outcomeWrap,
    adders,
  );

  if (depth === 0 && e.projects.length) {
    block.append(h('div', { class: 'projects' }, e.projects.map((_, i) => entryEditor(e.projects, i, 1))));
  }
  return block;
}

function sectionEditor(sec, idx, all) {
  const tools = h(
    'div',
    { class: 'tools' },
    iconBtn('up', 'Move section up', () => move(all, idx, -1), { disabled: idx === 0, fkey: `${sec.id}:up` }),
    iconBtn('down', 'Move section down', () => move(all, idx, 1), { disabled: idx === all.length - 1, fkey: `${sec.id}:down` }),
    iconBtn('trash', 'Delete section', () => removeWithUndo(all, idx, `"${sec.title || 'Section'}" deleted.`), { danger: true }),
  );
  const head = h('div', { class: 'sec-head' }, field(sec, 'title', { cls: 'f-sec-title', placeholder: 'Section title', label: 'Section title', fkey: `${sec.id}:title` }), tools);

  let body;
  if (sec.type === 'text') {
    body = field(sec, 'body', { cls: 'f-body', placeholder: 'Write a paragraph. Leave a blank line between paragraphs.', label: `${sec.title || 'Section'} text`, multiline: true, fkey: `${sec.id}:body` });
  } else if (sec.type === 'tags') {
    body = tagsEditor(sec);
  } else if (sec.type === 'list') {
    body = [
      rowsEditor(sec.items, { bullet: false, placeholder: 'List item', label: 'Item', keyPrefix: `${sec.id}:i` }),
      h('div', { class: 'adders' }, h('button', { type: 'button', class: 'text-btn', onclick: () => {
        sec.items.push('');
        rerender(`${sec.id}:i:${sec.items.length - 1}`);
      } }, '+ Item')),
    ];
  } else {
    body = [
      ...sec.items.map((_, i) => entryEditor(sec.items, i, 0)),
      h('div', { class: 'adders' }, h('button', { type: 'button', class: 'text-btn', onclick: () => {
        const e = newEntry();
        sec.items.push(e);
        rerender(`e:${e.id}:title`);
      } }, '+ Entry')),
    ];
  }
  return h('section', { class: 'sec', dataset: { type: sec.type, id: sec.id } }, head, body);
}

// ---- Rendering and focus -----------------------------------------------------

function currentFocus() {
  const a = document.activeElement;
  if (!a?.dataset?.fkey) return null;
  return { key: a.dataset.fkey, start: a.selectionStart, end: a.selectionEnd };
}

function render(focus = currentFocus()) {
  const d = state.doc;
  els.doc.replaceChildren(headEditor(d), ...d.sections.map((s, i, all) => sectionEditor(s, i, all)));
  requestAnimationFrame(() => autosizeAll());
  updatePublishState();
  if (focus?.key) {
    const el = els.doc.querySelector(`[data-fkey="${CSS.escape(focus.key)}"]`);
    if (el) {
      setActiveBlock(el);
      el.focus();
      if (typeof el.setSelectionRange === 'function' && el.value != null) {
        const n = el.value.length;
        if (focus.caretEnd || focus.start == null) el.setSelectionRange(n, n);
        else el.setSelectionRange(focus.start, focus.end);
      }
    }
  }
}

function rerender(focusKey) {
  changed();
  render(focusKey ? { key: focusKey, caretEnd: true } : currentFocus());
}

function move(list, i, dir) {
  const j = i + dir;
  if (j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  rerender(null);
}

function removeWithUndo(list, i, message) {
  const snapshot = structuredClone(state.doc);
  list.splice(i, 1);
  rerender(null);
  toast(message, {
    action: 'Undo',
    duration: 8000,
    onAction: () => {
      state.doc = snapshot;
      rerender(null);
    },
  });
}

// Empty optional fields appear only in the block being edited.
function setActiveBlock(target) {
  const block = target.closest?.('.block');
  els.doc.querySelectorAll('.block.is-active').forEach((b) => b !== block && b.classList.remove('is-active'));
  if (block && !block.classList.contains('is-active')) {
    block.classList.add('is-active');
    requestAnimationFrame(() => autosizeAll(block));
  }
}

els.doc.addEventListener('focusin', (e) => setActiveBlock(e.target));

// ---- Publish state -----------------------------------------------------------

function hasUnpublished() {
  return !state.published || canon(state.doc) !== canon(state.published);
}

function updatePublishState() {
  if (!state.doc) return;
  const pending = hasUnpublished();
  els.publish.disabled = Boolean(state.published) && !pending;
  els.publish.textContent = !state.published ? 'Publish' : pending ? 'Publish changes' : 'Published';

  const parts = [];
  if (!state.published) {
    parts.push(h('span', {}, 'Not published yet. Your main page still links to your original PDF.'));
  } else {
    parts.push(h('span', {}, `Published ${formatWhen(state.publishedAt)}.`));
    if (pending) parts.push(h('span', { class: 'badge' }, 'Unpublished changes'));
    parts.push(h('a', { href: '/resume.pdf' }, 'Download the live version'));
  }
  els.publishState.replaceChildren(...parts);
}

// ---- Saving ------------------------------------------------------------------

function backup() {
  try {
    localStorage.setItem(BACKUP_KEY, JSON.stringify({ doc: state.doc, at: new Date().toISOString() }));
  } catch {}
}

function clearBackup() {
  try {
    localStorage.removeItem(BACKUP_KEY);
  } catch {}
}

function readBackup() {
  try {
    return JSON.parse(localStorage.getItem(BACKUP_KEY) || 'null');
  } catch {
    return null;
  }
}

function changed() {
  state.dirty = true;
  backup();
  if (!state.sessionLost) setStatus('Unsaved changes');
  clearTimeout(state.saveTimer);
  state.saveTimer = setTimeout(save, SAVE_DELAY_MS);
  updatePublishState();
}

function save() {
  if (state.sessionLost) return Promise.resolve();
  if (state.saving) {
    state.saveAgain = true;
    return state.savePromise;
  }
  if (!state.dirty) return Promise.resolve();
  state.savePromise = doSave();
  return state.savePromise;
}

async function doSave() {
  state.saving = true;
  state.dirty = false;
  setStatus('Saving…');
  try {
    const res = await api('/api/resume', { method: 'PUT', body: { data: state.doc } });
    state.savedAt = (await res.json()).savedAt;
    if (!state.dirty) {
      clearBackup();
      setStatus('All changes saved');
    }
  } catch (e) {
    state.dirty = true;
    if (e.status === 401) sessionExpired();
    else {
      setStatus("Couldn't save. Retrying…", true);
      clearTimeout(state.saveTimer);
      state.saveTimer = setTimeout(save, RETRY_DELAY_MS);
    }
  } finally {
    state.saving = false;
    if (state.saveAgain) {
      state.saveAgain = false;
      save();
    }
  }
}

async function flush() {
  clearTimeout(state.saveTimer);
  while (state.saving) await state.savePromise;
  if (state.dirty) await save();
  while (state.saving) await state.savePromise;
  return !state.dirty;
}

window.addEventListener('beforeunload', (e) => {
  if (state.dirty || state.saving) {
    e.preventDefault();
    e.returnValue = '';
  }
});

window.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's' && state.doc) {
    e.preventDefault();
    flush().then((ok) => toast(ok ? 'Saved.' : "Couldn't save yet. Your changes are kept in this browser."));
  }
});

document.fonts?.ready.then(() => state.doc && autosizeAll());

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => state.doc && autosizeAll(), 150);
});

// ---- Actions -----------------------------------------------------------------

els.download.addEventListener('click', async () => {
  const label = els.download.textContent;
  els.download.disabled = true;
  els.download.textContent = 'Preparing…';
  try {
    const res = await api('/api/resume/pdf', { method: 'POST', body: { data: state.doc } });
    const blob = await res.blob();
    const name = /filename="([^"]+)"/.exec(res.headers.get('content-disposition') || '')?.[1] || 'Resume.pdf';
    const url = URL.createObjectURL(blob);
    const a = h('a', { href: url, download: name });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  } catch (e) {
    if (e.status === 401) sessionExpired();
    else toast(`Couldn't make the PDF. ${e.message}`);
  } finally {
    els.download.disabled = false;
    els.download.textContent = label;
  }
});

els.publish.addEventListener('click', async () => {
  els.publish.disabled = true;
  els.publish.textContent = 'Publishing…';
  try {
    clearTimeout(state.saveTimer);
    while (state.saving) await state.savePromise;
    const sent = structuredClone(state.doc);
    const res = await api('/api/resume/publish', { method: 'POST', body: { data: sent } });
    const out = await res.json();
    state.published = out.published;
    state.publishedAt = out.publishedAt;
    state.savedAt = out.savedAt;
    if (canon(sent) === canon(state.doc)) {
      state.dirty = false;
      clearBackup();
      setStatus('All changes saved');
    }
    toast('Published. Your main page now downloads this version.');
  } catch (e) {
    if (e.status === 401) sessionExpired();
    else toast(`Couldn't publish. ${e.message}`);
  } finally {
    updatePublishState();
  }
});

els.signout.addEventListener('click', async () => {
  await flush().catch(() => {});
  try {
    await api('/api/session', { method: 'DELETE' });
  } catch {}
  try {
    window.google?.accounts?.id?.disableAutoSelect();
  } catch {}
  clearBackup();
  Object.assign(state, { doc: null, published: null, publishedAt: null, savedAt: null, dirty: false, email: null });
  els.doc.replaceChildren();
  showSignin(state.session || { configured: true });
});

document.querySelectorAll('[data-add]').forEach((btn) =>
  btn.addEventListener('click', () => {
    const sec = newSection(btn.dataset.add);
    state.doc.sections.push(sec);
    rerender(`${sec.id}:title`);
  }),
);

// ---- Sign-in -----------------------------------------------------------------

let googleReady;
function loadGoogle() {
  googleReady ||= new Promise((resolve, reject) => {
    const started = Date.now();
    (function check() {
      if (window.google?.accounts?.id) return resolve(window.google);
      if (Date.now() - started > 10000) return reject(new Error('Google sign-in did not load'));
      setTimeout(check, 100);
    })();
  });
  return googleReady;
}

let googleInitialized = false;
async function showSignin(session, message) {
  els.loading.hidden = true;
  els.actions.hidden = true;
  els.signout.hidden = true;
  els.workspace.hidden = true;
  els.signin.hidden = false;
  els.signinError.hidden = !message;
  els.signinError.textContent = message || '';

  if (!session.configured) {
    els.signinNote.textContent = "Google sign-in isn't set up yet. Add a GOOGLE_CLIENT_ID environment variable in Netlify and redeploy. The repo's README walks through it.";
    els.googleButton.hidden = true;
    return;
  }
  els.signinNote.textContent = state.sessionLost
    ? 'Your session ended. Sign in again to keep saving; your edits are still here.'
    : 'Sign in with the Google account that owns this site to edit your résumé.';
  els.googleButton.hidden = false;
  try {
    const google = await loadGoogle();
    if (!googleInitialized) {
      google.accounts.id.initialize({ client_id: session.clientId, callback: onCredential, ux_mode: 'popup', context: 'signin', itp_support: true });
      googleInitialized = true;
    }
    els.googleButton.replaceChildren();
    google.accounts.id.renderButton(els.googleButton, { type: 'standard', theme: isDark() ? 'filled_black' : 'outline', size: 'large', shape: 'pill', text: 'signin_with', logo_alignment: 'left' });
  } catch {
    els.signinError.textContent = "Couldn't load Google sign-in. Check your connection, or allow accounts.google.com if you use a content blocker.";
    els.signinError.hidden = false;
  }
}

async function onCredential(response) {
  els.signinError.hidden = true;
  try {
    const res = await api('/api/session', { method: 'POST', body: { credential: response.credential } });
    const { email } = await res.json();
    openEditor(email);
  } catch (e) {
    els.signinError.textContent = e.message;
    els.signinError.hidden = false;
  }
}

function sessionExpired() {
  state.sessionLost = true;
  clearTimeout(state.saveTimer);
  setStatus('Signed out. Sign in to keep saving.', true);
  showSignin(state.session || { configured: true });
}

// ---- Start -------------------------------------------------------------------

async function openEditor(email) {
  state.email = email;
  els.signout.title = `Signed in as ${email}`;

  if (state.sessionLost && state.doc) {
    state.sessionLost = false;
    els.signin.hidden = true;
    els.actions.hidden = false;
    els.signout.hidden = false;
    els.workspace.hidden = false;
    render(null);
    await save();
    return;
  }

  els.signin.hidden = true;
  els.loading.hidden = false;
  els.loading.textContent = 'Loading your résumé…';
  let data;
  try {
    data = await (await api('/api/resume')).json();
  } catch (e) {
    if (e.status === 401) return showSignin(state.session || { configured: true });
    els.loading.textContent = `Couldn't load your résumé. ${e.message} Refresh to try again.`;
    return;
  }
  state.doc = data.draft;
  state.published = data.published;
  state.publishedAt = data.publishedAt;
  state.savedAt = data.savedAt;
  state.dirty = false;

  const saved = readBackup();
  const restore = saved?.doc && (!data.savedAt || saved.at > data.savedAt) && canon(saved.doc) !== canon(data.draft);

  els.loading.hidden = true;
  els.actions.hidden = false;
  els.signout.hidden = false;
  els.workspace.hidden = false;
  if (restore) {
    state.doc = saved.doc;
    render(null);
    changed();
    toast("Restored edits from this browser that hadn't been saved yet.");
  } else {
    clearBackup();
    render(null);
    setStatus(data.isSeed ? 'Started from your current résumé' : 'All changes saved');
  }
}

async function boot() {
  try {
    state.session = await (await fetch('/api/session', { credentials: 'same-origin' })).json();
  } catch {
    els.loading.textContent = "Couldn't reach the server. Refresh to try again.";
    return;
  }
  if (state.session.signedIn) openEditor(state.session.email);
  else showSignin(state.session);
}

boot();
