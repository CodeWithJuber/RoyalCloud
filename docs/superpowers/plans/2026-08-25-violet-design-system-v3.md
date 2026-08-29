# Violet Design System v3 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace RoyalCloud's drifted design system with one coherent violet/gold/DM-Sans system, retire the abandoned telemetry-visual layer, and add the three genuinely-missing interactions — without breaking the Storyblok-driven content pipeline.

**Architecture:** The existing 3-layer token system (primitive → semantic → component) in `src/assets/styles/tokens.css` stays; its primitive values are replaced and its dead "legacy-name bridge" is migrated out. Nine visual components are retired; the six blocks that depended on them are rebuilt around plain marketing patterns. Interactions reuse what already works (native `<details>` accordion, ARIA tabs, `[data-reveal]`) and add only marquee, scrollspy, and back-to-top.

**Tech Stack:** Astro 7 + Cloudflare adapter, Storyblok CMS, vanilla `<script>` interactions (no framework), `@fontsource-variable` self-hosted fonts, vitest (installed but currently unused).

**Spec:** `docs/superpowers/specs/2026-08-24-violet-design-system-v3-design.md`

## Global Constraints

- **Palette (exact, contrast-verified):** `--rc-primary:#673de6` · `--rc-primary-dark:#5025d1` · `--rc-primary-light:#7d59d9` · `--rc-primary-050:#f0edff` · `--rc-lavender:#faf7ff` · `--rc-ink:#2f1c6a` · `--rc-night:#2f1c6a` · `--rc-night-deep:#231252` · `--rc-body:#595b68` · `--rc-muted:#8b8c99` · `--rc-success:#009e81` · `--rc-gold:#ffc94b` · `--rc-gold-light:#ffd97a` · `--rc-border:#e9e4f7`

  **Two values differ from the reference, deliberately.** The reference's `#8a63f0` (primary-light) yields only 4.10:1 with white text and its `#00b090` (success) only 2.76:1 on white — both fail AA. Darkened to `#7d59d9` (4.88:1) and `#009e81` (3.38:1). All 20 pairings were computed and verified before this plan was written; do not revert these to the reference values.

- **Typography:** DM Sans (`@fontsource-variable/dm-sans`) for headings and body.
- **WCAG AA is a hard gate:** body text ≥4.5:1, large text (≥24px, or ≥18.66px bold) and UI components ≥3:1. Verified by the script built in Task 1, not by eye.
- **Do not build a countdown timer.** The reference includes one; it is banned by this repo's anti-pattern policy.
- **Untouchable (project memory):** WHMCS `my.royalclouds.net` links, `astro.config.mjs`'s `build.format`, currency/pricing spans.
- **No framework.** Interactions are vanilla JS in `<script>` tags, matching existing components.
- **Every task ends with `npm run build` passing.** There is no test suite to fall back on (see "Testing reality" below).

## Testing reality — read before starting

`vitest@4.1.10` is a dependency but **there are no test files and no `test` script in `package.json`**. This is a CSS/markup change where the meaningful failure modes are: the build breaks, contrast regresses, or a route 500s. So this plan's verification is:

1. **`npm run build`** — catches broken imports, type errors, invalid Astro.
2. **`node scripts/check-contrast.mjs`** — a real, runnable unit-tested check built in Task 1. This is the one piece of genuine logic here and it gets genuine tests.
3. **Route smoke check** — every route returns 200.
4. **Visual check** at 1440/768/390.

Do not fabricate tests for CSS. Do write real tests for the contrast math.

---

### Task 1: Contrast checker + DM Sans + token primitives

This task is the foundation. It builds the tool that gates every later color decision, then uses it.

**Files:**

- Create: `scripts/check-contrast.mjs`
- Create: `scripts/check-contrast.test.mjs`
- Modify: `package.json` (add `dm-sans` dep, `test` + `check:contrast` scripts)
- Modify: `src/assets/styles/tokens.css:9-49` (primitive block)
- Modify: `src/components/CustomStyles.astro:2-3` (font imports)

**Interfaces:**

- Produces: `relativeLuminance(hex) → number`, `contrastRatio(hexA, hexB) → number`, `checkPair({fg, bg, label, size}) → {label, ratio, required, pass}` — later tasks import these from `scripts/check-contrast.mjs`.

- [ ] **Step 1: Write the failing test**

Create `scripts/check-contrast.test.mjs`:

```js
import { describe, expect, it } from "vitest";
import {
  contrastRatio,
  relativeLuminance,
  checkPair,
} from "./check-contrast.mjs";

describe("relativeLuminance", () => {
  it("returns 0 for black and 1 for white", () => {
    expect(relativeLuminance("#000000")).toBeCloseTo(0, 5);
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1, 5);
  });

  it("accepts shorthand hex", () => {
    expect(relativeLuminance("#fff")).toBeCloseTo(1, 5);
  });

  it("throws on malformed input rather than silently scoring it", () => {
    expect(() => relativeLuminance("not-a-color")).toThrow();
    expect(() => relativeLuminance("#12345")).toThrow();
  });
});

describe("contrastRatio", () => {
  it("gives 21:1 for black on white", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
  });

  it("gives 1:1 for a color against itself", () => {
    expect(contrastRatio("#673de6", "#673de6")).toBeCloseTo(1, 5);
  });

  it("is order-independent", () => {
    expect(contrastRatio("#673de6", "#ffffff")).toBeCloseTo(
      contrastRatio("#ffffff", "#673de6"),
      5,
    );
  });
});

describe("checkPair", () => {
  it("requires 4.5:1 for body text and fails a known-bad pair", () => {
    // #999 on white is 2.85:1 — one of the three documented v2 failures.
    const result = checkPair({
      fg: "#999999",
      bg: "#ffffff",
      label: "old body",
      size: "body",
    });
    expect(result.required).toBe(4.5);
    expect(result.pass).toBe(false);
  });

  it("requires only 3:1 for large text", () => {
    const result = checkPair({
      fg: "#767676",
      bg: "#ffffff",
      label: "large",
      size: "large",
    });
    expect(result.required).toBe(3);
    expect(result.pass).toBe(true);
  });

  it("passes the new body color on white", () => {
    const result = checkPair({
      fg: "#595b68",
      bg: "#ffffff",
      label: "new body",
      size: "body",
    });
    expect(result.pass).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx vitest run scripts/check-contrast.test.mjs
```

Expected: FAIL — `Failed to resolve import "./check-contrast.mjs"`.

- [ ] **Step 3: Write the implementation**

Create `scripts/check-contrast.mjs`:

