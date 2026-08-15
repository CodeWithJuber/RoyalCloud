# Royal Clouds — Royal Systems Design Language v2

**Premium Dynamic Hosting Edition** · July 2026

---

## 0. What changed in v2 and why

v1 defined a strong editorial-tech identity. v2 keeps that identity and upgrades it into a **premium, dynamic, conversion-grade hosting system** by absorbing the best proven patterns from Ultahost and Hostinger without inheriting their look:

| Learned from | Pattern absorbed | Royal Clouds translation |
| --- | --- | --- |
| Ultahost | Radical billing transparency ("Billed for 24-month term, renews at $X/mo") | **Honest Ledger** pricing rules — every price shows term, renewal, and total, always |
| Ultahost | Deep hardware storytelling (NVMe, EPYC, PCIe Gen 5, 30+ DCs) | **Spec Plates** — machined hardware spec components with tabular numerals |
| Ultahost | Security stack as a named system (DDoS, malware scan, 2FA) | **Shield Stack** exploded diagram + per-plan security matrix |
| Ultahost | Support chat mockup with a real answer inside it | **Live Answer** component — a real support transcript, not a cartoon |
| Hostinger | Own-panel as product hero (hPanel) | **Royal Console** frames — the control panel shown as a first-class visual |
| Hostinger | AI website builder as a guided sequence | **Launch Sequence** module — 3-step build narrative with device preview |
| Hostinger | Developer tooling as a differentiator (IDE connector, Node hosting) | **Operator Tools** section family — CLI, API, Git deploy shown as real terminals |
| 2026 trend research | Type-first heroes, sequence-driven scroll, layout-as-system | Hero is a typographic thesis + live telemetry, sections answer questions in order |

What we deliberately did **not** copy: Hostinger's purple SaaS field, Ultahost's dense promo-bar clutter, countdown-timer urgency theater, stacked discount badges, and stock 3D mascots. Royal Clouds sells competence, not panic.

---

## 1. Design Read

Royal Clouds is a premium hosting brand for founders, developers, agencies, and infrastructure buyers who are graduating out of budget hosts. The site must read as **an operations company that happens to have a beautiful website** — engineered, decisive, globally capable, and alive.

**Direction:** cinematic editorial-tech with Swiss information structure, cobalt-black fields, signal-orange actions, chrome linework, custom systems diagrams, and — new in v2 — **live-feeling telemetry** woven through every commercial surface.

**Dials:** variance 9 · motion 7 · density 4 · dynamism 8 (new).

---

## 2. Concept Spine

**The cloud, made legible — and shown running.**

v1 made infrastructure legible as static diagrams. v2 makes it feel *operational*. Every page contains at least one element that behaves like a live system: a route pulsing, a capacity bar filling, a deploy log ticking, a latency number settling. The visitor should feel they are looking through a window into a running fleet, not at a brochure about one.

This is the single aesthetic risk of the system, and everything else stays quiet to let it work.

---

## 3. Anti-Patterns (extended)

Everything from v1 remains banned, plus:

- No countdown timers, fake scarcity, or "3 people are viewing this plan."
- No discount badge stacking (one promo statement per page, in the announcement line only).
- No prices without term length and renewal price adjacent.
- No screenshot of a competitor's panel; only the Royal Console.
- No auto-playing video with sound; ambient motion is CSS/SVG only.
- No chat widgets that pop themselves open.
- No AI-purple gradients, sparkle emoji, or "magic" language around AI features — AI features are described as tools with inputs and outputs.
- No testimonial walls without names, roles, and verifiable companies.
- No stock hosting cartoons, purple mesh gradients, repeated left-copy/right-image rhythm, equal three-card grids, decorative micro-copy, unsupported benchmarks, or 3-line desktop headlines (carried from v1).

---

## 4. Token Architecture

Three layers: **primitive → semantic → component.** Components never reference primitives directly. All tokens are CSS custom properties on `:root`, dark-context overrides on `[data-surface="dark"]`.

### 4.1 Primitive — Color

