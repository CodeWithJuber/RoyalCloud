# Royal Clouds — Design System v3

**Violet & Gold Edition** · August 2026

---

## 1. What changed and why

v3 supersedes both prior directions in this repo's history:

- **v2** (`cobalt/orange "Premium Dynamic Hosting Edition"`) — a telemetry-visual concept (Network Atlas, Deploy Log, Latency Ring, Royal Console frames, live-feeling capacity bars) meant to make the site feel like "a window into a running fleet." It was never fully carried through, and the live-telemetry storytelling was retired outright: none of it ships real data, and a component whose numbers can't be real doesn't ship (§9 carries this rule forward). The visuals it specified (`ShieldStack`, `DeployLog`, `LatencyRing`, `NetworkAtlas`, `RoyalConsole`, `RouteSignal`, `StackSchematic`, `RoyalCloudscape`, `AltitudeScene`) are deleted.
- **The pixel-clone-of-live-royalclouds.net direction** — an interim effort to match the sky-blue/navy/gold look of the production site exactly. Retired because it inherited real WCAG AA failures from the live site (`#999` body text at 2.85:1, `#ff5e3a` eyebrow at 3.04:1, `#269fd9` heading at 2.98:1) rather than fixing them.

v3 replaces both with a violet/gold identity, rebuilt token-first so every text/background pairing is verified rather than eyeballed (`npm run check:contrast`, §8).

---

## 2. Design read

Royal Clouds reads as a premium hosting brand for founders, developers, and agencies graduating out of budget hosts — competent and calm, not a simulated control-room. Direction: clean marketing patterns (hero, trust strip, feature narrative, pricing grid, testimonials, CTA band, footer) over a violet (`#673de6`) and gold (`#ffc94b`) palette, set in DM Sans, on mostly-dark section bands (`--rc-night` / `--rc-night-deep`) with light cards for contrast. No simulated telemetry, no live-fleet theater — see §9.

---

## 3. Token architecture

Three layers, split across two files that must load in this order (`src/layouts/SiteLayout.astro` imports `tokens.css` before `global.css` — this ordering was previously broken, i.e. `tokens.css` was never loaded at all, and was fixed as part of this rewrite):

- **`src/assets/styles/tokens.css`** — primitives + most of the semantic layer (surfaces, text roles, brand roles, lines/status, type/radius/shadow/motion/spacing primitives, the component layer).
- **`src/styles/global.css`** — component and layout rules that consume those tokens, plus a second, page-scoped semantic layer (`--canvas`, `--heading`, `--body`, `--muted`, `--interactive`, `--line`, `--field-line`, `--viz-*`) that `.section-light` / `.section-dark` / `.section-royal` repoint per band. Where global.css redeclares a name tokens.css also declares — `--font-mono`, `--line`, `--paper` — global.css's value wins (it's imported second); this is deliberate, not drift. `--font-body` is no longer one of those names: global.css's competing declaration (and the dead, unused `--font-display: "Bricolage Grotesque Variable"`) were removed so tokens.css's DM Sans value wins for body text too, per the binding typography spec.

**Rule:** components consume semantic/component names only, never primitives directly.

### Primitive table