```js
/**
 * WCAG 2.1 contrast checker for the Royal Clouds token system.
 * Math per https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */

const SHORTHAND = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i;
const FULL = /^#([0-9a-f]{6})$/i;

/** Parse a hex color to [r,g,b] in 0-255. Throws on anything malformed —
 *  a silently-scored bad color would defeat the point of the gate. */
function toRgb(hex) {
  if (typeof hex !== "string")
    throw new TypeError(`Expected hex string, got ${typeof hex}`);
  const short = hex.match(SHORTHAND);
  const normalized = short
    ? `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`
    : hex;
  const full = normalized.match(FULL);
  if (!full) throw new TypeError(`Malformed hex color: ${hex}`);
  const int = parseInt(full[1], 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

export function relativeLuminance(hex) {
  const [r, g, b] = toRgb(hex).map((channel) => {
    const s = channel / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(hexA, hexB) {
  const a = relativeLuminance(hexA);
  const b = relativeLuminance(hexB);
  const [light, dark] = a >= b ? [a, b] : [b, a];
  return (light + 0.05) / (dark + 0.05);
}

/** size: "body" (≥4.5:1) | "large" (≥3:1) | "ui" (≥3:1) */
export function checkPair({ fg, bg, label, size = "body" }) {
  const required = size === "body" ? 4.5 : 3;
  const ratio = contrastRatio(fg, bg);
  return {
    label,
    ratio: Math.round(ratio * 100) / 100,
    required,
    pass: ratio >= required,
  };
}

/** Every pairing the v3 system actually renders. Extend as tasks add surfaces. */
export const PAIRS = [
  { label: "body on white", fg: "#595b68", bg: "#ffffff", size: "body" },
  { label: "body on lavender", fg: "#595b68", bg: "#faf7ff", size: "body" },
  { label: "ink heading on white", fg: "#2f1c6a", bg: "#ffffff", size: "body" },
  {
    label: "ink heading on lavender",
    fg: "#2f1c6a",
    bg: "#faf7ff",
    size: "body",
  },
  {
    label: "primary link on white",
    fg: "#673de6",
    bg: "#ffffff",
    size: "body",
  },
  {
    label: "primary on primary-050",
    fg: "#5025d1",
    bg: "#f0edff",
    size: "body",
  },
  { label: "white on primary", fg: "#ffffff", bg: "#673de6", size: "body" },
  {
    label: "white on primary-dark",
    fg: "#ffffff",
    bg: "#5025d1",
    size: "body",
  },
  { label: "white on night", fg: "#ffffff", bg: "#2f1c6a", size: "body" },
  { label: "white on night-deep", fg: "#ffffff", bg: "#231252", size: "body" },
  { label: "ink on gold (CTA)", fg: "#2f1c6a", bg: "#ffc94b", size: "body" },
  { label: "muted on white", fg: "#8b8c99", bg: "#ffffff", size: "large" },
  { label: "success on white", fg: "#009e81", bg: "#ffffff", size: "ui" },
  { label: "success on night-deep", fg: "#009e81", bg: "#231252", size: "ui" },
  {
    label: "white on primary-light",
    fg: "#ffffff",
    bg: "#7d59d9",
    size: "body",
  },
  {
    label: "terminal out on night-deep",
    fg: "#a8a8b3",
    bg: "#231252",
    size: "body",
  },
  { label: "amber on white", fg: "#9a5c00", bg: "#ffffff", size: "body" },
  { label: "red on white", fg: "#d32f2f", bg: "#ffffff", size: "body" },
  {
    label: "gold eyebrow on primary-dark",
    fg: "#ffc94b",
    bg: "#5025d1",
    size: "large",
  },
  {
    label: "gold eyebrow on night",
    fg: "#ffc94b",
    bg: "#2f1c6a",
    size: "large",
  },
];

/* Verified while writing this plan — all 20 pairs pass:
   body/white 6.73 · body/lavender 6.35 · ink/white 14.05 · ink/lavender 13.25
   primary/white 6.20 · primary-dark/050 7.23 · white/primary 6.20
   white/primary-dark 8.31 · white/primary-light 4.88 · white/night 14.05
   white/night-deep 16.41 · ink/gold 9.17 · muted/white 3.33 · success/white 3.38
   success/night-deep 4.85 · terminal-out/night-deep 6.97 · amber/white 5.38
   red/white 4.98 · gold/primary-dark 5.43 · gold/night 9.17 */

// Direct execution: report and exit non-zero on any failure.
if (import.meta.url === `file://${process.argv[1]}`) {
  const results = PAIRS.map(checkPair);
  for (const r of results) {
    console.log(
      `${r.pass ? "PASS" : "FAIL"}  ${r.ratio.toFixed(2)}:1 (need ${r.required}:1)  ${r.label}`,
    );
  }
  const failures = results.filter((r) => !r.pass);
  if (failures.length > 0) {
    console.error(`\n${failures.length} contrast failure(s).`);
    process.exit(1);
  }
  console.log(`\nAll ${results.length} pairs pass WCAG AA.`);
}
```

Note on what is deliberately **not** in `PAIRS`: `--rc-border` (#e9e4f7) against white is ~1.2:1 and is excluded on purpose. WCAG 1.4.11 applies to elements needed to identify a control, not ornamental rules. Add this comment above the array so the omission is not later "fixed" by mistake:

```js
/** Decorative hairlines (--rc-border) are deliberately excluded: WCAG 1.4.11
 *  applies to elements needed to identify a control, not ornamental rules.
 *  Any border that IS the sole affordance of a control must use --rc-primary. */
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx vitest run scripts/check-contrast.test.mjs
```

Expected: PASS, all cases.

- [ ] **Step 5: Add scripts and the DM Sans dependency**

```bash
npm install @fontsource-variable/dm-sans
```

Then add to `package.json` `"scripts"`:

```json
"test": "vitest run",
"check:contrast": "node scripts/check-contrast.mjs"
```

- [ ] **Step 6: Run the contrast gate**

```bash
npm run check:contrast
```

Expected: **`All 20 pairs pass WCAG AA.`** with exit code 0. Every ratio was computed while writing this plan (see the comment block under `PAIRS`), so a failure here means a value was mistyped — compare against the verified list before changing anything.

If you later add a pair that fails, **adjust that token's value — never weaken the threshold.** Record the adjusted value; it must match what you write into `tokens.css` in Step 8.

- [ ] **Step 7: Swap the font imports**

In `src/components/CustomStyles.astro`, replace lines 2-3:

```diff
-import "@fontsource-variable/open-sans";
-import "@fontsource-variable/dosis";
+import "@fontsource-variable/dm-sans";
```

- [ ] **Step 8: Replace the token primitives**

In `src/assets/styles/tokens.css`, replace the primitive block (lines 9-49, from `/* ── Primitives` through the `--red` line) with:

```css
/* ── Primitives — violet system v3 ──────────────────────── */
--rc-primary: #673de6;
--rc-primary-dark: #5025d1;
--rc-primary-light: #7d59d9; /* darkened from reference #8a63f0 — see Global Constraints */
--rc-primary-050: #f0edff;
--rc-lavender: #faf7ff;
--rc-ink: #2f1c6a;
--rc-night: #2f1c6a;
--rc-night-deep: #231252;
--rc-body: #595b68;
--rc-muted: #8b8c99;
--rc-success: #009e81; /* darkened from reference #00b090 — see Global Constraints */
--rc-gold: #ffc94b;
--rc-gold-light: #ffd97a;
--rc-white: #ffffff;
--rc-border: #e9e4f7;

/* Functional status — not brand. Amber/red darkened for AA on white (verified 5.38 / 4.98). */
--green: #009e81;
--amber: #9a5c00;
--red: #d32f2f;

