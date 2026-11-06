/* Calculator engine: declarative inputs -> live results */
(function () {
  const { el, fmt, rs } = CW;
  const pct = n => fmt(n, 2) + '%';
  const today = () => new Date().toISOString().slice(0, 10);
  // f: fields [id,label,default,opts]; opts: {suf, min, max, step, r:[min,max,step], sel:[[v,label]], type, hint, show:v=>bool}
  const C = {
    'gst-calculator': {
      f: [['amt', 'Amount', 10000, { suf: '₹' }], ['rate', 'GST rate', 18, { sel: [[5, '5% (essentials)'], [18, '18% (standard)'], [40, '40% (luxury / sin goods)'], [3, '3% (gold, silver)'], [0.25, '0.25% (rough diamonds)'], [12, '12% (old slab)'], [28, '28% (old slab)']] }],
        ['mode', 'Calculation', 'add', { sel: [['add', 'Add GST (price excludes GST)'], ['rem', 'Remove GST (price includes GST)']] }]],
      c(v) { const r = v.rate / 100; let net, gst; if (v.mode === 'add') { net = v.amt; gst = net * r; } else { net = v.amt / (1 + r); gst = v.amt - net; }
        return { main: ['Total incl. GST', '₹' + fmt(net + gst)], rows: [['Price before GST', '₹' + fmt(net)], ['GST @ ' + v.rate + '%', '₹' + fmt(gst)], ['CGST (' + v.rate / 2 + '%)', '₹' + fmt(gst / 2)], ['SGST (' + v.rate / 2 + '%)', '₹' + fmt(gst / 2)], ['IGST (inter-state)', '₹' + fmt(gst)]], bar: [['Net price', net, 'var(--pri)'], ['GST', gst, '#f59e0b']] }; } },
    'emi-calculator': {
      f: [['p', 'Loan amount', 2500000, { suf: '₹', r: [50000, 20000000, 50000] }], ['rate', 'Interest rate (p.a.)', 8.5, { suf: '%', r: [1, 30, 0.05] }], ['yrs', 'Tenure', 20, { suf: 'years', r: [1, 30, 1] }]],
      c(v) { const n = v.yrs * 12, r = v.rate / 1200; const emi = r ? v.p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : v.p / n; const tot = emi * n;
        let bal = v.p; const rows = []; for (let y = 1; y <= v.yrs; y++) { let pi = 0, ii = 0; for (let m = 0; m < 12 && bal > 0.5; m++) { const it = bal * r, pr = Math.min(emi - it, bal); ii += it; pi += pr; bal -= pr; } rows.push([y, rs(pi), rs(ii), rs(Math.max(bal, 0))]); }
        return { main: ['Monthly EMI', rs(emi)], rows: [['Principal', rs(v.p)], ['Total interest', rs(tot - v.p)], ['Total payable', rs(tot)]], bar: [['Principal', v.p, 'var(--pri)'], ['Interest', tot - v.p, '#f59e0b']], table: { title: 'Year-by-year repayment schedule', head: ['Year', 'Principal paid', 'Interest paid', 'Balance'], rows } }; } },
    'sip-calculator': {
      f: [['amt', 'Monthly SIP', 5000, { suf: '₹', r: [500, 200000, 500] }], ['rate', 'Expected return (p.a.)', 12, { suf: '%', r: [1, 30, 0.5] }], ['yrs', 'Time period', 10, { suf: 'years', r: [1, 40, 1] }], ['step', 'Annual step-up', 0, { suf: '%', r: [0, 50, 1], hint: 'Increase your SIP by this % every year' }]],
      c(v) { const i = v.rate / 1200; let bal = 0, inv = 0, s = v.amt; const rows = [];
        for (let y = 1; y <= v.yrs; y++) { for (let m = 0; m < 12; m++) { bal = (bal + s) * (1 + i); inv += s; } rows.push([y, rs(s), rs(inv), rs(bal)]); s *= 1 + v.step / 100; }
        return { main: ['Estimated value', rs(bal)], rows: [['Total invested', rs(inv)], ['Estimated returns', rs(bal - inv)], ['Wealth gain', pct(inv ? (bal - inv) / inv * 100 : 0)]], bar: [['Invested', inv, 'var(--pri)'], ['Returns', bal - inv, '#10b981']], table: { title: 'Growth by year', head: ['Year', 'Monthly SIP', 'Invested', 'Value'], rows }, note: 'Estimate at a constant return. Mutual fund investments are subject to market risks.' }; } },
    'fd-calculator': {
      f: [['p', 'Deposit amount', 100000, { suf: '₹' }], ['rate', 'Interest rate (p.a.)', 7, { suf: '%', step: 0.05 }], ['yrs', 'Tenure', 5, { suf: 'years', step: 0.25 }], ['n', 'Compounding', 4, { sel: [[4, 'Quarterly (most banks)'], [12, 'Monthly'], [2, 'Half-yearly'], [1, 'Yearly']] }]],
      c(v) { const a = v.p * Math.pow(1 + v.rate / 100 / v.n, v.n * v.yrs); return { main: ['Maturity value', rs(a)], rows: [['Amount deposited', rs(v.p)], ['Interest earned', rs(a - v.p)], ['Effective annual yield', pct((Math.pow(1 + v.rate / 100 / v.n, v.n) - 1) * 100)]], bar: [['Deposit', v.p, 'var(--pri)'], ['Interest', a - v.p, '#10b981']] }; } },
    'ppf-calculator': {
      f: [['dep', 'Yearly deposit', 150000, { suf: '₹', min: 500, max: 150000, hint: 'Min ₹500, max ₹1,50,000 per year' }], ['rate', 'PPF interest rate', 7.1, { suf: '%', step: 0.05, hint: 'Rate is revised quarterly; check the current rate' }], ['yrs', 'Years', 15, { suf: 'years', min: 15, max: 50, step: 5 }]],
      c(v) { const d = Math.min(Math.max(v.dep, 0), 150000); let b = 0; const rows = []; for (let y = 1; y <= v.yrs; y++) { b = (b + d) * (1 + v.rate / 100); rows.push([y, rs(d * y), rs(b)]); }
        return { main: ['Maturity value (tax-free)', rs(b)], rows: [['Total deposited', rs(d * v.yrs)], ['Total interest', rs(b - d * v.yrs)]], bar: [['Deposits', d * v.yrs, 'var(--pri)'], ['Interest', b - d * v.yrs, '#10b981']], table: { title: 'Balance by year', head: ['Year', 'Deposited', 'Balance'], rows }, note: 'Assumes deposits made by 5 April each year so they earn interest for the full year.' }; } },
    'income-tax-calculator': {
      f: [['inc', 'Annual income (gross)', 1500000, { suf: '₹' }], ['sal', 'Salaried / pensioner?', 'y', { sel: [['y', 'Yes – apply standard deduction'], ['n', 'No']] }], ['age', 'Age', 'a', { sel: [['a', 'Below 60'], ['s', '60 to 79'], ['ss', '80 and above']] }], ['ded', 'Deductions (old regime only)', 0, { suf: '₹', hint: '80C, 80D, HRA, home loan interest, etc.' }]],
      c(v) {
        const slab = (x, s) => { let t = 0, prev = 0; for (const [lim, r] of s) { if (x > prev) t += (Math.min(x, lim) - prev) * r; prev = lim; } return t; };
        const sur = (t, x, cap) => { const r = x > 5e7 ? (cap ? .25 : .37) : x > 2e7 ? .25 : x > 1e7 ? .15 : x > 5e6 ? .10 : 0; return t * r; };
        const nTax = (() => { const ti = Math.max(v.inc - (v.sal === 'y' ? 75000 : 0), 0); let t = slab(ti, [[4e5, 0], [8e5, .05], [12e5, .10], [16e5, .15], [20e5, .20], [24e5, .25], [Infinity, .30]]);
          if (ti <= 12e5) t = 0; else t = Math.min(t, ti - 12e5); const s = sur(t, ti, 1); return { ti, t, s, tot: (t + s) * 1.04 }; })();
        const oTax = (() => { const ti = Math.max(v.inc - (v.sal === 'y' ? 50000 : 0) - v.ded, 0); const ex = v.age === 'ss' ? 5e5 : v.age === 's' ? 3e5 : 2.5e5;
          let t = slab(ti, [[ex, 0], [5e5, .05], [1e6, .20], [Infinity, .30]]); if (ti <= 5e5) t = 0; const s = sur(t, ti, 0); return { ti, t, s, tot: (t + s) * 1.04 }; })();
        const best = nTax.tot <= oTax.tot ? 'New regime' : 'Old regime', save = Math.abs(nTax.tot - oTax.tot);
        return { main: ['Tax payable (new regime)', rs(nTax.tot)], rows: [['Taxable income – new', rs(nTax.ti)], ['Tax + surcharge – new', rs(nTax.t + nTax.s)], ['Health & education cess (4%)', rs((nTax.t + nTax.s) * .04)], ['Taxable income – old', rs(oTax.ti)], ['Tax payable – old regime', rs(oTax.tot)], ['Better option', best + (save ? ' (saves ' + rs(save) + ')' : '')], ['Monthly tax (new)', rs(nTax.tot / 12)]],
          note: 'FY 2026-27 (AY 2027-28) slabs for resident individuals. New regime: 87A rebate up to ₹12 lakh taxable income with marginal relief. Old regime: rebate up to ₹5 lakh. Surcharge marginal relief and special-rate income (capital gains) are not included. This is an estimate, not tax advice.' }; } },
    'percentage-calculator': {
      f: [['m', 'What do you want to find?', 'of', { sel: [['of', 'What is X% of Y?'], ['is', 'X is what % of Y? (marks %)'], ['ch', '% change from X to Y'], ['add', 'Y increased / decreased by X%']] }], ['x', 'X', 25, {}], ['y', 'Y', 400, {}]],
      c(v) { const { x, y } = v; if (v.m === 'of') return { main: [x + '% of ' + y, fmt(x / 100 * y, 4)] };
        if (v.m === 'is') return { main: [x + ' is', pct(x / y * 100)], rows: [['Fraction', x + ' / ' + y]] };
        if (v.m === 'ch') { const c = (y - x) / Math.abs(x) * 100; return { main: [c >= 0 ? 'Increase' : 'Decrease', pct(Math.abs(c))], rows: [['Difference', fmt(y - x, 4)]] }; }
        return { main: [y + ' + ' + x + '%', fmt(y * (1 + x / 100), 4)], rows: [[y + ' − ' + x + '%', fmt(y * (1 - x / 100), 4)]] }; } },
    'discount-calculator': {
      f: [['p', 'Original price (MRP)', 2999, { suf: '₹' }], ['d', 'Discount', 40, { suf: '%' }], ['d2', 'Extra discount', 0, { suf: '%', hint: 'e.g. bank offer or coupon applied after the first discount' }]],
      c(v) { const f = v.p * (1 - v.d / 100) * (1 - v.d2 / 100); return { main: ['You pay', '₹' + fmt(f)], rows: [['You save', '₹' + fmt(v.p - f)], ['Effective discount', pct(v.p ? (1 - f / v.p) * 100 : 0)]], bar: [['You pay', f, 'var(--pri)'], ['Savings', v.p - f, '#10b981']] }; } },
    'bmi-calculator': {
      f: [['h', 'Height', 170, { suf: 'cm' }], ['w', 'Weight', 68, { suf: 'kg' }]],
      c(v) { const m = v.h / 100, b = v.w / (m * m);
        const who = b < 18.5 ? 'Underweight' : b < 25 ? 'Normal' : b < 30 ? 'Overweight' : 'Obese';
        const asia = b < 18.5 ? 'Underweight' : b < 23 ? 'Normal' : b < 25 ? 'Overweight' : 'Obese';
        return { main: ['Your BMI', fmt(b, 1)], rows: [['WHO category', who], ['Asian-Indian category', asia], ['Healthy weight (Asian, 18.5–22.9)', fmt(18.5 * m * m, 1) + ' – ' + fmt(22.9 * m * m, 1) + ' kg'], ['Healthy weight (WHO, 18.5–24.9)', fmt(18.5 * m * m, 1) + ' – ' + fmt(24.9 * m * m, 1) + ' kg']], note: 'BMI is a screening tool, not a diagnosis. Please consult a doctor for health advice.' }; } },
    'age-calculator': {
      f: [['dob', 'Date of birth', '2000-01-01', { type: 'date' }], ['on', 'Age on', today(), { type: 'date' }]],
      c(v) { const a = new Date(v.dob + 'T00:00'), b = new Date(v.on + 'T00:00'); if (isNaN(a) || isNaN(b) || b < a) return { main: ['Age', '—'], note: 'Enter a valid date of birth before the "age on" date.' };
        let y = b.getFullYear() - a.getFullYear(), mo = b.getMonth() - a.getMonth(), d = b.getDate() - a.getDate();
        if (d < 0) { mo--; d += new Date(b.getFullYear(), b.getMonth(), 0).getDate(); } if (mo < 0) { y--; mo += 12; }
        const days = Math.round((b - a) / 864e5); let nb = new Date(b.getFullYear(), a.getMonth(), a.getDate()); if (nb < b) nb.setFullYear(nb.getFullYear() + 1);
        return { main: ['Exact age', y + ' years, ' + mo + ' months, ' + d + ' days'], rows: [['Total months', fmt(y * 12 + mo)], ['Total weeks', fmt(Math.floor(days / 7))], ['Total days', fmt(days)], ['Next birthday in', Math.round((nb - b) / 864e5) + ' days'], ['Born on a', a.toLocaleDateString('en-IN', { weekday: 'long' })]] }; } },
  };

  CW.tools.calc = function (box, slug) {
    const cfg = C[slug]; const vals = {}; const inputs = {};
    const form = el('div', { class: 'stack' }), out = el('div', { class: 'res', 'aria-live': 'polite' }), tbl = el('div');
    cfg.f.forEach(([id, label, def, o]) => {
      let inp;
      if (o.sel) { inp = el('select', { id: 'f_' + id }, o.sel.map(([v, l]) => el('option', { value: v, selected: v === def }, l))); }
      else inp = el('input', { id: 'f_' + id, type: o.type || 'number', value: def, min: o.min ?? (o.r && o.r[0]), max: o.max, step: o.step || (o.r && o.r[2]) || 'any', inputmode: o.type ? null : 'decimal' });
      inputs[id] = inp;
      const wrap = el('div', { class: 'fld' }, el('label', { for: 'f_' + id }, label), o.suf ? el('div', { class: 'inp-suf' }, inp, el('span', {}, o.suf)) : inp);
      if (o.r) { const rg = el('input', { type: 'range', min: o.r[0], max: o.r[1], step: o.r[2], value: def, 'aria-label': label }); rg.oninput = () => { inp.value = rg.value; run(); }; inp.addEventListener('input', () => rg.value = inp.value); wrap.append(rg); }
      if (o.hint) wrap.append(el('div', { class: 'hint' }, o.hint));
      form.append(wrap); inp.addEventListener('input', run); inp.addEventListener('change', run);
    });
    function run() {
      cfg.f.forEach(([id, , def, o]) => { const raw = inputs[id].value; vals[id] = o.sel ? (isNaN(+raw) ? raw : +raw) : o.type ? raw : (raw === '' ? 0 : +raw); });
      let r; try { r = cfg.c(vals); } catch (e) { r = { main: ['Result', '—'] }; }
      const kids = [el('div', { class: 'big' }, el('small', {}, r.main[0]), r.main[1])];
      if (r.bar) { const tot = r.bar.reduce((s, b) => s + Math.max(b[1], 0), 0) || 1; kids.push(el('div', { class: 'bar' }, r.bar.map(b => el('i', { style: `width:${Math.max(b[1], 0) / tot * 100}%;background:${b[2]}` }))), el('div', { class: 'legend' }, r.bar.map(b => el('span', {}, el('i', { style: 'background:' + b[2] }), b[0] + ' ' + fmt(Math.max(b[1], 0) / tot * 100, 1) + '%')))); }
      if (r.rows) kids.push(el('table', { class: 'kv' }, el('tbody', {}, r.rows.map(([a, b]) => el('tr', {}, el('td', {}, a), el('td', {}, b))))));
      kids.push(el('div', { class: 'btns' }, el('button', { class: 'btn sec sm', onclick: () => CW.copy([r.main.join(': '), ...(r.rows || []).map(x => x.join(': '))].join('\n') + '\n— ConvertWiz ' + location.href) }, '📋 Copy result')));
      if (r.note) kids.push(el('div', { class: 'note' }, r.note));
      out.replaceChildren(...kids);
      tbl.replaceChildren(...(r.table ? [el('h3', {}, r.table.title), el('div', { class: 'scroll' }, el('table', { class: 'sched' }, el('thead', {}, el('tr', {}, r.table.head.map(h => el('th', {}, h)))), el('tbody', {}, r.table.rows.map(rw => el('tr', {}, rw.map(c => el('td', {}, c)))))))] : []));
    }
    box.append(el('div', { class: 'two' }, form, out), tbl); run();
  };
})();
