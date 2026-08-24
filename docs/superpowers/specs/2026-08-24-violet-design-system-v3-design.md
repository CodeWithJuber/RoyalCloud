# Royal Clouds — Violet Design System v3

**Status:** Approved for implementation planning
**Date:** 2026-08-24
**Supersedes:** `DESIGN.md` (cobalt/orange "Premium Dynamic Hosting Edition" v2, now stale) and the "pixel-faithful clone of live royalclouds.net" direction previously recorded in project memory as `pixel-clone-goal`.

## 1. Context

RoyalCloud is an Astro + Cloudflare site with a Storyblok-driven content pipeline (`PageView.astro` → `BlockRenderer.astro` → ~30 block components). The design system has drifted through two prior, now-abandoned directions:

1. `DESIGN.md` v2 describes a "cobalt-black / signal-orange" premium hosting language that was never fully carried through.
2. `src/assets/styles/tokens.css` was later re-pointed to clone the real royalclouds.net (sky blue / royal purple / gold / navy) — this is what's actually live today, but a past audit found it fails WCAG AA contrast in several places (`#999` body text 2.85:1, `#ff5e3a` eyebrow 3.04:1, `#269fd9` H2 2.98:1).

The user supplied a third reference — a standalone violet/gold/DM-Sans atomic style guide (tokens, atoms, molecules, organisms, interaction patterns) — and directed: **adopt this palette as the new system of record**, keep the existing Storyblok-driven architecture, and retire the "live telemetry" visual storytelling (`ShieldStack`, `DeployLog`, `LatencyRing`, `NetworkAtlas`, `RoyalConsole`, `RouteSignal`, `StackSchematic`, `AltitudeScene`, `RoyalCloudscape`) that belonged to the abandoned v2 direction, in favor of the reference's plainer, cleaner marketing patterns.

## 2. Goals

- One coherent, production-quality design system (tokens → atoms → molecules → organisms) driven by the violet/gold/DM Sans identity from the reference.
- No regressions: all Storyblok-driven routes keep working, CMS editability is preserved, currency/pricing spans and WHMCS links (both flagged untouchable in project memory) are untouched.
- Fix the known WCAG AA contrast failures as part of the token rewrite, not as a follow-up.
- Reuse existing, working interaction primitives instead of rebuilding what already works.

## 3. Non-goals (explicitly out of scope)

- No new CMS/backend (Storyblok stays as-is architecturally).
- No countdown-timer / fake-urgency widget. The reference includes one; this repo's existing (still valid) anti-pattern list bans it, and that judgment carries forward.
- No move to a JS framework (React/Vue/Alpine) for interactivity — the interaction layer stays vanilla JS + `<script>` tags, consistent with existing components.
- No rebuild of `LiveChat.astro` — it's a real Tawk.to/custom-embed integration, materially better than the reference's mock chat panel. Out of scope beyond restyling the launcher button.

## 4. Token architecture (v3)

Keep the existing 3-layer structure in `src/assets/styles/tokens.css` (primitive → semantic → component; components consume semantic/component names only) — it's sound and already the convention. Replace primitive values and delete the "Legacy-name bridge" section (`--rc-ink`, `--cobalt`, `--signal`, etc.) since the telemetry-visual consumers of those aliases are being retired.

New primitives (from the reference, extended where the reference is silent):

```css
--rc-primary:
  #673de6 --rc-primary-dark: #5025d1 --rc-primary-light: #8a63f0
    --rc-primary-050: #f0edff --rc-lavender: #faf7ff --rc-ink: #2f1c6a
    /* headings, dark text */ --rc-night: #2f1c6a
    /* dark section bands — verify AA on white text before reuse */
    --rc-night-deep: #231252 --rc-body: #595b68
    /* replaces #999 body text — recheck contrast */ --rc-muted: #8b8c99
    --rc-success: #00b090 --rc-gold: #ffc94b --rc-gold-light: #ffd97a
    --rc-white: #ffffff --rc-border: #e9e4f7 --rc-font: "DM Sans",
  ui-sans-serif, system-ui, sans-serif;
```

Status colors (`ok`/`warn`/`down`) are functional, not brand — keep current roles, re-tune hex only if they clash with the new palette or fail contrast; not a hard requirement to match the reference exactly.

**Acceptance criteria:** every text/background pairing introduced or changed by this rewrite passes WCAG AA (body ≥4.5:1, large text/UI ≥3:1) — verified with computed contrast, not eyeballed, before the token file is considered done.

## 5. Typography

