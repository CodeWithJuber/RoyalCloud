# Royal Clouds — `web/` design system

**Violet & Gold on Astryx · Next.js 16 app · September 2026**

This document governs the Next.js + Astryx app in `web/`. The root `DESIGN.md` describes the legacy Astro app and names files that do not exist here; treat it as history. Every token, class and file named below exists in this tree — check with `grep` before citing something new.

---

## 1. Design read

Royal Clouds is a premium hosting brand for founders, developers and agencies who are graduating out of budget hosts. The site should read as competent and calm: Bluehost-grade conversion patterns (intent chips, guided plan finder, term toggle, grouped comparison table, customer stories, sticky sub-nav) without the urgency theatre. Every number on the page is a real number from the catalog or content; if a figure cannot be real, the component does not ship.

---

## 2. Tokens

**Source of truth:** `theme/royal.theme.ts` (Astryx `defineTheme`, extends the Neutral theme). `npm run theme:build` compiles it to `app/royal-theme.css`, `app/royal.js`, `app/royal.d.ts` and `app/royal.variants.d.ts`; `npm run theme:check` (first step of `npm run check`) fails when those drift. **Never hand-edit the generated files** — a hand edit is overwritten by `prebuild` and fails the gate.

| Token (light / dark) | Value | Role |
| --- | --- | --- |
| `--color-accent` | `#673de6` / `#9b85ff` | brand violet: links, active states, focus rings on light grounds |
| `--color-text-accent` | `#5025d1` / `#b8a6ff` | accent-coloured text (passes body contrast on white) |
| `--color-background-body` | `#faf7ff` / `#17112b` | page canvas (lavender) |
| `--color-background-card` | `#ffffff` / `#241a45` | cards, tables, the plan finder |
| `--color-background-muted` | `#f0edff` / `#2c2154` | tinted tiles |
| `--color-text-primary` | `#2f1c6a` / `#f4f1ff` | headings and body ink |
| `--color-text-secondary` | `#595b68` / `#b3b0c3` | body copy on light grounds |
| `--color-border` / `--color-border-emphasized` | `#673de614` / `#e9e4f7` | hairlines |

Brand-only primitives that Astryx does not model live once at the top of `app/site.css`:
`--rc-night #2f1c6a`, `--rc-night-deep #231252`, `--rc-gold #ffc94b`, `--rc-gold-light #ffd97a`, `--rc-lavender #faf7ff`, `--rc-violet-050 #f0edff`.

**Gold is the only conversion colour.** The theme's `variant:primary` button is gold (`#ffc94b`) with night ink (`#2f1c6a`, 9.17:1). Gold appears on `.btn-primary`, the decorative rating stars and the popular plan card's hairline — nowhere else. "Most popular" flags, badges, dots and hover hairlines are violet or white.

Light mode is the shipping mode (`app/providers.tsx` mounts the theme with `mode="light"`).

---

## 3. Typography

Two self-hosted variable fonts from `next/font/google` (`app/layout.tsx`): **DM Sans** (`--font-dm-sans`) for body and headings, **JetBrains Mono** (`--font-jetbrains-mono`) for code and tabular data (benchmark values, prices use `font-variant-numeric: tabular-nums`). Type scale base 14 / ratio 1.2; heading weights 700. Display sizes are inline `clamp()` values in `app/site.css` (hero `h1` ≈ `clamp(2rem, 9.4vw, 2.6rem)` on phones). Helpers: `.eyebrow` (uppercase, tracked, accent), `.lede` (intro paragraph), `.section-header` (eyebrow + h2 + lede block).

---

## 4. Layout, spacing, radius, shadow, motion

- **Shell:** `--site-shell: 1200px` (`.site-shell`). Section rhythm `--section-y: clamp(3.5rem, 6.5vw, 5.5rem)`, `--section-y-sm` for shallow bands, `--header-gap` under section headers.
- **Bands:** `.section` (light), `.section-tint` (lavender), `.section-dark` (night), `.section-deep` (night-deep), `.section-royal` (violet gradient), `.section-sm` (shallow).
- **Grids:** `.grid`, `.grid-2/-3/-4` (2-up on phones, 1-up for `.grid-4` under 1024px).
- **Radius:** cards 20px (theme), plan finder and tables 24px/20px, chips and buttons 999px.
- **Shadow:** Astryx `--shadow-low / --shadow-med / --shadow-high` (ink-violet tinted via `--color-shadow`).
- **Motion tokens:** `--duration-fast 125ms`, `--duration-medium 300ms`, `--duration-slow 700ms` (theme `motion`), easing `cubic-bezier(0.32, 0.72, 0, 1)` for reveals and slides.
- **Sticky offsets:** `SiteHeader` measures itself into `--site-header-h`; `ProductSubnav` adds `--subnav-h`; `html { scroll-padding-top }` and every sticky element use those two variables. Never hardcode a header height.

