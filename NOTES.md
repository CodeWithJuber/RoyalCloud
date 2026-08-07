# Royal Clouds — design system notes (current)

This site uses **one** design system: the real royalclouds.net brand,
faithfully carried over from the live site and polished. It intentionally
replaces the earlier AI-invented systems ("Royal Systems v2" cobalt/orange and
"STRATOSPHERE v3.1" royal/azure/gold), which client feedback rejected as
"not professional". **Do not reintroduce those palettes, glassmorphism,
aurora/WebGL effects, or heavy scroll motion.**

## The system

- **Tokens** — `src/assets/styles/tokens.css`, three layers
  (primitive → semantic → component). Live-site palette:
  - sky `#00a7f5` (primary) · purple `#7652f2` (secondary) ·
    gold `#fdd700` (CTA accent) · navy `#22105f` (dark section bands) ·
    ink `#181b22` (footer) · orange `#fa4612` / magenta `#a5215e` (rare accents)
  - Light-first; dark sections are flat navy bands (`.section--dark`).
- **Type** — Open Sans (variable), self-hosted via
  `@fontsource-variable/open-sans`, imported in `CustomStyles.astro`.
  No Google Fonts CDN.
- **Component styles** — `src/assets/styles/components.css`: the structural
  classes every section component consumes (`.wrap`, `.sec-head`, `.btn*`,
  `.plan*`, `.compare`, `.faq`, `.site-header/footer`, `.prose-body`, …).
  Values come from tokens only.
- **Per-page accents** — `main[data-theme=…]` (8 frontmatter values kept for
  content stability) collapse to two brand pairs: sky (speed, panel, linux,
  domains) and purple (security, server, wordpress, money).
- **Motion policy** — restrained: IntersectionObserver reveals
  (`RevealScript.astro`), count-ups, card hover lift. Native
  `scroll-behavior: smooth` + `scroll-margin-top`; no GSAP/Lenis, no WebGL.

## Contracts to respect

- Section types in `src/content.config.ts` ↔ `SectionRenderer.astro` ↔
  `public/admin/config.yml` (Decap CMS) must stay in lockstep — Decap silently
  drops blocks/fields it doesn't know about on save.
  `node scripts/verify-cms.mjs` checks this drift.
- `astro.config.ts` `build.format: "file"` keeps dist filenames matching the
  live extensionless URLs — don't change.
- WHMCS deep links (`https://my.royalclouds.net/...`) in
  `src/data/plans/*.json` and `site.json` are real cart/portal URLs.

## Verify

- `npm run check` · `npm run build` · `node scripts/verify-slugs.mjs`
- `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node scripts/screenshots.mjs`