| Token | Value | Note |
| --- | --- | --- |
| `--night` | `#050712` | OLED canvas |
| `--midnight` | `#0A0E24` | Primary dark surface |
| `--abyss` | `#0E1330` | Elevated dark surface (new) |
| `--cobalt` | `#2F36D4` | Royal brand field |
| `--cobalt-bright` | `#5660FF` | Interactive signal |
| `--cobalt-dim` | `#1E2494` | Pressed / borders on cobalt (new) |
| `--signal` | `#FF6B3D` | Single conversion accent |
| `--signal-hot` | `#FF8A66` | Hover / focus |
| `--ice` | `#F4F6FB` | Light editorial field |
| `--paper` | `#FFFFFF` | Pure card on ice (new) |
| `--chrome` | `#CAD1E5` | Technical linework |
| `--smoke` | `#9099B2` | Secondary copy on dark |
| `--graphite` | `#20263B` | Secondary copy on light |
| `--pulse-ok` | `#3DDC97` | Live status: operational (new) |
| `--pulse-warn` | `#FFC24B` | Live status: degraded (new) |
| `--pulse-down` | `#FF5C5C` | Live status: incident (new) |

Rules: cobalt is a structural field, never a glow. Signal orange remains the **only** conversion color. Pulse colors appear only inside telemetry components (status dots, uptime strips, capacity bars) at ≤ 16px scale — never as section backgrounds or headline color.

### 4.2 Primitive — Space, Radius, Depth

| Group | Tokens |
| --- | --- |
| Space (4px base) | `--sp-1: 4px` `--sp-2: 8px` `--sp-3: 12px` `--sp-4: 16px` `--sp-5: 24px` `--sp-6: 32px` `--sp-7: 48px` `--sp-8: 64px` `--sp-9: 96px` `--sp-10: 128px` |
| Radius | `--r-input: 14px` `--r-inner: 23px` `--r-shell: 30px` `--r-pill: 999px` `--r-none: 0` |
| Shadow (cobalt-tinted) | `--sh-1: 0 2px 8px rgb(47 54 212 / .08)` · `--sh-2: 0 8px 28px rgb(47 54 212 / .12)` · `--sh-3: 0 20px 60px rgb(10 14 36 / .28)` |
| Dark depth | inner highlight `inset 0 1px 0 rgb(202 209 229 / .07)` + layered `--chrome` linework at 10–16% opacity. Never black drop shadows on dark. |
| Z-scale | `--z-base: 0` `--z-raised: 10` `--z-nav: 100` `--z-overlay: 200` `--z-toast: 300` |

### 4.3 Semantic layer (excerpt)

```css
--surface-page: var(--ice);
--surface-page-dark: var(--night);
--surface-card: var(--paper);
--surface-card-dark: var(--abyss);
--text-primary: var(--midnight);
--text-primary-dark: var(--ice);
--text-secondary: var(--graphite);
--text-secondary-dark: var(--smoke);
--action-primary: var(--signal);
--action-primary-hover: var(--signal-hot);
--interactive: var(--cobalt-bright);
--line-technical: var(--chrome);
--status-ok: var(--pulse-ok);
```

### 4.4 Component layer (pattern)

```css
--btn-primary-bg: var(--action-primary);
--btn-primary-fg: var(--night);
--plan-featured-bg: var(--cobalt);
--console-bg: var(--midnight);
--telemetry-bar: var(--interactive);
```

---

## 5. Typography

- **Display:** Bricolage Grotesque Variable, self-hosted, weights 560–720, `font-optical-sizing: auto`.
- **Body/UI:** Manrope Variable, self-hosted, weights 450–760.
- **Data/terminal:** JetBrains Mono Variable (new), self-hosted, 400–600 — used only inside terminals, code blocks, telemetry readouts, and IP/route labels.
- **Technical labels:** Manrope uppercase, `0.16em` tracking, 12–13px.
- **Numerals:** tabular in all prices, specs, and telemetry (`font-variant-numeric: tabular-nums`).

### Type scale

