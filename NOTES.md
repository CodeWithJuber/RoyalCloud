# Royal Clouds — STRATOSPHERE redesign notes

A bold, light, regal reinvention of the Royal Clouds site, built **in Astro**
(the existing stack). The whole site renders through one `SectionRenderer` + a
single token/CSS layer, so the redesign works by reskinning that layer — the
section skeleton (Layer-1) is unchanged; the brand soul (Layer-2) is new.

## What changed

- **Tokens** (`src/assets/styles/rc-premium.css` `:root`): new palette mapped
  onto the existing token names so every component recolored at once.
  - ink `#0A0E1F` · royal `#5111E0` · azure `#19B6FF` · gold `#FFB627` ·
    mist `#F3F4FB` · paper `#FBFBFD`, plus a `--spectrum` (royal→azure→gold).
  - crisper radii, ink-based shadows, motion tokens.
- **Type**: Bricolage Grotesque (display) + Inter (body) + Geist Mono (data).
  Eyebrows and all prices/stats/figures now read in the mono face with
  tabular figures. Font loading updated in `Layout.astro` + `CustomStyles.astro`.
- **Signature — "Living Sky" hero** (`HeroRC.astro`): a full-bleed, dependency-
  free WebGL GLSL cloud/aurora field reacting to cursor + scroll. Falls back to
  the static `--rc-grad-vivid` gradient on no-WebGL / low-power /
  `prefers-reduced-motion` (zero CLS). Pauses offscreen via IntersectionObserver.
- **Motion spine** (`SmoothScroll.astro`): Lenis smooth scroll + a GSAP
  ScrollTrigger hero→content handoff, fully gated behind reduced motion and
  re-initialised across Astro view transitions.
- **Altitude rule**: the old `brand-separator.svg` under headings is replaced by
  a thin spectrum hairline — the recurring connective motif. Reusable as
  `.altitude-rule`.
- **aurora.css**: recolored to the new palette and given a STRATOSPHERE layer
  (mono data, spectrum motifs, gold CTA focus).

## Layer-1 kept generic on purpose (Jakob's Law)

Section order, nav/dropdown behaviour, FAQ accordion, pricing toggle, comparison
table, the `SectionRenderer` registry — conventions users already know. Novelty
is spent on the signature, not the controls.

## What I cut (Chanel's mirror)

- A spectrum-filled "popular plan" band — reverted to solid royal because the
  gold portion of the spectrum failed contrast against the band label.
- Did not 3D-ify every section; the WebGL is reserved for the one hero.

## Verify

- `npm run build` (passes; 80 pages) · `node scripts/screenshots.mjs` (visual QA)
- `npm run dev` → http://localhost:4321

## Known, out of scope

The parallel `royalclouds-redesign/` Next.js folder is untouched by request. Its
pre-existing TypeScript/ESLint errors are surfaced by the repo-wide `astro check`
/ `eslint` but are unrelated to this Astro redesign.

## v3.1 — Quiet-premium discipline pass

Feedback after launch: it read "not professional" — diagnosed as _spectacle_
(the §5 trap). Restraint pass:

- **Palette deepened:** royal `#4B16D6`, azure `#1E96E8` (holds as text), gold
  `#F5A524`, paper `#FCFCFE`. Gold radial dropped from the dark-panel gradient.
- **Cut (Chanel's mirror):** all glassmorphism (stat tiles, chips), every
  coloured hover glow, the button sheen sweep, the looping aurora-drift on dark
  panels, the radial orbs behind light sections, the CTA pulse + plan-glow.
  Cards now lift with plain elevation; dark panels use one calm gradient.
- **Hero calmed:** slower shader drift, softer hues, restrained gold motes,
  stronger top-darken for headline legibility.
- **Rhythm:** body line-height 1.6; fixed `.sec-head` margin inversion.
- Net: less motion, fewer effects, one signature (the calm sky + spectrum
  hairline) — reads premium through restraint, not spectacle.

## Sign-off

- **Palette:** ink · royal `#4B16D6` · azure `#1E96E8` · gold `#F5A524` · mist · paper
- **Type:** Bricolage Grotesque · Inter · Geist Mono
- **Signature:** the (now calm) Living Sky WebGL hero + one spectrum altitude rule
- **Risk:** stripped the spectacle (glass + glows + busy motion) for disciplined
  quiet-premium — betting that _less_ finally reads _professional_.