--paper: #ffffff;
--mist: var(--rc-lavender);
```

Then update the semantic layer below it so it points at the new primitives:

```css
--bg-page: var(--paper);
--bg-tint: var(--rc-lavender);
--bg-tint-strong: var(--rc-primary-050);
--surface-band: var(--rc-night);
--surface-footer: var(--rc-night-deep);
--text-heading: var(--rc-ink);
--text-default: var(--rc-body);
--text-muted: var(--rc-muted);
--brand-primary: var(--rc-primary);
--brand-secondary: var(--rc-primary-light);
--accent-cta: var(--rc-gold);
--link: var(--rc-primary);
--focus-ring: var(--rc-primary);
--line: var(--rc-border);
--line-strong: color-mix(in srgb, var(--rc-ink) 20%, transparent);
```

Set the font tokens:

```css
--font-heading:
  "DM Sans Variable", "DM Sans", ui-sans-serif, system-ui, sans-serif;
--font-body:
  "DM Sans Variable", "DM Sans", ui-sans-serif, system-ui, sans-serif;
```

Leave the legacy-bridge section (from `/* ── Legacy-name bridge ──` to the end) **in place for now** — 34 files still consume it. Task 2 removes it.

- [ ] **Step 9: Verify**

```bash
npm run build && npm run check:contrast && npm test
```

Expected: all three pass. The site will look wrong at this stage (legacy bridge still points at old names) — expected, and Task 2 fixes it.

- [ ] **Step 10: Commit**

```bash
git add scripts/check-contrast.mjs scripts/check-contrast.test.mjs package.json package-lock.json src/assets/styles/tokens.css src/components/CustomStyles.astro
git commit -m "feat(tokens): violet v3 primitives, DM Sans, WCAG contrast gate"
```

---

### Task 2: Migrate and delete the legacy-name bridge

**Files:**

- Modify: `src/assets/styles/tokens.css` (delete the legacy-bridge section)
- Modify: the 34 files consuming legacy names (enumerate with the command in Step 1)

**Interfaces:**

- Consumes: the semantic tokens defined in Task 1.
- Produces: a codebase where no file references `--cobalt`, `--signal`, `--ice`, `--night`, `--midnight`, `--chrome`, `--smoke`, `--graphite`, `--rc-*` legacy aliases, or the legacy gradient names.

- [ ] **Step 1: Enumerate the real consumer list**

```bash
grep -rlE "var\(--(rc-ink-deep|rc-violet|rc-violet-dark|rc-blue|rc-yellow|rc-orange|rc-orange-dark|rc-orange-deep|rc-plum|rc-coral|rc-purple|rc-indigo|rc-indigo-deep|night|midnight|abyss|cobalt|cobalt-bright|cobalt-dim|signal|signal-hot|ice|chrome|smoke|graphite|pulse-ok|pulse-warn|pulse-down|line-chrome-10|line-chrome-16|line-chrome-24|inner-highlight|line-hairline|line-hairline-dark|interactive|interactive-pressed|wash-cobalt-06|wash-cobalt-10|wash-signal-10|font-display|spectrum|rc-gradient|grad-cta|grad-energy|grad-gold-spark|grad-hot|grad-gold-cta|grad-text|grad-violet-azure|rc-grad-vivid|shadow-violet)\)" src --include="*.astro" --include="*.css" | sort
```

Expected: ~34 files including `tokens.css` itself. Files scheduled for deletion in Tasks 3 and 11 (`src/components/visuals/*`) can be skipped — note which, and don't waste effort on them.

- [ ] **Step 2: Apply this mapping, file by file**

| Legacy name                                                        | Replace with                                                                  |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| `--night`, `--midnight`, `--rc-plum`, `--rc-indigo`                | `--rc-night`                                                                  |
| `--abyss`, `--rc-ink-deep`, `--rc-indigo-deep`                     | `--rc-night-deep`                                                             |
| `--cobalt`, `--rc-violet`, `--rc-purple`, `--interactive`          | `--rc-primary`                                                                |
| `--cobalt-bright`                                                  | `--rc-primary-light`                                                          |
| `--cobalt-dim`, `--rc-violet-dark`, `--interactive-pressed`        | `--rc-primary-dark`                                                           |
| `--signal`, `--rc-yellow`                                          | `--rc-gold`                                                                   |
| `--signal-hot`                                                     | `--rc-gold-light`                                                             |
| `--ice`, `--rc-blue`                                               | `--rc-lavender`                                                               |
| `--chrome`, `--smoke`                                              | `--rc-muted`                                                                  |
| `--graphite`                                                       | `--rc-body`                                                                   |
| `--rc-orange*`, `--rc-coral`                                       | `--rc-primary` (orange is retired)                                            |
| `--pulse-ok`                                                       | `--green`                                                                     |
| `--pulse-warn`                                                     | `--amber`                                                                     |
| `--pulse-down`                                                     | `--red`                                                                       |
| `--line-hairline`, `--line-chrome-*`                               | `--line`                                                                      |
| `--line-hairline-dark`                                             | `--dk-line`                                                                   |
| `--font-display`                                                   | `--font-heading`                                                              |
| `--wash-cobalt-06`                                                 | `color-mix(in srgb, var(--rc-primary) 6%, transparent)`                       |
| `--wash-cobalt-10`                                                 | `color-mix(in srgb, var(--rc-primary) 10%, transparent)`                      |
| `--wash-signal-10`                                                 | `color-mix(in srgb, var(--rc-gold) 14%, transparent)`                         |
| `--spectrum`, `--grad-energy`, `--grad-hot`, `--grad-violet-azure` | `linear-gradient(100deg, var(--rc-primary) 0%, var(--rc-primary-light) 100%)` |
| `--rc-gradient`, `--grad-cta`, `--rc-grad-vivid`                   | `linear-gradient(110deg, var(--rc-night) 0%, var(--rc-night-deep) 100%)`      |
| `--grad-gold-spark`, `--grad-gold-cta`                             | `linear-gradient(120deg, var(--rc-gold-light) 0%, var(--rc-gold) 100%)`       |
| `--grad-text`                                                      | `linear-gradient(96deg, var(--rc-ink) 0%, var(--rc-primary) 100%)`            |
| `--shadow-violet`                                                  | `var(--shadow-md)`                                                            |
| `--inner-highlight`                                                | `inset 0 1px 0 rgb(255 255 255 / 0.07)`                                       |

Note `--rc-ink` is already a v3 primitive — leave every use of it alone.

**Watch for:** `--interactive` maps to `--rc-primary`, and several focus rings use it. Those must stay ≥3:1 against their background — re-run `npm run check:contrast` after, adding any new focus-ring pairing to `PAIRS`.

- [ ] **Step 3: Delete the bridge**

In `src/assets/styles/tokens.css`, delete everything from the `/* ── Legacy-name bridge ──` comment through the last legacy declaration, keeping `:root`'s closing brace.

- [ ] **Step 4: Verify nothing still references a deleted name**

Re-run the Step 1 grep. Expected: **zero matches** outside files scheduled for deletion.

- [ ] **Step 5: Verify the build**

```bash
npm run build && npm run check:contrast
```

- [ ] **Step 6: Commit**

```bash
git add -u
git commit -m "refactor(tokens): migrate legacy-name bridge to v3 semantic tokens"
```

---

### Task 3: Delete zero-consumer dead code

`LatencyRing.astro` and `AltitudeScene.astro` have no importers — verified by grep. `RevealScript.astro` implements a `.reveal`/`.in` system whose only consumer is `LatencyRing`; the live reveal system is `[data-reveal]` at `SiteLayout.astro:71`.

**Files:**

- Delete: `src/components/visuals/LatencyRing.astro`, `src/components/widgets/AltitudeScene.astro`, `src/components/widgets/RevealScript.astro`
- Modify: `src/layouts/PageLayout.astro` (drop the `RevealScript` import/usage)

- [ ] **Step 1: Re-confirm zero consumers before deleting**

```bash
grep -rn "LatencyRing\|AltitudeScene" src --include="*.astro" --include="*.ts"
grep -rn "RevealScript" src --include="*.astro"
```

Expected: `LatencyRing`/`AltitudeScene` return only a comment mention in `src/components/illustrations/SvgDefs.astro`; `RevealScript` returns only `src/layouts/PageLayout.astro`. **If anything else appears, stop and reassess** — do not delete a live component.

- [ ] **Step 2: Delete and unwire**

```bash
git rm src/components/visuals/LatencyRing.astro src/components/widgets/AltitudeScene.astro src/components/widgets/RevealScript.astro
```

Then remove the `RevealScript` import line and its `<RevealScript />` usage from `src/layouts/PageLayout.astro`.

- [ ] **Step 3: Verify**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add -u
git commit -m "chore: remove zero-consumer visuals and dead reveal script"
```

---

## Tasks 4–9 — shared rebuild pattern

Each of the next six blocks imports one retiring visual. Read this once, apply per task:

1. Remove the visual's `import` line.
2. Remove the markup that rendered it.
3. Replace with the plain pattern named in that task.
4. Keep **every** `block.*` content binding — content comes from Storyblok and must still render. Never drop a field.
5. Keep `data-reveal` attributes (the live reveal system).
6. Keep existing ARIA (`aria-labelledby`, `role="tablist"`, etc.) intact.
7. `npm run build` must pass before commit.

---

### Task 4: Rebuild Hero (highest visibility — do this carefully)

**Files:**

- Modify: `src/components/blocks/Hero.astro`
- Modify: `src/styles/global.css` (add `.button-cta` if absent)
- Modify: `scripts/check-contrast.mjs` (add the gradient pair)

**Interfaces:**

- Consumes: `HeroBlock` from `src/types/content.ts` — fields `eyebrow?`, `title`, `summary`, `primaryAction{label,href,external?}`, `secondaryAction?`, `proof?: string[]`.

- [ ] **Step 1: Replace the file**

Replace `src/components/blocks/Hero.astro` in full — drops `RoyalCloudscape`, replaces the copy+visual grid with a centered typographic hero on a violet gradient:

```astro
---
import type { HeroBlock } from "../../types/content";

interface Props { block: HeroBlock }

const { block } = Astro.props;
const isExternal = (href: string, flag?: boolean) => flag ?? href.startsWith("http");
const primaryExternal = isExternal(block.primaryAction.href, block.primaryAction.external);
const secondaryExternal = block.secondaryAction
  ? isExternal(block.secondaryAction.href, block.secondaryAction.external)
  : false;
---

<section class="hero" aria-labelledby="hero-title">
  <div class="shell hero__inner" data-reveal>
    {block.eyebrow && <p class="hero__eyebrow">{block.eyebrow}</p>}
    <h1 id="hero-title">{block.title}</h1>
    <p class="hero__lede">{block.summary}</p>

    <div class="hero__actions">
      <a
        class="button button-cta"
        href={block.primaryAction.href}
        target={primaryExternal ? "_blank" : undefined}
        rel={primaryExternal ? "noopener noreferrer" : undefined}
      >{block.primaryAction.label}</a>

      {block.secondaryAction && (
        <a
          class="button button-ghost"
          href={block.secondaryAction.href}
          target={secondaryExternal ? "_blank" : undefined}
          rel={secondaryExternal ? "noopener noreferrer" : undefined}
        >{block.secondaryAction.label}</a>
      )}
    </div>

    {block.proof && block.proof.length > 0 && (
      <ul class="hero__proof">
        {block.proof.map((item) => (
          <li>
            <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" focusable="false">
              <path d="M3 8.5l3.2 3.2L13 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            {item}
          </li>
        ))}
      </ul>
    )}
  </div>
</section>

<style>
  .hero {
    position: relative;
    overflow: hidden;
    padding-block: clamp(4rem, 9vw, 7rem);
    background: linear-gradient(95deg, var(--rc-primary-dark), var(--rc-primary) 45%, var(--rc-primary-light));
    color: #fff;
    text-align: center;
  }

  .hero__inner {
    display: grid;
    justify-items: center;
    gap: 1.25rem;
    max-width: 52rem;
  }

  .hero__eyebrow {
    margin: 0;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--rc-gold);
  }

  .hero h1 {
    margin: 0;
    color: #fff;
    font-size: clamp(2rem, 5.4vw, 3.5rem);
    line-height: 1.12;
  }

  .hero__lede {
    margin: 0;
    max-width: 42rem;
    font-size: clamp(1rem, 1.4vw, 1.125rem);
    line-height: 1.6;
    color: rgb(255 255 255 / 0.88);
  }

  .hero__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem;
    margin-top: 0.75rem;
  }

  .hero__proof {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem 1.75rem;
    margin: 1.5rem 0 0;
    padding: 0;
    list-style: none;
  }
  .hero__proof li {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.875rem;
    font-weight: 700;
    color: rgb(255 255 255 / 0.92);
  }
  .hero__proof svg { flex-shrink: 0; color: var(--rc-gold); }
</style>
```

- [ ] **Step 2: Add the CTA button style if absent**

Check `src/styles/global.css` for `.button-cta`. If missing, add:

```css
.button-cta {
  background: linear-gradient(135deg, var(--rc-gold-light), var(--rc-gold));
  color: var(--rc-ink);
  border: 2px solid transparent;
}
.button-cta:hover {
  filter: brightness(1.06);
}
```

`#2f1c6a` on `#ffc94b` is already in `PAIRS` and passes.

- [ ] **Step 3: Gate the gradient's worst case**

The gradient's **lightest** stop is where white text is most at risk. That stop is `--rc-primary-light`, already covered by the `white on primary-light` pair added in Task 1 (verified 4.88:1 with the corrected `#7d59d9`).

This is precisely why `--rc-primary-light` was darkened from the reference's `#8a63f0`: at that value the gradient's lightest stop gives white text only **4.10:1** — a real AA failure on the site's most prominent element.

```bash
npm run build && npm run check:contrast
```

If you change any gradient stop, add the new stop color to `PAIRS` and re-run. **Do not ship white text on a gradient that fails at any stop.**

If this pair fails, darken the gradient's third stop until it passes and update the pair's `bg` to match. **Do not ship white text on a gradient that fails at any stop.**

- [ ] **Step 4: Commit**

```bash
git add src/components/blocks/Hero.astro src/styles/global.css scripts/check-contrast.mjs
git commit -m "feat(hero): rebuild on violet gradient, drop RoyalCloudscape"
```

---

### Task 5: Rebuild OperatorStrip

`DeployLog` rendered `block.tabs[].lines[]` — **real CMS content**. It must keep rendering; only the styling changes. Inline the transcript markup; do not delete the data.

**Files:**

- Modify: `src/components/blocks/OperatorStrip.astro`
- Modify: `scripts/check-contrast.mjs`

- [ ] **Step 1: Remove the import**

Delete line 5: `import DeployLog from "@/components/visuals/DeployLog.astro";`

- [ ] **Step 2: Replace the usage**

Replace `<DeployLog title={tab.title} lines={tab.lines} />` with an inline transcript preserving every line:

```astro
<div class="terminal">
  <div class="terminal-bar">
    <span class="terminal-dot" aria-hidden="true"></span>
    <span class="terminal-dot" aria-hidden="true"></span>
    <span class="terminal-dot" aria-hidden="true"></span>
    <span class="terminal-title">{tab.title}</span>
  </div>
  <div class="terminal-body">
    {tab.lines.map((line) => (
      <code class:list={["line", `line-${line.kind}`]}>
        {line.kind === "cmd" ? "$ " : line.kind === "ok" ? "✓ " : "  "}
        {line.text}
      </code>
    ))}
  </div>
</div>
```

- [ ] **Step 3: Add the terminal styles**

Append to the component's `<style>`:

```css
.terminal {
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 0.14);
  border-radius: var(--radius-card);
  background: var(--rc-night-deep);
}
.terminal-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-bottom: 1px solid rgb(255 255 255 / 0.1);
}
.terminal-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.28);
}
.terminal-title {
  margin-left: 0.375rem;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: rgb(255 255 255 / 0.72);
}
.terminal-body {
  padding: 1rem;
}
.line {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  line-height: 1.7;
  white-space: pre-wrap;
}
.line-cmd {
  color: #fff;
}
.line-out {
  color: #a8a8b3;
}
.line-ok {
  color: var(--rc-success);
}
```

- [ ] **Step 4: Verify content survived**

```bash
npm run build
grep -c "tab.lines.map" src/components/blocks/OperatorStrip.astro
```

Expected: build passes, grep returns `1`. The tablist JS at the bottom of the file is untouched and still works.

- [ ] **Step 5: Gate the terminal colors**

Both terminal colors are already covered by pairs added in Task 1 and verified: `terminal out on night-deep` (`#a8a8b3` on `#231252`) at 6.97:1, and `success on night-deep` (`#009e81`) at 4.85:1.

```bash
npm run check:contrast
```

If you change `line-out`'s color, update **both** the CSS and its pair, then re-run.

- [ ] **Step 6: Commit**

```bash
git add src/components/blocks/OperatorStrip.astro scripts/check-contrast.mjs
git commit -m "feat(operator-strip): inline terminal transcript, drop DeployLog"
```

---

### Task 6: Rebuild Infrastructure

`NetworkAtlas` is **purely decorative** — verified: no content props, and its own `<desc>` reads "illustrative and shows no live status." Delete it; `block.locations` carries all the real content.

**Files:**

- Modify: `src/components/blocks/Infrastructure.astro`

- [ ] **Step 1: Remove the import and the atlas figure**

Delete line 2 (`import NetworkAtlas ...`) and the entire `<div class="atlas" data-reveal><NetworkAtlas /></div>`.

- [ ] **Step 2: Promote the locations grid**

Replace the `.atlas` and `.locations` styles with:

```css
.locations {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 1rem;
  margin: 2.5rem 0 0;
  padding: 0;
  list-style: none;
}
.locations li {
  padding: 1.5rem;
  border: 1px solid rgb(255 255 255 / 0.14);
  border-radius: var(--radius-card);
  background: rgb(255 255 255 / 0.05);
}
.locations h3 {
  margin: 0 0 0.25rem;
  font-size: 1.0625rem;
  color: #fff;
}
.region {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--rc-gold);
}
.detail {
  margin: 0;
  font-size: 0.875rem;
  color: rgb(255 255 255 / 0.72);
}
```

- [ ] **Step 3: Verify and commit**

```bash
npm run build && npm run check:contrast
git add src/components/blocks/Infrastructure.astro
git commit -m "feat(infrastructure): location grid carries the section, drop NetworkAtlas"
```

---

### Task 7: Rebuild ConsoleShowcase

`RoyalConsole` renders `screen.label` and `screen.caption` — **real CMS content**. Preserve both. The `Math.random()` uid at line 14 stays.

**Files:**

- Modify: `src/components/blocks/ConsoleShowcase.astro`

- [ ] **Step 1: Remove the import**

Delete line 6: `import RoyalConsole from "../visuals/RoyalConsole.astro";`

- [ ] **Step 2: Replace the usage**

Replace `<RoyalConsole label={screen.label} caption={screen.caption} />` with:

```astro
<article class="screen-card">
  <h3 class="screen-card__label">{screen.label}</h3>
  {screen.caption && <p class="screen-card__caption">{screen.caption}</p>}
</article>
```

- [ ] **Step 3: Add styles**

```css
.screen-card {
  padding: clamp(1.25rem, 3vw, 1.75rem);
  border: 1px solid rgb(255 255 255 / 0.14);
  border-radius: var(--radius-panel);
  background: rgb(255 255 255 / 0.05);
}
.screen-card__label {
  margin: 0 0 0.5rem;
  font-size: 1.0625rem;
  color: #fff;
}
.screen-card__caption {
  margin: 0;
  max-width: 60ch;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: rgb(255 255 255 / 0.72);
}
```

- [ ] **Step 4: Verify the no-JS path**

The script at lines 65-81 only collapses frames once it confirms 2+ tabs. The wrapper `div.frame` carrying `[data-console-frame]` is unchanged, so the switcher still works.

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/components/blocks/ConsoleShowcase.astro
git commit -m "feat(console-showcase): plain screen cards, drop RoyalConsole"
```

---

### Task 8: Rebuild Cta

`RouteSignal` is decorative (`aria-hidden="true"`, no props). Replace the background graphic with a gradient.

**Files:**

- Modify: `src/components/blocks/Cta.astro`

- [ ] **Step 1: Remove the import and graphic**

Delete line 2 (`import RouteSignal ...`) and the entire `<div class="cta__graphic" aria-hidden="true"><RouteSignal /></div>`.

- [ ] **Step 2: Replace the styles**

```css
.cta {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: linear-gradient(
    95deg,
    var(--rc-primary-dark),
    var(--rc-primary) 45%,
    var(--rc-primary-light)
  );
  color: #fff;
}
.cta__copy {
  margin-bottom: 0;
}
.cta__copy h2 {
  color: #fff;
}
.cta__copy .lede {
  color: rgb(255 255 255 / 0.88);
}
.cta__copy .button-row {
  margin-top: 1.75rem;
}
```

- [ ] **Step 3: Match Hero's conversion color**

Change the CTA link's class from `button-invert` to `button-cta`, so the conversion action is gold-on-violet exactly as in Hero.

- [ ] **Step 4: Verify and commit**

```bash
npm run build && npm run check:contrast
git add src/components/blocks/Cta.astro
git commit -m "feat(cta): violet gradient band with gold action, drop RouteSignal"
```

---

### Task 9: Rebuild FeatureNarrative

`StackSchematic` carried **its own hardcoded layer names** (`["EDGE CACHE", "ISOLATED POOLS", …]`) — invented in the component, not supplied by the CMS. Dropping it loses no CMS content. The `variant` derivation (lines 8-19) exists only to pick a schematic, so it becomes dead — delete it too.

**Files:**

- Modify: `src/components/blocks/FeatureNarrative.astro`

- [ ] **Step 1: Delete the import, the variant logic, and the schematic**

Remove line 2 (`import StackSchematic ...`), the whole `haystack`/`variant` block (lines 8-19), and `<div class="schematic">…</div>`.

- [ ] **Step 2: Make the feature list a full-width card grid**

Leave `.feature-list` as the grid's only child and replace the styles:

```css
.feature-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
  gap: 1.25rem;
  margin: 2.5rem 0 0;
  padding: 0;
  list-style: none;
}
.feature-list .card {
  padding: 1.75rem;
  border: 2px solid var(--rc-primary-050);
  border-radius: var(--radius-panel);
  background: #fff;
  transition:
    transform var(--dur-3) var(--ease-out),
    box-shadow var(--dur-3) var(--ease-out);
}
.feature-list .card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-card-hover);
}
.feature-list h3 {
  margin: 0 0 0.5rem;
  color: var(--rc-ink);
  font-size: 1.125rem;
}
.feature-list p {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.6;
}

@media (prefers-reduced-motion: reduce) {
  .feature-list .card {
    transition: none;
  }
  .feature-list .card:hover {
    transform: none;
  }
}
```

Delete the now-unused `.features__grid` and `.schematic` rules.

- [ ] **Step 3: Verify and commit**

```bash
npm run build
git add src/components/blocks/FeatureNarrative.astro
git commit -m "feat(feature-narrative): card grid, drop StackSchematic"
```

---

### Task 10: Remove ShieldStackBlock from the CMS contract

The only task that changes the content schema. All four edits land together or the type union breaks.

**Files:**

- Delete: `src/components/blocks/ShieldStackBlock.astro`
- Modify: `src/types/content.ts:186` (interface), `:297` (union entry)
- Modify: `src/components/blocks/BlockRenderer.astro:19` (import), `:49` (case), `:57` (preview array)

- [ ] **Step 1: STOP-GATE — confirm no published content uses the block**

```bash
grep -rn "shield-stack" src public --include="*.json" --include="*.yml" --include="*.yaml" --include="*.ts"
```

Expected: matches only in `src/types/content.ts` and `src/components/blocks/BlockRenderer.astro`. **If any content JSON references `shield-stack`, stop and report** — removing the block would blank a live section.

- [ ] **Step 2: Remove from the type contract**

In `src/types/content.ts`: delete the `ShieldStackBlock` interface (starts line 186) and remove `| ShieldStackBlock` from the `PageBlock` union (line 297).

- [ ] **Step 3: Remove from the renderer**

In `src/components/blocks/BlockRenderer.astro`:

- Delete line 19 (import).
- Delete line 49 (the `shield-stack` render case).
- Remove the `"shield-stack"` string from line 57's `includes([...])` array.

- [ ] **Step 4: Delete the component**

```bash
git rm src/components/blocks/ShieldStackBlock.astro
```

- [ ] **Step 5: Verify the type contract holds**

```bash
npm run build
```

Expected: PASS. A dangling union member or leftover import fails here.

- [ ] **Step 6: Run the CMS consistency check if it exists**

```bash
grep -n '"check:cms"' package.json && npm run check:cms || echo "check:cms not defined — skipping, note in commit"
```

Do not invent this script if absent.

- [ ] **Step 7: Commit**

```bash
git add -u
git commit -m "refactor(cms): remove shield-stack block from schema and renderer"
```

---

### Task 11: Delete the remaining visuals and trim SvgDefs

Safe only once Tasks 4–10 removed every importer.

**Files:**

- Delete: `src/components/visuals/{ShieldStack,DeployLog,NetworkAtlas,RoyalConsole,RouteSignal,StackSchematic,RoyalCloudscape}.astro`
- Modify: `src/components/illustrations/SvgDefs.astro`

- [ ] **Step 1: Prove every one is now unimported**

```bash
for name in ShieldStack DeployLog NetworkAtlas RoyalConsole RouteSignal StackSchematic RoyalCloudscape; do
  echo "--- $name ---"
  grep -rn "$name" src --include="*.astro" --include="*.ts" | grep -v "^src/components/visuals/$name.astro"
done
```

Expected: no import lines. Comment mentions in `SvgDefs.astro` are fine. **Any real import means that task is incomplete — go back.**

- [ ] **Step 2: Delete**

```bash
git rm src/components/visuals/ShieldStack.astro src/components/visuals/DeployLog.astro src/components/visuals/NetworkAtlas.astro src/components/visuals/RoyalConsole.astro src/components/visuals/RouteSignal.astro src/components/visuals/StackSchematic.astro src/components/visuals/RoyalCloudscape.astro
```

- [ ] **Step 3: Trim SvgDefs**

Remove `<defs>` entries used only by the deleted visuals, plus the stale `AltitudeScene` comment. Before removing each id, confirm it is unused:

```bash
grep -rn "url(#<id>)\|href=\"#<id>\"" src --include="*.astro" --include="*.css"
```

Keep anything still referenced. If the file ends up empty, delete it and remove its usage.

- [ ] **Step 4: Verify and commit**

```bash
npm run build
git add -u
git commit -m "chore(visuals): delete retired telemetry-visual layer"
```

---

### Task 12: Re-theme the hardcoded-hex components

Mechanical, but **not** blind find-replace — some hexes are inside SVG artwork where a token would be wrong.

**Files:** the ~28 files listed by Step 1, minus any already deleted.

- [ ] **Step 1: Get the live list**

```bash
grep -rlE "#[0-9a-fA-F]{3,6}" src/components/blocks src/components/sections src/components/widgets src/components/ui | sort
```

- [ ] **Step 2: Apply the mapping per file**

| Hardcoded                                                                   | Replace with                                        |
| --------------------------------------------------------------------------- | --------------------------------------------------- |
| `#00a7f5`, `#269fd9`, `#7652f2`, `#7b1fa2`, `#2e1acc`, `#673ab7`, `#5e35b1` | `var(--rc-primary)`                                 |
| `#0086cf`, `#5b3bd6`                                                        | `var(--rc-primary-dark)`                            |
| `#e5f6fe`, `#efeafe`, `#f6f8fc`                                             | `var(--rc-lavender)`                                |
| `#22105f`, `#2c1a6e`                                                        | `var(--rc-ink)`                                     |
| `#181b22`, `#00051e`, `#04183c`, `#00031e`                                  | `var(--rc-night-deep)`                              |
| `#4d4d4d`, `#5f6673`                                                        | `var(--rc-body)`                                    |
| `#999`, `#999999`                                                           | `var(--rc-muted)` _(fixes a documented AA failure)_ |
| `#fdd700`                                                                   | `var(--rc-gold)`                                    |
| `#1fa463`                                                                   | `var(--rc-success)`                                 |
| `#ff5e3a`, `#fa4612`, `#ff416c`                                             | `var(--rc-primary)` _(orange retired)_              |
| `#a5215e`                                                                   | `var(--rc-primary-dark)`                            |
| `#ddd`, `#eee`, `#e9e4f7`                                                   | `var(--line)`                                       |
| `#fff`, `#ffffff`                                                           | leave as-is                                         |

**Do not** convert hexes inside `<svg>` illustration paths in `src/components/sections/art/*` unless the color is clearly brand chrome — illustration fills are artwork, and tokenizing them can make the drawing unreadable. When unsure, leave it and note it in the commit body.

- [ ] **Step 3: Verify no brand hex survives outside artwork**

```bash
grep -rnE "#(00a7f5|269fd9|7652f2|7b1fa2|2e1acc|22105f|4d4d4d|999999|fdd700|ff5e3a)" src/components | grep -v "/art/"
```

Expected: zero matches.

- [ ] **Step 4: Verify and commit**

```bash
npm run build && npm run check:contrast
git add -u
git commit -m "refactor(components): replace hardcoded hex with v3 tokens"
```

---

### Task 13: Header scroll-shadow

`[data-header]` exists at `SiteHeader.astro:27`; the script at line 103 handles nav only — no scroll listener today.

**Files:**

- Modify: `src/components/SiteHeader.astro`

- [ ] **Step 1: Add the scroll listener**

Inside the existing `if (header) { … }` block (opens line 105), before its closing brace:

```ts
// Shadow appears only once the page has actually scrolled.
const SCROLL_THRESHOLD = 8;
let ticking = false;
const syncShadow = () => {
  header.classList.toggle("is-scrolled", window.scrollY > SCROLL_THRESHOLD);
  ticking = false;
};
window.addEventListener(
  "scroll",
  () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(syncShadow);
  },
  { passive: true },
);
syncShadow();
```

- [ ] **Step 2: Add the style**

```css
.header-dock {
  transition: box-shadow var(--dur-2) var(--ease-out);
}
.header-dock.is-scrolled {
  box-shadow: 0 4px 18px rgb(35 18 82 / 0.18);
}
@media (prefers-reduced-motion: reduce) {
  .header-dock {
    transition: none;
  }
}
```

- [ ] **Step 3: Verify manually**

```bash
npm run dev
```

At `http://localhost:4321`: scroll down → shadow appears; scroll to top → it goes. Confirm nav dropdowns still open/close (the shared `if (header)` block must not be broken).

- [ ] **Step 4: Commit**

```bash
git add src/components/SiteHeader.astro
git commit -m "feat(header): scroll-conditional shadow"
```

---

### Task 14: Marquee ticker

Pure CSS, no JS. Sits under the existing announcement band (`SiteHeader.astro` lines 8-25), which already owns its dismiss logic — do not duplicate that.

**Files:**

- Modify: `src/components/SiteHeader.astro`
- Modify: `src/data/settings.ts`

**Interfaces:**

- Consumes: `siteSettings` from `@/data/settings`.
- Produces: `siteSettings.marquee?: string[]` — omitted or empty renders nothing.

- [ ] **Step 1: Add the setting**

In `src/data/settings.ts`, add to the exported settings object, matching the file's existing style:

```ts
  marquee: ["Free SSL", "15x Faster SSD", "24/7/365 Support", "Money-Back Guarantee"],
```

Add `marquee?: string[];` to the settings type if one is declared.

- [ ] **Step 2: Render it**

Destructure `marquee` alongside the existing fields on line 5. Then, after the announcement `<aside>` (line 25) and before `<div class="header-dock">`:

```astro
{marquee && marquee.length > 0 && (
  <div class="marquee" aria-hidden="true">
    {/* Duplicated once so the -50% translate loops seamlessly. aria-hidden
        because a perpetually looping ticker is hostile to a screen reader. */}
    <div class="marquee__track">
      {[0, 1].map(() => (
        <span class="marquee__group">
          {marquee.map((item) => (
            <>
              <span>{item}</span>
              <span class="marquee__star">✦</span>
            </>
          ))}
        </span>
      ))}
    </div>
  </div>
)}
```

- [ ] **Step 3: Add the styles**

```css
.marquee {
  overflow: hidden;
  padding-block: 0.625rem;
  background: var(--rc-night);
  color: #fff;
}
.marquee__track {
  display: flex;
  width: max-content;
  animation: marquee-scroll 30s linear infinite;
}
.marquee__group {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding-right: 2rem;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  white-space: nowrap;
}
.marquee__star {
  color: var(--rc-gold);
}

