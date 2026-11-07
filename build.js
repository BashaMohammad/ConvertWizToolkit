// ConvertWiz static site generator (no dependencies). Run: node build.js  -> ./dist
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { CATS, TOOLS } = require('./src/registry');
const SITE = 'https://www.convertwiz.in', OUT = path.join(__dirname, 'dist');
const PROD = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === 'production' : false;
const YEAR = new Date().getFullYear(), TODAY = new Date().toISOString().slice(0, 10);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// copy static and fingerprint assets
fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(path.join(__dirname, 'static'), OUT, { recursive: true });
const V = {};
for (const f of fs.readdirSync(path.join(OUT, 'assets'))) V[f] = crypto.createHash('md5').update(fs.readFileSync(path.join(OUT, 'assets', f))).digest('hex').slice(0, 8);
const A = f => `/assets/${f}?v=${V[f]}`;
const write = (p, html) => { const f = path.join(OUT, p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html); };
const OG = fs.existsSync(path.join(OUT, 'og.png'));
const bySlug = Object.fromEntries(TOOLS.map(t => [t.s, t]));

function head({ title, desc, url, ld = [], noindex }) {
  return `<!doctype html><html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${SITE}${url}">
${noindex ? '<meta name="robots" content="noindex">' : '<meta name="robots" content="index,follow,max-image-preview:large">'}
<meta property="og:type" content="website"><meta property="og:site_name" content="ConvertWiz"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${SITE}${url}">${OG ? `<meta property="og:image" content="${SITE}/og.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">` : ''}<meta property="og:locale" content="en_IN">
<meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#4f46e5">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/icon-192.png"><link rel="manifest" href="/manifest.webmanifest">
<script>try{var t=localStorage.getItem('cw_theme');document.documentElement.dataset.theme=t?JSON.parse(t):(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch(e){}</script>
<link rel="stylesheet" href="${A('app.css')}">
${ld.map(o => `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', ...o })}</script>`).join('')}
${PROD ? `<script async src="https://www.googletagmanager.com/gtag/js?id=G-7QJXHFPZVE"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-7QJXHFPZVE');</script>
<script>(function(){var d=0;function L(){if(d)return;d=1;var s=document.createElement('script');s.async=true;s.crossOrigin='anonymous';s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2287734666559045';document.head.appendChild(s)}['pointerdown','keydown','scroll','touchstart'].forEach(function(e){addEventListener(e,L,{once:true,passive:true})});addEventListener('load',function(){setTimeout(L,2500)})})();</script>` : ''}
<script defer src="/_vercel/insights/script.js"></script><script defer src="/_vercel/speed-insights/script.js"></script>
</head>`;
}
const SHORT = { image: 'Image', pdf: 'PDF', finance: 'Finance', calc: 'Calculators', units: 'Converters', text: 'Text', dev: 'Dev tools' };
const nav = Object.entries(CATS).map(([k, c]) => `<a href="/${c.slug}">${SHORT[k]}</a>`).join('') + '<a href="/pro">✨ Pro</a>';
function shell(bodyAttr, main) {
  return `<body${bodyAttr}><a href="#main" style="position:absolute;left:-999px">Skip to content</a>
<header class="top"><div class="wrap"><a class="logo" href="/" aria-label="ConvertWiz home">Convert<b>Wiz</b></a><nav class="cats" aria-label="Categories">${nav}</nav><span class="sp"></span>
<button class="ibtn" id="searchBtn" aria-label="Search tools">🔎 <span class="lbl">Search</span> <kbd>Ctrl K</kbd></button><button class="ibtn" id="themeBtn" aria-label="Toggle dark mode">🌙</button></div></header>
<main id="main"><div class="wrap">${main}</div></main>
<footer><div class="wrap"><div class="cols">
<div><b>ConvertWiz</b>Free, fast and private online tools. Files are processed on your device.<br><br>© ${YEAR} ConvertWiz</div>
${Object.values(CATS).slice(0, 3).map(c => `<div><b>${c.name}</b>${TOOLS.filter(t => CATS[t.c] === c).slice(0, 6).map(t => `<a href="/${t.s}">${t.n}</a>`).join('')}</div>`).join('')}
<div><b>Company</b><a href="/about">About</a><a href="/pro">ConvertWiz Pro</a><a href="/contact">Contact</a><a href="/privacy">Privacy Policy</a><a href="/terms">Terms &amp; Disclaimer</a></div>
</div></div></footer>
<dialog id="sd" aria-label="Search tools"><input type="search" placeholder="Search ${TOOLS.length} tools… e.g. compress, GST, PDF" aria-label="Search"><ul></ul></dialog>
<script src="${A('app.js')}" defer></script>`;
}
const card = t => `<a class="tc" href="/${t.s}" data-k="${esc((t.n + ' ' + t.d).toLowerCase())}"><span class="em">${t.e}</span><span><b>${esc(t.n)}${t.india ? '<span class="badge">India</span>' : ''}</b><small>${esc(t.sd || t.i.split('. ')[0].replace(/\.$/, '') + '.')}</small></span></a>`;
const crumb = items => ({ '@type': 'BreadcrumbList', itemListElement: items.map(([n, u], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: SITE + u })) });
const faqLd = f => ({ '@type': 'FAQPage', mainEntity: f.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });

// ---------- tool pages ----------
for (const t of TOOLS) {
  const cat = CATS[t.c], url = '/' + t.s;
  const rel = [...TOOLS.filter(x => x.c === t.c && x.s !== t.s), ...TOOLS.filter(x => x.pop && x.c !== t.c)].slice(0, 9);
  const ld = [{ '@type': 'WebApplication', name: t.n, url: SITE + url, description: t.d, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any (web browser)', isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' }, publisher: { '@type': 'Organization', name: 'ConvertWiz', url: SITE } },
    crumb([['Home', '/'], [cat.name, '/' + cat.slug], [t.n, url]]), faqLd(t.f)];
  const main = `<div class="crumb"><a href="/">Home</a> › <a href="/${cat.slug}">${cat.name}</a></div>
<div class="tool-head"><div><h1>${esc(t.n)}</h1><p class="lead">${esc(t.i)}</p></div><button class="ibtn star" id="favBtn" aria-label="Favourite">☆</button></div>
<section class="card toolbox" id="tool" data-tool="${t.s}" data-engine="${t.g}"><noscript>Please enable JavaScript to use this tool.</noscript><p class="muted">Loading tool…</p></section>
<h2>How to use the ${esc(t.n)}</h2><ol class="steps">${t.st.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
<h2>Frequently asked questions</h2>${t.f.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}
<h2>Related tools</h2><div class="grid">${rel.map(card).join('')}</div>`;
  write(t.s + '.html', head({ title: t.t, desc: t.d, url, ld }) + shell(` data-tool="${t.s}"`, main) + `<script src="${A('e-' + t.g + '.js')}" defer></script></body></html>`);
}

// ---------- category pages ----------
for (const [k, c] of Object.entries(CATS)) {
  const list = TOOLS.filter(t => t.c === k), url = '/' + c.slug;
  const ld = [crumb([['Home', '/'], [c.name, url]]), { '@type': 'CollectionPage', name: c.name, url: SITE + url, hasPart: list.map(t => ({ '@type': 'WebApplication', name: t.n, url: SITE + '/' + t.s })) }];
  write(c.slug + '.html', head({ title: `${c.name} – ${list.length} Free Online Tools | ConvertWiz`, desc: c.d, url, ld }) + shell('', `<div class="crumb"><a href="/">Home</a></div><h1>${c.e} ${c.name}</h1><p class="lead">${esc(c.d)}</p><div class="grid">${list.map(card).join('')}</div>
<h2>Other categories</h2><div class="chips" style="justify-content:flex-start">${Object.values(CATS).filter(x => x !== c).map(x => `<a class="chip" href="/${x.slug}">${x.e} ${x.name}</a>`).join('')}</div>`) + '</body></html>');
}

// ---------- home ----------
{
  const pop = TOOLS.filter(t => t.pop);
  const main = `<section class="hero"><h1>All your everyday tools,<br><span>free, fast &amp; private</span></h1>
<p class="lead">${TOOLS.length} free tools for images, PDFs, GST, EMI, income tax, unit conversion and more. Everything runs in your browser, so your files never leave your device. No sign-up needed.</p>
<div class="bigsearch"><input id="q" type="search" placeholder="Try &quot;compress to 50 KB&quot;" aria-label="Filter tools" autocomplete="off"></div>
<div class="chips">${['exam-photo-resizer', 'image-compressor', 'merge-pdf', 'gst-calculator', 'income-tax-calculator', 'qr-code-generator'].map(s => `<a class="chip" href="/${s}">${bySlug[s].e} ${bySlug[s].n.replace(/ \(.*|FY.*$/, '').trim()}</a>`).join('')}</div></section>
<div id="mine"></div>
<section data-cat="pop"><h2>🔥 Most popular</h2><div class="grid">${pop.map(card).join('')}</div></section>
${Object.entries(CATS).map(([k, c]) => `<section data-cat="${k}"><div class="sec-h"><h2>${c.e} ${c.name}</h2><a href="/${c.slug}">View all →</a></div><div class="grid">${TOOLS.filter(t => t.c === k).map(card).join('')}</div></section>`).join('')}
<section style="margin-top:40px" class="two"><div class="card"><h2 style="margin-top:0">🔒 Private by design</h2><p class="muted">Images, PDFs and text are processed with your browser's own engine. Nothing is uploaded to our servers, which also makes ConvertWiz fast even on mobile data.</p></div>
<div class="card"><h2 style="margin-top:0">📱 Install as an app</h2><p class="muted">Add ConvertWiz to your home screen from your browser menu for one-tap access. Many tools also work offline after your first visit.</p></div></section>`;
  const ld = [{ '@type': 'WebSite', name: 'ConvertWiz', url: SITE + '/', description: 'Free online converters and calculators for India' }, { '@type': 'Organization', name: 'ConvertWiz', url: SITE, logo: SITE + '/icon-192.png', email: 'support@convertwiz.in' }];
  write('index.html', head({ title: 'ConvertWiz – Free Online Tools: Image, PDF, GST, EMI & Unit Converters', desc: `${TOOLS.length} free online tools: compress images to a target KB, resize exam photos, merge PDFs, GST, EMI and income tax calculators, and unit and currency converters. Fast, private and no sign-up.`, url: '/', ld }) + shell('', main) + '</body></html>');
}

// ---------- info pages ----------
const page = (slug, title, desc, body, noindex) => write(slug + '.html', head({ title: title + ' | ConvertWiz', desc, url: '/' + slug, noindex }) + shell('', `<div class="crumb"><a href="/">Home</a></div><article class="prose"><h1>${title}</h1>${body}</article>`) + '</body></html>');
page('about', 'About ConvertWiz', 'ConvertWiz offers free, private online tools for images, PDFs, finance and unit conversion, built for India.', `
<p>ConvertWiz is a free collection of ${TOOLS.length} online tools that solve everyday problems in seconds: resizing a photo for an exam form, merging PDFs, checking GST or EMI, converting land units and much more.</p>
<h2>Why ConvertWiz?</h2><ul><li><b>Private:</b> files are processed inside your browser and never uploaded.</li><li><b>Fast:</b> pages are lightweight and work well on mobile data.</li><li><b>Made for India:</b> GST 2.0 rates, FY 2026-27 income tax, Indian land units, UPI QR codes and exam photo presets.</li><li><b>Free:</b> no sign-up and no watermarks. The site is supported by advertising.</li></ul>
<h2>Accuracy</h2><p>We check tax rates and formulas against official and reputable sources and update them when the rules change. Calculators provide estimates, so please confirm important figures with a qualified professional.</p>
<p>Questions or ideas for new tools? <a href="/contact">Contact us</a>.</p>`);
page('contact', 'Contact Us', 'Contact the ConvertWiz team for feedback, bug reports or tool requests.', `<p>We'd love to hear from you, whether it's a bug, a tool you'd like us to build or a business enquiry.</p><p>📧 Email: <a href="mailto:support@convertwiz.in">support@convertwiz.in</a></p><p>We usually reply within 2 working days.</p>`);
page('pro', 'ConvertWiz Pro (coming soon)', 'ConvertWiz Pro: an ad-free experience, bigger batches and advanced document tools. Join the waitlist.', `
<div class="pro"><h2 style="margin-top:0">✨ ConvertWiz Pro is coming</h2><p>Everything on ConvertWiz stays free. Pro will add extras for people who use our tools every day.</p></div>
<h2>Planned Pro features</h2><ul><li>Ad-free experience on every device</li><li>Unlimited batch processing and ZIP downloads</li><li>PDF to Word, Excel and PowerPoint conversion with accurate layouts</li><li>PDF compression, OCR and e-signature</li><li>Background remover and passport photo maker with print sheets</li><li>Saved presets, history and priority support</li></ul>
<h2>Join the waitlist</h2><p>Be the first to know when Pro launches and get an early-bird discount: <a class="btn" href="mailto:support@convertwiz.in?subject=ConvertWiz%20Pro%20waitlist&body=Please%20add%20me%20to%20the%20ConvertWiz%20Pro%20waitlist.%20The%20feature%20I%20want%20most%20is%3A%20">📩 Join the waitlist</a></p>`);
page('privacy', 'Privacy Policy', 'How ConvertWiz handles your data: files are processed locally in your browser; we use cookies for analytics and advertising.', `
<p><i>Last updated: ${TODAY}</i></p>
<h2>Files and text you use with our tools</h2><p>Our tools run inside your web browser. Images, PDFs and text you process are <b>not uploaded</b> to our servers, and we cannot see them. The currency converter requests exchange rates from a third-party rate service, and no personal data is sent with that request.</p>
<h2>Information stored on your device</h2><p>We store small preferences in your browser's local storage, such as dark mode, favourite tools and recently used tools. You can clear these at any time from your browser settings.</p>
<h2>Analytics</h2><p>We use Google Analytics and Vercel Web Analytics to understand which tools are popular and how the site performs. These services collect anonymised usage data such as pages visited, device type and approximate location. Vercel Web Analytics does not use cookies.</p>
<h2>Advertising</h2><p>We use Google AdSense to show ads. Google and its partners use cookies to serve ads based on your visits to this and other websites. You can opt out of personalised advertising at <a href="https://adssettings.google.com" rel="nofollow">Google Ads Settings</a>. Learn more about <a href="https://policies.google.com/technologies/ads" rel="nofollow">how Google uses data</a>.</p>
<h2>Children</h2><p>ConvertWiz is not directed at children under 13, and we do not knowingly collect their personal information.</p>
<h2>Contact</h2><p>Questions about this policy: <a href="mailto:support@convertwiz.in">support@convertwiz.in</a></p>`);
page('terms', 'Terms of Use & Disclaimer', 'Terms of use and disclaimer for ConvertWiz online tools.', `
<p><i>Last updated: ${TODAY}</i></p>
<h2>Use of the tools</h2><p>ConvertWiz tools are provided free of charge, "as is", for personal and commercial use. Do not use them for unlawful purposes or to process content you do not have the right to use.</p>
<h2>No professional advice</h2><p>Financial, tax and health calculators give estimates for general information only. They are not financial, tax, legal or medical advice. Rates and rules change, so verify important figures with official sources or a qualified professional before making decisions.</p>
<h2>Exam and document requirements</h2><p>Photo and signature presets reflect common requirements. Always follow the exact specifications in your official notification.</p>
<h2>Limitation of liability</h2><p>We are not liable for any loss arising from the use of these tools or reliance on their results. Keep a copy of your original files.</p>
<h2>Changes</h2><p>We may update these terms. Continued use of the site means you accept the current version.</p>`);
write('404.html', head({ title: 'Page not found | ConvertWiz', desc: 'Page not found', url: '/404', noindex: true }) + shell('', `<section class="hero"><h1>404 – Page not found</h1><p class="lead">The page you're looking for doesn't exist or has moved. Try searching for the tool you need:</p><div class="bigsearch"><input id="q" type="search" placeholder="Search tools…" aria-label="Filter tools"></div></section><div class="grid">${TOOLS.map(card).join('')}</div>`) + '</body></html>');

// ---------- machine files ----------
const urls = [['/', '1.0'], ...Object.values(CATS).map(c => ['/' + c.slug, '0.8']), ...TOOLS.map(t => ['/' + t.s, t.pop ? '0.9' : '0.7']), ['/about', '0.3'], ['/pro', '0.4'], ['/contact', '0.3'], ['/privacy', '0.2'], ['/terms', '0.2']];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([u, p]) => `<url><loc>${SITE}${u}</loc><lastmod>${TODAY}</lastmod><priority>${p}</priority></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', PROD ? `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n` : `User-agent: *\nDisallow: /\n`);
write('ads.txt', 'google.com, pub-2287734666559045, DIRECT, f08c47fec0942fa0\n');
write('assets/index.json', JSON.stringify(TOOLS.map(t => ({ s: t.s, n: t.n, e: t.e, c: CATS[t.c].name, k: t.t + ' ' + t.d, p: t.pop ? 1 : 0 }))));
write('manifest.webmanifest', JSON.stringify({ name: 'ConvertWiz – Free Online Tools', short_name: 'ConvertWiz', start_url: '/?source=pwa', display: 'standalone', background_color: '#f7f8fb', theme_color: '#4f46e5', description: 'Free image, PDF, finance and unit tools that work on your device.', icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }, ...(fs.existsSync(path.join(OUT, 'icon-512.png')) ? [{ src: '/icon-512.png', sizes: '512x512', type: 'image/png' }] : [])],
  shortcuts: ['image-compressor', 'merge-pdf', 'gst-calculator'].map(s => ({ name: bySlug[s].n, url: '/' + s })) }));
const ver = crypto.createHash('md5').update(Object.values(V).join('')).digest('hex').slice(0, 8);
write('sw.js', `const C='cw-${ver}',PRE=['/','${A('app.css')}','${A('app.js')}','/assets/index.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(PRE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.method!=='GET')return;
if(u.origin===location.origin&&u.pathname.startsWith('/_vercel'))return;
if(r.mode==='navigate'){e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put(r,cp));return res}).catch(()=>caches.match(r).then(m=>m||caches.match('/'))));return}
if(u.origin===location.origin){e.respondWith(caches.match(r).then(m=>{const f=fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res});return m||f}))}});
`);
console.log(`Built ${TOOLS.length} tools, ${Object.keys(CATS).length} categories, ${urls.length} URLs in sitemap (production=${PROD})`);
