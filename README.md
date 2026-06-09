# Royal Clouds — Website

A fast, SEO-friendly, fully responsive website for **Royal Clouds** hosting,
built with [Astro](https://astro.build) and editable through a visual
[Decap CMS](https://decapcms.org) dashboard. Deploys free to **GitHub Pages**
via GitHub Actions.

> Ordering, login, tickets and the knowledge base are handled by the existing
> WHMCS client portal at `https://my.royalclouds.net` — this site links to it
> and does not replace it.

---

## Tech stack

| Concern | Tool |
| --- | --- |
| Framework / SSG | Astro 5 (zero-JS by default) |
| Content editing | Decap CMS (Git-backed, at `/admin`) |
| Blog content | Markdown/MDX content collections |
| SEO | Per-page `<Seo>` component, JSON-LD, `@astrojs/sitemap`, RSS |
| Hosting | Cloudflare (Workers Static Assets, custom domain `royalclouds.net`) |
| CI/CD | Cloudflare Workers Builds (Git integration → `npx wrangler deploy`) |

## Local development

```bash
npm install      # install dependencies
npm run dev      # start dev server at http://localhost:4321
npm run build    # production build to ./dist
npm run preview  # preview the production build
```

## Project structure

```
src/
├─ data/            # ← EDIT HERE: site settings, nav, footer, plans, testimonials, faqs
│  ├─ site.json     #    name, contact, portal URLs, socials, live chat
│  └─ plans/*.json  #    hosting tiers & prices (one file per product)
├─ content/blog/    # ← blog posts (Markdown, Yoast-style frontmatter)
├─ components/       # Header, Footer, PricingCards, Seo, BlogCard, …
├─ layouts/          # BaseLayout, BlogLayout
├─ pages/            # routes (index, product pages, /blog, rss.xml, 404)
├─ lib/              # blog + JSON-LD helpers
└─ styles/global.css # ← all brand colours live here (CSS custom properties)
public/
├─ admin/            # Decap CMS (index.html + config.yml)
├─ assets/img/       # logo, OG image, uploads
├─ CNAME             # custom domain
└─ robots.txt
```

## Editing content

### Option A — visual editor (recommended, no code)

1. Go to **`https://royalclouds.net/admin`**.
2. Log in with GitHub (see *CMS auth* below).
3. Edit **Blog Posts**, **Hosting Plans & Pricing**, **Site Settings**,
   **Testimonials** or **FAQs** in the dashboard.
4. Hit **Publish**. Decap commits the change to the repo, GitHub Actions
   rebuilds the site, and it goes live in a couple of minutes.

### Option B — edit files directly

Everything the CMS edits is plain text in the repo:

- **Prices / plan features** → `src/data/plans/*.json`
- **Text, contact info, portal links, socials** → `src/data/site.json`
- **Menus** → `src/data/nav.json`, `src/data/footer.json`
- **Testimonials / FAQs** → `src/data/testimonials.json`, `src/data/faqs.json`
- **Blog posts** → add a `.md` file under `src/content/blog/`
- **Brand colours** → the `:root` custom properties in `src/styles/global.css`

## Blog & SEO

Each post's frontmatter mirrors the controls Yoast SEO offers in WordPress:

```yaml
---
title: "Post title"             # SEO <title> + H1
description: "Meta description"  # 150–160 chars
publishDate: 2026-05-20
updatedDate: 2026-05-25          # optional
author: "Royal Clouds Team"
category: "Performance"
tags: ["SSD", "Speed"]
image: ./cover.jpg               # optional, used for social cards
imageAlt: "Alt text"
canonical: https://...           # optional
featured: false                  # feature on blog homepage
noindex: false                   # hide from search engines
draft: false                     # hide until ready
---
```

Built in automatically: canonical URLs, Open Graph + Twitter cards, JSON-LD
(`Organization`, `WebSite`, `Product`/`AggregateOffer`, `BlogPosting`,
`FAQPage`, `BreadcrumbList`), `sitemap-index.xml`, `robots.txt` and an RSS feed
at `/rss.xml`.

## Deployment (Cloudflare — Workers Static Assets)

The repo is connected to Cloudflare via the **Workers Builds** Git integration,
which works with a **private** repo and keeps your Cloudflare DNS. On every push
to `main`, Cloudflare runs:

- **Build command:** `npm run build` → outputs static files to `dist/`
- **Deploy command:** `npx wrangler deploy` → publishes `dist/` as an
  **assets-only Worker** (no server code), per `wrangler.toml`.

`wrangler.toml` is the single source of truth:

```toml
name = "royalfront"
compatibility_date = "2025-01-01"

[assets]
directory = "./dist"
not_found_handling = "404-page"   # serves dist/404.html for unmatched routes
```

Validate the config locally any time with:

```bash
npm run build
npx wrangler deploy --dry-run   # checks config + assets, publishes nothing
```

### Custom domain

In the Cloudflare project (**Workers & Pages → royalfront → Domains**), add
`royalclouds.net`. Since DNS is already on Cloudflare, the record is created for
you and TLS is issued automatically — no `CNAME` file needed.

> The previous GitHub Actions workflow was removed, since Cloudflare now builds
> and deploys directly from Git. To re-add CI-based deploys instead, use
> `cloudflare/wrangler-action` with a `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID`
> secret and the command `deploy`.

## CMS auth

Decap's GitHub backend needs an OAuth handshake. The simplest options:

- **GitHub OAuth app + a small OAuth proxy** (e.g. a Cloudflare Worker running
  the community `decap-cms-oauth` provider) with the client ID/secret set there, **or**
- Switch `public/admin/config.yml` to `backend: git-gateway` if you host auth
  via a gateway service.

For quick **local** editing without any of that, uncomment `local_backend: true`
in `config.yml` and run `npx decap-server` alongside `npm run dev`.

## Notes

- Colours are defined once in `src/styles/global.css` — change `--rc-primary`
  and friends to retune the whole site.
- Live chat: set `liveChat.tawkPropertyId` in `src/data/site.json` to enable the
  Tawk.to widget site-wide.
- All prices/specs are easily editable and were seeded to mirror the current
  Royal Clouds catalogue; adjust in `src/data/plans/` as needed.