| Token                           | Value                             | Note                                                                                           |
| ------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------- |
| `--rc-primary`                  | `#673de6`                         | Brand violet                                                                                   |
| `--rc-primary-dark`             | `#5025d1`                         |                                                                                                |
| `--rc-primary-light`            | `#7d59d9`                         | Darkened from the design reference's `#8a63f0` — fails contrast at that value. Do not restore. |
| `--rc-primary-050`              | `#f0edff`                         | Tint surface                                                                                   |
| `--rc-lavender`                 | `#faf7ff`                         | Near-white; text on dark/violet grounds                                                        |
| `--rc-ink`                      | `#2f1c6a`                         | Heading ink on light                                                                           |
| `--rc-night`                    | `#2f1c6a`                         | Dark section band                                                                              |
| `--rc-night-deep`               | `#231252`                         | Darker band (footer, nested panels)                                                            |
| `--rc-body`                     | `#595b68`                         | Body text on light                                                                             |
| `--rc-muted`                    | `#8b8c99`                         | Muted text on **light** grounds only — see §7                                                  |
| `--rc-muted-dark`               | `#a8a8b3`                         | Muted/body text on **dark** grounds (`--rc-night`/`--rc-night-deep`) — see §7                  |
| `--rc-success`                  | `#009e81`                         | Darkened from the design reference's `#00b090` — fails contrast at that value. Do not restore. |
| `--rc-gold`                     | `#ffc94b`                         | The only conversion/CTA accent color                                                           |
| `--rc-gold-light`               | `#ffd97a`                         |                                                                                                |
| `--rc-white`                    | `#ffffff`                         |                                                                                                |
| `--rc-border`                   | `#e9e4f7`                         | Hairline on light                                                                              |
| `--green` / `--amber` / `--red` | `#009e81` / `#9a5c00` / `#d32f2f` | Functional status, not brand; darkened for AA on white                                         |

---

## 4. Typography

Two self-hosted variable fonts (`@fontsource-variable/*`), loaded in `SiteLayout.astro`:

- **Headings** — `--font-heading` (tokens.css only; global.css does not override it): **DM Sans Variable**, falling back to `"DM Sans"`, `ui-sans-serif`, `system-ui`, `sans-serif`.
- **Body** — `--font-body` (tokens.css only; global.css no longer redeclares it): **DM Sans Variable**, same stack as `--font-heading`. `SiteLayout.astro` imports `@fontsource-variable/dm-sans` and preloads `dm-sans-latin-wght-normal.woff2`; the `bricolage-grotesque` and `manrope` imports/preloads were removed as unused.
- **Monospace** — `--font-mono`: global.css wins with **JetBrains Mono Variable**, used only in terminal/code-style components.

### Type scale

There is one tokenized display size — `--fs-display: clamp(42px, 5.8vw, 76px)` — used for the largest hero headline. The rest of the scale is expressed as inline `clamp()` sizes directly on semantic selectors in `global.css`, not as a named token family:

| Role       | Selector   | Size                                                |
| ---------- | ---------- | --------------------------------------------------- |
| H1         | `h1`       | `clamp(3rem, 6.4vw, 5.6rem)`, weight 680            |
| H2         | `h2`       | `clamp(2.2rem, 4vw, 3.4rem)`, weight 640            |
| H3         | `h3`       | `clamp(1.35rem, 2vw, 1.7rem)`, weight 600           |
| Lede       | `.lede`    | `clamp(1.125rem, 1.4vw, 1.3rem)`, max 62ch          |
| Body       | `p`        | `1rem` / 1.6, max 68ch                              |
| Eyebrow    | `.eyebrow` | `0.8125rem`, weight 700, uppercase, 0.16em tracking |
| Fine print | `.fine`    | `0.8125rem`, weight 600                             |

If a new named scale (e.g. `--rc-fs-*`) is ever introduced, extend this table — don't invent tokens in this doc that don't exist in `tokens.css`.

---

## 5. Spacing, radius, shadow, motion

**Spacing** — 4px grid, in `tokens.css`: `--s-1: 4px` `--s-2: 8px` `--s-3: 12px` `--s-4: 16px` `--s-6: 24px` `--s-8: 32px` `--s-12: 48px` `--s-16: 64px`. Section rhythm: `--space-section: 100px` (`--space-section-sm: 60px` on shallow sections). Canvas: `--maxw: 1140px`, gutter `--wrap-pad: 15px` — `.shell` (global.css) additionally clamps to `min(82.5rem, 100% - clamp(2rem, 6vw, 4rem))` for the wider block-driven layout.

