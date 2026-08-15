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

## CMS auth (logging in to `/admin`)

The CMS logs in through a **GitHub OAuth proxy built into the Worker**
(`src/worker.ts` → `/oauth/auth` + `/oauth/callback` — no third-party service).
One-time setup:

1. **Create a GitHub OAuth App** — GitHub → Settings → Developer settings →
   OAuth Apps → *New OAuth App*:
   - **Homepage URL:** `https://royalfront.hostlelo.workers.dev` (or the custom domain)
   - **Authorization callback URL:** `https://royalfront.hostlelo.workers.dev/oauth/callback`
   - Copy the **Client ID** and generate a **Client Secret**.
2. **Give the Worker the credentials:**
   - Client ID (public, safe to commit) → `wrangler.toml` `[vars] GITHUB_OAUTH_CLIENT_ID`
     (or the Cloudflare dashboard).
   - Client Secret (**never commit**) → `npx wrangler secret put GITHUB_OAUTH_CLIENT_SECRET`
     (or dashboard → Workers → `royalfront` → Settings → Variables & Secrets).
3. **Editors need push access** to `codewithjuber/royalfront` — the editorial
   workflow commits / opens PRs as the logged-in user.

> `base_url` in `public/admin/config.yml`, the OAuth App's callback URL, and the
> host that serves `/admin` must all be the **same origin**. When you attach the
> custom domain, update `base_url` and the callback URL together to
> `https://royalclouds.net`.

For local editing without GitHub, uncomment `local_backend: true` in
`public/admin/config.yml` and run `npx decap-server` alongside `npm run dev`.

## Integrations & Tracking (analytics, pixels, chat, scripts)

Analytics, tag managers, search-console verification, marketing pixels, the live
chat widget, and any custom `<head>`/`<body>` scripts are all editable from
**`/admin` → "Integrations & Tracking"** (stored in `src/data/integrations.json`,
rendered by `src/components/integrations/*`). Every field is optional — blank
means nothing is injected, so the site looks/behaves identically out of the box.
Saving in the CMS commits the JSON and triggers a rebuild; **no code deploy
needed**.

Supported out of the box: Google Analytics 4, Google Tag Manager, Google/Bing
site verification, Facebook/Meta Pixel, Tawk.to live chat (or a custom chat
embed), plus free-form `<head>`/`<body>` code for anything else. Custom code
runs verbatim, so only paste snippets you trust.

## Visual QA

`scripts/screenshots.mjs` renders every page at desktop + mobile in light + dark
using Playwright (`PAGES="home:/,…" node scripts/screenshots.mjs`).
