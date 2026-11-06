/* ConvertWiz app shell: theme, search (Ctrl+K), favorites/recent, helpers, PWA */
(function () {
  const W = window, D = document;
  const store = {
    get(k, d) { try { const v = localStorage.getItem('cw_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('cw_' + k, JSON.stringify(v)); } catch (e) {} },
  };
  const $ = (s, r) => (r || D).querySelector(s);
  function el(tag, attrs, ...kids) {
    const e = D.createElement(tag);
    for (const k in attrs || {}) {
      const v = attrs[k];
      if (k === 'class') e.className = v; else if (k === 'html') e.innerHTML = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else if (v !== false && v != null) e.setAttribute(k, v === true ? '' : v);
    }
    kids.flat().forEach(c => c != null && e.append(c.nodeType ? c : String(c)));
    return e;
  }
  const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });
  function fmt(n, d) { if (!isFinite(n)) return '—'; return d != null ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: d }).format(n) : inr.format(n); }
  function rs(n) { return '₹' + fmt(Math.round(n)); }
  function size(b) { return b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB'; }
  function download(blob, name) {
    const a = el('a', { href: URL.createObjectURL(blob), download: name });
    D.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    track('download', { tool: tool() });
  }
  const loaded = {};
  function loadScript(src) {
    return loaded[src] || (loaded[src] = new Promise((ok, no) => { const s = el('script', { src, async: true }); s.onload = ok; s.onerror = () => no(new Error('Could not load ' + src)); D.head.append(s); }));
  }
  let tt;
  function toast(msg) { let t = $('.toast'); if (!t) { t = el('div', { class: 'toast' }); D.body.append(t); } t.textContent = msg; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 1800); }
  async function copy(text) { try { await navigator.clipboard.writeText(text); toast('Copied ✓'); } catch (e) { toast('Copy failed'); } }
  function tool() { return D.body.dataset.tool || ''; }
  let used = false;
  function track(name, params) { try { W.gtag && W.gtag('event', name, params || {}); } catch (e) {} }
  function markUsed() { if (!used && tool()) { used = true; track('tool_use', { tool: tool() }); } }
  // generic file drop zone
  function drop(opts) {
    const inp = el('input', { type: 'file', accept: opts.accept || '*/*', multiple: !!opts.multiple, hidden: true });
    const z = el('div', { class: 'drop', tabindex: 0, role: 'button' }, el('div', { style: 'font-size:34px' }, opts.icon || '📂'), el('b', {}, opts.label || 'Drop files here or tap to choose'), el('small', {}, opts.hint || 'Files stay on your device'), inp);
    const go = files => { files = [...files]; if (files.length) { markUsed(); opts.onFiles(opts.multiple ? files : [files[0]]); } inp.value = ''; };
    z.onclick = () => inp.click(); z.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inp.click(); } };
    inp.onchange = () => go(inp.files);
    z.ondragover = e => { e.preventDefault(); z.classList.add('on'); };
    z.ondragleave = () => z.classList.remove('on');
    z.ondrop = e => { e.preventDefault(); z.classList.remove('on'); go(e.dataTransfer.files); };
    return z;
  }
  W.CW = { el, $, fmt, rs, size, download, loadScript, toast, copy, store, drop, track, markUsed, tools: {} };

  // theme
  const root = D.documentElement;
  const btnT = $('#themeBtn');
  const setTheme = t => { root.dataset.theme = t; store.set('theme', t); if (btnT) btnT.textContent = t === 'dark' ? '☀️' : '🌙'; };
  setTheme(root.dataset.theme || 'light');
  btnT && (btnT.onclick = () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

  // search index
  let IDX = null;
  async function index() { if (!IDX) { const r = await fetch('/assets/index.json'); IDX = await r.json(); } return IDX; }
  function match(q, list) {
    q = q.trim().toLowerCase(); if (!q) return list.filter(t => t.p).slice(0, 12);
    const w = q.split(/\s+/);
    return list.map(t => { const h = (t.n + ' ' + t.k + ' ' + t.c).toLowerCase(); let sc = 0; for (const x of w) { if (!h.includes(x)) return null; sc += t.n.toLowerCase().includes(x) ? 2 : 1; } return [sc + (t.p ? .5 : 0), t]; })
      .filter(Boolean).sort((a, b) => b[0] - a[0]).map(x => x[1]).slice(0, 20);
  }
  const dlg = $('#sd');
  async function openSearch(q) {
    if (!dlg) return; const list = await index();
    const inp = $('input', dlg), ul = $('ul', dlg); let sel = 0, res = [];
    const draw = () => { res = match(inp.value, list); sel = Math.min(sel, res.length - 1); ul.replaceChildren(...res.map((t, i) => el('li', {}, el('a', { href: '/' + t.s, class: i === sel ? 'on' : '' }, t.e + ' ', t.n, el('small', {}, t.c))))); if (!res.length) ul.append(el('li', { class: 'muted', style: 'padding:12px' }, 'No tools found. Try "pdf", "gst" or "resize".')); };
    inp.value = q || ''; inp.oninput = () => { sel = 0; draw(); };
    inp.onkeydown = e => { if (e.key === 'ArrowDown') { sel = Math.min(sel + 1, res.length - 1); draw(); e.preventDefault(); } else if (e.key === 'ArrowUp') { sel = Math.max(sel - 1, 0); draw(); e.preventDefault(); } else if (e.key === 'Enter' && res[sel]) { location.href = '/' + res[sel].s; } };
    draw(); dlg.showModal(); inp.focus();
    dlg.onclick = e => { if (e.target === dlg) dlg.close(); };
  }
  $('#searchBtn') && ($('#searchBtn').onclick = () => openSearch());
  D.addEventListener('keydown', e => { if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(D.activeElement.tagName))) { e.preventDefault(); openSearch(); } });

  // home: live filter + favourites/recent
  const q = $('#q');
  if (q) {
    q.addEventListener('input', () => { const v = q.value.trim().toLowerCase(); D.querySelectorAll('[data-k]').forEach(c => c.hidden = v && !c.dataset.k.includes(v)); D.querySelectorAll('section[data-cat]').forEach(s => s.hidden = v && !s.querySelector('[data-k]:not([hidden])')); });
    q.addEventListener('keydown', e => { if (e.key === 'Enter') { const f = $('[data-k]:not([hidden])'); f && (location.href = f.getAttribute('href')); } });
  }
  async function personal() {
    const box = $('#mine'); if (!box) return;
    const fav = store.get('fav', []), rec = store.get('recent', []);
    if (!fav.length && !rec.length) return;
    const list = await index(), by = Object.fromEntries(list.map(t => [t.s, t]));
    const card = t => el('a', { class: 'tc', href: '/' + t.s }, el('span', { class: 'em' }, t.e), el('span', {}, el('b', {}, t.n)));
    const sec = (title, arr) => arr.length ? [el('h2', {}, title), el('div', { class: 'grid' }, arr.map(s => by[s]).filter(Boolean).map(card))] : [];
    box.append(...sec('⭐ Your favourites', fav), ...sec('🕘 Recently used', rec.filter(s => !fav.includes(s)).slice(0, 8)));
  }
  personal();

  // tool page: recent + favourite star
  const slug = tool();
  if (slug) {
    store.set('recent', [slug, ...store.get('recent', []).filter(s => s !== slug)].slice(0, 12));
    const star = $('#favBtn');
    if (star) {
      const upd = () => { const on = store.get('fav', []).includes(slug); star.classList.toggle('on', on); star.textContent = on ? '★' : '☆'; star.title = on ? 'Remove from favourites' : 'Add to favourites'; };
      star.onclick = () => { const f = store.get('fav', []); store.set('fav', f.includes(slug) ? f.filter(s => s !== slug) : [slug, ...f]); upd(); toast(f.includes(slug) ? 'Removed from favourites' : 'Added to favourites ⭐'); };
      upd();
    }
    D.addEventListener('input', markUsed, { once: true });
  }
  // start the tool once its engine has loaded
  W.addEventListener('DOMContentLoaded', () => {
    const box = $('#tool'); if (!box) return;
    const fn = CW.tools[box.dataset.engine];
    if (fn) { box.replaceChildren(); try { fn(box, box.dataset.tool); } catch (e) { box.textContent = 'Sorry, this tool failed to load. Please refresh.'; console.error(e); } }
  });
  // PWA
  if ('serviceWorker' in navigator && location.protocol === 'https:') W.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
})();