@keyframes marquee-scroll {
  to {
    transform: translateX(-50%);
  }
}

/* A perpetually-moving band is a vestibular trigger — stop it entirely. */
@media (prefers-reduced-motion: reduce) {
  .marquee__track {
    animation: none;
  }
}
```

- [ ] **Step 4: Verify**

```bash
npm run build && npm run dev
```

Check: loops with no visible seam; static with OS reduce-motion on; white-on-`--rc-night` already passes in `PAIRS`.

- [ ] **Step 5: Commit**

```bash
git add src/components/SiteHeader.astro src/data/settings.ts
git commit -m "feat(header): CSS marquee ticker"
```

---

### Task 15: Legal-page scrollspy

`Legal.astro` has a sticky `<aside>` with an `<ol>` of anchors to `#{section.id}`. Add active-link highlighting.

**Files:**

- Modify: `src/components/blocks/Legal.astro`

- [ ] **Step 1: Add the hook attribute**

On the `<nav>` inside the `<aside>`, add `data-legal-nav`.

- [ ] **Step 2: Add the script**

At the end of the file, before `<style>`:

```astro
<script>
  const nav = document.querySelector<HTMLElement>("[data-legal-nav]");
  if (nav) {
    const links = new Map<string, HTMLAnchorElement>();
    for (const link of nav.querySelectorAll<HTMLAnchorElement>("a[href^='#']")) {
      links.set(decodeURIComponent(link.hash.slice(1)), link);
    }

    const sections = [...links.keys()]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length > 0) {
      let current = "";
      const setActive = (id: string) => {
        if (id === current) return;
        current = id;
        for (const [key, link] of links) {
          link.classList.toggle("is-active", key === id);
        }
      };

      const observer = new IntersectionObserver(
        (entries) => {
          // Topmost intersecting section wins, so scrolling up highlights correctly.
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          if (visible[0]) setActive(visible[0].target.id);
        },
        { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
      );

      for (const section of sections) observer.observe(section);
      setActive(sections[0].id);
    }
  }
</script>
```

