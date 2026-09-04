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

Two self-hosted variable fonts from `next/font/google` (`app/layout.tsx`): **DM Sans** (`--font-dm-sans`) for body and headings, **JetBrains Mono** (`--font-jetbrains-mono`) for code and tabular data (benchmark values, prices use `font-variant-numeric: tabular-nums`). Type scale base 16 / ratio 1.2 (body 16px, secondary `--text-supporting-size` 14px, tracked micro-labels `--font-size-sm` 13px — nothing smaller); heading weights 700. Display sizes are theme tokens: `--text-display-1-size: clamp(2.25rem, 4vw, 3.25rem)`, `--text-display-2-size: clamp(1.75rem, 1.1rem + 2.6vw, 2.5rem)`. No raw `font-size` values outside `:root`. Helpers: `.eyebrow` (uppercase, tracked, accent), `.lede` (intro paragraph), `.section-header` (eyebrow + h2 + lede block).

---

## 4. Layout, spacing, radius, shadow, motion

- **Shell:** `--site-shell: 1200px` (`.site-shell`). Section rhythm `--section-y: clamp(3rem, 5.5vw, 5rem)` (`clamp(2.5rem, 5vw, 3.25rem)` at ≤1024px), `--section-y-sm` for shallow bands, `--header-gap` under section headers; two consecutive light sections share one gap (the second's top padding halves), dark/royal/tint bands keep full padding.
- **Bands:** `.section` (light), `.section-tint` (lavender), `.section-dark` (night), `.section-deep` (night-deep), `.section-royal` (violet gradient), `.section-sm` (shallow).
- **Card grid contract:** one rule drives every card row — `repeat(auto-fit, minmax(min(100%, var(--card-min)), 1fr))`. A family sets `--card-min` (and `--card-gap` when it needs a different gutter); the column count then follows the space available, so no card family carries a breakpoint or a hardcoded count. Current minimums: `.grid-2/-3/-4` 17rem, `.product-grid` 16rem, `.steps-grid` 15rem, `.split-list` 14rem, `.stats-row` 10rem, `.sec-stats` 9rem, plan deck 300px. Adding a family means adding a `--card-min`, never a media query.
- **Plan deck:** three layouts over one DOM — stacked ≤640px, a two-up snap rail 641–1023px (`Rail`), auto-fit from 1024px. Cards align through `subgrid` (rail → slide → card, four rows: head, price, CTA, body), so price and CTA sit on the same line across a row. A card's query container is `.plan-body`, never `.plan-card` — inline-size containment disqualifies an element from being a subgrid.
- **Scrollers:** `useOverflow` (`lib/use-overflow.ts`) measures whether a box really scrolls. Tab stops, prev/next buttons, dots and `aria-roledescription="carousel"` are all conditioned on it — a static grid must not announce itself as a carousel, and a box that fits must not be a focus stop.
- **Radius:** cards 20px (theme), plan finder and tables 24px/20px, chips and buttons 999px.
- **Shadow:** Astryx `--shadow-low / --shadow-med / --shadow-high` (ink-violet tinted via `--color-shadow`).
- **Motion tokens:** `--duration-fast 125ms`, `--duration-medium 300ms`, `--duration-slow 700ms` (theme `motion`), easing `cubic-bezier(0.32, 0.72, 0, 1)` for reveals and slides.
- **Sticky offsets:** `SiteHeader` measures itself into `--site-header-h`; `ProductSubnav` adds `--subnav-h`; `html { scroll-padding-top }` and every sticky element use those two variables. Never hardcode a header height.

---

## 5. Component inventory

**Site chrome** (`components/site/`): `SiteHeader` (announcement, sticky nav, mega menu, mobile drawer, height publisher), `SiteFooter`, `MobileCtaBar` (phone-only sticky CTA), `ProductSubnav` (desktop sticky "On this page" pills + "Help me choose" + "From $X/mo"), `FinderDrawer` (site-wide "Help me choose" `<dialog>`), `FinderJump` (home: in-page jump to the inline finder), `CurrencySwitch` (USD/INR via `<html data-currency>`), `RevealScript` (scroll reveal).

**Shared atoms** (`components/`): `Price` (dual-currency spans, CSS shows one — never mutate from JS), `RatingBadge` (aggregate rating from `data/site.json`), `CountUp` (stat count-up), `Icon` (theme icon registry), `BrandMark` (real brand glyphs from the vendored Simple Icons subset in `lib/brand-icons.ts`; server-only — pass the node into client components), `Prose`.

**Sections** (`components/sections/`, dispatched by `SectionRenderer` from the `type` in content frontmatter):

| `type` | Component | Notes |
| --- | --- | --- |
| `hero` | `Hero` | gradient/product/simple; the home hero is hosting-first — eyebrow, h1, lede, rating, offer, CTA pair, intent chips, no domain field. Domain search lives in the `domainsearch` section and on `/domains`. |
| `trustbar` | `TrustBar` | four items become four tiles ≥900px |
| `pricing` | `PlanCards` (client) | spec tiles read from each tier's features (`lib/plan-specs.ts`), native `<details>` "All features" with grouped rest + deck highlights, "Every plan includes" brand strip from a "·" deck note, shared billing store, term-only labels |
| `comparison` | `ComparisonTable` → `CompareTable` (client) | grouped rows, best-for, synced billing, sticky header |
| `planfinder` | `PlanFinder` → `FinderFlow` (client) | four steps, budget bands from real prices, `?for=` prefill; the same flow powers `FinderDrawer` |
| `features` | `FeatureGrid` | optional `metric`, `variant: tiles` |
| `products` | `ProductGrid` | starting prices |
| `content` | `ContentSplit` | copy beside the art, checklist as a full-width night strip (count-based columns) |
| `steps` | `StepProcess` | scroll-snap rail on phones |
| `stats` | `StatsBand` | `CountUp` values |
| `benchmark` / `race` | `BenchmarkBars` | bars fill on reveal, optional `scale` caption |
| `testimonials` | `Testimonials` → `TestimonialCarousel` (client) | inline or global items, rating aggregate |
| `faq` | `FaqAccordion` | native exclusive `<details>`, FAQPage JSON-LD |
| `osstrip` | `OsStrip` → `DeployTabs` (client) | real distro/panel glyphs where they exist, letter marks otherwise; tabs only when items span OS/panel/app |
| `showcase` | `ShowcaseTabs` (client) | Astryx TabList product panels |
| `techlogos` | `TechLogos` | brand glyph + name; wordmark only where no glyph exists |
| `domainsearch`, `cta`, `storycards`, `security`, `mapband` | one component each | static |

Illustrations are hand-built SVG in `components/art/` (`HeroArt`, `ProductArt`, `SectionArt`), all `aria-hidden`.

Every section receives a stable `id` from `lib/section-ids.ts` (explicit content `id` wins, else a per-type default — `pricing`, `features`, `compare`, `faq`, `reviews`, `deploy`, `planfinder`, `stats`, `benchmark`… — with `-2`, `-3` suffixes for repeats).

---

## 6. Interactions

| Behaviour | Where | Trigger | Reduced motion | Without JS |
| --- | --- | --- | --- | --- |
| Scroll reveal + stagger | `RevealScript`, `[data-reveal]`, `--reveal-i` | IntersectionObserver marks `data-visible` | everything visible at once, no delay | content is never hidden — transform only |
| Billing period | `lib/billing-store.ts` (client), `lib/billing.ts` (pure) | SegmentedControl in `PlanCards` and `CompareTable` | n/a | annual prices shown (server snapshot) |
| Currency | `CurrencySwitch`, `Price` | flips `<html data-currency>` | n/a | USD |
| Plan finder | `FinderFlow`, `lib/plan-finder.ts`, `lib/intents.ts` | option buttons; `/?for=<intent>#planfinder` prefills the build | no slide between steps | first question renders; answers need JS |
| Help-me-choose drawer | `FinderDrawer`, `lib/recommend-store.ts` | any `[data-finder]` link (hero help, intent chips on landing pages, pricing banner, sub-nav); native `<dialog>` side panel ≥641px, bottom sheet on phones; "Show it on this page" marks and scrolls to the matching card | no slide-in, instant scroll | links lead to `/#planfinder` |
| In-page finder jump | `FinderJump`, `lib/finder-intent-store.ts` | on the home page the same links scroll to the inline finder on step two and rewrite the URL to `?for=` | instant scroll | links lead to `/#planfinder` |
| Plan card details | `PlanCards` `<details class="plan-more">` | summary toggles grouped rest features + deck highlights; CSS `::details-content` animation where supported; price re-enters on billing change | no transition | native open/close |
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

Enforced by `npm run check:contrast` (`scripts/check-contrast.mjs`, WCAG 2.1 math: body ≥4.5:1, large/UI ≥3:1). Every rendered pairing is listed in `PAIRS` — adding a colour pairing means adding it there; thresholds are never lowered. The list includes the hero intent chips over night, the comparison table's active column tint (`#f4f0fd`), the benchmark axis caption on night, the carousel's inactive dot on white, and the plan spec tiles on violet-050.

- Visible `:focus-visible` on every interactive element: violet on light grounds, lavender (`#faf7ff`) on night/violet bands, gold only on the violet CTA button.
- Tap targets ≥24px (dots 24px, chips and sub-nav pills ≥36px, buttons ≥44px).
- Native semantics first: `<details>` accordion, `<table>` with `scope`, `<nav aria-label>`, `role="region"` + `aria-roledescription="carousel"`, `aria-live` for step and slide announcements, `aria-current` for the active pill.
- Mobile above-the-fold: at ≤640px `.hero-actions .btn-primary` must sit within the first 844px (`scripts/qa-shots.mjs` asserts it; keep that class name). The home hero leads with the hosting CTA pair — no domain field; `.domain-row` lives in the mid-page `#domains` section and on `/domains`.

---

## 8. Content rules

- A price is always shown with its term ("per month, billed monthly / yearly"). No renewal claim without renewal data in the catalog.
- Discounts come only from real `price` vs `priceAnnual` pairs (`savePct`); one promo line per page, in the announcement bar.
- Testimonials carry a name and a site; the data has no role/company field yet — add one before claiming it.
- Stats and benchmark bars are authored numbers from content; `CountUp` animates only plain quantities and never invents a value.
- Deploy chips get descriptions only when the text is copied verbatim from a plan highlight or the page's own copy (test-enforced).
- Brand marks are real glyphs only: the vendored Simple Icons subset (`lib/brand-icons.ts`, CC0, regenerated by `scripts/vendor-brands.mjs`). A brand without a glyph (LiteSpeed, CloudLinux, CyberPanel, Softaculous, WHMCS) is a wordmark or a letter mark — never a drawn approximation.
- Plan card specs and the "Every plan includes" strip are derived from the catalog (`data/plans/*.json` features and a "·"-separated `billingNote`), never authored twice.
- No sparkle/"magic" language, no fake scarcity, no chat widgets that open themselves.

---

## 9. Contracts and verification

- **CMS lockstep:** a new section type or field changes `lib/content.ts` (use `z.enum` for enumerations — `verify-cms.mjs` reads every `z.literal` as a section type), `components/sections/SectionRenderer.tsx` and `public/admin/config.yml` in the same commit. The CMS (Sveltia, Decap-compatible) deletes unknown fields on save; `/admin` login runs through `app/oauth/*` (see README).
- **Route contract:** 60 content routes and 7 redirects (`tests/routes.test.ts`); every off-site CTA points at `https://my.royalclouds.net`.
- **Server/client boundary:** section shells are server components; client children receive serialisable props. `lib/billing.ts` is importable everywhere, `lib/billing-store.ts` only from client files.
- **Gates:** `npm run check` (theme drift, `next typegen`, `tsc`, ESLint, Vitest, CMS lockstep, contrast) and `npm run build` must exit 0. Visual QA: `npm run dev` then `node scripts/qa-shots.mjs` (1440 and 390 widths, zero console errors, above-the-fold assertion).