| Role | Size | Face / weight | Rules |
| --- | --- | --- | --- |
| Hero H1 | `clamp(4rem, 7.6vw, 7.4rem)` | Bricolage 680 | Max 2 lines desktop, short statements only |
| Section H2 | `clamp(2.2rem, 4vw, 3.4rem)` | Bricolage 640 | Max 3 lines, vary measure per section |
| Card H3 | `clamp(1.35rem, 2vw, 1.7rem)` | Bricolage 600 | |
| Lead | `clamp(1.125rem, 1.4vw, 1.3rem)` | Manrope 500, 1.55 line-height | Max 62ch |
| Body | `1rem` / 1.6 | Manrope 470 | Max 68ch |
| Label | `0.8125rem` | Manrope 700 UPPERCASE 0.16em | |
| Price display | `clamp(2.4rem, 3.4vw, 3.2rem)` | Bricolage 700, tabular | Currency symbol at 0.5em, superscript |
| Terminal | `0.875rem` / 1.7 | JetBrains Mono 450 | |
| Telemetry digits | `0.8125rem` | JetBrains Mono 550, tabular | |

Exactly one visible H1 per route.

---

## 6. Composition & Grid

- Max canvas `1320px`; page gutter `clamp(1rem, 3vw, 2rem)`; 12-column grid, `24px` gap desktop.
- Section vertical rhythm: `--sp-9` between major sections, `--sp-10` before/after full-bleed cobalt fields.
- **Navigation:** detached floating island below the announcement line; blurred `--midnight` at 88% with chrome hairline; collapses to pill logo + menu at 768px.
- **Hero:** editorial offset — copy upper-left, live visual system spanning lower-right and bleeding behind the fold. Type-first: the headline is the largest object on screen; the visual supports it.
- **Sequence-driven scroll:** every long page answers questions in order: *What is this? → Prove it works → What does it cost, honestly? → What if I need help? → Act.* Each section is designed as an answer, and at least three distinct composition anchors (from §6.1) appear on every long page.

### 6.1 Composition anchors

1. Editorial offset hero (copy UL / system LR)
2. Asymmetric gapless bento (one dominant panel + operational panels)
3. Full-width cobalt field (Network Atlas or Shield Stack)
4. Horizontal plan deck with featured plane
5. Boxless accordion answer rows
6. Signal CTA field with route graphic
7. **Operator strip** (new): full-width `--night` band with a live terminal or deploy log
8. **Ledger table** (new): editorial full-width comparison/spec table with hairline chrome rules

---

## 7. Shape & Surface System

- Major visual shells: double bezel — outer `--r-shell` (30px), inner `--r-inner` (23px), 7px reveal carrying a chrome hairline.
- Editorial content sections: no container radius.
- Controls and primary actions: pill. Utility inputs: `--r-input` (14px). Chips: pill.
- Terminals/consoles: outer 23px, header bar with three 8px chrome dots (decorative, `aria-hidden`), `--midnight` body.
- Shadows: cobalt-tinted ambient (`--sh-*`) on light; inner highlight + layered linework on dark.

---

## 8. Signature Visuals

All native SVG/CSS under `src/components/visuals/`, sharing one 1.5px stroke language in `--chrome`, responsive, accessible (title/desc on meaningful diagrams, `aria-hidden` on decorative layers).

1. **Royal Cloudscape** — isometric orbital compute system for the home hero; v2 adds slow packet dots traveling its routes.
2. **Hosting Stack Schematic** — exploded edge → runtime → storage → protection → support layers.
3. **Network Atlas** — world route map with nodes, traffic bands, region labels; nodes carry `--pulse-ok` status dots.
4. **Plan Telemetry** — capacity bars and resource coordinates inside pricing cards; bars animate to value on reveal.
5. **Shield Stack** (new) — security layers (WAF → DDoS scrub → malware scan → isolation → backup) as concentric plates.
6. **Royal Console frames** (new) — stylized, truthful renderings of the actual control panel in double-bezel shells; never fake data the product can't show.
7. **Deploy Log** (new) — a monospace ticker (`git push → build → provision → live 47s`) used in developer sections.
8. **Latency Ring** (new) — a circular gauge that settles on a measured-style number (e.g., `TTFB 87ms`), used in performance sections.

---

## 9. Motion System