---

## 5. Component inventory

**Site chrome** (`components/site/`): `SiteHeader` (announcement, sticky nav, mega menu, mobile drawer, height publisher), `SiteFooter`, `MobileCtaBar` (phone-only sticky CTA), `ProductSubnav` (desktop sticky "On this page" pills + "From $X/mo"), `CurrencySwitch` (USD/INR via `<html data-currency>`), `RevealScript` (scroll reveal).

**Shared atoms** (`components/`): `Price` (dual-currency spans, CSS shows one — never mutate from JS), `RatingBadge` (aggregate rating from `data/site.json`), `CountUp` (stat count-up), `Icon` (theme icon registry), `Prose`.

**Sections** (`components/sections/`, dispatched by `SectionRenderer` from the `type` in content frontmatter):

| `type` | Component | Notes |
| --- | --- | --- |
| `hero` | `Hero` | gradient/product/simple; home hero carries the domain search and intent chips |
| `trustbar` | `TrustBar` | four items become four tiles ≥900px |
| `pricing` | `PlanCards` (client) | shared billing store, term-only labels, popular hairline |
| `comparison` | `ComparisonTable` → `CompareTable` (client) | grouped rows, best-for, synced billing, sticky header |
| `planfinder` | `PlanFinder` (client) | four steps, budget bands from real prices, `?for=` prefill |
| `features` | `FeatureGrid` | optional `metric`, `variant: tiles` |
| `products` | `ProductGrid` | starting prices |
| `content` | `ContentSplit` | copy + checklist + art |
| `steps` | `StepProcess` | scroll-snap rail on phones |
| `stats` | `StatsBand` | `CountUp` values |
| `benchmark` / `race` | `BenchmarkBars` | bars fill on reveal, optional `scale` caption |
| `testimonials` | `Testimonials` → `TestimonialCarousel` (client) | inline or global items, rating aggregate |
| `faq` | `FaqAccordion` | native exclusive `<details>`, FAQPage JSON-LD |
| `osstrip` | `OsStrip` → `DeployTabs` (client) | tabs only when items span OS/panel/app |
| `showcase` | `ShowcaseTabs` (client) | Astryx TabList product panels |
| `domainsearch`, `techlogos`, `cta`, `storycards`, `security`, `mapband` | one component each | static |

Illustrations are hand-built SVG in `components/art/` (`HeroArt`, `ProductArt`, `SectionArt`), all `aria-hidden`.

Every section receives a stable `id` from `lib/section-ids.ts` (explicit content `id` wins, else a per-type default — `pricing`, `features`, `compare`, `faq`, `reviews`, `deploy`, `planfinder`, `stats`, `benchmark`… — with `-2`, `-3` suffixes for repeats).

---

## 6. Interactions