**Radius** — `tokens.css`: `--radius-panel: 24px` `--radius-card: 16px` `--radius-btn: 999px` `--radius-md: 12px` `--radius-lg: 18px` `--r-sm: 8px`. `global.css` adds the "double bezel" family used by the header island, nav panels, and `.bezel`: `--r-input: 14px` `--r-inner: 23px` `--r-shell: 30px` `--r-pill: 999px`.

**Shadow** — ink-based, one scale, in `tokens.css`: `--shadow-xs` `--shadow-sm` `--shadow-md` `--shadow-lg`, plus `--shadow-card` (= sm), `--shadow-card-hover` (= md), `--shadow-cta` (gold-tinted lift). `global.css` adds a violet-tinted set for dark-band chrome: `--sh-1` `--sh-2` `--sh-3`.

**Motion** — `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)` with `--dur-1: 0.15s` `--dur-2: 0.22s` `--dur-3: 0.32s` (tokens.css); `global.css` also defines `--ease: cubic-bezier(0.32, 0.72, 0, 1)` used by older component transitions (card lift, nav panel, reveal). Every animation wraps `@media (prefers-reduced-motion: reduce)`; the global reduced-motion rule in `global.css` additionally collapses all transition/animation durations to near-zero as a backstop.

---

## 6. Component inventory

Real class names, verified against `src/styles/global.css` and the block components — not the aspirational `.rc-btn`/`.rc-pill`/`.rc-card`/`.rc-input` names from earlier planning notes, which were never implemented.

**Atoms** (`global.css`, shared everywhere):
`.button` / `.button-primary` (gold pill, nested arrow island) / `.button-ghost` / `.button-invert` / `.button-cta` / `.button-block`, `.card`, `.bezel` (double-bezel shell: 30px outer, 23px inner face), `.chip` / `.chip-discount` / `.chip-save`, `.eyebrow`, `.lede`, `.fine`, `.mono`, `.status-dot`, bare `input`/`textarea`/`select` styling (no `.field`/`.input` wrapper class).

**Molecules** (per-block, scoped styles, consuming atoms + tokens): `.section-header` (eyebrow + heading + lede intro block), `.trust__rail` (stat rail, `TrustStrip.astro`), `.feature-list` (`FeatureNarrative.astro`), `.plan` (pricing card, `PricingGrid.astro`), `.quotes` (`Testimonials.astro`), `.plates`/`.plate` (spec plates), `.terminal` (code/CLI display), `.ledger-table`.

**Organisms**: header (`SiteHeader.astro` — announcement band, marquee, floating pill nav island), pricing grid (`PricingGrid.astro`), CTA band (`Cta.astro`), footer (`SiteFooter.astro`). Content composition beyond these lives in `src/components/blocks/*.astro`, dispatched by `BlockRenderer.astro` from the Storyblok-driven `PageBlock` union in `src/types/content.ts` — this CMS pipeline is unchanged by v3.

---

## 7. Accessibility floor

Enforced by `npm run check:contrast` (`scripts/check-contrast.mjs`) — every pairing the system renders is listed and computed against WCAG 2.1 math (body ≥4.5:1, large text/UI ≥3:1), not eyeballed. Adding a new pairing requires adding it to `PAIRS`; thresholds are never lowered.

**Dark/violet-ground text rule.** On `--rc-night` / `--rc-night-deep` / `--rc-primary`, muted or body-weight text must use `--rc-muted-dark` (5.96:1 on night, 6.97:1 on night-deep) or `--rc-lavender` (14.05:1 / 16.41:1) — **never `--rc-muted`**, which is tuned for light grounds only and fails AA on both dark surfaces (4.22:1 on night, 1.86:1 on primary).