Reference uses DM Sans for both headings and body. `@fontsource-variable/dm-sans` is **not currently installed** (installed: bricolage-grotesque, dosis, jetbrains-mono, manrope, open-sans) — add it as a new dependency, self-hosted the same way existing fonts are (matches `AGENTS.md`'s "prefer what's already installed" guidance as closely as possible while honoring the approved palette/typography pivot). Verify current stable version before adding.

## 6. DESIGN.md v3

Rewrite `DESIGN.md` in place as the single source of truth, replacing the v2 content. Must cover: design read/direction, token architecture (mirrors §4 above), typography, spacing/radius/shadow/motion scales, component inventory (atoms/molecules/organisms), and an anti-patterns section that explicitly carries forward: no countdown/fake urgency, no discount-badge stacking, no un-attributed testimonials, no auto-playing video with sound. Document that this supersedes both the cobalt/orange v2 doc and the prior pixel-clone-of-live-site goal, and why.

## 7. Interaction layer

Audit of the reference's "Data API" interactions against what already exists in this codebase:

| Behavior              | Status                                                                                                   | Action                                                             |
| --------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Accordion             | **Exists** — `FaqAccordion.astro` uses native `<details>/<summary>`, already accessible, zero JS         | Reuse as-is; re-theme colors only                                  |
| Tabs                  | **Exists** — `ShowcaseTabs.astro`, full ARIA + keyboard nav + `astro:after-swap` re-init                 | Reuse as-is; re-theme colors only                                  |
| Scroll reveal         | **Exists** — `RevealScript.astro`, IntersectionObserver + scroll fallback + 2.5s force-reveal safety net | Reuse `.reveal`/`.in` class pattern for all new/rebuilt components |
| Mobile drawer         | **Exists** — `ToggleMenu.astro` (+ its `data-aw-toggle-menu` wiring)                                     | Reuse as-is                                                        |
| Live chat             | **Exists** — `LiveChat.astro`, real Tawk.to/custom embed                                                 | Out of scope; restyle launcher only if using a custom embed        |
| Header scroll-shadow  | Partial — sticky header has a shadow token but needs verifying it's scroll-conditional, not always-on    | Verify; wire a scroll listener if it's currently static            |
| Marquee / ticker      | **Missing**                                                                                              | Build — pure CSS `@keyframes`, no JS                               |
| Scrollspy (Legal TOC) | **Missing** — `Legal.astro`'s sidebar nav is plain anchor links                                          | Build — small JS, active-link highlighting only                    |
| Back-to-top           | **Missing**                                                                                              | Build — small JS/CSS, visible after ~600px scroll                  |
| Countdown             | N/A                                                                                                      | **Do not build** — contradicts existing anti-pattern policy        |

## 8. Component inventory & actions

**Retire (delete):** `src/components/visuals/{ShieldStack,DeployLog,LatencyRing,NetworkAtlas,RoyalConsole,RouteSignal,StackSchematic,RoyalCloudscape}.astro` (8 files) plus `src/components/widgets/AltitudeScene.astro` (9 files total).

**Rebuild** (currently depend on the retired visuals; rebuild around reference-style plain patterns — stat rows, feature cards, testimonials): `src/components/blocks/{Hero,OperatorStrip,Infrastructure,ConsoleShowcase,Cta,FeatureNarrative}.astro`. `Hero.astro` is the homepage's primary block — extra care on this one.

**Retire outright:** `src/components/blocks/ShieldStackBlock.astro` — existed only to host the now-retired `ShieldStack` visual.

**Trim:** `src/components/illustrations/SvgDefs.astro` — remove defs that were specific to the retired visuals; keep the rest.

**Re-theme (hex → tokens, adopt reference's atom classes `.rc-btn`/`.rc-pill`/`.rc-card`/`.rc-input`/`.rc-sticker`):** the remaining files with hardcoded hex —
`src/components/sections/{BenchmarkBars,ComparisonTable,ContentSplit,CtaBand,DomainSearch,FaqAccordion,MapBand,OsStrip,SectionArt,SectionHero,SecurityLayers,ShowcaseTabs,SpeedRace,StatsBand,StepProcess,StoryCards,TechLogos,TestimonialsSlider}.astro`,
`src/components/sections/art/{ArtPanel,ArtRocket,ArtShield,ArtTerminal}.astro`,
`src/components/widgets/{FooterRC,HeaderRC,HeroRC,MobileCTA,PlanGridRC}.astro`
(28 files total; `AltitudeScene.astro` drops out of this list since it's covered under Retire above).

All other block/section/widget/ui components consume tokens already and need no color-value edits, only a visual pass to confirm they read correctly against the new palette.

## 9. CMS schema changes

The live content path is `src/types/content.ts` (the `PageBlock` union + per-block interfaces) → `src/components/blocks/BlockRenderer.astro` (switch on `component` discriminant) → individual block components. **Note:** `src/components/sections/SectionRenderer.astro` and the "cms-lockstep" convention recorded in project memory (content.config.ts + SectionRenderer.astro + config.yml) describe a **dead code path** — `SectionRenderer.astro` has zero importers, confirmed by grep. That memory is stale and should be corrected once this work lands.

Removing `ShieldStackBlock` requires:

1. `src/types/content.ts` — remove the `ShieldStackBlock` interface and its entry in the `PageBlock` union.
2. `src/components/blocks/BlockRenderer.astro` — remove the import and the `"shield-stack"` case.
3. Delete `src/components/blocks/ShieldStackBlock.astro`.
4. `public/admin/config.yml` — confirmed no `shield-stack` entry exists there currently; no change needed, but re-verify at implementation time in case content changed since this spec was written.

## 10. QA / acceptance criteria

- `npm run build`, typecheck, and lint all pass.
- WCAG AA re-verified for all touched text/background pairs (no new or carried-over failures).
- Visual check at 1440 / 768 / 390 widths for the homepage and at least one representative Storyblok-driven inner page.
- All previously-verified Storyblok routes still return 200.
- `npm run check:cms` passes (confirms the CMS schema stays internally consistent after `ShieldStackBlock` removal).
- No changes to WHMCS `my.royalclouds.net` links, `astro.config.mjs`'s `build.format`, or currency/pricing spans (project-memory untouchables).

## 11. Open risk

`Hero.astro` is the single highest-visibility file in this change — it's both being re-themed and rebuilt (losing its telemetry-visual dependency). Treat it as its own careful pass in implementation, not a mechanical find-replace.
