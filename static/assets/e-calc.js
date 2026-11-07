/* Calculator engine: declarative inputs -> live results */
(function () {
  const { el, fmt, rs } = CW;
  const pct = n => fmt(n, 2) + '%';
  const today = () => new Date().toISOString().slice(0, 10);
  const L = n => { const a = Math.abs(n), s = n < 0 ? '-' : ''; return a >= 1e7 ? s + '₹' + fmt(a / 1e7, a >= 1e9 ? 0 : 2) + ' Cr' : a >= 1e5 ? s + '₹' + fmt(a / 1e5, 2) + ' L' : a >= 1e3 ? s + '₹' + fmt(a / 1e3, 1) + 'K' : s + '₹' + fmt(a, 0); };
  const NS = 'http://www.w3.org/2000/svg';
  const sv = (t, a) => { const e = document.createElementNS(NS, t); for (const k in a) { const v = String(a[k]); if ((k === 'stroke' || k === 'fill') && v.startsWith('var(')) e.style[k] = v; else e.setAttribute(k, v); } return e; };
  const niceMax = v => { if (v <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(v))), m = v / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p; };
  // Responsive SVG line chart with tap/hover read-out. cfg: {title, x:[labels], s:[{n,c,d,area,dash}], mark, xl}
  function chart(cfg) {
    const sm = innerWidth < 640, W = sm ? 400 : 640, H = sm ? 250 : 260, l = sm ? 58 : 64, r = 12, t = 14, b = 30, iw = W - l - r, ih = H - t - b, n = cfg.x.length;
    const max = niceMax(Math.max(...cfg.s.flatMap(x => x.d)) * 1.04), X = i => l + (n > 1 ? i / (n - 1) : .5) * iw, Y = v => t + ih - Math.max(v, 0) / max * ih;
    const svg = sv('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart-svg', role: 'img', 'aria-label': cfg.title });
    for (let k = 0; k <= 4; k++) { const v = max * k / 4, y = Y(v); svg.append(sv('line', { x1: l, x2: W - r, y1: y, y2: y, class: 'ch-grid' })); const tx = sv('text', { x: l - 8, y: y + 4, 'text-anchor': 'end', class: 'ch-lbl' }); tx.textContent = L(v); svg.append(tx); }
    const step = Math.max(1, Math.ceil(n / (sm ? 5 : 8)));
    cfg.x.forEach((lab, i) => { if ((i % step && i !== n - 1) || (i !== n - 1 && n - 1 - i < step * .7)) return; const tx = sv('text', { x: X(i), y: H - 9, 'text-anchor': 'middle', class: 'ch-lbl' }); tx.textContent = lab; svg.append(tx); });
    if (cfg.mark != null) svg.append(sv('line', { x1: X(cfg.mark), x2: X(cfg.mark), y1: t, y2: t + ih, class: 'ch-mark' }));
    cfg.s.forEach(se => { const pts = se.d.map((v, i) => X(i).toFixed(1) + ',' + Y(v).toFixed(1));
      if (se.area) svg.append(sv('path', { d: 'M' + X(0) + ',' + Y(0) + ' L' + pts.join(' L') + ' L' + X(n - 1) + ',' + Y(0) + 'Z', fill: se.c, 'fill-opacity': .12, stroke: 'none' }));
      svg.append(sv('path', { d: 'M' + pts.join(' L'), fill: 'none', stroke: se.c, 'stroke-width': 2.6, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'stroke-dasharray': se.dash ? '6 5' : 'none' })); });
    const vl = sv('line', { y1: t, y2: t + ih, class: 'ch-hover', visibility: 'hidden' }), dots = cfg.s.map(se => sv('circle', { r: 4.5, fill: se.c, stroke: '#fff', 'stroke-width': 1.5, visibility: 'hidden' }));
    svg.append(vl, ...dots);
    const tip = el('div', { class: 'ch-tip', hidden: true }), wrap = el('div', { class: 'chart' }, el('h4', {}, cfg.title), el('div', { class: 'legend' }, cfg.s.map(se => el('span', {}, el('i', { style: 'background:' + se.c }), se.n))), el('div', { class: 'ch-box' }, svg, tip));
    const show = ev => { const bx = svg.getBoundingClientRect(), px = (ev.clientX - bx.left) / bx.width * W, i = Math.min(n - 1, Math.max(0, Math.round((px - l) / iw * (n - 1))));
      vl.setAttribute('x1', X(i)); vl.setAttribute('x2', X(i)); vl.setAttribute('visibility', 'visible');
      dots.forEach((d, k) => { d.setAttribute('cx', X(i)); d.setAttribute('cy', Y(cfg.s[k].d[i])); d.setAttribute('visibility', 'visible'); });
      tip.replaceChildren(el('b', {}, (cfg.xl || '') + (cfg.xl ? String(cfg.x[i]).replace(/^[YM](?=\d)/, '') : cfg.x[i])), ...cfg.s.map(se => el('div', {}, el('i', { style: 'background:' + se.c }), se.n + ': ' + rs(se.d[i]))));
      tip.hidden = false; const left = X(i) / W * 100; tip.style.left = left > 55 ? '' : 'calc(' + left + '% + 12px)'; tip.style.right = left > 55 ? 'calc(' + (100 - left) + '% + 12px)' : ''; };
    svg.addEventListener('pointermove', show); svg.addEventListener('pointerdown', show);
    const hide = () => { tip.hidden = true; vl.setAttribute('visibility', 'hidden'); dots.forEach(d => d.setAttribute('visibility', 'hidden')); };
    svg.addEventListener('pointerleave', ev => { if (ev.pointerType === 'mouse') hide(); }); // on touch, keep the read-out until the user taps elsewhere
    svg._hide = hide;
    return wrap;
  }
  document.addEventListener('pointerdown', ev => document.querySelectorAll('.chart-svg').forEach(s => { if (s._hide && !s.contains(ev.target)) s._hide(); }), { passive: true });
  // monthly IRR of cash flows (cf[0] = money received, later = payments as negatives) -> annual % (nominal)
  function irr(cf) { const f = r => cf.reduce((s, c, k) => s + c / Math.pow(1 + r, k), 0); let lo = 0, hi = .2; if (f(lo) > 0 || f(hi) < 0) return NaN; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; f(m) < 0 ? lo = m : hi = m; } return lo * 1200; }
  // amortise a loan: P, monthly rate r, months n, EMI e, optional extra payment fn(month) -> {months, interest, yearly[{p,i,bal}], cross}
  function amort(P, r, n, e, extra) { let bal = P, ti = 0, m = 0, cross = null; const yr = [];
    while (bal > 0.5 && m < n + 600) { const it = bal * r, pr = Math.min(e - it + (extra ? extra(m + 1) : 0), bal); if (pr <= 0) break; if (cross == null && e - it > it) cross = m + 1; bal -= pr; ti += it; const y = Math.floor(m / 12); (yr[y] = yr[y] || { p: 0, i: 0, bal: 0 }); yr[y].p += pr; yr[y].i += it; yr[y].bal = Math.max(bal, 0); m++; }
    return { months: m, interest: ti, yearly: yr, cross }; }
  const emiOf = (P, r, n) => r ? P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : P / n;
  const yrsTxt = m => { const y = Math.floor(m / 12), mo = m % 12; return (y ? y + (y === 1 ? ' year' : ' years') : '') + (y && mo ? ' ' : '') + (mo ? mo + (mo === 1 ? ' month' : ' months') : ''); };
  const LOANS = {
    home: ['Home loan', { p: [3000000, 100000, 50000000, 50000], rate: 8.5, yrs: [20, 1, 30, 1], fee: 0.5 }],
    car: ['Car loan', { p: [800000, 50000, 10000000, 10000], rate: 9, yrs: [5, 1, 7, 1], fee: 0.5 }],
    bike: ['Two-wheeler loan', { p: [100000, 10000, 1000000, 5000], rate: 11, yrs: [3, 1, 5, 1], fee: 1 }],
    personal: ['Personal loan', { p: [500000, 10000, 4000000, 10000], rate: 11.5, yrs: [4, 1, 7, 1], fee: 2 }],
    edu: ['Education loan', { p: [1000000, 50000, 15000000, 50000], rate: 9.5, yrs: [10, 1, 15, 1], fee: 0 }],
    gold: ['Gold loan', { p: [200000, 10000, 5000000, 5000], rate: 9.5, yrs: [1, 0.25, 3, 0.25], fee: 0.5 }],
    lap: ['Loan against property', { p: [2500000, 100000, 50000000, 50000], rate: 9.75, yrs: [15, 1, 20, 1], fee: 1 }],
    biz: ['Business loan', { p: [1000000, 50000, 20000000, 50000], rate: 14, yrs: [5, 1, 10, 1], fee: 2 }],
  };
  // f: fields [id,label,default,opts]; opts: {suf, min, max, step, r:[min,max,step], sel:[[v,label]], type, hint, show:v=>bool}
  const C = {
    'gst-calculator': {
      f: [['amt', 'Amount', 10000, { suf: '₹' }], ['rate', 'GST rate', 18, { sel: [[5, '5% (essentials)'], [18, '18% (standard)'], [40, '40% (luxury / sin goods)'], [3, '3% (gold, silver)'], [0.25, '0.25% (rough diamonds)'], [12, '12% (old slab)'], [28, '28% (old slab)']] }],
        ['mode', 'Calculation', 'add', { sel: [['add', 'Add GST (price excludes GST)'], ['rem', 'Remove GST (price includes GST)']] }]],
      c(v) { const r = v.rate / 100; let net, gst; if (v.mode === 'add') { net = v.amt; gst = net * r; } else { net = v.amt / (1 + r); gst = v.amt - net; }
        return { main: ['Total incl. GST', '₹' + fmt(net + gst)], rows: [['Price before GST', '₹' + fmt(net)], ['GST @ ' + v.rate + '%', '₹' + fmt(gst)], ['CGST (' + v.rate / 2 + '%)', '₹' + fmt(gst / 2)], ['SGST (' + v.rate / 2 + '%)', '₹' + fmt(gst / 2)], ['IGST (inter-state)', '₹' + fmt(gst)]], bar: [['Net price', net, 'var(--pri)'], ['GST', gst, '#f59e0b']] }; } },
    'emi-calculator': {
      f: [['type', 'Loan type', 'home', { sel: Object.entries(LOANS).map(([k, v]) => [k, v[0]]), preset: k => LOANS[k][1], hint: 'Sets typical Indian bank rates and limits. Change any value to match your offer letter.' }],
        ['p', 'Loan amount', 3000000, { suf: '₹', r: [100000, 50000000, 50000] }], ['rate', 'Interest rate (p.a.)', 8.5, { suf: '%', r: [1, 30, 0.05] }], ['yrs', 'Tenure', 20, { suf: 'years', r: [1, 30, 1] }],
        ['mor', 'Course + moratorium period', 4, { suf: 'years', r: [0, 7, 0.5], show: v => v.type === 'edu', hint: 'Course length plus 6–12 months. Interest builds up during this time.' }],
        ['morpay', 'Interest during study', 'n', { sel: [['n', 'Not paid – added to the loan'], ['y', 'Paid monthly while studying']], show: v => v.type === 'edu' }],
        ['rep', 'Repayment type', 'emi', { sel: [['emi', 'Monthly EMI'], ['int', 'Bullet – interest monthly, principal at end'], ['end', 'Bullet – principal + interest at end']], show: v => v.type === 'gold' }],
        ['fee', 'Processing fee', 0.5, { suf: '%', step: 0.05, hint: 'One-time lender fee; 18% GST is added on it' }]],
      c(v) {
        const r = v.rate / 1200, n = Math.max(1, Math.round(v.yrs * 12)), fee = v.p * v.fee / 100 * 1.18, ins = [], charts = [];
        let P = v.p, morInt = 0;
        if (v.type === 'edu' && v.mor > 0) { morInt = v.p * v.rate / 100 * v.mor; if (v.morpay === 'n') P = v.p + morInt; }
        // Gold-loan bullet options (simple interest, as most lenders charge)
        if (v.type === 'gold' && v.rep !== 'emi') {
          const tot = v.p * v.rate / 100 * (n / 12), mi = tot / n, eA = amort(v.p, r, n, emiOf(v.p, r, n));
          const cf = v.rep === 'int' ? [v.p - fee, ...Array(n - 1).fill(-mi), -(mi + v.p)] : [v.p - fee, ...Array(n - 1).fill(0), -(v.p + tot)];
          ins.push(v.rep === 'int' ? 'You pay only ' + rs(mi) + ' interest each month and return the full ' + rs(v.p) + ' after ' + yrsTxt(n) + '.' : 'Nothing to pay monthly: you repay ' + rs(v.p + tot) + ' in one go after ' + yrsTxt(n) + '. Check whether your lender adds penal interest if you are late.',
            'On monthly EMIs the same loan would cost ' + rs(eA.interest) + ' interest – ' + rs(Math.abs(tot - eA.interest)) + (tot >= eA.interest ? ' less than this bullet option' : ' more than this bullet option') + ', because EMIs repay principal as you go.',
            'Gold loans are usually limited to 75% of your gold\'s value (LTV). If gold prices fall, the lender may ask for a top-up.');
          const xs = Array.from({ length: n + 1 }, (_, k) => k), owed = xs.map(k => v.rep === 'int' ? (k < n ? v.p : 0) : (k < n ? v.p + tot * k / n : 0)), paid = xs.map(k => v.rep === 'int' ? mi * k + (k === n ? v.p : 0) : (k === n ? v.p + tot : 0));
          charts.push({ title: 'What you owe vs what you have paid', x: xs.map(k => 'M' + k), xl: 'Month ', s: [{ n: 'Amount owed', c: '#ef4444', d: owed, area: 1 }, { n: 'Total paid so far', c: 'var(--pri)', d: paid }] });
          return { main: [v.rep === 'int' ? 'Monthly interest' : 'Pay at the end', rs(v.rep === 'int' ? mi : v.p + tot)], rows: [['Loan amount', rs(v.p)], ['Total interest', rs(tot)], ['Processing fee (incl. GST)', rs(fee)], ['Total cost of the loan', rs(tot + fee)], ['Effective rate incl. fee (APR)', isFinite(irr(cf)) ? fmt(irr(cf), 2) + '%' : '—']],
            bar: [['Principal', v.p, 'var(--pri)'], ['Interest', tot, '#f59e0b']], ins, charts };
        }
        const emi = emiOf(P, r, n), A = amort(P, r, n, emi), tot = emi * n;
        const cf = [v.p - fee, ...(v.type === 'edu' && v.morpay === 'y' ? Array(Math.round(v.mor * 12)).fill(-v.p * r) : Array(Math.round(v.type === 'edu' ? v.mor * 12 : 0)).fill(0)), ...Array(n).fill(-emi)], apr = irr(cf);
        const yrs = A.yearly, x = yrs.map((_, i) => 'Y' + (i + 1));
        // insights
        const y1 = yrs[0]; ins.push('In year 1, ' + rs(y1.i) + ' of the ' + rs(y1.i + y1.p) + ' you pay (' + fmt(y1.i / (y1.i + y1.p) * 100, 0) + '%) goes to interest.');
        if (A.cross && A.cross > 1) ins.push('From EMI no. ' + A.cross + ' (' + yrsTxt(A.cross) + ' in), more of each EMI repays principal than interest – the lines cross in the first chart.'); else ins.push('From the very first EMI, more goes to principal than to interest.');
        const half = yrs[Math.max(0, Math.ceil(yrs.length / 2) - 1)]; if (yrs.length > 1) ins.push('Halfway through the tenure you will still owe ' + rs(half.bal) + ' (' + fmt(half.bal / P * 100, 0) + '% of the loan).');
        if (n >= 24) { const X1 = amort(P, r, n, emi, m => m % 12 === 0 ? emi : 0); ins.push('Paying one extra EMI every year would close the loan in ' + yrsTxt(X1.months) + ' instead of ' + yrsTxt(n) + ' and save ' + rs(A.interest - X1.interest) + ' interest.'); }
        if (['home', 'lap'].includes(v.type)) { const up = emiOf(P, (v.rate + .5) / 1200, n); ins.push('Floating rate: a 0.5% rate rise would increase the EMI by ' + rs(up - emi) + ' a month (or banks may extend the tenure instead).'); }
        if (v.type === 'home') ins.push('Tax (old regime, self-occupied home): interest up to ₹2,00,000 a year is deductible under Sec 24(b) and principal up to ₹1,50,000 under Sec 80C. Your year-1 interest is ' + rs(y1.i) + ', principal ' + rs(y1.p) + '.');
        if (v.type === 'edu') { if (morInt) ins.push(v.morpay === 'n' ? rs(morInt) + ' simple interest builds up during the ' + v.mor + '-year study period and is added to the loan, so EMIs start on ' + rs(P) + '.' : 'While studying you pay ' + rs(v.p * r) + ' a month as interest (' + rs(morInt) + ' in total); EMIs then start on the original ' + rs(v.p) + '.'); ins.push('Interest on an education loan is fully deductible under Sec 80E for up to 8 years (old regime).'); }
        if (v.type === 'car' || v.type === 'bike') { if (n > 36) { const s3 = amort(P, r, 36, emiOf(P, r, 36)); ins.push('Vehicles lose value quickly. A 3-year tenure would raise the EMI to ' + rs(emiOf(P, r, 36)) + ' but save ' + rs(A.interest - s3.interest) + ' interest.'); } else ins.push('Short tenure – good choice for a vehicle that loses value quickly.'); }
        if (['personal', 'biz'].includes(v.type)) ins.push('Unsecured loans often charge 2–5% for prepayment or foreclosure; check this before choosing a long tenure.');
        charts.push({ title: 'Interest vs principal paid each year', x, xl: 'Year ', s: [{ n: 'Interest', c: '#f59e0b', d: yrs.map(y => y.i) }, { n: 'Principal', c: 'var(--pri)', d: yrs.map(y => y.p) }], mark: A.cross ? Math.floor((A.cross - 1) / 12) : null },
          { title: 'Loan balance remaining', x: ['Start', ...x], xl: '', s: [{ n: 'Balance', c: '#ef4444', d: [P, ...yrs.map(y => y.bal)], area: 1 }, { n: 'Total interest paid', c: '#f59e0b', d: [0, ...yrs.map((_, i) => yrs.slice(0, i + 1).reduce((a, b) => a + b.i, 0))], dash: 1 }] });
        const rows = [['Loan amount', rs(v.p)]];
        if (v.type === 'edu' && morInt) rows.push([v.morpay === 'n' ? 'Interest added during study' : 'Interest paid during study', rs(morInt)]);
        rows.push(['Total interest (EMIs)', rs(tot - P)], ['Processing fee (incl. GST)', rs(fee)], ['Total payable', rs(tot + fee + (v.type === 'edu' && v.morpay === 'y' ? morInt : 0))], ['Effective rate incl. fee (APR)', isFinite(apr) ? fmt(apr, 2) + '%' : '—']);
        return { main: ['Monthly EMI', rs(emi)], rows, bar: [['Principal', v.p, 'var(--pri)'], ['Interest', tot - v.p + (v.type === 'edu' && v.morpay === 'y' ? morInt : 0), '#f59e0b']], ins, charts,
          table: { title: 'Year-by-year repayment schedule', head: ['Year', 'Principal paid', 'Interest paid', 'Balance'], rows: yrs.map((y, i) => [i + 1, rs(y.p), rs(y.i), rs(y.bal)]) }, note: 'Rates shown are typical; your bank\'s offer depends on your credit score and income.' }; } },
    'sip-calculator': {
      f: [['amt', 'Monthly SIP', 5000, { suf: '₹', r: [500, 200000, 500] }], ['rate', 'Expected return (p.a.)', 12, { suf: '%', r: [1, 30, 0.5] }], ['yrs', 'Time period', 10, { suf: 'years', r: [1, 40, 1] }], ['step', 'Annual step-up', 0, { suf: '%', r: [0, 50, 1], hint: 'Increase your SIP by this % every year' }]],
      c(v) { const i = v.rate / 1200; let bal = 0, inv = 0, s = v.amt; const rows = [];
        for (let y = 1; y <= v.yrs; y++) { for (let m = 0; m < 12; m++) { bal = (bal + s) * (1 + i); inv += s; } rows.push([y, rs(s), rs(inv), rs(bal)]); s *= 1 + v.step / 100; }
        const sim = (yrs, step) => { let b = 0, iv = 0, a = v.amt; const Y = []; for (let y = 1; y <= yrs; y++) { for (let m = 0; m < 12; m++) { b = (b + a) * (1 + i); iv += a; } Y.push([iv, b]); a *= 1 + step / 100; } return Y; };
        const Y = sim(v.yrs, v.step), ins = [], over = Y.findIndex(([iv, b]) => b - iv > iv);
        if (over >= 0) ins.push('From year ' + (over + 1) + ', your returns are bigger than everything you have invested – compounding takes over.'); else ins.push('Returns stay below your invested amount in this period; longer horizons let compounding work harder.');
        if (v.yrs > 5) { const late = sim(v.yrs - 5, v.step); ins.push('Starting 5 years later would give ' + rs(late[late.length - 1][1]) + ' – ' + rs(bal - late[late.length - 1][1]) + ' less.'); }
        if (v.step > 0) { const flat = sim(v.yrs, 0); ins.push('Your ' + v.step + '% yearly step-up adds ' + rs(bal - flat[flat.length - 1][1]) + ' compared with a flat SIP.'); } else { const st = sim(v.yrs, 10); ins.push('Raising the SIP by 10% each year would grow it to ' + rs(st[st.length - 1][1]) + '.'); }
        const charts = [{ title: 'Invested vs estimated value', x: Y.map((_, k) => 'Y' + (k + 1)), xl: 'Year ', s: [{ n: 'Estimated value', c: '#10b981', d: Y.map(y => y[1]), area: 1 }, { n: 'Invested', c: 'var(--pri)', d: Y.map(y => y[0]) }], mark: over >= 0 ? over : null }];
        return { main: ['Estimated value', rs(bal)], rows: [['Total invested', rs(inv)], ['Estimated returns', rs(bal - inv)], ['Wealth gain', pct(inv ? (bal - inv) / inv * 100 : 0)]], bar: [['Invested', inv, 'var(--pri)'], ['Returns', bal - inv, '#10b981']], ins, charts, table: { title: 'Growth by year', head: ['Year', 'Monthly SIP', 'Invested', 'Value'], rows }, note: 'Estimate at a constant return. Mutual fund investments are subject to market risks.' }; } },
    'fd-calculator': {
      f: [['p', 'Deposit amount', 100000, { suf: '₹' }], ['rate', 'Interest rate (p.a.)', 7, { suf: '%', step: 0.05 }], ['yrs', 'Tenure', 5, { suf: 'years', step: 0.25 }], ['n', 'Compounding', 4, { sel: [[4, 'Quarterly (most banks)'], [12, 'Monthly'], [2, 'Half-yearly'], [1, 'Yearly']] }]],
      c(v) { const g = t => v.p * Math.pow(1 + v.rate / 100 / v.n, v.n * t), a = g(v.yrs), ys = Math.max(1, Math.ceil(v.yrs)), xs = Array.from({ length: ys + 1 }, (_, k) => Math.min(k, v.yrs));
        const yi = Array.from({ length: ys }, (_, k) => g(Math.min(k + 1, v.yrs)) - g(k)), ins = [];
        if (v.rate > 0) ins.push('At ' + v.rate + '% your money doubles in about ' + fmt(Math.log(2) / (v.n * Math.log(1 + v.rate / 100 / v.n)), 1) + ' years.');
        const maxI = Math.max(...yi); ins.push(maxI > 50000 ? 'Interest crosses ₹50,000 in a year (₹1,00,000 for senior citizens), so the bank will deduct TDS. Submit Form 15G/15H if your total income is below the taxable limit.' : 'Yearly interest stays under ₹50,000, the TDS limit for most depositors.');
        ins.push('FD interest is taxed at your income-tax slab rate. At 30% tax your post-tax return is about ' + fmt(v.rate * .7 * 1.0, 2) + '% (plus cess).');
        return { main: ['Maturity value', rs(a)], rows: [['Amount deposited', rs(v.p)], ['Interest earned', rs(a - v.p)], ['Effective annual yield', pct((Math.pow(1 + v.rate / 100 / v.n, v.n) - 1) * 100)]], bar: [['Deposit', v.p, 'var(--pri)'], ['Interest', a - v.p, '#10b981']], ins,
          charts: [{ title: 'How your deposit grows', x: xs.map(t => t ? 'Y' + fmt(t, 2) : 'Start'), xl: '', s: [{ n: 'Value', c: '#10b981', d: xs.map(g), area: 1 }, { n: 'Deposit', c: 'var(--pri)', d: xs.map(() => v.p), dash: 1 }] }] }; } },
    'ppf-calculator': {
      f: [['dep', 'Yearly deposit', 150000, { suf: '₹', min: 500, max: 150000, hint: 'Min ₹500, max ₹1,50,000 per year' }], ['rate', 'PPF interest rate', 7.1, { suf: '%', step: 0.05, hint: 'Rate is revised quarterly; check the current rate' }], ['yrs', 'Years', 15, { suf: 'years', min: 15, max: 50, step: 5 }]],
      c(v) { const d = Math.min(Math.max(v.dep, 0), 150000); let b = 0; const rows = []; for (let y = 1; y <= v.yrs; y++) { b = (b + d) * (1 + v.rate / 100); rows.push([y, rs(d * y), rs(b)]); }
        let bb = 0; const bal = [], dep = [], yi = []; for (let y = 1; y <= v.yrs; y++) { const prev = bb; bb = (bb + d) * (1 + v.rate / 100); bal.push(bb); dep.push(d * y); yi.push(bb - prev - d); }
        const cross = yi.findIndex(x => x > d), ins = [];
        if (cross >= 0) ins.push('From year ' + (cross + 1) + ', the interest you earn each year is more than your yearly deposit.');
        ins.push('Interest makes up ' + fmt((b - d * v.yrs) / b * 100, 0) + '% of the final amount, and all of it is tax-free (EEE).');
        if (v.yrs === 15) { let e = b; for (let y = 0; y < 5; y++) e = (e + d) * (1 + v.rate / 100); ins.push('Extending by one 5-year block with deposits would take it to ' + rs(e) + '.'); }
        return { main: ['Maturity value (tax-free)', rs(b)], rows: [['Total deposited', rs(d * v.yrs)], ['Total interest', rs(b - d * v.yrs)]], bar: [['Deposits', d * v.yrs, 'var(--pri)'], ['Interest', b - d * v.yrs, '#10b981']], ins,
          charts: [{ title: 'PPF balance vs your deposits', x: bal.map((_, k) => 'Y' + (k + 1)), xl: 'Year ', s: [{ n: 'Balance', c: '#10b981', d: bal, area: 1 }, { n: 'Deposited', c: 'var(--pri)', d: dep }, { n: 'Interest that year', c: '#f59e0b', d: yi, dash: 1 }], mark: cross >= 0 ? cross : null }],
          table: { title: 'Balance by year', head: ['Year', 'Deposited', 'Balance'], rows }, note: 'Assumes deposits made by 5 April each year so they earn interest for the full year.' }; } },
    'income-tax-calculator': {
      f: [['inc', 'Annual income (gross)', 1500000, { suf: '₹' }], ['sal', 'Salaried / pensioner?', 'y', { sel: [['y', 'Yes – apply standard deduction'], ['n', 'No']] }], ['age', 'Age', 'a', { sel: [['a', 'Below 60'], ['s', '60 to 79'], ['ss', '80 and above']] }], ['ded', 'Deductions (old regime only)', 0, { suf: '₹', hint: '80C, 80D, HRA, home loan interest, etc.' }]],
      c(v) {
        const slab = (x, s) => { let t = 0, prev = 0; for (const [lim, r] of s) { if (x > prev) t += (Math.min(x, lim) - prev) * r; prev = lim; } return t; };
        const sur = (t, x, cap) => { const r = x > 5e7 ? (cap ? .25 : .37) : x > 2e7 ? .25 : x > 1e7 ? .15 : x > 5e6 ? .10 : 0; return t * r; };
        const newT = inc => { const ti = Math.max(inc - (v.sal === 'y' ? 75000 : 0), 0); let t = slab(ti, [[4e5, 0], [8e5, .05], [12e5, .10], [16e5, .15], [20e5, .20], [24e5, .25], [Infinity, .30]]);
          if (ti <= 12e5) t = 0; else t = Math.min(t, ti - 12e5); const s = sur(t, ti, 1); return { ti, t, s, tot: (t + s) * 1.04 }; };
        const oldT = (inc, ded) => { const ti = Math.max(inc - (v.sal === 'y' ? 50000 : 0) - ded, 0); const ex = v.age === 'ss' ? 5e5 : v.age === 's' ? 3e5 : 2.5e5;
          let t = slab(ti, [[ex, 0], [5e5, .05], [1e6, .20], [Infinity, .30]]); if (ti <= 5e5) t = 0; const s = sur(t, ti, 0); return { ti, t, s, tot: (t + s) * 1.04 }; };
        const nTax = newT(v.inc), oTax = oldT(v.inc, v.ded);
        const best = nTax.tot <= oTax.tot ? 'New regime' : 'Old regime', save = Math.abs(nTax.tot - oTax.tot), ins = [];
        // deductions at which old regime starts to win
        if (nTax.tot <= oTax.tot) { if (oldT(v.inc, v.inc).tot >= nTax.tot) ins.push('The new regime is better for you at any level of deductions.'); else { let lo = v.ded, hi = v.inc; for (let k = 0; k < 50; k++) { const m = (lo + hi) / 2; oldT(v.inc, m).tot > nTax.tot ? lo = m : hi = m; } ins.push('The old regime would win only if your deductions (80C, 80D, HRA, home-loan interest…) exceed ' + rs(Math.ceil(hi / 1000) * 1000) + '.'); } }
        else ins.push('With ' + rs(v.ded) + ' of deductions the old regime saves you ' + rs(save) + '. Remember to choose it when filing (and tell your employer for TDS).');
        ins.push('Your effective tax rate is ' + fmt(v.inc ? nTax.tot / v.inc * 100 : 0, 1) + '% (new regime). ' + (nTax.ti > 12e5 ? 'The top slab applying to you is ' + (nTax.ti > 24e5 ? 30 : nTax.ti > 20e5 ? 25 : nTax.ti > 16e5 ? 20 : 15) + '%.' : 'Income up to ₹12 lakh taxable (₹12.75 lakh for salaried) is tax-free with the 87A rebate.'));
        const top = Math.max(3e6, Math.ceil(v.inc * 1.5 / 5e5) * 5e5), pts = Array.from({ length: 31 }, (_, k) => top * k / 30);
        return { main: ['Tax payable (new regime)', rs(nTax.tot)], rows: [['Taxable income – new', rs(nTax.ti)], ['Tax + surcharge – new', rs(nTax.t + nTax.s)], ['Health & education cess (4%)', rs((nTax.t + nTax.s) * .04)], ['Taxable income – old', rs(oTax.ti)], ['Tax payable – old regime', rs(oTax.tot)], ['Better option', best + (save ? ' (saves ' + rs(save) + ')' : '')], ['Monthly tax (new)', rs(nTax.tot / 12)]], ins,
          charts: [{ title: 'Tax at different incomes (with your deductions)', x: pts.map(p => L(p).replace('₹', '')), xl: 'Income ₹', s: [{ n: 'New regime', c: 'var(--pri)', d: pts.map(p => newT(p).tot) }, { n: 'Old regime', c: '#f59e0b', d: pts.map(p => oldT(p, v.ded).tot), dash: 1 }], mark: Math.round(Math.min(v.inc, top) / top * 30) }],
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
    const cfg = C[slug]; const vals = {}; const inputs = {}, ranges = {}, wraps = {};
    const form = el('div', { class: 'stack' }), out = el('div', { class: 'res', 'aria-live': 'polite' }), tbl = el('div'), extra = el('div', { class: 'calc-extra' });
    cfg.f.forEach(([id, label, def, o]) => {
      let inp;
      if (o.sel) { inp = el('select', { id: 'f_' + id }, o.sel.map(([v, l]) => el('option', { value: v, selected: v === def }, l))); }
      else inp = el('input', { id: 'f_' + id, type: o.type || 'number', value: def, min: o.min ?? (o.r && o.r[0]), max: o.max, step: o.step || (o.r && o.r[2]) || 'any', inputmode: o.type ? null : 'decimal' });
      inputs[id] = inp;
      const wrap = el('div', { class: 'fld' }, el('label', { for: 'f_' + id }, label), o.suf ? el('div', { class: 'inp-suf' }, inp, el('span', {}, o.suf)) : inp);
      if (o.r) { const rg = el('input', { type: 'range', min: o.r[0], max: o.r[1], step: o.r[2], value: def, 'aria-label': label }); rg.oninput = () => { inp.value = rg.value; run(); }; inp.addEventListener('input', () => rg.value = inp.value); wrap.append(rg); ranges[id] = rg; }
      if (o.preset) inp.addEventListener('change', () => { const pr = o.preset(inp.value); for (const k in pr) { const x = pr[k], val = Array.isArray(x) ? x[0] : x; if (!inputs[k]) continue; inputs[k].value = val; if (Array.isArray(x) && ranges[k]) { ranges[k].min = x[1]; ranges[k].max = x[2]; ranges[k].step = x[3]; inputs[k].min = x[1]; inputs[k].step = x[3]; } if (ranges[k]) ranges[k].value = val; } run(); });
      wraps[id] = wrap;
      if (o.hint) wrap.append(el('div', { class: 'hint' }, o.hint));
      form.append(wrap); inp.addEventListener('input', run); inp.addEventListener('change', run);
    });
    function run() {
      cfg.f.forEach(([id, , def, o]) => { const raw = inputs[id].value; vals[id] = o.sel ? (isNaN(+raw) ? raw : +raw) : o.type ? raw : (raw === '' ? 0 : +raw); });
      cfg.f.forEach(([id, , , o]) => { if (o.show) wraps[id].hidden = !o.show(vals); });
      let r; try { r = cfg.c(vals); } catch (e) { r = { main: ['Result', '—'] }; }
      const kids = [el('div', { class: 'big' }, el('small', {}, r.main[0]), r.main[1])];
      if (r.bar) { const tot = r.bar.reduce((s, b) => s + Math.max(b[1], 0), 0) || 1; kids.push(el('div', { class: 'bar' }, r.bar.map(b => el('i', { style: `width:${Math.max(b[1], 0) / tot * 100}%;background:${b[2]}` }))), el('div', { class: 'legend' }, r.bar.map(b => el('span', {}, el('i', { style: 'background:' + b[2] }), b[0] + ' ' + fmt(Math.max(b[1], 0) / tot * 100, 1) + '%')))); }
      if (r.rows) kids.push(el('table', { class: 'kv' }, el('tbody', {}, r.rows.map(([a, b]) => el('tr', {}, el('td', {}, a), el('td', {}, b))))));
      kids.push(el('div', { class: 'btns' }, el('button', { class: 'btn sec sm', onclick: () => CW.copy([r.main.join(': '), ...(r.rows || []).map(x => x.join(': '))].join('\n') + '\n— ConvertWiz ' + location.href) }, '📋 Copy result')));
      if (r.note) kids.push(el('div', { class: 'note' }, r.note));
      out.replaceChildren(...kids);
      const ex = [];
      if (r.ins && r.ins.length) ex.push(el('div', { class: 'insights' }, el('h3', {}, '💡 What this means for you'), el('ul', {}, r.ins.map(t => el('li', {}, t)))));
      if (r.charts) r.charts.forEach(c => { try { if (c.x.length > 1) ex.push(chart(c)); } catch (e) {} });
      extra.replaceChildren(...ex);
      tbl.replaceChildren(...(r.table ? [el('h3', {}, r.table.title), el('div', { class: 'scroll' }, el('table', { class: 'sched' }, el('thead', {}, el('tr', {}, r.table.head.map(h => el('th', {}, h)))), el('tbody', {}, r.table.rows.map(rw => el('tr', {}, rw.map(c => el('td', {}, c)))))))] : []));
    }
    box.append(el('div', { class: 'two' }, form, out), extra, tbl); run();
  };
})();
