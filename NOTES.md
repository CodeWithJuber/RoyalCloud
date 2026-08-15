# Royal Clouds — design system notes (current)

This site is a **pixel-faithful, polished clone of the live royalclouds.net**
(the owner's own site — see `scripts/clone-site.sh`). It intentionally replaces
both the earlier AI-invented systems ("Royal Systems v2", "STRATOSPHERE") and
the first live-brand retheme (PR #61), which kept modern layouts the client
rejected. The rule now: **match the live site's own layouts** (ground truth in
`refs/live/`, rebuilt from meaning — never copied Bootstrap markup), polished
for spacing, responsiveness, and typos.

## Verified live design facts (do not "fix" these backwards)

- **Headings: Dosis** (`h1–h6`, weight 700, color `#269fd9`) — self-hosted via
  `@fontsource-variable/dosis`. Body: **Open Sans 14px/1.8 `#4d4d4d`**
  (`@fontsource-variable/open-sans`). No Google Fonts CDN.
- **Signature band**: `linear-gradient(225deg, #7B1FA2, #2e1acc)` — homepage
  hero (800px), interior `page-title` bands, hosted-clients band. Sticky nav
  `#673AB7`.
- **Footer**: `linear-gradient(to bottom right, #04183c, #00031e)`, bottom bar
  `#00051e`, column rules `#0d1d46`. To-top `#4aaede`.
- **Buttons**: `.default-btn` white-text pill (radius 50px) with red-orange
  hover slide `#ff416c→#fa4612`; conversion CTA = gold `#fdd700` fill with
  **black/navy text only** (gold text on white fails AA); pink `#a5215e`
  (PROMO badge, testimonials CTA).
- **Brand colors**: sky `#00a7f5` · purple `#7652f2` · gold `#fdd700` ·
  navy `#22105f` (FAQ titles, dark tab band) · heading blue `#269fd9`.
- Section header pattern: centered `.section-title` (max 625px) → 40px Dosis h2
  → `separator-rc.svg` flourish → paragraph.
- The hero **countdown** lives inside the hero (not a promo bar). Target date:
  `site.json` `offerDeadline` (empty = live-style rolling next-day).
- "Need help?" strip is chrome on **every** page; the newsletter band is
  **homepage-only** (page frontmatter `newsletter: true`).
- Container: 1140px / 15px gutters (live Bootstrap), `.wrap` is retuned to it.

## The system

- **Tokens** — `src/assets/styles/tokens.css` (primitive → semantic →
  component). **Clone primitives** — `src/assets/styles/clone.css`
  (`.wrap`, `.section-title`, buttons, band utilities). Everything else is
  per-component scoped styles. Colors come from tokens only — no raw hex in
  components (var() fallbacks allowed).
- **Assets** — live-site images under `src/assets/images/live/` (mirrored via
  `scripts/clone-site.sh`, query strings stripped). Icons: tabler via
  `tablerIcon()` in `src/utils/plans.ts` — no icon-font dependencies.
- **Motion** — only what the live site has: countdown, sticky nav, tabs,
  carousel autoplay, cloud drift — tiny vanilla JS / CSS, reduced-motion gated.

## Contracts to respect

- Section types: `src/content.config.ts` ↔ `SectionRenderer.astro` ↔
  `public/admin/config.yml` (Decap) change **together in one commit**;
  `node scripts/verify-cms.mjs` (in `npm run check`) gates drift — Decap
  silently deletes unknown blocks/fields on editor save.
- `astro.config.ts` `build.format: "file"` keeps dist filenames matching live
  URLs — don't change. WHMCS deep links (`https://my.royalclouds.net/...`)
  and `pricify()` currency spans are untouchable.
- Live `/domains` is a redirect to WHMCS; our richer page is a deliberate
  deviation.

## Verify

- `npm run check` · `npm run build` · `node scripts/verify-slugs.mjs`
- Recon: `bash scripts/clone-site.sh` → `/tmp/rcmirror`, then
  `CHROMIUM_BIN=/opt/pw-browsers/chromium node scripts/capture-live.mjs`
- **Acceptance**: `CHROMIUM_BIN=… node scripts/compare-live.mjs` — side-by-side
  local vs live screenshots + diff ratio per page/width.