- Entry: `720ms cubic-bezier(0.32, 0.72, 0, 1)`, opacity + transform only, 60ms stagger within a group, triggered once via `IntersectionObserver` (allowed; scroll-position listeners are not).
- Ambient: slow transform-only orbital drift (≥ 40s loops); packet dots via `offset-path`; telemetry bars fill via `scaleX` from registered origin.
- Micro: primary button's inner arrow island translates 4px while the pill compresses `scale(0.985)` on active; accordion chevrons rotate 180°; plan deck cards lift `translateY(-6px)` + `--sh-2` on hover.
- Numeric settle: telemetry digits count to value over 900ms using `@property` animated custom properties — CSS only.
- `prefers-reduced-motion`: all ambient and reveal motion removed; state changes become instant opacity.
- Never: GSAP, Lenis, smooth-scroll hijack, layout-property animation, perpetual large-area blur.

---

## 10. Component Library (pixel specs)

### 10.1 Announcement line
36px `--night` band · label-style copy · one promo statement max, e.g. `TRANSPARENT PRICING — RENEWAL RATES SHOWN ON EVERY PLAN` · optional dismiss (persisted in `localStorage`).

### 10.2 Floating island nav
Height 64px · radius pill · inner padding `0 --sp-5` · logo left (preserved asset) · center links 15px Manrope 600 · right: currency switch + `Sign in` link + signal pill `Open console`. Dropdown panels: 23px radius `--abyss` sheets with two-column product links + one Royal Console frame thumbnail.

### 10.3 Buttons
| Variant | Spec |
| --- | --- |
| Primary | Signal pill, 52px height, `0 28px` padding, `--night` text 700, nested 36px arrow island in `--night` at 12% |
| Secondary | Text link + 2px underline track in `--chrome`, fills to `--interactive` on hover |
| Console | 44px pill, `--midnight` bg, chrome hairline, JetBrains Mono label (dev contexts only) |
| Destructive-free | There is no red button on marketing routes |

Focus: 2px `--interactive` ring offset 3px, all interactive elements.

### 10.4 Domain command console
Double-bezel shell (30/23) · 64px input row: `https://` prefix chip, 18px input, TLD select, signal submit `Search domains` · helper line below with live TLD price chips (`.com $9.98 · .io $32.00`, tabular) · results render as ledger rows: domain, availability dot, first-year price, renewal price, add pill.

### 10.5 Plan deck (pricing)
Horizontal deck, 4 planes desktop, featured plane in `--cobalt` with white type and 1.04 scale. Each plane, top to bottom:

1. Label chip (plan name) + "MOST DEPLOYED" tag on featured (only if true).
2. Price display + `/mo` + **Honest Ledger line** — mandatory, 13px: `Billed $71.76 for 24 months · Renews $4.99/mo`.
3. Plan Telemetry: 3 capacity bars (vCPU, RAM, NVMe) with tabular values.
4. 6–8 feature rows, 15px, check glyphs in `--interactive`.
5. Full-width action: signal pill on featured, secondary on others.
6. Footer microline: `30-day money-back · Free migration`.

Billing-term segmented switch (1 / 12 / 24 / 48 mo) sits above the deck; switching re-renders all prices and ledger lines — no hidden math.

### 10.6 Ledger comparison table
Full-width editorial table, no card container. Chrome hairline rows, sticky first column, Royal Clouds column tinted `--cobalt` at 6% with cobalt hairline. Competitor data must be dated (`Source: public pricing, July 2026`). Boolean cells use glyphs + visually-hidden text.

### 10.7 Spec Plates
Machined hardware rows for product pages: 96px plates, chrome top hairline, label left, JetBrains Mono value right (`AMD EPYC 9354 · 3.8GHz boost`, `PCIe Gen 5 NVMe`, `1Gbps unmetered`). Grouped in 2-column gapless grid.

### 10.8 Live Answer (support proof)
Double-bezel chat frame: real anonymized transcript, agent avatar + name + `Response 46s` telemetry chip, 2–3 exchanges max, ends with resolution state `Resolved · 4m 12s`. Never a fake typing indicator.

### 10.9 Launch Sequence (AI builder module)
Three-step horizontal narrative: `01 Describe` (prompt field mock) → `02 Review` (structure tree) → `03 Live` (device trio preview in Console frame). Steps are numbered because the content is a true sequence. One CTA: `Start building`.

