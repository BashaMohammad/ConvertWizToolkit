/* Image engine: everything runs on <canvas> in the browser */
(function () {
  const { el, fmt, size, download } = CW;
  const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
  const base = n => n.replace(/\.[^.]+$/, '');
  const load = f => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error('Unsupported image')); i.src = URL.createObjectURL(f); });
  const enc = (cv, type, q) => new Promise(ok => cv.toBlob(ok, type, q));
  function draw(img, w, h, bg, crop) {
    const cv = el('canvas'); cv.width = Math.max(1, Math.round(w)); cv.height = Math.max(1, Math.round(h)); const x = cv.getContext('2d');
    if (bg) { x.fillStyle = bg; x.fillRect(0, 0, cv.width, cv.height); }
    x.imageSmoothingQuality = 'high';
    if (crop) { const s = Math.max(cv.width / img.naturalWidth, cv.height / img.naturalHeight), sw = cv.width / s, sh = cv.height / s; x.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, 0, 0, cv.width, cv.height); }
    else x.drawImage(img, 0, 0, cv.width, cv.height);
    return cv;
  }
  // smallest blob that fits under maxBytes (quality search, then downscale)
  async function fit(img, w, h, type, maxB, bg, crop) {
    let scale = 1, best = null;
    for (let round = 0; round < 12; round++) {
      const cv = draw(img, w * scale, h * scale, bg, crop); let lo = .3, hi = .95, ok = null;
      const top = await enc(cv, type, hi); if (top.size <= maxB) return { blob: top, q: hi, w: cv.width, h: cv.height };
      for (let i = 0; i < 7; i++) { const m = (lo + hi) / 2, b = await enc(cv, type, m); if (b.size <= maxB) { ok = { blob: b, q: m, w: cv.width, h: cv.height }; lo = m; } else hi = m; }
      if (ok) return ok;
      best = { blob: await enc(cv, type, .3), q: .3, w: cv.width, h: cv.height }; scale *= .85; if (cv.width < 40) break;
    }
    return best;
  }
  // Pad a JPEG up to minB bytes with COM (comment) segments: image pixels are untouched and the file stays valid.
  async function padJpeg(blob, minB) {
    if (blob.type !== 'image/jpeg' || blob.size >= minB) return blob;
    const u = new Uint8Array(await blob.arrayBuffer()), parts = [u.slice(0, 2)]; let need = minB - u.length;
    while (need > 0) { const n = Math.min(65533, Math.max(1, need - 4)), c = new Uint8Array(n + 4); c[0] = 0xFF; c[1] = 0xFE; c[2] = (n + 2) >> 8; c[3] = (n + 2) & 255; c.fill(0x20, 4); parts.push(c); need -= n + 4; }
    parts.push(u.slice(2)); return new Blob(parts, { type: 'image/jpeg' });
  }
  // KB limits: max uses 1 KB = 1000 bytes and min uses 1 KB = 1024 bytes, so the file passes portals that count either way.
  const KBMAX = kb => kb * 1000, KBMIN = kb => kb * 1024;
  const seg = (items, val, on) => { const s = el('div', { class: 'seg' }); const b = items.map(([v, l]) => el('button', { type: 'button', class: v === val ? 'on' : '', onclick: () => { b.forEach(x => x.classList.toggle('on', x === bb[v])); on(v); } }, l)); const bb = Object.fromEntries(items.map(([v], i) => [v, b[i]])); s.append(...b); return s; };
  const fld = (label, inp, hint) => el('div', { class: 'fld' }, el('label', {}, label), inp, hint ? el('div', { class: 'hint' }, hint) : '');

  const PRESETS = [
    ['photo', 'Exam photo – 200×230 px, 20–50 KB', 200, 230, 20, 50],
    ['sign', 'Signature – 140×60 px, 10–20 KB', 140, 60, 10, 20],
    ['upsc', 'Photo – 350×350 px, 20–300 KB', 350, 350, 20, 300],
    ['passport', 'Indian passport (Passport Seva) – 630×810 px, up to 250 KB', 630, 810, 10, 250],
    ['visa', 'US visa photo – 600×600 px, up to 240 KB', 600, 600, 10, 240],
    ['custom', 'Custom size', 300, 400, 10, 100],
  ];

  // Exam pages inject their official presets as window.CW_EXAM = { items: [...] }
  const EXAM = window.CW_EXAM && window.CW_EXAM.items ? window.CW_EXAM.items.filter(i => !i.live) : null;
  if (EXAM) PRESETS.splice(0, PRESETS.length, ...EXAM.map(i => [i.id, i.n + ' – ' + (i.keep ? 'up to ' : '') + i.w + '×' + i.h + ' px, ' + i.min + '–' + i.max + ' KB', i.w, i.h, i.min, i.max, !!i.keep, i.dpi || 0]), ['custom', 'Custom size', 300, 400, 10, 100]);
  CW.tools.image = function (box, slug) {
    if (slug === 'instagram-dp-resizer') return dp(box);
    if (slug === 'dpi-checker') return dpi(box);
    if (slug === 'passport-photo-maker') return passport(box);
    if (slug === 'aadhaar-pan-print') return idprint(box);
    const o = { type: { 'jpg-to-png': 'image/png', 'png-to-jpg': 'image/jpeg', 'webp-converter': 'image/webp', 'image-compressor': 'image/jpeg', 'exam-photo-resizer': 'image/jpeg' }[slug] || 'same', q: .9, kb: 0, w: 1200, h: 0, pct: 50, mode: 'px', lock: true, ex: PRESETS[0] };
    const opts = el('div', { class: 'row', style: 'margin-bottom:14px' });
    const fmtSel = (list) => fld('Output format', seg(list, o.type, v => { o.type = v; go(); }));
    const qual = () => { const r = el('input', { type: 'range', min: 10, max: 100, value: o.q * 100 }), l = el('b', {}, Math.round(o.q * 100) + '%'); r.oninput = () => { l.textContent = r.value + '%'; o.q = r.value / 100; }; r.onchange = go; return fld('Quality: ', el('div', {}, l, r)); };
    const num = (k, label, suf) => { const i = el('input', { type: 'number', value: o[k] || '', min: 0, placeholder: k === 'kb' ? 'optional' : 'auto' }); let t; i.onchange = () => { clearTimeout(t); o[k] = +i.value || 0; if (k === 'w' && o.lock) o.h = 0; if (k === 'h' && o.lock) o.w = 0; go(); }; i.oninput = () => { clearTimeout(t); t = setTimeout(i.onchange, 700); }; return fld(label, el('div', { class: 'inp-suf' }, i, el('span', {}, suf))); };
    if (slug === 'png-to-jpg') opts.append(qual());
    if (slug === 'webp-converter') opts.append(fmtSel([['image/webp', 'WebP'], ['image/jpeg', 'JPG'], ['image/png', 'PNG']]), qual());
    if (slug === 'image-compressor') opts.append(fmtSel([['image/jpeg', 'JPG'], ['image/webp', 'WebP']]), qual(), num('kb', 'Target max size', 'KB'));
    if (slug === 'image-resizer') {
      const pxBox = el('div', { class: 'row' }, num('w', 'Width', 'px'), num('h', 'Height', 'px')), pcBox = el('div', { hidden: true }, num('pct', 'Scale', '%'));
      const lock = el('input', { type: 'checkbox', checked: true }); lock.onchange = () => { o.lock = lock.checked; go(); };
      opts.append(fld('Resize by', seg([['px', 'Pixels'], ['pct', 'Percent']], 'px', v => { o.mode = v; pxBox.hidden = v !== 'px'; pcBox.hidden = v === 'px'; go(); })), pxBox, pcBox, el('label', { style: 'align-self:end' }, lock, 'Lock aspect ratio'), fmtSel([['same', 'Same'], ['image/jpeg', 'JPG'], ['image/png', 'PNG'], ['image/webp', 'WebP']]));
    }
    if (slug === 'exam-photo-resizer') {
      const w = el('input', { type: 'number' }), h = el('input', { type: 'number' }), mn = el('input', { type: 'number' }), mx = el('input', { type: 'number' });
      const setP = p => { o.ex = p.slice(); [w.value, h.value, mn.value, mx.value] = p.slice(2, 6); };
      const ps = el('select', {}, PRESETS.map(p => el('option', { value: p[0] }, p[1]))); ps.onchange = () => { setP(PRESETS.find(p => p[0] === ps.value)); go(); };
      [w, h, mn, mx].forEach((i, k) => { let t; i.onchange = () => { clearTimeout(t); if (o.ex[2 + k] === +i.value) return; o.ex[2 + k] = +i.value; ps.value = 'custom'; go(); }; i.oninput = () => { clearTimeout(t); t = setTimeout(i.onchange, 700); }; });
      setP(PRESETS[0]);
      opts.append(el('div', { style: 'grid-column:1/-1' }, fld(EXAM ? 'Document' : 'Preset', ps, EXAM ? 'Values from the official notification shown below. Choose the document you are uploading.' : 'Presets are common requirements. Always match the exact values in your exam notification.')), fld('Width (px)', w), fld('Height (px)', h), fld('Min size (KB)', mn), fld('Max size (KB)', mx));
    }
    const list = el('div', { class: 'files' }), all = el('div', { class: 'btns' });
    let files = [], outs = [], seq = 0, lastKey = '';
    box.append(opts, CW.drop({ accept: 'image/*', multiple: true, icon: '🖼️', label: 'Drop images here or tap to choose', hint: 'JPG, PNG, WebP • batch supported • files never leave your device', onFiles: f => { files = files.concat(f); go(); } }), list, all);
    async function go() {
      if (!files.length) return;
      const key = JSON.stringify(o) + '|' + files.map(f => f.name + f.size).join(','); if (key === lastKey) return; lastKey = key;
      const run = ++seq; outs = []; list.replaceChildren(); all.replaceChildren();
      for (const f of files) {
        if (run !== seq) return;
        const row = el('div', { class: 'fi' }, el('div', { class: 'nm' }, el('b', {}, f.name), el('small', {}, 'Processing…'))); list.append(row);
        try {
          const img = await load(f); let W = img.naturalWidth, H = img.naturalHeight, type = o.type === 'same' ? (EXT[f.type] ? f.type : 'image/png') : o.type, r, crop = false, bg = type === 'image/jpeg' ? '#fff' : null;
          if (slug === 'image-resizer') { if (o.mode === 'pct') { W *= o.pct / 100; H *= o.pct / 100; } else if (o.w && o.h && !o.lock) { W = o.w; H = o.h; } else if (o.w) { H = H * o.w / W; W = o.w; } else if (o.h) { W = W * o.h / H; H = o.h; } }
          if (slug === 'exam-photo-resizer') { W = o.ex[2]; H = o.ex[3]; crop = !o.ex[6]; if (o.ex[6]) { const s = Math.min(1, W / img.naturalWidth, H / img.naturalHeight); W = img.naturalWidth * s; H = img.naturalHeight * s; } r = await fit(img, W, H, type, KBMAX(o.ex[5]), bg, crop);
            if (r.blob.size < KBMIN(o.ex[4])) { const cv = draw(img, W, H, bg, crop), hq = await enc(cv, type, 1); if (hq.size <= KBMAX(o.ex[5])) r = { blob: hq, q: 1, w: cv.width, h: cv.height }; }
            if (o.ex[7]) r.blob = setDPI(await r.blob.arrayBuffer(), o.ex[7]);
            if (r.blob.size < KBMIN(o.ex[4]) && KBMIN(o.ex[4]) <= KBMAX(o.ex[5])) { r.blob = await padJpeg(r.blob, KBMIN(o.ex[4]) + 512); r.padded = true; } }
          else if (slug === 'image-compressor' && o.kb) r = await fit(img, W, H, type, KBMAX(o.kb), bg);
          else { const cv = draw(img, W, H, bg); r = { blob: await enc(cv, type, o.q), w: cv.width, h: cv.height }; }
          if (run !== seq) return;
          if (slug === 'image-compressor' && r.blob.size >= f.size && EXT[f.type]) { r = { blob: f, w: img.naturalWidth, h: img.naturalHeight, kept: true }; }
          const name = (EXAM && slug === 'exam-photo-resizer' ? o.ex[0] + '-' : '') + base(f.name) + (slug === 'image-resizer' || slug === 'exam-photo-resizer' ? '-' + r.w + 'x' + r.h : '') + '.' + EXT[r.blob.type];
          outs.push([r.blob, name]);
          const diff = (1 - r.blob.size / f.size) * 100, thumb = el('img', { src: URL.createObjectURL(r.blob), alt: '' });
          let msg = size(f.size) + ' → ' + size(r.blob.size) + ' • ' + r.w + '×' + r.h;
          let cls = diff >= 0 ? 'ok' : 'muted';
          if (slug === 'exam-photo-resizer') { const b = r.blob.size; if (b > KBMAX(o.ex[5])) { msg += ' • still above the maximum – try smaller pixel dimensions'; cls = 'bad'; } else if (b < KBMIN(o.ex[4])) { msg += ' • below the minimum KB – use a clearer or larger original'; cls = 'bad'; } else { msg += ' • ✓ within ' + o.ex[4] + '–' + o.ex[5] + ' KB' + (r.padded ? ' (size raised to meet the minimum; image unchanged)' : ''); cls = 'ok'; } }
          else if (r.kept) { msg += ' • already well compressed – original kept'; cls = 'ok'; }
          else if (slug === 'image-compressor' || slug === 'png-to-jpg' || slug === 'webp-converter') msg += ' • ' + (diff >= 0 ? fmt(diff, 0) + '% smaller' : fmt(-diff, 0) + '% larger');
          row.replaceChildren(thumb, el('div', { class: 'nm' }, el('b', {}, name), el('small', { class: cls }, msg)), el('button', { class: 'btn sm', onclick: () => download(r.blob, name) }, '⬇ Download'), CW.canShareFile(r.blob, name) ? el('button', { class: 'btn sm sec', title: 'Share', onclick: () => CW.shareFile(r.blob, name) }, '📤') : '');
        } catch (e) { row.replaceChildren(el('div', { class: 'nm' }, el('b', {}, f.name), el('small', { class: 'bad' }, 'Could not read this image. Most browsers cannot open HEIC photos (the iPhone default), so please save the photo as JPG first.'))); }
      }
      if (run !== seq) return;
      if (outs.length > 1) all.append(el('button', { class: 'btn', onclick: async () => { for (const [b, n] of outs) { download(b, n); await new Promise(r => setTimeout(r, 400)); } } }, '⬇ Download all (' + outs.length + ')'));
      all.append(el('button', { class: 'btn sec', onclick: () => { files = []; outs = []; lastKey = ''; seq++; list.replaceChildren(); all.replaceChildren(); } }, 'Clear'));
    }
  };

  function dp(box) {
    const o = { mode: 'crop', zoom: 1, bg: '#ffffff', fmt: 'image/jpeg' }; let img;
    const cv = el('canvas', { width: 1080, height: 1080 }), prev = el('div', { class: 'circle-prev' }, cv), ctl = el('div', { hidden: true });
    const zoom = el('input', { type: 'range', min: 100, max: 300, value: 100 }); zoom.oninput = () => { o.zoom = zoom.value / 100; render(); };
    const bg = el('input', { type: 'color', value: o.bg, style: 'width:60px;height:38px;border:0;background:none' }); bg.oninput = () => { o.bg = bg.value; render(); };
    function render() { if (!img) return; const x = cv.getContext('2d'), S = 1080, iw = img.naturalWidth, ih = img.naturalHeight; x.fillStyle = o.bg; x.fillRect(0, 0, S, S);
      const s = (o.mode === 'crop' ? Math.max(S / iw, S / ih) : Math.min(S / iw, S / ih)) * o.zoom; x.imageSmoothingQuality = 'high'; x.drawImage(img, (S - iw * s) / 2, (S - ih * s) / 2, iw * s, ih * s); }
    ctl.append(el('div', { class: 'row' }, fld('Mode', seg([['crop', 'Crop to fill'], ['fit', 'Fit (no cropping)']], 'crop', v => { o.mode = v; render(); })), fld('Zoom', zoom), fld('Background', bg), fld('Format', seg([['image/jpeg', 'JPG'], ['image/png', 'PNG']], o.fmt, v => o.fmt = v))),
      el('div', { class: 'btns' }, el('button', { class: 'btn', onclick: async () => download(await enc(cv, o.fmt, .95), 'profile-1080.' + EXT[o.fmt]) }, '⬇ Download 1080×1080')));
    box.append(CW.drop({ accept: 'image/*', icon: '📸', label: 'Choose your photo', onFiles: async f => { img = await load(f[0]); ctl.hidden = false; render(); } }), el('div', { class: 'two', style: 'margin-top:16px;align-items:center' }, el('div', {}, el('p', { class: 'muted small', style: 'text-align:center' }, 'Circle preview'), prev), ctl));
  }

  // ---- shared helpers for print layouts (300 DPI) ----
  const MM = 300 / 25.4, PDFLIB = () => CW.loadScript('/vendor/pdf-lib-1.17.1/pdf-lib.min.js').then(() => window.PDFLib);
  const rng = (min, max, val, on) => { const r = el('input', { type: 'range', min, max, value: val }); r.oninput = () => on(+r.value); return r; };
  // draw img into (x,y,w,h) of ctx, cover-fit with zoom (1..3) and offsets (-1..1), optional rotation (deg)
  function coverDraw(x, img, X, Y, W, H, zoom, ox, oy, rot) {
    const rw = rot % 180 ? img.naturalHeight : img.naturalWidth, rh = rot % 180 ? img.naturalWidth : img.naturalHeight, s = Math.max(W / rw, H / rh) * zoom;
    const dw = rw * s, dh = rh * s, cx = X + W / 2 - (dw - W) / 2 * ox, cy = Y + H / 2 - (dh - H) / 2 * oy;
    x.save(); x.beginPath(); x.rect(X, Y, W, H); x.clip(); x.translate(cx, cy); x.rotate(rot * Math.PI / 180); x.imageSmoothingQuality = 'high';
    const iw = img.naturalWidth * s, ih = img.naturalHeight * s; x.drawImage(img, -iw / 2, -ih / 2, iw, ih); x.restore();
  }
  async function pdfFromCanvas(cv, wmm, hmm, name) {
    const { PDFDocument } = await PDFLIB(), d = await PDFDocument.create(), pg = d.addPage([wmm / 25.4 * 72, hmm / 25.4 * 72]);
    const jpg = await enc(cv, 'image/jpeg', .95), im = await d.embedJpg(new Uint8Array(await jpg.arrayBuffer()));
    pg.drawImage(im, { x: 0, y: 0, width: pg.getWidth(), height: pg.getHeight() }); download(new Blob([await d.save()], { type: 'application/pdf' }), name);
  }
  const dl300 = async (cv, name) => download(setDPI(await (await enc(cv, 'image/jpeg', .95)).arrayBuffer(), 300), name);

  // ---- Passport photo sheet ----
  function passport(box) {
    const SIZES = { in: ['Indian passport / visa – 35 × 45 mm', 35, 45, [630, 810, 250]], us: ['US visa – 2 × 2 in (51 × 51 mm)', 51, 51, [600, 600, 240]], c: ['Custom size', 35, 45, null] };
    const SHEETS = { r4: ['4 × 6 in photo print (4R)', 101.6, 152.4], a4: ['A4 sheet', 210, 297] };
    const o = { sz: 'in', sh: 'r4', zoom: 1, ox: 0, oy: 0, w: 35, h: 45, border: true }; let img;
    const prev = el('canvas', { style: 'width:150px;border:1px solid var(--line);border-radius:6px;background:#fff' }), info = el('p', { class: 'small muted' }), acts = el('div', { class: 'btns' }), ctl = el('div', { hidden: true });
    const sel = (obj, val, on) => { const s = el('select', {}, Object.entries(obj).map(([k, v]) => el('option', { value: k, selected: k === val }, v[0]))); s.onchange = () => on(s.value); return s; };
    const cw = el('input', { type: 'number', value: 35, min: 15, max: 100 }), ch = el('input', { type: 'number', value: 45, min: 15, max: 100 }), cbox = el('div', { class: 'row', hidden: true }, fld('Width (mm)', cw), fld('Height (mm)', ch));
    cw.oninput = ch.oninput = () => { o.w = +cw.value || 35; o.h = +ch.value || 45; draw(); };
    const bd = el('input', { type: 'checkbox', checked: true }); bd.onchange = () => { o.border = bd.checked; draw(); };
    const dims = () => o.sz === 'c' ? [o.w, o.h] : SIZES[o.sz].slice(1, 3);
    function single(W, H) { const c = el('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); coverDraw(x, img, 0, 0, W, H, o.zoom, o.ox, o.oy, 0); return c; }
    function layout() { const [pw, ph] = dims(), [, sw, sh] = SHEETS[o.sh], m = 3, g = 2, fit = (W, H) => [Math.floor((W - 2 * m + g) / (pw + g)), Math.floor((H - 2 * m + g) / (ph + g))];
      const a = fit(sw, sh), b = fit(sh, sw); return a[0] * a[1] >= b[0] * b[1] ? { W: sw, H: sh, c: a[0], r: a[1], pw, ph, m, g } : { W: sh, H: sw, c: b[0], r: b[1], pw, ph, m, g }; }
    function sheet() { const L = layout(), cv = el('canvas'); cv.width = Math.round(L.W * MM); cv.height = Math.round(L.H * MM); const x = cv.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, cv.width, cv.height);
      const one = single(Math.round(L.pw * MM), Math.round(L.ph * MM)), gw = L.c * L.pw + (L.c - 1) * L.g, gh = L.r * L.ph + (L.r - 1) * L.g, x0 = (L.W - gw) / 2, y0 = (L.H - gh) / 2;
      for (let i = 0; i < L.c; i++) for (let j = 0; j < L.r; j++) { const X = (x0 + i * (L.pw + L.g)) * MM, Y = (y0 + j * (L.ph + L.g)) * MM; x.drawImage(one, X, Y, L.pw * MM, L.ph * MM); if (o.border) { x.strokeStyle = '#bbb'; x.lineWidth = 2; x.strokeRect(X, Y, L.pw * MM, L.ph * MM); } }
      return { cv, L, n: L.c * L.r }; }
    function draw() { if (!img) return; const [pw, ph] = dims(); prev.width = 300; prev.height = Math.round(300 * ph / pw); prev.getContext('2d').drawImage(single(prev.width, prev.height), 0, 0); const L = layout(); info.textContent = (L.c * L.r) + ' photos of ' + pw + ' × ' + ph + ' mm on a ' + SHEETS[o.sh][0] + '. Print at 100% (actual size).';
      acts.replaceChildren(el('button', { class: 'btn', onclick: async () => { const S = sheet(); await dl300(S.cv, 'passport-photos-' + o.sh + '.jpg'); } }, '⬇ Sheet (JPG)'), el('button', { class: 'btn sec', onclick: async () => { const S = sheet(); await pdfFromCanvas(S.cv, S.L.W, S.L.H, 'passport-photos-' + o.sh + '.pdf'); } }, '⬇ Sheet (PDF)'),
        SIZES[o.sz][3] ? el('button', { class: 'btn sec', onclick: async () => { const [W, H, kb] = SIZES[o.sz][3], b = await encUnder(single(W, H), kb * 1000); download(b, 'passport-photo-' + W + 'x' + H + '.jpg'); } }, '⬇ Digital copy ' + SIZES[o.sz][3][0] + '×' + SIZES[o.sz][3][1]) : ''); }
    // highest JPEG quality that stays under maxB (pixel size is fixed – portals check exact pixels)
    async function encUnder(cv, maxB) { let lo = .3, hi = .95, best = await enc(cv, 'image/jpeg', lo); const top = await enc(cv, 'image/jpeg', hi); if (top.size <= maxB) return top; for (let i = 0; i < 8; i++) { const m = (lo + hi) / 2, b = await enc(cv, 'image/jpeg', m); if (b.size <= maxB) { best = b; lo = m; } else hi = m; } return best; }
    ctl.append(el('div', { class: 'row' }, fld('Photo size', sel(SIZES, o.sz, v => { o.sz = v; cbox.hidden = v !== 'c'; draw(); })), fld('Print on', sel(SHEETS, o.sh, v => { o.sh = v; draw(); }))), cbox,
      el('div', { class: 'two', style: 'margin-top:12px;align-items:start' }, el('div', { style: 'text-align:center' }, prev), el('div', {}, fld('Zoom', rng(100, 300, 100, v => { o.zoom = v / 100; draw(); })), fld('Move left / right', rng(-100, 100, 0, v => { o.ox = v / 100; draw(); })), fld('Move up / down', rng(-100, 100, 0, v => { o.oy = v / 100; draw(); })), el('label', {}, bd, ' Draw cutting lines'))),
      info, acts, el('p', { class: 'note' }, 'Use a recent photo with a plain white background, both ears visible, no glasses, and your face filling about 80–85% of the frame.'));
    box.append(CW.drop({ accept: 'image/*', icon: '🛂', label: 'Choose your photo', onFiles: async f => { try { img = await load(f[0]); ctl.hidden = false; draw(); } catch (e) { CW.toast('Could not read this image'); } } }), ctl);
  }

  // ---- Aadhaar / PAN print layout ----
  function idprint(box) {
    const side = { f: { img: null, rot: 0, zoom: 1 }, b: { img: null, rot: 0, zoom: 1 } }, o = { lay: 'stack' }, CW_ = 85.6, CH = 54;
    const prev = el('canvas', { style: 'width:100%;max-width:420px;border:1px solid var(--line);border-radius:6px;background:#fff;display:block;margin:auto' }), acts = el('div', { class: 'btns' });
    function card(sd) { const c = el('canvas'); c.width = Math.round(CW_ * MM); c.height = Math.round(CH * MM); const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); if (sd.img) coverDraw(x, sd.img, 0, 0, c.width, c.height, sd.zoom, 0, 0, sd.rot); return c; }
    function page() { const cv = el('canvas'); cv.width = Math.round(210 * MM); cv.height = Math.round(297 * MM); const x = cv.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, cv.width, cv.height);
      const list = [side.f, side.b].filter(s => s.img), gap = 10, tot = o.lay === 'side' ? list.length * CW_ + (list.length - 1) * gap : CW_, y0 = 25;
      list.forEach((sd, i) => { const X = (o.lay === 'side' ? (210 - tot) / 2 + i * (CW_ + gap) : (210 - CW_) / 2) * MM, Y = (o.lay === 'side' ? y0 : y0 + i * (CH + gap)) * MM; x.drawImage(card(sd), X, Y); x.setLineDash([12, 8]); x.strokeStyle = '#999'; x.lineWidth = 2; x.strokeRect(X, Y, CW_ * MM, CH * MM); x.setLineDash([]); });
      return cv; }
    function draw() { if (!side.f.img && !side.b.img) { acts.replaceChildren(); return; } const P = page(); prev.width = 420; prev.height = 594; prev.getContext('2d').drawImage(P, 0, 0, 420, 594);
      acts.replaceChildren(el('button', { class: 'btn', onclick: () => pdfFromCanvas(page(), 210, 297, 'id-card-print-a4.pdf') }, '⬇ A4 PDF'), el('button', { class: 'btn sec', onclick: () => dl300(page(), 'id-card-print-a4.jpg') }, '⬇ A4 JPG')); }
    const sideCtl = (k, label) => { const sd = side[k], st = el('small', { class: 'muted' }, 'No image yet');
      return el('div', { class: 'card', style: 'padding:12px' }, el('b', {}, label), CW.drop({ accept: 'image/*', icon: k === 'f' ? '🪪' : '🔄', label: 'Choose ' + label.toLowerCase(), onFiles: async f => { try { sd.img = await load(f[0]); st.textContent = f[0].name; draw(); } catch (e) { CW.toast('Could not read this image'); } } }), st,
        el('div', { class: 'btns' }, el('button', { class: 'btn sm sec', type: 'button', onclick: () => { sd.rot = (sd.rot + 90) % 360; draw(); } }, '↻ Rotate'), el('button', { class: 'btn sm sec', type: 'button', onclick: () => { sd.img = null; st.textContent = 'No image yet'; draw(); } }, 'Remove')), fld('Zoom', rng(100, 200, 100, v => { sd.zoom = v / 100; draw(); }))); };
    const lay = el('select', {}, [['stack', 'Front above back (A4 portrait)'], ['side', 'Front and back side by side']].map(([v, l]) => el('option', { value: v }, l))); lay.onchange = () => { o.lay = lay.value; draw(); };
    box.append(el('div', { class: 'two' }, sideCtl('f', 'Front side'), sideCtl('b', 'Back side')), el('div', { style: 'max-width:340px;margin:12px 0' }, fld('Layout', lay)), prev, acts,
      el('p', { class: 'note' }, 'Cards are placed at real size (85.6 × 54 mm). Print at 100% / “Actual size”. Images stay on your device. Where the full number is not needed, use UIDAI’s masked Aadhaar.'));
    draw();
  }

  // ---- DPI ----
  function readDPI(b) {
    const u = new Uint8Array(b), dv = new DataView(b);
    if (u[0] === 0x89 && u[1] === 0x50) { let p = 8; while (p < u.length - 12) { const len = dv.getUint32(p), t = String.fromCharCode(...u.slice(p + 4, p + 8)); if (t === 'pHYs') { const x = dv.getUint32(p + 8), unit = u[p + 16]; return unit === 1 ? { dpi: Math.round(x * .0254), src: 'PNG pHYs' } : null; } if (t === 'IDAT') break; p += 12 + len; } return null; }
    if (u[0] !== 0xFF || u[1] !== 0xD8) return null;
    let p = 2, res = null;
    while (p < u.length - 4 && u[p] === 0xFF) { const m = u[p + 1], len = dv.getUint16(p + 2);
      if (m === 0xE0 && String.fromCharCode(...u.slice(p + 4, p + 8)) === 'JFIF') { const un = u[p + 11], x = dv.getUint16(p + 12); if (un === 1) res = res || { dpi: x, src: 'JFIF' }; else if (un === 2) res = res || { dpi: Math.round(x * 2.54), src: 'JFIF' }; }
      if (m === 0xE1 && String.fromCharCode(...u.slice(p + 4, p + 8)) === 'Exif') { const e = exifRes(dv, p + 10); if (e) res = { dpi: e, src: 'EXIF' }; }
      if (m === 0xDA) break; p += 2 + len; }
    return res;
  }
  function exifTags(dv, t) { const le = dv.getUint16(t) === 0x4949, g16 = o => dv.getUint16(o, le), g32 = o => dv.getUint32(o, le), ifd = t + g32(t + 4), n = g16(ifd), out = {};
    for (let i = 0; i < n; i++) { const e = ifd + 2 + i * 12, tag = g16(e); out[tag] = { e, le, val: tag === 0x0128 ? g16(e + 8) : t + g32(e + 8) }; } return out; }
  function exifRes(dv, t) { try { const T = exifTags(dv, t), x = T[0x011A]; if (!x) return null; const le = x.le, r = dv.getUint32(x.val, le) / dv.getUint32(x.val + 4, le), unit = T[0x0128] ? T[0x0128].val : 2; return Math.round(unit === 3 ? r * 2.54 : r); } catch (e) { return null; } }
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return a => { let c = ~0; for (const x of a) c = t[(c ^ x) & 255] ^ (c >>> 8); return ~c >>> 0; }; })();
  function setDPI(b, dpi) {
    const u = new Uint8Array(b), dv = new DataView(b);
    if (u[0] === 0x89) { // PNG: drop old pHYs, insert new after IHDR
      const parts = [u.slice(0, 33)]; let p = 33; while (p < u.length) { const len = dv.getUint32(p), t = String.fromCharCode(...u.slice(p + 4, p + 8)); if (t !== 'pHYs') parts.push(u.slice(p, p + 12 + len)); p += 12 + len; }
      const c = new Uint8Array(21), cd = new DataView(c.buffer), ppm = Math.round(dpi / .0254); cd.setUint32(0, 9); c.set([112, 72, 89, 115], 4); cd.setUint32(8, ppm); cd.setUint32(12, ppm); c[16] = 1; cd.setUint32(17, CRC(c.slice(4, 17)));
      parts.splice(1, 0, c); return new Blob(parts, { type: 'image/png' });
    }
    const out = u.slice(), od = new DataView(out.buffer); let p = 2, jfif = false;
    while (p < out.length - 4 && out[p] === 0xFF) { const m = out[p + 1], len = od.getUint16(p + 2);
      if (m === 0xE0 && String.fromCharCode(...out.slice(p + 4, p + 8)) === 'JFIF') { out[p + 11] = 1; od.setUint16(p + 12, dpi); od.setUint16(p + 14, dpi); jfif = true; }
      if (m === 0xE1 && String.fromCharCode(...out.slice(p + 4, p + 8)) === 'Exif') { try { const T = exifTags(od, p + 10); [0x011A, 0x011B].forEach(k => { if (T[k]) { od.setUint32(T[k].val, dpi, T[k].le); od.setUint32(T[k].val + 4, 1, T[k].le); } }); if (T[0x0128]) od.setUint16(T[0x0128].e + 8, 2, T[0x0128].le); } catch (e) {} }
      if (m === 0xDA) break; p += 2 + len; }
    if (jfif) return new Blob([out], { type: 'image/jpeg' });
    const app0 = new Uint8Array([0xFF, 0xE0, 0, 16, 0x4A, 0x46, 0x49, 0x46, 0, 1, 1, 1, dpi >> 8, dpi & 255, dpi >> 8, dpi & 255, 0, 0]);
    return new Blob([out.slice(0, 2), app0, out.slice(2)], { type: 'image/jpeg' });
  }
  function dpi(box) {
    const res = el('div'); let file, buf, img;
    const sel = el('select', {}, [72, 96, 150, 200, 300, 600].map(v => el('option', { value: v, selected: v === 300 }, v + ' DPI')));
    function show() {
      const cur = readDPI(buf), d = cur ? cur.dpi : null, W = img.naturalWidth, H = img.naturalHeight, at = d || 72, t = +sel.value;
      res.replaceChildren(el('div', { class: 'two', style: 'margin-top:16px' },
        el('div', { class: 'res' }, el('div', { class: 'big' }, el('small', {}, 'Current DPI'), d ? d + ' DPI' : 'Not set'), el('table', { class: 'kv' }, el('tbody', {}, [['File', file.name], ['Pixels', W + ' × ' + H], ['Size', size(file.size)], ['DPI stored in', cur ? cur.src : '— (apps assume 72 or 96)'], ['Print size at ' + at + ' DPI', fmt(W / at, 2) + '″ × ' + fmt(H / at, 2) + '″ (' + fmt(W / at * 2.54, 1) + ' × ' + fmt(H / at * 2.54, 1) + ' cm)']].map(([a, b]) => el('tr', {}, el('td', {}, a), el('td', {}, b)))))),
        el('div', {}, fld('Change DPI to', sel), el('p', { class: 'small muted' }, 'At ' + t + ' DPI this image prints at ' + fmt(W / t * 2.54, 1) + ' × ' + fmt(H / t * 2.54, 1) + ' cm. Pixels are not changed.'),
          /jpe?g|png/.test(file.type) ? el('button', { class: 'btn', onclick: () => download(setDPI(buf, t), base(file.name) + '-' + t + 'dpi.' + (file.type === 'image/png' ? 'png' : 'jpg')) }, '⬇ Download with ' + t + ' DPI') : el('p', { class: 'bad' }, 'DPI can be changed for JPG and PNG files.'))));
    }
    sel.onchange = () => buf && show();
    box.append(CW.drop({ accept: 'image/jpeg,image/png,image/webp', icon: '🔍', label: 'Choose a JPG or PNG to check its DPI', onFiles: async f => { file = f[0]; buf = await file.arrayBuffer(); img = await load(file); show(); } }), res);
  }
})();