- [ ] **Step 3: Add the active style**

```css
ol a {
  border-left: 3px solid transparent;
  padding-left: 0.625rem;
  transition:
    color var(--dur-2) var(--ease-out),
    border-color var(--dur-2) var(--ease-out);
}
ol a.is-active {
  color: var(--rc-primary);
  border-left-color: var(--rc-primary);
}
@media (prefers-reduced-motion: reduce) {
  ol a {
    transition: none;
  }
}
```

Also update the existing `ol a:hover` rule's `var(--cobalt)` to `var(--rc-primary)` if Task 2 missed it.

- [ ] **Step 4: Verify**

Load a legal page and scroll: the active link tracks the visible section, and updates correctly in **both** directions.

- [ ] **Step 5: Commit**

```bash
git add src/components/blocks/Legal.astro
git commit -m "feat(legal): scrollspy active-section highlighting"
```

---

### Task 16: Back-to-top button

**Files:**

- Modify: `src/layouts/SiteLayout.astro` (between `<slot />` at line 47 and `<SiteFooter />` at 48)

- [ ] **Step 1: Add the button**

```astro
<button type="button" class="to-top" data-to-top hidden aria-label="Back to top">
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
    <path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</button>
```

- [ ] **Step 2: Add the script**

```astro
<script>
  const toTop = document.querySelector<HTMLButtonElement>("[data-to-top]");
  if (toTop) {
    const SHOW_AFTER = 600;
    let ticking = false;
    const sync = () => {
      toTop.hidden = window.scrollY < SHOW_AFTER;
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(sync);
    }, { passive: true });

    toTop.addEventListener("click", () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });

    sync();
  }
</script>
```