| Behaviour | Where | Trigger | Reduced motion | Without JS |
| --- | --- | --- | --- | --- |
| Scroll reveal + stagger | `RevealScript`, `[data-reveal]`, `--reveal-i` | IntersectionObserver marks `data-visible` | everything visible at once, no delay | content is never hidden — transform only |
| Billing period | `lib/billing-store.ts` (client), `lib/billing.ts` (pure) | SegmentedControl in `PlanCards` and `CompareTable` | n/a | annual prices shown (server snapshot) |
| Currency | `CurrencySwitch`, `Price` | flips `<html data-currency>` | n/a | USD |
| Plan finder | `PlanFinder`, `lib/plan-finder.ts`, `lib/intents.ts` | option buttons; `/?for=<intent>#planfinder` prefills the build | no slide between steps | first question renders; answers need JS |
| Comparison table | `CompareTable`, `lib/feature-groups.ts` | hover/focus highlights a column; phone "Compare all features" | n/a | every row renders |
| Count-up stats | `CountUp`, `lib/count-up.ts` | first time in view, rAF over 1.2s | final value immediately | final value |
| Benchmark bars | `BenchmarkBars` CSS | panel `data-visible` | full width, no transition | full width |
| Testimonials carousel | `TestimonialCarousel` | scroll-snap rail, prev/next, dots, live "n of N"; no autoplay | instant scrolls | rail scrolls natively, controls hidden |
| FAQ accordion | `FaqAccordion` | native `<details name>`; CSS `::details-content` animation where supported | no transition | native open/close |
| Deploy tabs | `DeployTabs`, `lib/deploy-catalog.ts` | Astryx TabList | n/a | all chips in the HTML |
| Product sub-nav | `ProductSubnav`, `lib/use-scrollspy.ts`, `lib/subnav.ts` | sticky under the header; scrollspy sets `aria-current` | n/a | plain anchor links |
| Header | `SiteHeader` | scroll shadow at 8px, drawer with `inert`, Escape closes | shadow only | links work |
| Mobile CTA bar | `MobileCtaBar` | appears after 400px, hides over the footer | slide removed | hidden |

Rules: every animation ≥200ms lives inside `@media (prefers-reduced-motion: no-preference)`; `app/globals.css` collapses all durations as a backstop; rAF and `scrollTo` code checks `matchMedia` itself. No countdowns, no autoplay, no simulated telemetry.

---

## 7. Accessibility floor

Enforced by `npm run check:contrast` (`scripts/check-contrast.mjs`, WCAG 2.1 math: body ≥4.5:1, large/UI ≥3:1). Every rendered pairing is listed in `PAIRS` — adding a colour pairing means adding it there; thresholds are never lowered. The list includes the hero intent chips over night, the comparison table's active column tint (`#f4f0fd`), the benchmark axis caption on night, and the carousel's inactive dot on white.

- Visible `:focus-visible` on every interactive element: violet on light grounds, lavender (`#faf7ff`) on night/violet bands, gold only on the violet CTA button.
- Tap targets ≥24px (dots 24px, chips and sub-nav pills ≥36px, buttons ≥44px).
- Native semantics first: `<details>` accordion, `<table>` with `scope`, `<nav aria-label>`, `role="region"` + `aria-roledescription="carousel"`, `aria-live` for step and slide announcements, `aria-current` for the active pill.
- Mobile above-the-fold: at ≤640px the hero's `.hero-search` / `.domain-row` and `.hero-actions .btn-primary` must sit within the first 844px (`scripts/qa-shots.mjs` asserts it; keep those class names).

---

## 8. Content rules

- A price is always shown with its term ("per month, billed monthly / yearly"). No renewal claim without renewal data in the catalog.
- Discounts come only from real `price` vs `priceAnnual` pairs (`savePct`); one promo line per page, in the announcement bar.
- Testimonials carry a name and a site; the data has no role/company field yet — add one before claiming it.
- Stats and benchmark bars are authored numbers from content; `CountUp` animates only plain quantities and never invents a value.
- Deploy chips get descriptions only when the text is copied verbatim from a plan highlight or the page's own copy (test-enforced).
- No sparkle/"magic" language, no fake scarcity, no chat widgets that open themselves.

---

## 9. Contracts and verification

- **CMS lockstep:** a new section type or field changes `lib/content.ts` (use `z.enum` for enumerations — `verify-cms.mjs` reads every `z.literal` as a section type), `components/sections/SectionRenderer.tsx` and `public/admin/config.yml` in the same commit. Decap deletes unknown fields on save.
- **Route contract:** 60 content routes and 7 redirects (`tests/routes.test.ts`); every off-site CTA points at `https://my.royalclouds.net`.
- **Server/client boundary:** section shells are server components; client children receive serialisable props. `lib/billing.ts` is importable everywhere, `lib/billing-store.ts` only from client files.
- **Gates:** `npm run check` (theme drift, `next typegen`, `tsc`, ESLint, Vitest, CMS lockstep, contrast) and `npm run build` must exit 0. Visual QA: `npm run dev` then `node scripts/qa-shots.mjs` (1440 and 390 widths, zero console errors, above-the-fold assertion).
