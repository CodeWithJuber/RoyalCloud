# Royal Clouds — Website

A fast, SEO-friendly, fully responsive website for **Royal Clouds** hosting,
built on the **[AstroWind](https://github.com/arthelokyo/astrowind)** theme
(Astro v6 + Tailwind CSS v4), branded to the Royal Clouds **green** identity,
editable through a **Decap CMS** dashboard, and deployed on **Cloudflare** with
an optional Basic-Auth preview lock.

> Ordering, login, tickets and the knowledge base are handled by the existing
> WHMCS client portal at `https://my.royalclouds.net` — this site links to it.

## Tech stack

| Concern | Tool |
| --- | --- |
| Framework / UI | Astro v6 + Tailwind CSS v4 (AstroWind theme — designer-made widgets) |
| Theme | Green brand, light + dark, set in `src/components/CustomStyles.astro` |
| Icons / logos | astro-icon (Tabler) + Iconify `logos` for real partner marks |
| Content editing | Decap CMS (Git-backed, at `/admin`) |
| Blog | Markdown/MDX posts in `src/data/post/` (AstroWind blog, RSS, categories, tags) |
| SEO | Built-in metadata/OG, `@astrojs/sitemap`, blog RSS |
| Hosting | Cloudflare Worker (`src/worker.ts`) serving static `dist/` assets |
| Privacy | Optional Basic Auth preview lock via Worker secrets |
| CI/CD | Cloudflare Workers Builds (Git → `npx wrangler deploy`) |

## Local development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # production build to ./dist
npm run check    # type/lint checks
```

## Where things live

- **Brand colours / fonts** → `src/components/CustomStyles.astro`
- **Site name & SEO** → `src/config.yaml`
- **Navigation (header + footer)** → `src/navigation.ts`
- **Logo** → `src/components/Logo.astro`
- **Plans & prices** → `src/data/plans/*.json` (also exposed in the CMS)
- **Technology pages content** → `src/data/technology.json`
- **Testimonials / FAQs** → `src/data/testimonials.json`, `src/data/faqs.json`
- **Blog posts** → `src/data/post/*.md`
- **Pages** → `src/pages/` (home, 6 product pages, 3 technology pages,
  about/contact/testimonials, `[...blog]`)
- **Product page template** → `src/components/ProductPage.astro`
  (Hero + Pricing + Features + FAQs + CTA, fed by a plan JSON)

## Deployment (Cloudflare — Worker + static assets)

The repo is connected to Cloudflare via **Workers Builds**. On push to `main`:
`npm run build` → `dist/`, then `npx wrangler deploy` publishes it via
`src/worker.ts` (per `wrangler.toml`). Validate locally:

```bash
npm run build
npx wrangler deploy --dry-run
```

### Preview lock (hide the site until launch)

`src/worker.ts` gates the whole site behind HTTP Basic Auth while the
`BASIC_AUTH_USER` / `BASIC_AUTH_PASS` secrets are set on the Worker. Set them in
Cloudflare → Workers & Pages → `royalfront` → Settings → Variables & Secrets
(or `npx wrangler secret put …`). **Remove both at launch** to go public — no
code change. The Worker also adds security headers on every response.

### Custom domain

Add `royalclouds.net` in **Workers & Pages → royalfront → Domains**. DNS is on
Cloudflare, so the record + TLS are issued automatically.

## CMS auth

Decap's GitHub backend needs an OAuth handshake (GitHub OAuth app + a small
OAuth proxy, e.g. a Cloudflare Worker), or switch `public/admin/config.yml` to
`git-gateway`. For local editing, run `npx decap-server` with `local_backend`.

## Visual QA

`scripts/screenshots.mjs` renders every page at desktop + mobile in light + dark
using Playwright (`PAGES="home:/,…" node scripts/screenshots.mjs`).
