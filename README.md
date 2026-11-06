# ConvertWiz

Free, private online tools (image, PDF, GST/EMI/tax calculators, unit converters, text and developer tools), live at https://www.convertwiz.in.

## How it works
- `src/registry.js` – every tool's name, URL slug, SEO title/description, how-to steps and FAQs.
- `static/assets/` – the app shell (`app.js`, `app.css`) and tool engines (`e-*.js`). All processing runs in the visitor's browser.
- `build.js` – dependency-free static site generator. `node build.js` writes the site to `dist/` (one page per tool, category pages, sitemap, robots.txt, ads.txt, PWA files).
- `vercel.json` – tells Vercel to run `node build.js` and serve `dist/`, plus redirects and cache headers.

## Add a new tool
1. Add an entry to `TOOLS` in `src/registry.js`.
2. Implement it in the matching engine in `static/assets/` (`e-calc.js`, `e-units.js`, `e-image.js`, `e-pdf.js`, `e-text.js`, `e-dev.js`).
3. Run `node build.js`, open `dist/` with any static server and test.

## Deploying
Pushing to `main` deploys production on Vercel. Other branches get preview deployments.

> The previous Replit-built app is kept in `legacy/` for reference. Do **not** publish from Replit any more – it would overwrite this site.