**Focus-ring override pattern.** The global `:focus-visible` outline is `--rc-primary` (2px, in `global.css`), which is invisible on violet-family gradients (1.00:1 on `--rc-primary-light`) and under 3:1 on `--rc-night` (2.88:1 via the old `--rc-primary-light` choice). `Hero`, `Cta`, `OperatorStrip`, and `ShowcaseTabs` each scope a local override to `var(--rc-lavender)` for their `:focus-visible` rings. The back-to-top button (§8) uses `--rc-gold` instead — that clears 3:1 against its own `--rc-primary` fill (4.05:1) and is documented as its own pairing in `PAIRS`. When adding a new interactive element to a dark/gradient surface, check the default ring against that surface before shipping; don't assume `--rc-primary` is visible everywhere.

Other floor items: visible `:focus-visible` on every interactive element (no `outline: none` without a replacement); tap targets ≥24×24px (back-to-top is 44×44); all animation wrapped in `prefers-reduced-motion` at ≥200ms base duration; landmark structure per template; alt text and form labels present.

---

## 8. Interactions

Corrects an earlier planning note that pointed at a deleted file — the live reveal system is `[data-reveal]`, handled inline in `src/layouts/SiteLayout.astro`'s `<script>` block via `IntersectionObserver` (falls back to marking everything visible immediately if reduced-motion is set or `IntersectionObserver` is unavailable). `RevealScript.astro` and its `.reveal`/`.in` class convention were deleted; do not reintroduce or reference them.

| Behavior                   | Implementation                                                                          | Notes                                                                                                                                          |
| -------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Scroll reveal              | `[data-reveal]` / `[data-visible]`, `SiteLayout.astro`                                  | Content is never hidden by default — only `transform` moves; reduced-motion marks everything visible instantly                                 |
| Accordion                  | `FaqAccordion.astro`, native `<details>/<summary>`                                      | Zero JS, already accessible                                                                                                                    |
| Tabs                       | `ShowcaseTabs.astro`                                                                    | Full ARIA + keyboard nav                                                                                                                       |
| Mobile nav / dropdowns     | `SiteHeader.astro`, `<details>`-based, custom focus trap + Escape handling              | See the shared `if (header) {...}` script block                                                                                                |
| Header scroll-shadow       | `SiteHeader.astro`, `.header-dock.is-scrolled` toggled by a throttled `scroll` listener | Threshold 8px; `prefers-reduced-motion` removes the shadow's transition, not the shadow itself                                                 |
| Marquee / ticker           | `SiteHeader.astro`, `.marquee`                                                          | Pure CSS `@keyframes`, `aria-hidden`, animation fully removed under reduced-motion                                                             |
| Scrollspy (Legal TOC)      | `Legal.astro`, `[data-legal-nav]`                                                       | `IntersectionObserver` with an asymmetric `rootMargin`; topmost intersecting section wins so it tracks correctly scrolling in either direction |
| Back-to-top                | `SiteLayout.astro`, `[data-to-top]`                                                     | Appears past 600px scroll; `scrollTo` behavior is `"auto"` (instant) under reduced-motion, `"smooth"` otherwise                                |
| Live chat                  | `LiveChat.astro`                                                                        | Real embed, out of scope for this rewrite                                                                                                      |
| Countdown / urgency timers | —                                                                                       | Not built — contradicts §9                                                                                                                     |

---

## 9. Anti-patterns

Carried forward from earlier revisions of this document:

- No countdown timers or fake scarcity ("3 people are viewing this plan").
- No discount-badge stacking — one promo statement per page, in the announcement line only.
- No prices without term length and renewal price shown adjacent.
- No un-attributed testimonials — name, role, and company, or don't ship the quote.
- No auto-playing video with sound.
- No AI-purple gradients, sparkle emoji, or "magic" language around AI features.
- No screenshots of a competitor's panel, no stock hosting cartoons, no chat widgets that pop themselves open.
- No simulated live telemetry (fleet stats, capacity bars, deploy logs) unless the number is real — this is the direct lesson from v2's retirement (§1): if the data can't be real, the component doesn't ship.
