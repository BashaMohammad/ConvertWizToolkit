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
    ['passport', 'Passport photo – 35×45 mm (413×531 px), up to 250 KB', 413, 531, 10, 250],
    ['visa', 'US visa photo – 600×600 px, up to 240 KB', 600, 600, 10, 240],
    ['custom', 'Custom size', 300, 400, 10, 100],
  ];

  // Exam pages inject their official presets as window.CW_EXAM = { items: [...] }
  const EXAM = window.CW_EXAM && window.CW_EXAM.items ? window.CW_EXAM.items.filter(i => !i.live) : null;
  if (EXAM) PRESETS.splice(0, PRESETS.length, ...EXAM.map(i => [i.id, i.n + ' – ' + (i.keep ? 'up to ' : '') + i.w + '×' + i.h + ' px, ' + i.min + '–' + i.max + ' KB', i.w, i.h, i.min, i.max, !!i.keep, i.dpi || 0]), ['custom', 'Custom size', 300, 400, 10, 100]);
  CW.tools.image = function (box, slug) {
    if (slug === 'instagram-dp-resizer') return dp(box);
    if (slug === 'dpi-checker') return dpi(box);
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
          const name = (EXAM && slug === 'exam-photo-resizer' ? o.ex[0] + '-' : '') + base(f.name) + (slug === 'image-resizer' || slug === 'exam-photo-resizer' ? '-' + r.w + 'x' + r.h : '') + '.' + EXT[r.blob.type];
          outs.push([r.blob, name]);
          const diff = (1 - r.blob.size / f.size) * 100, thumb = el('img', { src: URL.createObjectURL(r.blob), alt: '' });
          let msg = size(f.size) + ' → ' + size(r.blob.size) + ' • ' + r.w + '×' + r.h;
          let cls = diff >= 0 ? 'ok' : 'muted';
          if (slug === 'exam-photo-resizer') { const b = r.blob.size; if (b > KBMAX(o.ex[5])) { msg += ' • still above the maximum – try smaller pixel dimensions'; cls = 'bad'; } else if (b < KBMIN(o.ex[4])) { msg += ' • below the minimum KB – use a clearer or larger original'; cls = 'bad'; } else { msg += ' • ✓ within ' + o.ex[4] + '–' + o.ex[5] + ' KB' + (r.padded ? ' (size raised to meet the minimum; image unchanged)' : ''); cls = 'ok'; } }
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
