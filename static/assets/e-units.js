/* Unit + currency converter engine */
(function () {
  const { el, fmt } = CW;
  // factor to base unit
  const U = {
    'length-converter': { def: ['km', 'mi'], u: { mm: [.001, 'Millimetre'], cm: [.01, 'Centimetre'], m: [1, 'Metre'], km: [1000, 'Kilometre'], in: [.0254, 'Inch'], ft: [.3048, 'Foot'], yd: [.9144, 'Yard'], mi: [1609.344, 'Mile'], nmi: [1852, 'Nautical mile'] } },
    'weight-converter': { def: ['kg', 'lb'], u: { mg: [1e-6, 'Milligram'], g: [.001, 'Gram'], kg: [1, 'Kilogram'], t: [1000, 'Tonne'], q: [100, 'Quintal'], oz: [.028349523125, 'Ounce'], lb: [.45359237, 'Pound'], st: [6.35029318, 'Stone'], tola: [.0116638, 'Tola'] } },
    'height-converter': { def: ['cm', 'ft'], u: { cm: [.01, 'Centimetre'], m: [1, 'Metre'], in: [.0254, 'Inch'], ft: [.3048, 'Foot'] }, ftin: 1 },
    'land-area-converter': { def: ['acre', 'sqft'], u: { sqft: [1, 'Square foot'], sqm: [10.7639104, 'Square metre'], sqyd: [9, 'Square yard (Gaj)'], acre: [43560, 'Acre'], ha: [107639.104, 'Hectare'], cent: [435.6, 'Cent'], guntha: [1089, 'Guntha'], ground: [2400, 'Ground (Tamil Nadu)'], ankanam: [72, 'Ankanam (Andhra/Telangana)'], marla: [272.25, 'Marla (Punjab/Haryana)'], kanal: [5445, 'Kanal (Punjab/Haryana)'], sqkm: [10763910.4, 'Square kilometre'] } },
    'data-storage-converter': { def: ['MB', 'KB'], u: { B: [1, 'Byte'], KB: [1024, 'Kilobyte'], MB: [1048576, 'Megabyte'], GB: [1073741824, 'Gigabyte'], TB: [1099511627776, 'Terabyte'], bit: [.125, 'Bit'] } },
    'speed-converter': { def: ['kmh', 'mph'], u: { kmh: [1 / 3.6, 'Kilometres per hour'], mph: [.44704, 'Miles per hour'], ms: [1, 'Metres per second'], fts: [.3048, 'Feet per second'], kn: [.514444, 'Knot'] } },
    'volume-converter': { def: ['l', 'galus'], u: { ml: [.001, 'Millilitre'], l: [1, 'Litre'], m3: [1000, 'Cubic metre'], galus: [3.785411784, 'US gallon'], galuk: [4.54609, 'UK gallon'], cup: [.2365882365, 'US cup'], tbsp: [.0147867648, 'Tablespoon'], tsp: [.00492892159, 'Teaspoon'], floz: [.0295735296, 'US fluid ounce'] } },
    'temperature-converter': { def: ['c', 'f'], u: { c: [0, 'Celsius (°C)'], f: [0, 'Fahrenheit (°F)'], k: [0, 'Kelvin (K)'] }, temp: 1 },
  };
  const toC = (v, u) => u === 'c' ? v : u === 'f' ? (v - 32) * 5 / 9 : v - 273.15;
  const fromC = (c, u) => u === 'c' ? c : u === 'f' ? c * 9 / 5 + 32 : c + 273.15;
  const nice = n => { if (!isFinite(n)) return '—'; const a = Math.abs(n); return a !== 0 && (a < 1e-4 || a >= 1e12) ? n.toExponential(6) : fmt(n, a < 1 ? 8 : 6); };

  function ui(box, defs, sym, conv, extra) {
    const opts = sel => Object.keys(defs).map(k => el('option', { value: k, selected: k === sel }, defs[k] + ' (' + k + ')'));
    const v = el('input', { type: 'number', value: extra.val || 1, inputmode: 'decimal', step: 'any', id: 'uv' });
    const a = el('select', { 'aria-label': 'From unit' }, opts(extra.def[0])), b = el('select', { 'aria-label': 'To unit' }, opts(extra.def[1]));
    const out = el('div', { class: 'res' }), all = el('div');
    const swap = el('button', { class: 'btn sec', title: 'Swap units', onclick: () => { const t = a.value; a.value = b.value; b.value = t; run(); } }, '⇄');
    function run() {
      const x = parseFloat(v.value) || 0, r = conv(x, a.value, b.value);
      out.replaceChildren(el('div', { class: 'big' }, el('small', {}, nice(x) + ' ' + a.value + ' ='), nice(r) + ' ' + b.value), extra.after ? extra.after(x, a.value) : '', el('div', { class: 'btns' }, el('button', { class: 'btn sec sm', onclick: () => CW.copy(nice(x) + ' ' + a.value + ' = ' + nice(r) + ' ' + b.value) }, '📋 Copy')));
      all.replaceChildren(el('h3', {}, 'All conversions of ' + nice(x) + ' ' + a.value), el('table', { class: 'kv' }, el('tbody', {}, Object.keys(defs).filter(k => k !== a.value).map(k => el('tr', {}, el('td', {}, defs[k]), el('td', {}, nice(conv(x, a.value, k)) + ' ' + k))))));
    }
    [v, a, b].forEach(i => { i.oninput = run; i.onchange = run; });
    box.append(el('div', { class: 'urow' }, el('div', {}, el('label', { for: 'uv' }, 'Value'), v), el('div', {}, el('label', {}, 'From'), a), swap, el('div', {}, el('label', {}, 'To'), b)), el('div', { style: 'margin-top:16px' }, out), all);
    run(); return { run, a, b, v };
  }

  CW.tools.units = function (box, slug) {
    if (slug === 'currency-converter') return currency(box);
    const cfg = U[slug], defs = Object.fromEntries(Object.entries(cfg.u).map(([k, x]) => [k, x[1]]));
    const conv = cfg.temp ? (x, a, b) => fromC(toC(x, a), b) : (x, a, b) => x * cfg.u[a][0] / cfg.u[b][0];
    let after;
    if (cfg.ftin) {
      after = (x, u) => { const inch = x * cfg.u[u][0] / .0254; const ft = Math.floor(inch / 12); return el('div', { class: 'muted', style: 'margin-top:6px' }, '= ' + ft + ' ft ' + fmt(inch - ft * 12, 1) + ' in'); };
      const fi = el('div', { class: 'card', style: 'margin-bottom:16px;padding:14px' }, el('b', {}, 'Feet + inches → cm'));
      const f = el('input', { type: 'number', value: 5, 'aria-label': 'Feet' }), i = el('input', { type: 'number', value: 7, 'aria-label': 'Inches' }), o = el('div', { class: 'big', style: 'font-size:24px' });
      const go = () => o.textContent = '= ' + fmt(((+f.value || 0) * 12 + (+i.value || 0)) * 2.54, 2) + ' cm';
      f.oninput = i.oninput = go; go();
      fi.append(el('div', { class: 'row', style: 'margin-top:8px;align-items:center' }, el('div', { class: 'inp-suf' }, f, el('span', {}, 'ft')), el('div', { class: 'inp-suf' }, i, el('span', {}, 'in')), o));
      box.append(fi);
    }
    ui(box, defs, null, conv, { def: cfg.def, after, val: slug === 'height-converter' ? 170 : slug === 'temperature-converter' ? 37 : 1 });
    if (slug === 'land-area-converter') box.append(el('div', { class: 'note' }, 'Bigha, katha and biswa differ between states and even districts, so they are not included. Check with your local land records office.'));
  };

  const getJSON = async u => { const c = new AbortController(), t = setTimeout(() => c.abort(), 6000); try { const r = await fetch(u, { signal: c.signal }); if (!r.ok) throw 0; return await r.json(); } finally { clearTimeout(t); } };
  async function rates() {
    const c = CW.store.get('fx'); if (c && Date.now() - c.t < 6 * 36e5) return c;
    try { const r = await getJSON('https://open.er-api.com/v6/latest/USD'); if (r.result !== 'success') throw 0; const d = { t: Date.now(), rates: r.rates, upd: r.time_last_update_utc }; CW.store.set('fx', d); return d; }
    catch (e) {
      try { const r = await getJSON('https://api.frankfurter.app/latest?from=USD'); r.rates.USD = 1; const d = { t: Date.now(), rates: r.rates, upd: r.date }; CW.store.set('fx', d); return d; }
      catch (e2) { if (c) return Object.assign({}, c, { stale: true }); throw e2; }
    }
  }
  const NAMES = { INR: 'Indian Rupee', USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', AED: 'UAE Dirham', SAR: 'Saudi Riyal', QAR: 'Qatari Riyal', KWD: 'Kuwaiti Dinar', OMR: 'Omani Rial', BHD: 'Bahraini Dinar', SGD: 'Singapore Dollar', AUD: 'Australian Dollar', CAD: 'Canadian Dollar', JPY: 'Japanese Yen', CNY: 'Chinese Yuan', NZD: 'NZ Dollar', CHF: 'Swiss Franc', MYR: 'Malaysian Ringgit', THB: 'Thai Baht', NPR: 'Nepalese Rupee', LKR: 'Sri Lankan Rupee', BDT: 'Bangladeshi Taka', PKR: 'Pakistani Rupee', HKD: 'Hong Kong Dollar', ZAR: 'South African Rand', RUB: 'Russian Ruble', KRW: 'South Korean Won' };
  async function currency(box) {
    box.append(el('div', { class: 'muted' }, 'Loading today\'s exchange rates…'));
    let d; try { d = await rates(); } catch (e) { box.replaceChildren(el('div', { class: 'bad' }, 'Could not load exchange rates. Please check your connection and refresh.')); return; }
    box.replaceChildren();
    const defs = {}; const keys = Object.keys(d.rates); const top = Object.keys(NAMES).filter(k => d.rates[k]);
    [...top, ...keys.filter(k => !NAMES[k]).sort()].forEach(k => defs[k] = NAMES[k] || k);
    const conv = (x, a, b) => x / d.rates[a] * d.rates[b];
    const u = ui(box, defs, null, conv, { def: ['USD', 'INR'], after: (x, a) => el('div', { class: 'muted small', style: 'margin-top:6px' }, '1 ' + a + ' = ' + nice(conv(1, a, 'INR')) + ' INR') });
    if (d.stale) box.prepend(el('div', { class: 'bad small', style: 'margin-bottom:8px' }, '⚠ Live rates are unavailable right now – showing the last saved rates (' + (d.upd || 'earlier') + ').'));
    box.append(el('div', { class: 'note' }, 'Reference rates updated ' + (d.upd || 'daily') + '. Banks and exchange services add a margin, so the amount you receive may differ. Rates by open.er-api.com.'));
  }
})();
