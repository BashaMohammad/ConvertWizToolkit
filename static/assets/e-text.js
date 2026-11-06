/* Text tools engine */
(function () {
  const { el, fmt, copy } = CW;
  const STOP = new Set('a an the and or but if of to in on at for with by from as is are was were be been it its this that these those i you he she we they me my your our their not no so do does did have has had will would can could should may might than then there here what which who whom how when where why all any some just also into about over more most very s t'.split(' '));
  const ta = (ph, v) => el('textarea', { placeholder: ph, spellcheck: 'false' }, v || '');
  const words = s => (s.match(/\S+/g) || []);
  const T = {
    'word-counter'(box) {
      const t = ta('Type or paste your text here…'), st = el('div', { class: 'stats' }), kw = el('div');
      const run = () => { const v = t.value, w = words(v), wc = w.length;
        const S = [['Words', wc], ['Characters', [...v].length], ['Without spaces', [...v.replace(/\s/g, '')].length], ['Sentences', (v.match(/[^.!?।]+[.!?।]+/g) || (v.trim() ? [1] : [])).length], ['Paragraphs', v.split(/\n\s*\n/).filter(p => p.trim()).length], ['Reading time', wc ? Math.max(1, Math.round(wc / 200)) + ' min' : '0 min']];
        st.replaceChildren(...S.map(([a, b]) => el('div', { class: 'stat' }, el('b', {}, typeof b === 'number' ? fmt(b) : b), el('small', {}, a))));
        const f = {}; w.forEach(x => { x = x.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''); if (x.length > 2 && !STOP.has(x)) f[x] = (f[x] || 0) + 1; });
        const top = Object.entries(f).sort((a, b) => b[1] - a[1]).slice(0, 10);
        kw.replaceChildren(...(top.length ? [el('h3', {}, 'Top keywords'), el('table', { class: 'kv' }, el('tbody', {}, top.map(([k, c]) => el('tr', {}, el('td', {}, k), el('td', {}, c + ' × (' + fmt(c / wc * 100, 1) + '%)')))))] : [])); };
      t.oninput = run; box.append(t, st, kw); run();
    },
    'case-converter'(box) {
      const t = ta('Paste your text here…');
      const w = s => s.replace(/([a-z])([A-Z])/g, '$1 $2').split(/[^\p{L}\p{N}]+/u).filter(Boolean);
      const F = [['UPPERCASE', s => s.toUpperCase()], ['lowercase', s => s.toLowerCase()], ['Title Case', s => s.toLowerCase().replace(/(^|[\s\-(“"'])(\p{L})/gu, (m, a, b) => a + b.toUpperCase())], ['Sentence case', s => s.toLowerCase().replace(/(^\s*|[.!?।]\s+)(\p{L})/gu, (m, a, b) => a + b.toUpperCase())],
        ['camelCase', s => w(s).map((x, i) => i ? x[0].toUpperCase() + x.slice(1).toLowerCase() : x.toLowerCase()).join('')], ['snake_case', s => w(s).map(x => x.toLowerCase()).join('_')], ['kebab-case', s => w(s).map(x => x.toLowerCase()).join('-')], ['aLtErNaTiNg', s => [...s].map((c, i) => i % 2 ? c.toUpperCase() : c.toLowerCase()).join('')]];
      box.append(t, el('div', { class: 'btns' }, F.map(([n, f]) => el('button', { class: 'btn sec sm', onclick: () => { t.value = f(t.value); CW.markUsed(); } }, n)), el('button', { class: 'btn sm', onclick: () => copy(t.value) }, '📋 Copy')));
    },
    'text-to-speech'(box) {
      if (!('speechSynthesis' in window)) { box.append(el('p', { class: 'bad' }, 'Your browser does not support text to speech. Try Chrome, Edge or Safari.')); return; }
      const t = ta('Type or paste the text to read aloud…', 'Welcome to ConvertWiz. Paste any text here and press Speak to hear it read aloud.'), vs = el('select', {}), rate = el('input', { type: 'range', min: .5, max: 2, step: .1, value: 1 }), pitch = el('input', { type: 'range', min: .5, max: 2, step: .1, value: 1 });
      const load = () => { const v = speechSynthesis.getVoices().sort((a, b) => (b.lang.includes('IN') - a.lang.includes('IN')) || a.lang.localeCompare(b.lang)); vs.replaceChildren(...v.map((x, i) => el('option', { value: x.name }, x.name + ' (' + x.lang + ')'))); };
      load(); speechSynthesis.onvoiceschanged = load;
      const speak = () => { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t.value); const v = speechSynthesis.getVoices().find(x => x.name === vs.value); if (v) { u.voice = v; u.lang = v.lang; } u.rate = +rate.value; u.pitch = +pitch.value; speechSynthesis.speak(u); CW.markUsed(); };
      box.append(t, el('div', { class: 'row', style: 'margin-top:12px' }, el('div', {}, el('label', {}, 'Voice'), vs), el('div', {}, el('label', {}, 'Speed'), rate), el('div', {}, el('label', {}, 'Pitch'), pitch)),
        el('div', { class: 'btns' }, el('button', { class: 'btn', onclick: speak }, '▶ Speak'), el('button', { class: 'btn sec', onclick: () => speechSynthesis.paused ? speechSynthesis.resume() : speechSynthesis.pause() }, '⏯ Pause / Resume'), el('button', { class: 'btn sec', onclick: () => speechSynthesis.cancel() }, '⏹ Stop')));
    },
    'remove-duplicate-lines'(box) {
      const a = ta('Paste your list – one item per line…'), b = ta('Result appears here'), info = el('p', { class: 'muted small' });
      const cb = (l, on) => { const c = el('input', { type: 'checkbox', checked: on }); c.onchange = run; return [c, el('label', { style: 'display:inline;font-weight:500;margin-right:14px' }, c, l)]; };
      const [ci, l1] = cb('Ignore case', false), [tr, l2] = cb('Trim spaces', true), [em, l3] = cb('Remove empty lines', true), [so, l4] = cb('Sort A→Z', false);
      function run() { const seen = new Set(); let L = a.value.split(/\r?\n/), n = L.length; if (tr.checked) L = L.map(x => x.trim()); if (em.checked) L = L.filter(x => x !== '');
        L = L.filter(x => { const k = ci.checked ? x.toLowerCase() : x; if (seen.has(k)) return false; seen.add(k); return true; }); if (so.checked) L.sort((x, y) => x.localeCompare(y));
        b.value = L.join('\n'); info.textContent = a.value ? n + ' lines → ' + L.length + ' unique lines (' + (n - L.length) + ' removed)' : ''; }
      a.oninput = run; box.append(el('div', { style: 'margin-bottom:10px' }, l1, l2, l3, l4), el('div', { class: 'two' }, a, b), info, el('div', { class: 'btns' }, el('button', { class: 'btn', onclick: () => copy(b.value) }, '📋 Copy result')));
    },
    'ip-address-extractor'(box) {
      const a = ta('Paste logs or any text containing IP addresses…'), out = el('div');
      const v4 = /\b(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\b/g, v6 = /\b(?:[0-9a-f]{1,4}:){2,7}[0-9a-f]{1,4}\b|\b(?:[0-9a-f]{1,4}:){1,7}:(?:[0-9a-f]{1,4}(?::[0-9a-f]{1,4})*)?/gi;
      a.oninput = () => { const s = a.value, A = [...new Set(s.match(v4) || [])], B = [...new Set((s.match(v6) || []).filter(x => x.includes(':') && x.length > 3))], all = [...A, ...B];
        out.replaceChildren(el('div', { class: 'stats' }, el('div', { class: 'stat' }, el('b', {}, A.length), el('small', {}, 'IPv4')), el('div', { class: 'stat' }, el('b', {}, B.length), el('small', {}, 'IPv6'))), all.length ? el('textarea', { readonly: true, style: 'margin-top:12px;min-height:120px' }, all.join('\n')) : '', all.length ? el('div', { class: 'btns' }, el('button', { class: 'btn', onclick: () => copy(all.join('\n')) }, '📋 Copy ' + all.length + ' IPs')) : ''); };
      box.append(a, out);
    },
  };
  CW.tools.text = (box, slug) => T[slug](box);
})();