### 10.10 Operator strip
Full-bleed `--night` band containing a Deploy Log terminal + copy block: `Push to deploy. Roll back in one click.` Tabs above terminal switch Git / CLI / API examples (real, copyable, `Copy` affordance).

### 10.11 Uptime strip
90 thin vertical ticks (one per day), `--pulse-ok` default, height 28px, hover reveals date + status tooltip. Footer: `99.99% — trailing 90 days` linking to the status page. Only render from real data; omit otherwise.

### 10.12 Accordion answer rows
Boxless: 1px chrome top rule per row, 20px Bricolage 600 question, chevron right, 720ms grid-template-rows reveal. Body max 62ch.

### 10.13 Region picker
Atlas-connected: selecting a region chip (pill, flag-free, text labels `Frankfurt · FRA`) highlights the node on the Network Atlas and updates a latency readout `~ 34ms from your location` (measured client-side via a single HEAD request; shown only when measurable).

### 10.14 Forms & inputs
56px height, `--r-input`, `--paper` on light / `--abyss` on dark, 1px chrome border → 2px `--interactive` on focus, floating-free labels (labels always above, 13px 700). Errors: `--pulse-down` text + specific instruction, never "Invalid input."

### 10.15 Currency switch
Compact segmented pill (USD / EUR / AED / INR), active segment `--midnight` with `--ice` text; persists; all prices re-render with correct symbols and tabular alignment.

### 10.16 Testimonial ledger
Editorial rows, not cards: quote (max 3 lines), name, role, company, and a chrome-hairline metric chip (`Migrated 40 client sites`). No star-rating theater unless from a verifiable platform, then linked.

### 10.17 Toasts, badges, chips
Toast: 23px radius `--abyss`, bottom-right, auto-dismiss 6s, action verb matches its trigger. Status badge: 8px pulse dot + label. Tech chip: pill, chrome hairline, 12px label.

### 10.18 Footer
`--night`, 4-column link groups + newsletter console (input + signal pill `Subscribe`), bottom bar with preserved logo, legal links, live status badge (`All systems operational` + pulse dot linked to status page).

---

## 11. Interactive Innovations (the dynamic layer)

Each is an island component (see §15), hydrated only when visible, with a static SSR fallback.

1. **VPS Configurator** — sliders for vCPU / RAM / NVMe / bandwidth with detented steps; price recalculates live with the Honest Ledger line; a Plan Telemetry graphic mirrors the sliders in real time. This is the signature interactive of the product family.
2. **Latency Check** — one-tap measurement to 3 nearest regions, results settle in Latency Rings.
3. **TCO Slider** — "What you pay elsewhere vs here over 3 years," two honest lines on one axis, competitor figures dated and sourced.
4. **Migration Wizard teaser** — 3-field intake (current host, sites count, panel type) that routes to a human plan; sets expectation `We reply within 2 hours`.
5. **Live telemetry ribbon** — thin band under the hero cycling real fleet-level stats (`214 deploys today · 34 regions · TTFB p50 91ms`); values come from a public metrics endpoint, cached; component omitted entirely if the endpoint is unavailable — never faked.
6. **Plan matcher** — 3-question chooser (traffic, stack, management level) that highlights one plane in the deck instead of adding another page.

Rule for all dynamic elements: **if the number can't be real, the component doesn't ship.**

---

## 12. Page Templates — full system

Every template lists its anchor sequence. Shared: announcement line, island nav, footer, exactly one H1.

### 12.1 Home
1. Hero (anchor 1): H1 max 2 lines — `Hosting that shows its work.` — lead, primary CTA `See plans`, secondary `Run a latency check`; Royal Cloudscape bleeding lower-right; telemetry ribbon beneath.
2. Trust ledger: single hairline row of client marks (preserved partner assets) + one metric.
3. Product bento (anchor 2): dominant panel = managed cloud with Console frame; operational panels = WordPress, VPS, domains, email.
4. Operator strip (anchor 7).
5. Network Atlas cobalt field (anchor 3) + region picker.
6. Plan deck (anchor 4) with billing switch.
7. Live Answer + support stats pair.
8. Accordion answers (anchor 5).
9. Signal CTA field (anchor 6): `Deploy your first project tonight.`