- [ ] **Step 3: Add the styles**

```css
.to-top {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 40;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 999px;
  background: var(--rc-primary);
  color: #fff;
  cursor: pointer;
  box-shadow: var(--shadow-md);
}
.to-top[hidden] {
  display: none;
}
.to-top:hover {
  background: var(--rc-primary-dark);
}
.to-top:focus-visible {
  outline: 3px solid var(--rc-gold);
  outline-offset: 2px;
}
```

44×44 exceeds the 24×24 minimum tap target; white-on-primary is already covered in `PAIRS`.

- [ ] **Step 4: Verify**

Scroll past 600px → appears. Click → returns to top. Tab to it → visible gold focus ring. With reduce-motion on → jumps instantly.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/SiteLayout.astro
git commit -m "feat(layout): back-to-top button"
```

---

### Task 17: Rewrite DESIGN.md as v3

**Files:**

- Modify: `DESIGN.md` (full replacement)

- [ ] **Step 1: Replace the file**

Write DESIGN.md v3 covering, in order:

1. **What changed and why** — v3 supersedes both the cobalt/orange v2 language and the pixel-clone-of-live-royalclouds.net direction. State plainly that the telemetry-visual concept was retired, and why.
2. **Design read** — premium hosting, violet/gold, clean marketing patterns over simulated telemetry.
3. **Token architecture** — the three layers, with the exact primitive table from Global Constraints. Rule: components consume semantic/component names only, never primitives.
4. **Typography** — DM Sans; the type scale (`--rc-fs-display` … `--rc-fs-caption`).
5. **Spacing / radius / shadow / motion** — the 4px grid and the scales in `tokens.css`.
6. **Component inventory** — atoms (`.rc-btn`, `.rc-pill`, `.rc-card`, `.rc-input`), molecules (section header, stat, feature card, testimonial), organisms (header, marquee, pricing grid, CTA band, footer).
7. **Interactions** — the table from spec §7, **corrected**: the live reveal system is `[data-reveal]` handled in `SiteLayout.astro`, not the deleted `RevealScript.astro`.
8. **Accessibility floor** — AA enforced by `npm run check:contrast`; visible `:focus-visible` on every interactive element; tap targets ≥24×24; animations ≥200ms wrapped in `prefers-reduced-motion`.
9. **Anti-patterns** — carried forward: no countdown timers or fake scarcity, no discount-badge stacking, no prices without term and renewal, no un-attributed testimonials, no auto-playing video with sound, no AI-purple "magic" language.

- [ ] **Step 2: Verify no stale references survive**

```bash
grep -nE "cobalt|signal-orange|#FF6B3D|#2F36D4|LatencyRing|RoyalConsole|NetworkAtlas|RouteSignal|StackSchematic|RoyalCloudscape|AltitudeScene|Dosis|Open Sans" DESIGN.md
```

Expected: no matches except where section 1 deliberately names what was retired.

- [ ] **Step 3: Commit**

```bash
git add DESIGN.md
git commit -m "docs(design): rewrite DESIGN.md as violet system v3"
```

---

### Task 18: Full-system QA

**Files:** none modified unless a defect is found.

- [ ] **Step 1: Full gate**

```bash
npm run build && npm test && npm run check:contrast
```

All three must pass.

- [ ] **Step 2: Route smoke check**

```bash
npm run dev
```

In a second shell — first derive the real route list rather than trusting a stale one:

```bash
curl -s http://localhost:4321/sitemap.xml | grep -oE "<loc>[^<]+</loc>" | sed -E "s#</?loc>##g"
```

Then check each returns 200:

```bash
for url in $(curl -s http://localhost:4321/sitemap.xml | grep -oE "<loc>[^<]+</loc>" | sed -E "s#</?loc>##g"); do
  path=$(echo "$url" | sed -E "s#https?://[^/]+##")
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:4321${path:-/}")
  echo "$code  ${path:-/}"
done
```

Expected: all `200`. Any non-200 for a route that worked before this branch is a regression — fix before proceeding.

- [ ] **Step 3: Visual check at three widths**

At 1440, 768, and 390 px, on the homepage and one inner page, confirm:

- No horizontal scrollbar at 390.
- Hero headline does not exceed 3 lines at 1440.
- Marquee loops with no visible seam.
- Header shadow appears only after scrolling.
- Back-to-top appears past 600px and does not cover the footer CTA.
- Cards and pricing tables do not overflow their containers.

- [ ] **Step 4: Accessibility spot-check**

- Tab through the header: every control shows a visible focus ring.
- With OS reduce-motion on: marquee static, reveals instant, back-to-top jumps.
- Pricing/currency spans still render correct values (project-memory untouchable).
- WHMCS links still point at `my.royalclouds.net`.

- [ ] **Step 5: Confirm the untouchables**

```bash
git diff e0d7b42..HEAD -- astro.config.mjs | grep -i "format" || echo "build.format untouched — OK"
grep -rn "my.royalclouds.net" src/data/settings.ts | head -3
```

- [ ] **Step 6: Final commit**

```bash
git add -u
git commit -m "chore: violet design system v3 QA pass"
```

---

## Self-review notes

**Corrections to the spec, applied in this plan:**

1. **Spec §7 was wrong about scroll-reveal.** It named `RevealScript.astro` as the system to reuse. Verified: the live system is `[data-reveal]` handled at `SiteLayout.astro:71`; `RevealScript.astro` uses a separate `.reveal`/`.in` convention, is wired only into `PageLayout.astro`, and its sole class consumer is the dead `LatencyRing.astro`. Task 3 deletes it; Task 17 §7 records the correction.
2. **Spec §8 implied all 9 visuals were live.** Verified: `LatencyRing.astro` and `AltitudeScene.astro` have zero importers — already-dead code, not tied to any block rebuild. Split into Task 3 (delete now) vs Task 11 (delete after rebuilds).
3. **Spec assumed a test suite exists.** Verified: `vitest` is a dependency but there are no test files and no `test` script. Task 1 adds both, scoped to the contrast math — the only real logic in this change.
4. **Two of the reference palette's colors fail WCAG AA.** The contrast checker was executed against the full palette while writing this plan, and caught three failures the spec would have shipped: `#8a63f0` primary-light (4.10:1 with white — and it is the hero gradient's lightest stop, the single most prominent text on the site), `#00b090` success (2.76:1 on white), and a first-pass `#b26b00` amber (4.20:1). Corrected to `#7d59d9`, `#009e81`, `#9a5c00` — all verified. **These are intentional divergences from the user-supplied reference; do not "restore" them.**

**Uncertainty flagged for the implementer:**

- **Task 10 Step 1 is a stop-gate.** If any content JSON references `shield-stack`, removing the block blanks a live section. Report rather than proceed.
- **Task 12** needs judgment on SVG artwork fills. The mapping table is for chrome, not illustration. When unsure, leave the hex and note it.
- **`npm run check:cms`** is referenced in project memory but was not confirmed present in `package.json`. Task 10 Step 6 detects it and skips if absent rather than inventing it.
- **Contrast values in `PAIRS`** are computed by the checker at runtime; the plan does not assert specific ratios it did not compute. Any pair that fails is a real signal to change the token, not the threshold.
