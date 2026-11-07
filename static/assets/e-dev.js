/* Web & developer tools engine */
(function () {
  const { el, copy, download, fmt } = CW;
  const fld = (label, inp, hint) => el('div', { class: 'fld' }, el('label', {}, label), inp, hint ? el('div', { class: 'hint' }, hint) : '');
  const inp = (ph, v, t) => el('input', { type: t || 'text', placeholder: ph || '', value: v || '' });
  const T = {
    async 'qr-code-generator'(box) {
      const kinds = { url: 'Website / text', upi: 'UPI payment', wifi: 'WiFi', wa: 'WhatsApp' };
      const kind = el('select', {}, Object.entries(kinds).map(([v, l]) => el('option', { value: v }, l)));
      const F = { url: inp('https://example.com or any text', 'https://www.convertwiz.in'), upi: inp('yourname@okaxis'), name: inp('Shop or person name'), amt: inp('Optional amount', '', 'number'), note: inp('Optional note'), ssid: inp('Network name (SSID)'), pass: inp('Password'), enc: el('select', {}, ['WPA', 'WEP', 'nopass'].map(v => el('option', { value: v }, v === 'nopass' ? 'No password' : v))), wa: inp('Number with country code, e.g. 919876543210', '', 'tel'), msg: inp('Optional pre-filled message') };
      const groups = { url: [fld('Text or URL', F.url)], upi: [fld('UPI ID', F.upi), fld('Payee name', F.name), fld('Amount (₹)', F.amt), fld('Note', F.note)], wifi: [fld('Network name', F.ssid), fld('Password', F.pass), fld('Security', F.enc)], wa: [fld('WhatsApp number', F.wa), fld('Message', F.msg)] };
      const fg = el('input', { type: 'color', value: '#111827' }), bg = el('input', { type: 'color', value: '#ffffff' }), sz = el('select', {}, [[512, '512 px'], [1024, '1024 px'], [2048, '2048 px (print)']].map(([v, l]) => el('option', { value: v }, l)));
      const fields = el('div', { class: 'row' }), cv = el('canvas', { style: 'width:240px;height:240px;border-radius:12px;background:#fff;display:block;margin:auto' }), txt = el('p', { class: 'small muted mono', style: 'word-break:break-all;text-align:center' });
      const esc = s => s.replace(/([\\;,:"])/g, '\\$1');
      const val = () => { const k = kind.value; if (k === 'url') return F.url.value;
        if (k === 'upi') { if (!F.upi.value.includes('@')) return ''; let s = 'upi://pay?pa=' + encodeURIComponent(F.upi.value.trim()).replace(/%40/g, '@') + '&pn=' + encodeURIComponent(F.name.value || F.upi.value) + '&cu=INR'; if (+F.amt.value > 0) s += '&am=' + (+F.amt.value).toFixed(2); if (F.note.value) s += '&tn=' + encodeURIComponent(F.note.value); return s; }
        if (k === 'wifi') return F.ssid.value ? 'WIFI:T:' + F.enc.value + ';S:' + esc(F.ssid.value) + ';' + (F.enc.value !== 'nopass' ? 'P:' + esc(F.pass.value) + ';' : '') + ';' : '';
        return F.wa.value ? 'https://wa.me/' + F.wa.value.replace(/\D/g, '') + (F.msg.value ? '?text=' + encodeURIComponent(F.msg.value) : '') : ''; };
      let qr;
      let shown; const draw = () => { if (shown !== kind.value) { shown = kind.value; fields.replaceChildren(...groups[kind.value]); } const v = val(); txt.textContent = v || 'Fill in the details to create your QR code'; if (!qr) return; qr.set({ value: v || ' ', size: +sz.value, foreground: fg.value, background: bg.value, level: 'H', padding: Math.round(+sz.value / 25) }); };
      [kind, fg, bg, sz, ...Object.values(F)].forEach(i => { i.oninput = draw; i.onchange = draw; });
      box.append(el('div', { class: 'two' }, el('div', {}, fld('QR type', kind), fields, el('div', { class: 'row', style: 'margin-top:10px' }, fld('Colour', fg), fld('Background', bg), fld('Size', sz))),
        el('div', { class: 'res' }, cv, txt, el('div', { class: 'btns', style: 'justify-content:center' }, el('button', { class: 'btn', onclick: () => { if (!val()) return CW.toast('Fill in the details first'); cv.toBlob(b => download(b, 'qr-' + kind.value + '.png')); } }, '⬇ Download PNG')),
          el('p', { class: 'small muted', style: 'text-align:center' }, 'Tip: test-scan before printing. UPI QR works with GPay, PhonePe, Paytm and BHIM.'))));
      draw();
      try { await CW.loadScript('/vendor/qrious-4.0.2/qrious.min.js'); qr = new QRious({ element: cv }); draw(); } catch (e) { txt.textContent = 'Could not load the QR library. Check your connection.'; }
    },
    'password-generator'(box) {
      const len = el('input', { type: 'range', min: 8, max: 64, value: 16 }), ll = el('b', {}, '16');
      const opt = (l, on) => { const c = el('input', { type: 'checkbox', checked: on }); c.onchange = gen; return [c, el('label', { style: 'display:inline;font-weight:500;margin-right:14px' }, c, l)]; };
      const [up, a] = opt('A–Z', true), [lo, b] = opt('a–z', true), [nu, c] = opt('0–9', true), [sy, d] = opt('Symbols', true), [am, e] = opt('Avoid look-alikes (0O1lI)', false);
      const out = el('div', { class: 'files' });
      function pick(n) { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n; }
      function gen() { ll.textContent = len.value; let sets = []; if (up.checked) sets.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ'); if (lo.checked) sets.push('abcdefghijklmnopqrstuvwxyz'); if (nu.checked) sets.push('0123456789'); if (sy.checked) sets.push('!@#$%^&*()-_=+[]{};:,.?/');
        if (am.checked) sets = sets.map(s => s.replace(/[0O1lI]/g, '')); if (!sets.length) return out.replaceChildren(el('p', { class: 'bad' }, 'Select at least one character type.'));
        const all = sets.join(''), bits = Math.round(len.value * Math.log2(all.length)), str = bits >= 100 ? ['Very strong', 'ok'] : bits >= 70 ? ['Strong', 'ok'] : bits >= 50 ? ['Fair', 'muted'] : ['Weak', 'bad'];
        out.replaceChildren(...Array.from({ length: 5 }, () => { const p = sets.map(s => s[pick(s.length)]); while (p.length < len.value) p.push(all[pick(all.length)]); for (let i = p.length - 1; i > 0; i--) { const j = pick(i + 1); [p[i], p[j]] = [p[j], p[i]]; } const pw = p.join('');
          return el('div', { class: 'fi' }, el('div', { class: 'nm mono', style: 'word-break:break-all' }, pw), el('button', { class: 'btn sm', onclick: () => copy(pw) }, '📋')); }), el('p', { class: 'small ' + str[1] }, 'Strength: ' + str[0] + ' (≈' + bits + ' bits of entropy)')); }
      len.oninput = gen;
      box.append(el('div', {}, el('label', {}, 'Length: ', ll), len), el('div', { style: 'margin:10px 0' }, a, b, c, d, e), el('button', { class: 'btn', onclick: gen }, '🔄 Generate'), out); gen();
    },
    'color-converter'(box) {
      const pick = el('input', { type: 'color', value: '#4f46e5', style: 'width:64px;height:48px;border:0;background:none;cursor:pointer' }), code = inp('#4f46e5, rgb(79,70,229) or hsl(243,75%,59%)', '#4f46e5'), out = el('div'), sw = el('div', { class: 'swatches' });
      const hex = (r, g, b) => '#' + [r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('');
      const toHsl = (r, g, b) => { r /= 255; g /= 255; b /= 255; const M = Math.max(r, g, b), m = Math.min(r, g, b), l = (M + m) / 2; let h = 0, s = 0; if (M !== m) { const d = M - m; s = l > .5 ? d / (2 - M - m) : d / (M + m); h = M === r ? (g - b) / d + (g < b ? 6 : 0) : M === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s * 100, l * 100]; };
      const fromHsl = (h, s, l) => { s /= 100; l /= 100; const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)); return [f(0) * 255, f(8) * 255, f(4) * 255]; };
      const parse = s => { s = s.trim().toLowerCase(); let m; if ((m = s.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/))) { let h = m[1]; if (h.length === 3) h = [...h].map(c => c + c).join(''); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); }
        if ((m = s.match(/rgba?\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)/))) return [+m[1], +m[2], +m[3]].map(x => Math.min(255, x)); if ((m = s.match(/hsla?\(\s*([\d.]+)[ ,]+([\d.]+)%?[ ,]+([\d.]+)%?/))) return fromHsl(+m[1], +m[2], +m[3]); return null; };
      function show(rgb) { const [r, g, b] = rgb, H = hex(r, g, b), [h, s, l] = toHsl(r, g, b); pick.value = H;
        const rows = [['HEX', H.toUpperCase()], ['RGB', `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`], ['HSL', `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`], ['CSS variable', `--color: ${H};`]];
        out.replaceChildren(el('table', { class: 'kv' }, el('tbody', {}, rows.map(([a, v]) => el('tr', {}, el('td', {}, a), el('td', {}, el('button', { class: 'btn sec sm mono', onclick: () => copy(v) }, v + ' 📋')))))));
        sw.replaceChildren(...[95, 85, 75, 65, 55, 45, 35, 25, 15].map(L => { const c = hex(...fromHsl(h, s, L)); return el('button', { style: `background:${c};color:${L > 55 ? '#111' : '#fff'}`, title: 'Copy ' + c, onclick: () => copy(c) }, c); })); }
      pick.oninput = () => { code.value = pick.value; show(parse(pick.value)); };
      code.oninput = () => { const p = parse(code.value); if (p) show(p); };
      box.append(el('div', { style: 'display:flex;gap:12px;align-items:end' }, pick, el('div', { style: 'flex:1' }, fld('Colour code', code))), out, el('h3', {}, 'Tints & shades (click to copy)'), sw); show(parse('#4f46e5'));
    },
    'meta-tag-generator'(box) {
      const F = { t: inp('Page title (50–60 characters)'), d: el('textarea', { placeholder: 'Meta description (120–160 characters)', style: 'min-height:90px' }), u: inp('https://www.example.com/page', '', 'url'), i: inp('https://www.example.com/og-image.jpg', '', 'url'), s: inp('Site name'), tw: inp('@twitterhandle') };
      const cnt = { t: el('span', { class: 'small muted' }), d: el('span', { class: 'small muted' }) }, prev = el('div', { class: 'preview-google' }), out = el('textarea', { readonly: true, class: 'mono', style: 'min-height:260px' });
      const e = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
      function run() { const t = F.t.value, d = F.d.value, u = F.u.value;
        cnt.t.textContent = t.length + ' chars ' + (t.length > 60 ? '⚠ may be cut off' : t.length >= 30 ? '✓' : ''); cnt.d.textContent = d.length + ' chars ' + (d.length > 160 ? '⚠ may be cut off' : d.length >= 70 ? '✓' : '');
        prev.replaceChildren(el('div', { class: 'u' }, u || 'https://www.example.com'), el('div', { class: 't' }, (t || 'Your page title').slice(0, 60) + (t.length > 60 ? '…' : '')), el('div', { class: 'd' }, (d || 'Your meta description will appear here in Google search results.').slice(0, 160) + (d.length > 160 ? '…' : '')));
        const L = [`<title>${e(t)}</title>`, `<meta name="description" content="${e(d)}">`, u && `<link rel="canonical" href="${e(u)}">`, `<meta name="viewport" content="width=device-width, initial-scale=1">`, `<meta property="og:type" content="website">`, `<meta property="og:title" content="${e(t)}">`, `<meta property="og:description" content="${e(d)}">`, u && `<meta property="og:url" content="${e(u)}">`, F.i.value && `<meta property="og:image" content="${e(F.i.value)}">`, F.s.value && `<meta property="og:site_name" content="${e(F.s.value)}">`, `<meta name="twitter:card" content="${F.i.value ? 'summary_large_image' : 'summary'}">`, F.tw.value && `<meta name="twitter:site" content="${e(F.tw.value)}">`];
        out.value = L.filter(Boolean).join('\n'); }
      Object.values(F).forEach(i => i.oninput = run);
      box.append(el('div', { class: 'two' }, el('div', {}, fld('Title', F.t), cnt.t, fld('Description', F.d), cnt.d, el('div', { class: 'row' }, fld('Page URL', F.u), fld('Image URL', F.i), fld('Site name', F.s), fld('Twitter handle', F.tw))),
        el('div', {}, el('label', {}, 'Google preview'), prev, el('label', { style: 'margin-top:14px' }, 'Your meta tags'), out, el('div', { class: 'btns' }, el('button', { class: 'btn', onclick: () => copy(out.value) }, '📋 Copy HTML'))))); run();
    },
    'json-formatter'(box) {
      const a = el('textarea', { class: 'mono', placeholder: 'Paste JSON here…', spellcheck: 'false' }, '{"name":"ConvertWiz","tools":43,"free":true,"tags":["pdf","image","gst"]}'), msg = el('div');
      const ind = el('select', {}, [['2', '2 spaces'], ['4', '4 spaces'], ['\t', 'Tab']].map(([v, l]) => el('option', { value: v }, l)));
      const run = min => { try { const o = JSON.parse(a.value); a.value = min ? JSON.stringify(o) : JSON.stringify(o, null, ind.value === '\t' ? '\t' : +ind.value); msg.replaceChildren(el('p', { class: 'ok' }, '✓ Valid JSON')); CW.markUsed(); }
        catch (e) { const m = e.message.match(/position (\d+)/), p = m ? +m[1] : -1; let where = ''; if (p >= 0) { const pre = a.value.slice(0, p).split('\n'); where = ' (line ' + pre.length + ', column ' + (pre.at(-1).length + 1) + ')'; a.focus(); a.setSelectionRange(p, p + 1); } msg.replaceChildren(el('p', { class: 'bad' }, '✗ ' + e.message + where)); } };
      box.append(a, el('div', { class: 'btns' }, el('button', { class: 'btn', onclick: () => run(false) }, '✨ Format'), el('button', { class: 'btn sec', onclick: () => run(true) }, 'Minify'), ind, el('button', { class: 'btn sec', onclick: () => copy(a.value) }, '📋 Copy'), el('button', { class: 'btn sec', onclick: () => download(new Blob([a.value], { type: 'application/json' }), 'data.json') }, '⬇ Save')), msg);
    },
    'base64-encoder'(box) {
      const a = el('textarea', { placeholder: 'Text to encode, or Base64 to decode…', class: 'mono' }), b = el('textarea', { readonly: true, class: 'mono', placeholder: 'Output' }), msg = el('div');
      const enc = s => btoa(String.fromCharCode(...new TextEncoder().encode(s))), dec = s => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\s/g, '')), c => c.charCodeAt(0)));
      const go = f => { try { b.value = f(a.value); msg.replaceChildren(); CW.markUsed(); } catch (e) { msg.replaceChildren(el('p', { class: 'bad' }, 'Invalid Base64 input.')); } };
      const file = el('input', { type: 'file' }); file.onchange = () => { const r = new FileReader(); r.onload = () => { b.value = r.result; msg.replaceChildren(el('p', { class: 'ok' }, '✓ ' + file.files[0].name + ' encoded as data URL (' + fmt(r.result.length) + ' chars)')); }; r.readAsDataURL(file.files[0]); };
      box.append(el('div', { class: 'two' }, a, b), el('div', { class: 'btns' }, el('button', { class: 'btn', onclick: () => go(enc) }, 'Encode →'), el('button', { class: 'btn', onclick: () => go(dec) }, 'Decode →'), el('button', { class: 'btn sec', onclick: () => copy(b.value) }, '📋 Copy output'), el('label', { class: 'btn sec', style: 'margin:0' }, '📁 Encode a file', file)), msg);
      file.hidden = true;
    },
  };
  CW.tools.dev = (box, slug) => T[slug](box);
})();