### 12.2 Shared / WordPress hosting
Hero: type-first with a Console frame (WP dashboard) offset right → Launch Sequence module → Spec Plates (LiteSpeed/Redis, PHP versions, staging) → speed section with Latency Ring pair (before/after cache) → plan deck scoped to WP plans → migration wizard teaser → comparison ledger vs 2 named competitors → answers → CTA field.

### 12.3 VPS / Cloud
Hero: `Root access. Royal backbone.` with Deploy Log → **VPS Configurator** (dominant, full-width, anchor-2 layout with config left / telemetry right) → Spec Plates (EPYC, Gen 5 NVMe, unmetered) → OS/stack chip grid (Ubuntu, Debian, Rocky, Docker, Node, NestJS) → Operator strip with API examples → Shield Stack → plan deck (preset configs) → answers → CTA.

### 12.4 Dedicated servers
Hero with a single machined Spec Plate hero-object → inventory ledger table (CPU / RAM / storage / region / price / provision-time column `Ready in 4h`) → Network Atlas with private-network callouts → Shield Stack → Live Answer (enterprise transcript) → contact-sales CTA (form, not deck).

### 12.5 Domains
Hero = Domain command console as the thesis object (type above it, minimal) → TLD price ledger (sortable, first-year + renewal columns, tabular) → bundling row (`Free with any annual plan`) → transfer console variant → WHOIS-privacy answer rows → CTA.

### 12.6 Pricing overview
H1 `Every price, with its renewal.` → billing switch + full plan deck across product families (tabbed: Shared / WP / VPS / Dedicated) → Honest Ledger explainer strip (why we show renewals) → ledger comparison table → money-back terms in plain language → answers → CTA.

### 12.7 Comparison (`/vs/host-x`)
Hero states the single honest difference → ledger comparison table (dated sources) → TCO slider → migration wizard → testimonial ledger filtered to switchers → CTA `Move your sites — we do the lifting`.

### 12.8 Data centers / Network
Full cobalt Atlas as hero (anchor 3 first — allowed exception) → region ledger (city, code, latency from visitor, capacity status dot) → Spec Plates for backbone (carriers, Tbps, peering) → uptime strip → compliance chip row (ISO 27001, SOC 2 — only if held) → CTA.

### 12.9 About
Editorial: type-first hero on `--ice`, founder letter set at 62ch, timeline as true sequence (numbered — order is real), team ledger rows (no card grid), principles as accordion, careers CTA.

### 12.10 Support hub / Docs
Utility register: 56px search console hero → category bento (asymmetric) → popular-answer ledger → Live Answer + channel matrix (chat/ticket/phone with response-time telemetry chips) → status strip. Docs article: 68ch measure, sticky right mini-TOC, JetBrains Mono code blocks with copy affordance, previous/next ledger row.

### 12.11 Blog
Index: dominant feature panel + 2-column editorial list (date, tag chip, 2-line titles, no thumbnails-for-everything). Article: 68ch, drop-in Spec Plates/terminals reuse, author ledger row, related-posts hairline list.

### 12.12 Checkout / Cart
Two-column: left = 3-step true sequence (01 Account · 02 Configure · 03 Pay), one step visible at a time; right = sticky order ledger (plan, term, renewal line, total — Honest Ledger enforced at the moment of payment). Trust microline under pay button (`30-day money-back · No setup fees`). No upsell interstitials; add-ons are inline toggles with prices. Payment inputs 56px, provider logos as chips.

### 12.13 Status page
Utility surface on `--night`: current-state banner (pulse color + plain sentence), uptime strips per service, incident history ledger with timestamps in JetBrains Mono. No marketing components on this route.

### 12.14 Legal
`--ice`, 68ch, real headings, sticky TOC, last-updated line. Nothing clever.

### 12.15 404 / Error
`--night`, oversized Bricolage `404` with a broken-route Atlas fragment (one node `--pulse-warn`), one line, two links (home, status). Errors state what happened; they do not apologize.

### 12.16 Contact / Sales
Split: form (name, email, company, need selector, message) left; right = response-time telemetry chip, Live Answer excerpt, and direct channels ledger.

---

## 13. Responsive Contract

