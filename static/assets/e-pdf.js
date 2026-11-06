/* PDF engine: pdf-lib + pdf.js, loaded on demand from jsDelivr */
(function () {
  const { el, size, download, loadScript } = CW;
  const LIB = () => loadScript('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js').then(() => window.PDFLib);
  const PDFJS = async () => { await loadScript('https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js'); pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'; return pdfjsLib; };
  const base = n => n.replace(/\.[^.]+$/, '');
  const pdfBlob = bytes => new Blob([bytes], { type: 'application/pdf' });
  const busy = (btn, on, txt) => { btn.disabled = on; if (txt) btn.textContent = txt; };
  const err = (box, e) => box.append(el('p', { class: 'bad' }, '⚠ ' + (/encrypt/i.test(e.message) ? 'This PDF is password-protected. Unlock it first.' : 'Could not process this file: ' + e.message)));
  function parseRanges(s, max) { const out = []; for (const part of s.split(',')) { const m = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/); if (!m) continue; let a = +m[1], b = m[2] ? +m[2] : a; if (a > b) [a, b] = [b, a]; for (let i = Math.max(1, a); i <= Math.min(max, b); i++) out.push(i - 1); } return out; }

  // reorderable file list
  function sortable(onChange) {
    const wrap = el('div', { class: 'files' }); let items = [];
    const draw = () => { wrap.replaceChildren(...items.map((f, i) => el('div', { class: 'fi' }, el('span', { class: 'em', style: 'font-size:22px' }, f.type === 'application/pdf' ? '📄' : '🖼️'), el('div', { class: 'nm' }, el('b', {}, (i + 1) + '. ' + f.name), el('small', {}, size(f.size))),
      el('button', { class: 'ibtn', title: 'Move up', disabled: i === 0, onclick: () => { [items[i - 1], items[i]] = [items[i], items[i - 1]]; draw(); } }, '↑'), el('button', { class: 'ibtn', title: 'Move down', disabled: i === items.length - 1, onclick: () => { [items[i + 1], items[i]] = [items[i], items[i + 1]]; draw(); } }, '↓'), el('button', { class: 'ibtn', title: 'Remove', onclick: () => { items.splice(i, 1); draw(); } }, '✕')))); onChange(items); };
    return { wrap, add: f => { items = items.concat(f); draw(); }, get: () => items };
  }

  const T = {
    'merge-pdf'(box) {
      const btn = el('button', { class: 'btn', disabled: true }, '📑 Merge PDFs'), msg = el('div');
      const L = sortable(it => btn.disabled = it.length < 2);
      btn.onclick = async () => { msg.replaceChildren(); busy(btn, true, 'Merging…'); try { const { PDFDocument } = await LIB(); const out = await PDFDocument.create();
        for (const f of L.get()) { const src = await PDFDocument.load(await f.arrayBuffer()); (await out.copyPages(src, src.getPageIndices())).forEach(p => out.addPage(p)); }
        const b = await out.save(); download(pdfBlob(b), 'merged.pdf'); msg.append(el('p', { class: 'ok' }, '✓ Merged ' + L.get().length + ' files, ' + out.getPageCount() + ' pages, ' + size(b.length))); } catch (e) { err(msg, e); } busy(btn, false, '📑 Merge PDFs'); };
      box.append(CW.drop({ accept: 'application/pdf', multiple: true, icon: '📄', label: 'Drop PDF files here or tap to choose', onFiles: L.add }), L.wrap, el('div', { class: 'btns' }, btn), msg);
    },
    'split-pdf'(box) {
      let file, n = 0; const info = el('div'), rng = el('input', { type: 'text', placeholder: 'e.g. 1-3, 5, 8-10' }), each = el('input', { type: 'checkbox' }), btn = el('button', { class: 'btn' }, '✂️ Split'), msg = el('div'), ctl = el('div', { hidden: true }, info, el('div', { class: 'row', style: 'margin-top:12px' }, el('div', {}, el('label', {}, 'Pages to extract'), rng), el('label', { style: 'align-self:end' }, each, 'Save every page as a separate PDF')), el('div', { class: 'btns' }, btn), msg);
      btn.onclick = async () => { msg.replaceChildren(); busy(btn, true, 'Working…'); try { const { PDFDocument } = await LIB(); const src = await PDFDocument.load(await file.arrayBuffer());
        const idx = each.checked ? (rng.value.trim() ? parseRanges(rng.value, n) : src.getPageIndices()) : parseRanges(rng.value, n);
        if (!idx.length) throw new Error('enter valid page numbers between 1 and ' + n);
        if (each.checked) { for (const i of idx) { const d = await PDFDocument.create(); d.addPage((await d.copyPages(src, [i]))[0]); download(pdfBlob(await d.save()), base(file.name) + '-page-' + (i + 1) + '.pdf'); await new Promise(r => setTimeout(r, 350)); } }
        else { const d = await PDFDocument.create(); (await d.copyPages(src, idx)).forEach(p => d.addPage(p)); download(pdfBlob(await d.save()), base(file.name) + '-pages.pdf'); }
        msg.append(el('p', { class: 'ok' }, '✓ Done – ' + idx.length + ' page(s)')); } catch (e) { err(msg, e); } busy(btn, false, '✂️ Split'); };
      box.append(CW.drop({ accept: 'application/pdf', icon: '✂️', label: 'Choose a PDF to split', onFiles: async f => { file = f[0]; msg.replaceChildren(); try { const { PDFDocument } = await LIB(); n = (await PDFDocument.load(await file.arrayBuffer())).getPageCount(); info.replaceChildren(el('b', {}, file.name), ' – ' + n + ' pages, ' + size(file.size)); rng.value = '1-' + Math.min(n, 3); ctl.hidden = false; } catch (e) { err(msg, e); box.append(msg); } } }), ctl);
    },
    'jpg-to-pdf'(box) {
      const o = { page: 'a4', m: 20 }; const btn = el('button', { class: 'btn', disabled: true }, '🖨️ Create PDF'), msg = el('div');
      const L = sortable(it => btn.disabled = !it.length);
      const ps = el('select', {}, [['a4', 'A4 portrait'], ['a4l', 'A4 landscape'], ['fit', 'Same as image']].map(([v, l]) => el('option', { value: v }, l))); ps.onchange = () => o.page = ps.value;
      const mg = el('select', {}, [[20, 'Small margin'], [0, 'No margin'], [40, 'Large margin']].map(([v, l]) => el('option', { value: v }, l))); mg.onchange = () => o.m = +mg.value;
      btn.onclick = async () => { msg.replaceChildren(); busy(btn, true, 'Creating…'); try { const { PDFDocument } = await LIB(); const d = await PDFDocument.create();
        for (const f of L.get()) { let bytes = await f.arrayBuffer(), im;
          if (f.type === 'image/png') im = await d.embedPng(bytes); else if (f.type === 'image/jpeg') im = await d.embedJpg(bytes);
          else { const i = new Image(); i.src = URL.createObjectURL(f); await i.decode(); const c = el('canvas'); c.width = i.naturalWidth; c.height = i.naturalHeight; c.getContext('2d').drawImage(i, 0, 0); im = await d.embedJpg(await (await new Promise(r => c.toBlob(r, 'image/jpeg', .92))).arrayBuffer()); }
          const [pw, ph] = o.page === 'a4' ? [595.28, 841.89] : o.page === 'a4l' ? [841.89, 595.28] : [im.width, im.height];
          const pg = d.addPage([pw, ph]), m = o.page === 'fit' ? 0 : o.m, s = Math.min((pw - 2 * m) / im.width, (ph - 2 * m) / im.height, o.page === 'fit' ? 1 : Infinity);
          pg.drawImage(im, { x: (pw - im.width * s) / 2, y: (ph - im.height * s) / 2, width: im.width * s, height: im.height * s }); }
        const b = await d.save(); download(pdfBlob(b), 'images.pdf'); msg.append(el('p', { class: 'ok' }, '✓ PDF created – ' + d.getPageCount() + ' pages, ' + size(b.length))); } catch (e) { err(msg, e); } busy(btn, false, '🖨️ Create PDF'); };
      box.append(el('div', { class: 'row', style: 'margin-bottom:14px' }, el('div', {}, el('label', {}, 'Page size'), ps), el('div', {}, el('label', {}, 'Margin'), mg)), CW.drop({ accept: 'image/*', multiple: true, icon: '🖼️', label: 'Drop images here or tap to choose', onFiles: L.add }), L.wrap, el('div', { class: 'btns' }, btn), msg);
    },
    'pdf-to-jpg'(box) {
      const q = el('select', {}, [[2, 'Standard (≈150 DPI)'], [3, 'High (≈220 DPI)'], [1.4, 'Small file (≈100 DPI)']].map(([v, l]) => el('option', { value: v }, l))), list = el('div', { class: 'files' }), all = el('div', { class: 'btns' });
      box.append(el('div', { style: 'max-width:320px;margin-bottom:14px' }, el('label', {}, 'Image quality'), q), CW.drop({ accept: 'application/pdf', icon: '📄', label: 'Choose a PDF', onFiles: async f => {
        list.replaceChildren(el('p', { class: 'muted' }, 'Rendering pages…')); all.replaceChildren(); const outs = [];
        try { const lib = await PDFJS(); const doc = await lib.getDocument({ data: await f[0].arrayBuffer() }).promise; list.replaceChildren();
          for (let i = 1; i <= doc.numPages; i++) { const pg = await doc.getPage(i), vp = pg.getViewport({ scale: +q.value }), c = el('canvas'); c.width = vp.width; c.height = vp.height; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
            await pg.render({ canvasContext: x, viewport: vp }).promise; const b = await new Promise(r => c.toBlob(r, 'image/jpeg', .9)), nm = base(f[0].name) + '-page-' + i + '.jpg'; outs.push([b, nm]);
            list.append(el('div', { class: 'fi' }, el('img', { src: URL.createObjectURL(b), alt: 'Page ' + i }), el('div', { class: 'nm' }, el('b', {}, 'Page ' + i), el('small', {}, Math.round(vp.width) + '×' + Math.round(vp.height) + ' • ' + size(b.size))), el('button', { class: 'btn sm', onclick: () => download(b, nm) }, '⬇'))); }
          if (outs.length > 1) all.append(el('button', { class: 'btn', onclick: async () => { for (const [b, n] of outs) { download(b, n); await new Promise(r => setTimeout(r, 400)); } } }, '⬇ Download all ' + outs.length + ' pages'));
        } catch (e) { list.replaceChildren(); err(list, e); } } }), list, all);
    },
    'rotate-pdf'(box) {
      let file; let deg = 90; const msg = el('div'), btn = el('button', { class: 'btn', disabled: true }, '🔃 Rotate & download');
      const s = el('select', {}, [[90, '90° clockwise'], [180, '180° (upside down)'], [270, '90° anti-clockwise']].map(([v, l]) => el('option', { value: v }, l))); s.onchange = () => deg = +s.value;
      btn.onclick = async () => { msg.replaceChildren(); busy(btn, true); try { const { PDFDocument, degrees } = await LIB(); const d = await PDFDocument.load(await file.arrayBuffer()); d.getPages().forEach(p => p.setRotation(degrees((p.getRotation().angle + deg) % 360))); download(pdfBlob(await d.save()), base(file.name) + '-rotated.pdf'); msg.append(el('p', { class: 'ok' }, '✓ Rotated ' + d.getPageCount() + ' pages')); } catch (e) { err(msg, e); } busy(btn, false); };
      box.append(el('div', { style: 'max-width:320px;margin-bottom:14px' }, el('label', {}, 'Rotation'), s), CW.drop({ accept: 'application/pdf', icon: '🔃', label: 'Choose a PDF', onFiles: f => { file = f[0]; btn.disabled = false; msg.replaceChildren(el('p', {}, '📄 ' + file.name + ' (' + size(file.size) + ')')); } }), el('div', { class: 'btns' }, btn), msg);
    },
  };
  CW.tools.pdf = (box, slug) => T[slug](box);
})();
