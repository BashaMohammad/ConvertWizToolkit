// Programmatic "ready answer" pages: each one pre-fills a real tool (window.CW_PRE) and shows
// numbers computed at build time with the SAME calculator code the browser runs (static/assets/e-calc.js).
// Rule: only add a page family when every page gives a genuinely useful, specific answer.
const vm = require('vm'), fs = require('fs'), path = require('path');

const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });
const fmt = (n, d) => !isFinite(n) ? '—' : d != null ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: d }).format(n) : inr.format(n);
const rs = n => '₹' + fmt(Math.round(n));
const lakh = n => n >= 1e7 ? fmt(n / 1e7, 2) + ' crore' : fmt(n / 1e5, 2) + ' lakh';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const table = (head, rows, cls = 'sched') => `<div class="scroll"><table class="${cls}"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

function loadCalc() {
  const CW = { el: () => ({}), fmt, rs, tools: {} };
  const doc = { addEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; } };
  const ctx = { CW, innerWidth: 1000, document: doc, location: { search: '' }, console };
  ctx.window = ctx;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'static/assets/e-calc.js'), 'utf8'), ctx);
  return CW;
}

module.exports = function landings(EXAMS) {
  const CW = loadCalc(), C = CW.calcDefs, LOANS = CW.loans;
  const defs = k => Object.fromEntries(C[k].f.map(([id, , d]) => [id, d]));
  const P = [];

  // exam upload items with real limits, for "where is this size used" lines
  const items = EXAMS.flatMap(e => e.items.filter(i => !i.live && i.max).map(i => ({ ...i, exam: e.n, page: e.s })));

  // ---------- A. compress image to N KB ----------
  const KBS = [10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 100, 150, 200, 250, 300, 500];
  for (const kb of KBS) {
    const uses = items.filter(i => i.max === kb);
    const s = `compress-image-to-${kb}kb`;
    P.push({ s, fam: 'kb', tool: 'image-compressor', pre: { kb },
      title: `Compress Image to ${kb} KB Online Free – JPG, PNG, Photo & Signature`,
      desc: `Reduce a photo or signature to under ${kb} KB in seconds. Works for JPG, PNG and WebP, runs on your phone, no upload and no sign-up.`,
      h1: `Compress Image to ${kb} KB`, nav: `${kb} KB`,
      lead: `The target is already set to ${kb} KB. Choose your photo and download a JPG that is ${kb} KB or smaller – it never leaves your device.`,
      answer: `<b>Under ${kb} KB</b> means at most ${fmt(kb * 1000)} bytes, the way most Indian application portals count it. We aim just below the limit so the portal never rejects the file.`,
      body: (uses.length ? `<h2>Where a ${kb} KB limit is used</h2>${table(['Exam', 'Document', 'Required size'], uses.map(i => [`<a href="/${i.page}">${esc(i.exam)}</a>`, esc(i.n), `${i.w && i.h ? i.w + ' × ' + i.h + ' px, ' : ''}${i.min}–${i.max} KB`]))}<p class="src">From each exam's official notification. Open the exam page for the source document.</p>` : '') +
        `<h2>Tips for a sharp ${kb} KB photo</h2><ul>${[
          kb <= 30 ? 'Small limits work best with small images: resize to the pixel size the form asks for first (e.g. 200 × 230 for a photo, 140 × 60 for a signature).' : 'If the photo looks soft, lower the pixel size slightly instead of lowering quality – fewer pixels at good quality look better than many pixels at low quality.',
          'Crop away empty background before compressing – fewer pixels means more detail for your face or signature.',
          'If the form also has a minimum size, use the Exam Photo & Signature Resizer, which keeps the file between the minimum and maximum.',
          'PNG screenshots compress much better once converted to JPG, which this tool does automatically.'].map(t => `<li>${t}</li>`).join('')}</ul>`,
      faq: [[`How do I reduce a photo to ${kb} KB on mobile?`, `Open this page, tap "Choose", pick the photo from your gallery and tap Download. The ${kb} KB target is already set and the photo is processed on your phone.`],
        [`Is ${kb} KB the same as ${fmt(kb * 1024)} bytes?`, `Some systems use 1 KB = 1024 bytes (${fmt(kb * 1024)} bytes), most portals use 1000. We stay under ${fmt(kb * 1000)} bytes so the file passes both checks.`]],
      rel: KBS.filter(x => x !== kb).map(x => [`/compress-image-to-${x}kb`, `${x} KB`]) });
  }

  // ---------- B. resize image to W × H ----------
  const SIZES = [[200, 230], [140, 60], [240, 240], [800, 400], [413, 531], [630, 810], [472, 157], [350, 200], [276, 354], [600, 600], [1080, 1080], [1080, 1350], [1080, 1920], [1920, 1080], [1200, 630], [500, 500], [300, 300], [3508, 2480].reverse()];
  const ratio = (w, h) => { const g = (a, b) => b ? g(b, a % b) : a, d = g(w, h); return `${w / d}:${h / d}`; };
  const KNOWN = { '1080x1080': 'Instagram square post and WhatsApp/Instagram profile photo', '1080x1350': 'Instagram portrait post (4:5)', '1080x1920': 'Instagram/WhatsApp story and reels (9:16)', '1920x1080': 'Full HD wallpaper, YouTube thumbnail source and presentations (16:9)', '1200x630': 'Link preview image for Facebook, LinkedIn and WhatsApp', '600x600': 'Common square size for passport-style and profile uploads', '500x500': 'Square product or profile image', '300x300': 'Small square thumbnail or logo', '630x810': 'Indian passport photo (Passport Seva digital photo)', '2480x3508': 'A4 page at 300 DPI' };
  for (const [w, h] of SIZES) {
    const key = w + 'x' + h, s = `resize-image-to-${key}`;
    const uses = items.filter(i => i.w === w && i.h === h);
    const mm = v => fmt(v / 300 * 25.4, 1);
    P.push({ s, fam: 'px', tool: 'image-resizer', pre: { w, h, lock: false, mode: 'px' },
      title: `Resize Image to ${w}×${h} Pixels Online – Free | ConvertWiz`,
      desc: `Resize any photo to exactly ${w} × ${h} px${uses.length ? ' for ' + [...new Set(uses.map(u => u.exam))].join(', ') : KNOWN[key] ? ' – ' + KNOWN[key].toLowerCase() : ''}. Free, private and instant on your phone.`,
      h1: `Resize Image to ${w} × ${h} Pixels`, nav: `${w}×${h}`,
      lead: `Width ${w} px and height ${h} px are already filled in. Choose your image and download it at exactly this size.`,
      answer: `<b>${w} × ${h} px</b> is an aspect ratio of ${ratio(w, h)}. Printed at 300 DPI it measures ${mm(w)} × ${mm(h)} mm.${KNOWN[key] ? ' Commonly used for: ' + KNOWN[key] + '.' : ''}`,
      body: (uses.length ? `<h2>Exams that ask for ${w} × ${h} px</h2>${table(['Exam', 'Document', 'Requirement'], uses.map(i => [`<a href="/${i.page}">${esc(i.exam)}</a>`, esc(i.n), esc(i.spec)]))}<p class="src">From each exam's official notification. For exam uploads, the <a href="/exam-photo-resizer">Exam Photo &amp; Signature Resizer</a> also meets the KB limits.</p>` : '') +
        `<h2>Good to know</h2><ul><li>If your photo has a different shape, it is stretched to fill ${w} × ${h}. To avoid that, crop it to ${ratio(w, h)} first, or tick "Lock aspect ratio" to keep the shape.</li><li>Need a file size limit too? Compress the result with the <a href="/image-compressor">Image Compressor</a>.</li></ul>`,
      faq: [[`How do I resize a photo to ${w}×${h} on my phone?`, `Open this page, tap "Choose", select the photo and tap Download. The ${w} × ${h} size is preset and nothing is uploaded.`],
        [`What is ${w}×${h} in cm?`, `At 300 DPI it is ${fmt(w / 300 * 2.54, 2)} × ${fmt(h / 300 * 2.54, 2)} cm; at 200 DPI it is ${fmt(w / 200 * 2.54, 2)} × ${fmt(h / 200 * 2.54, 2)} cm.`]],
      rel: SIZES.filter(x => x[0] + 'x' + x[1] !== key).map(([a, b]) => [`/resize-image-to-${a}x${b}`, `${a}×${b}`]) });
  }

  // ---------- C. CTC → in-hand salary ----------
  const CTCS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 30, 32, 33, 35, 36, 38, 40, 42, 44, 45, 48, 50];
  const sd = defs('salary-calculator');
  for (const L of CTCS) {
    const ctc = L * 1e5, s = `${L}-lakh-ctc-in-hand-salary`;
    const n = C['salary-calculator'].c({ ...sd, ctc, reg: 'new' }), o = C['salary-calculator'].c({ ...sd, ctc, reg: 'old' });
    const row = (r, k) => (r.rows.find(x => x[0] === k) || [, '—'])[1];
    P.push({ s, fam: 'ctc', tool: 'salary-calculator', pre: { ctc },
      title: `${L} Lakh CTC In-Hand Salary: ${n.main[1]}/Month (FY 2026-27)`,
      desc: `${L} LPA in hand = about ${n.main[1]} per month under the new regime (${o.main[1]} in the old regime). Monthly breakdown with PF, tax and gratuity for FY 2026-27.`,
      h1: `₹${L} Lakh CTC – In-Hand Salary per Month`, nav: `${L} L`,
      lead: `Estimated take-home pay for a ₹${L},00,000 CTC in FY 2026-27. Change any setting below to match your offer letter.`,
      answer: `<b>About ${n.main[1]} per month</b> in hand under the new regime (${o.main[1]} under the old regime with ₹1.5 lakh of deductions).`,
      body: `<h2>Monthly breakdown (new regime)</h2>${table(['Component', 'Amount'], n.rows.slice(0, 7), 'kv')}
<h2>New vs old regime</h2>${table(['', 'New regime', 'Old regime'], [['Monthly in-hand', n.main[1], o.main[1]], ['Yearly income tax', row(n, 'Yearly income tax'), row(o, 'Yearly income tax')], ['Yearly take-home', row(n, 'Yearly take-home (excluding variable)'), row(o, 'Yearly take-home (excluding variable)')]])}
<p class="note">Assumptions: basic = 50% of CTC (labour code minimum for basic + DA), HRA 50% of basic, PF 12% on the ₹25,000 wage ceiling, gratuity 4.81% of basic inside CTC, no variable pay, professional tax ₹200/month, FY 2026-27 slabs with standard deduction (₹75,000 new, ₹50,000 old). Your payslip may differ.</p>`,
      faq: [[`What is the in-hand salary for ${L} LPA?`, `About ${n.main[1]} a month under the new regime with the assumptions above. Variable pay, a different basic percentage or full-basic PF will change it.`],
        [`How much tax is paid on ${L} lakh CTC?`, `About ${row(n, 'Yearly income tax')} a year in the new regime and ${row(o, 'Yearly income tax')} in the old regime with ₹1.5 lakh of deductions.`]],
      rel: CTCS.filter(x => x !== L).map(x => [`/${x}-lakh-ctc-in-hand-salary`, `₹${x} L`]) });
  }

  // ---------- D. EMI for common loan amounts ----------
  const emiOf = (p, r, n) => { const i = r / 1200; return i ? p * i * Math.pow(1 + i, n) / (Math.pow(1 + i, n) - 1) : p / n; };
  const LN = { home: { a: [10, 15, 20, 25, 30, 40, 50, 60, 75, 100], t: [10, 15, 20, 25, 30] }, car: { a: [3, 5, 7, 8, 10, 12, 15], t: [3, 5, 7] }, personal: { a: [1, 2, 3, 5, 7, 10, 15], t: [1, 2, 3, 4, 5] } };
  const amtLabel = a => a >= 100 ? `${a / 100} Crore` : `${a} Lakh`, amtSlug = a => a >= 100 ? `${a / 100}-crore` : `${a}-lakh`;
  for (const [type, cfg] of Object.entries(LN)) {
    const name = LOANS[type][0], rate = LOANS[type][1].rate, defY = LOANS[type][1].yrs[0];
    for (const a of cfg.a) {
      const p = a * 1e5, s = `${type}-loan-emi-for-${amtSlug(a)}`;
      const rates = [rate - 0.5, rate, rate + 0.5, rate + 1];
      const e0 = emiOf(p, rate, defY * 12), int0 = e0 * defY * 12 - p;
      P.push({ s, fam: 'emi-' + type, tool: 'emi-calculator', pre: { type, p, rate, yrs: defY },
        title: `₹${amtLabel(a)} ${name.replace(/\b\w/g, c => c.toUpperCase())} EMI: ${rs(e0)}/Month (${defY} Yrs) – All Tenures`,
        desc: `EMI on a ₹${amtLabel(a)} ${name.toLowerCase()} is about ${rs(e0)} a month for ${defY} years at ${rate}%. Compare EMIs for every tenure and rate, with total interest.`,
        h1: `EMI for ₹${amtLabel(a)} ${name}`, nav: `₹${amtLabel(a)}`,
        lead: `Monthly EMI, total interest and the true cost of a ₹${lakh(p)} ${name.toLowerCase()}. The calculator below is pre-filled – change the rate to your bank's offer.`,
        answer: `<b>${rs(e0)} per month</b> for ${defY} years at ${rate}% p.a. – total interest ${rs(int0)} on ₹${lakh(p)}.`,
        body: `<h2>EMI by tenure and interest rate</h2>${table(['Tenure', ...rates.map(r => r + '%')], cfg.t.map(y => [y + (y > 1 ? ' years' : ' year'), ...rates.map(r => rs(emiOf(p, r, y * 12)))]))}
<h2>Total interest you pay</h2>${table(['Tenure', ...rates.map(r => r + '%')], cfg.t.map(y => [y + (y > 1 ? ' years' : ' year'), ...rates.map(r => rs(emiOf(p, r, y * 12) * y * 12 - p))]))}
<p class="note">EMI uses the standard reducing-balance formula. ${rate}% is the typical starting rate our calculator uses for a ${name.toLowerCase()}; your rate depends on the lender, your credit score and income. Processing fees are not included in the tables – the calculator below adds them.</p>`,
        faq: [[`What is the EMI for ₹${amtLabel(a)} ${name.toLowerCase()}?`, `About ${rs(e0)} a month for ${defY} years at ${rate}% p.a. A longer tenure lowers the EMI but raises the total interest – see the tables above.`],
          [`How can I reduce the interest on this loan?`, `Choose the shortest tenure you can afford, compare lenders' rates, and make part-prepayments – the calculator's prepayment fields show how much you save.`]],
        rel: cfg.a.filter(x => x !== a).map(x => [`/${type}-loan-emi-for-${amtSlug(x)}`, `₹${amtLabel(x)}`]) });
    }
  }

  // ---------- E. CGPA → percentage ----------
  const F = [['CBSE (Class 10)', 9.5, 0], ['VTU 2015/2017/2018 schemes', 10, -7.5], ['VTU 2022 scheme', 10, 0], ['Anna University', 10, 0]];
  const cgs = []; for (let x = 50; x <= 100; x++) cgs.push(x / 10);
  const cgS = x => `${String(x.toFixed(1)).replace('.', '-')}-cgpa-to-percentage`;
  for (const g of cgs) {
    const near = cgs.filter(x => Math.abs(x - g) <= 0.55 && x !== g);
    P.push({ s: cgS(g), fam: 'cgpa', tool: 'cgpa-to-percentage', pre: { cg: g },
      title: `${g.toFixed(1)} CGPA to Percentage = ${fmt(9.5 * g, 2)}% (CBSE), VTU & Anna Univ`,
      desc: `${g.toFixed(1)} CGPA is ${fmt(9.5 * g, 2)}% in CBSE, ${fmt(10 * g - 7.5, 2)}% under VTU's older schemes and ${fmt(10 * g, 2)}% for VTU 2022 and Anna University. Official formulas.`,
      h1: `${g.toFixed(1)} CGPA to Percentage`, nav: g.toFixed(1),
      lead: `${g.toFixed(1)} CGPA converted with each board's or university's own published formula. Pick yours in the converter below.`,
      answer: `<b>${g.toFixed(1)} CGPA = ${fmt(9.5 * g, 2)}%</b> in CBSE (9.5 × CGPA). For universities it depends on the regulations – see the table.`,
      body: `<h2>${g.toFixed(1)} CGPA by board and university</h2>${table(['Board / university', 'Formula', 'Percentage'], F.map(([n, a, b]) => [n, b ? `(CGPA − ${-b / a}) × ${a}` : `${a} × CGPA`, fmt(Math.max(a * g + b, 0), 2) + '%']))}
<h2>Nearby CGPA values (CBSE)</h2>${table(['CGPA', 'Percentage'], near.map(x => [`<a href="/${cgS(x)}">${x.toFixed(1)}</a>`, fmt(9.5 * x, 2) + '%']))}
<p class="note">If your grade sheet or university prints a different conversion formula, use that one – choose "Custom" in the converter. Mumbai University and other universities publish their own rules.</p>`,
      faq: [[`What is ${g.toFixed(1)} CGPA in percentage?`, `${fmt(9.5 * g, 2)}% using CBSE's 9.5 × CGPA rule, ${fmt(10 * g, 2)}% where the rule is CGPA × 10 (VTU 2022 scheme, Anna University).`],
        [`How do I convert ${g.toFixed(1)} CGPA for my university?`, `Use the formula printed on your grade sheet or in your university's regulations. Choose your board or university in the converter above, or pick “Custom” and enter the formula.`]],
      rel: cgs.filter(x => x !== g && (x * 10) % 5 === 0).map(x => [`/${cgS(x)}`, x.toFixed(1)]) });
  }

  // ---------- F. Height: cm → feet & inches, and feet+inches → cm ----------
  const CM0 = 135, CM1 = 210, TI0 = 54, TI1 = 80;
  const ftin = cm => { const inch = cm / 2.54, ft = Math.floor(inch / 12), r = inch - ft * 12; return r >= 11.95 ? [ft + 1, 0] : [ft, Math.round(r * 10) / 10]; };
  for (let cm = CM0; cm <= CM1; cm++) {
    const [ft, inch] = ftin(cm), s = `${cm}-cm-in-feet`;
    const near = []; for (let x = cm - 5; x <= cm + 5; x++) if (x !== cm) near.push(x);
    P.push({ s, fam: 'cm', tool: 'height-converter', pre: { val: cm, def: ['cm', 'ft'], ft, inch: Math.round(inch) },
      title: `${cm} cm in Feet = ${ft} ft ${fmt(inch, 1)} in (${fmt(cm / 30.48, 2)} ft) – Height`,
      desc: `${cm} cm height is ${ft} feet ${fmt(inch, 1)} inches, or ${fmt(cm / 30.48, 2)} feet (${fmt(cm / 2.54, 1)} inches). Table of nearby heights and an instant cm ↔ feet converter.`,
      h1: `${cm} cm in Feet and Inches`, nav: `${cm} cm`,
      lead: `${cm} centimetres converted to feet and inches, with nearby heights.`,
      answer: `<b>${cm} cm = ${ft} ft ${fmt(inch, 1)} in</b> (${fmt(cm / 30.48, 2)} feet, ${fmt(cm / 2.54, 1)} inches, ${fmt(cm / 100, 2)} m).`,
      body: `<h2>Nearby heights</h2>${table(['Centimetres', 'Feet and inches', 'Feet (decimal)'], near.map(x => { const [f, i] = ftin(x); return [x >= CM0 && x <= CM1 ? `<a href="/${x}-cm-in-feet">${x} cm</a>` : x + ' cm', `${f} ft ${fmt(i, 1)} in`, fmt(x / 30.48, 2)]; }))}
<p class="note">1 inch = 2.54 cm exactly, and 1 foot = 12 inches = 30.48 cm.</p>`,
      faq: [[`How tall is ${cm} cm in feet?`, `${cm} cm is ${ft} feet ${fmt(inch, 1)} inches, or ${fmt(cm / 30.48, 2)} feet.`], [`How do I convert cm to feet?`, `Divide by 2.54 to get inches, then divide by 12: the whole number is feet and the remainder is inches.`]],
      rel: [150, 155, 160, 165, 170, 175, 180, 185, 190].filter(x => x !== cm).map(x => [`/${x}-cm-in-feet`, `${x} cm`]) });
  }
  for (let ti = TI0; ti <= TI1; ti++) {
    const ft = Math.floor(ti / 12), inch = ti % 12, cm = ti * 2.54, s = `${ft}-feet-${inch}-inches-in-cm`;
    P.push({ s, fam: 'ftin', tool: 'height-converter', pre: { ft, inch, val: Math.round(cm * 10) / 10 },
      title: `${ft} Feet ${inch} Inches in cm = ${fmt(cm, 2)} cm (${fmt(cm / 100, 2)} m)`,
      desc: `${ft} ft ${inch} in (${ft}′${inch}″) height is ${fmt(cm, 2)} cm, or ${fmt(cm / 100, 2)} metres. Table of nearby heights and an instant feet ↔ cm converter.`,
      h1: `${ft} Feet ${inch} Inches in cm`, nav: `${ft}′${inch}″`,
      lead: `${ft}′${inch}″ converted to centimetres and metres.`,
      answer: `<b>${ft} ft ${inch} in = ${fmt(cm, 2)} cm</b> (${ti} inches, ${fmt(cm / 100, 2)} m).`,
      body: `<h2>Nearby heights</h2>${table(['Feet and inches', 'Centimetres'], [-3, -2, -1, 1, 2, 3].map(d => ti + d).filter(x => x >= TI0 && x <= TI1).map(x => [`<a href="/${Math.floor(x / 12)}-feet-${x % 12}-inches-in-cm">${Math.floor(x / 12)} ft ${x % 12} in</a>`, fmt(x * 2.54, 2) + ' cm']))}
<p class="note">Formula: (feet × 12 + inches) × 2.54 = centimetres.</p>`,
      faq: [[`What is ${ft} feet ${inch} inches in cm?`, `${fmt(cm, 2)} cm.`], [`How do I convert feet and inches to cm?`, `Multiply the feet by 12, add the inches, then multiply by 2.54. For ${ft}′${inch}″: (${ft} × 12 + ${inch}) × 2.54 = ${fmt(cm, 2)} cm.`]],
      rel: [58, 60, 62, 64, 66, 68, 70, 72].filter(x => x !== ti).map(x => [`/${Math.floor(x / 12)}-feet-${x % 12}-inches-in-cm`, `${Math.floor(x / 12)}′${x % 12}″`]) });
  }
  return P;
};