- `390px`: single-column narrative; configurator sliders become steppers; plan deck becomes vertical stack with featured first; Atlas simplifies to region list + mini-map; touch targets ≥ 44px, no overlaps; telemetry ribbon shows one stat at a time.
- `768px`: bento two columns; plan deck scrolls horizontally with visible affordance (peeking next plane + edge fade); nav collapses to island pill + full-screen dark menu panel.
- `1024px`: configurator side-by-side; ledger tables un-stack.
- `1440px`: hero fits the initial viewport, nav one line, primary CTA visible without scrolling, canvas capped at 1320px.

---

## 14. Accessibility & Performance Budget

- WCAG 2.2 AA contrast minimum; signal-on-night and ice-on-cobalt pairs verified.
- Full keyboard access; visible 2px focus ring everywhere; skip-to-content first in tab order.
- Configurator sliders are real `<input type="range">` with `aria-valuetext` (`4 vCPU`); deck and tabs use proper roving tabindex patterns.
- Reduced motion removes orbital drift, packet dots, count-ups, and reveals.
- Decorative SVG `aria-hidden`; meaningful diagrams carry `<title>`/`<desc>`.
- Budgets: first-party initial JS < 80KB compressed; LCP < 1.8s on 4G, hero usable < 2s on throttled 3G; CLS = 0 (all media has intrinsic dimensions, fonts use `size-adjust` fallbacks); islands lazy-hydrate on visibility.
- Exactly one H1 per route; landmark structure (`header/nav/main/footer`) on every template.

---

## 15. Implementation Stack (open-source, current)

Best-fit, battle-tested, no reinvention:

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | **Astro 5** (islands architecture) | Marketing site is 90% static; islands give the dynamic layer without a SPA tax; content collections power blog/docs |
| Styling | **Tailwind CSS v4** with `@theme` mapped to the token layers | Tokens live once as CSS variables; v4's CSS-first config matches §4 exactly |
| Interactive islands | **Preact** (or Svelte 5) islands for Configurator, Domain console, Plan matcher | ~4KB runtime keeps the 80KB budget comfortable |
| Motion | CSS + `@property` counts + `IntersectionObserver` reveals; **Motion One** (`motion`) only if a sequence needs orchestration | Honors the no-GSAP/Lenis rule |
| Charts/telemetry | Hand-rolled SVG (per §8) — no chart library | Stroke language must stay unified |
| Forms | **@tanstack/form** or native + `zod` validation | Tiny, typed |
| Fonts | Self-hosted via **fontsource** variable packages (Bricolage Grotesque, Manrope, JetBrains Mono) | No third-party font CDN |
| Search (docs) | **Pagefind** | Static, zero-backend, fast |
| Checkout | Existing billing (WHMCS/Stripe) behind the checkout template; UI owned by this system |
| Testing | Playwright visual snapshots per template at 390/768/1440 | Enforces the responsive contract |

Repo layout: tokens in `src/styles/tokens.css`, visuals in `src/components/visuals/`, islands in `src/components/islands/`, page templates in `src/layouts/`.

---

## 16. Asset Policy

- Preserve `/public/legacy-assets/assets/img/royalclouds_w_logo.png` and `/public/legacy-assets/assets/img/royalclouds-blues.png` exactly.
- Preserve audited partner marks and route-specific OG artwork.
- Existing product cartoons remain in the migration archive; they are not primary redesign visuals.
- All new visual language lives under `src/components/visuals/` and is reused across page families.

---

## 17. Governance Checklist (ship gate per page)

- [ ] One H1, headline ≤ 2 lines desktop
- [ ] ≥ 3 composition anchors, no repeated section rhythm
- [ ] Every price shows term + renewal (Honest Ledger)
- [ ] Every live number is real or the component is absent
- [ ] Signal orange used only for conversion actions
- [ ] Pulse colors confined to telemetry ≤ 16px
- [ ] Reduced-motion pass verified
- [ ] 390 / 768 / 1440 snapshots match contract
- [ ] JS payload ≤ 80KB, CLS = 0, LCP ≤ 1.8s
- [ ] No anti-pattern from §3 present

**One-line test:** if a screenshot of any section could belong to another host's website, it is not finished.