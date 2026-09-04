#!/usr/bin/env node
/**
 * check-contrast.mjs — WCAG 2.1 contrast gate for the Royal Clouds theme.
 * Every pairing the site renders is listed and computed, not eyeballed.
 * Math per https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 *
 * Run: node scripts/check-contrast.mjs (or npm run check:contrast)
 */

const SHORTHAND = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i;
const FULL = /^#([0-9a-f]{6})$/i;

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
  return { label, ratio: Math.round(ratio * 100) / 100, required, pass: ratio >= required };
}

/* Royal palette (light mode is the shipping mode):
   violet #673de6 · violet-dark #5025d1 · violet-light #7d59d9
   night #2f1c6a · night-deep #231252 · gold #ffc94b · gold-light #ffd97a
   lavender #faf7ff · violet-050 #f0edff · body #595b68 · muted #8b8c99 */
export const PAIRS = [
  // Light fields
  { label: "body on white card", fg: "#595b68", bg: "#ffffff", size: "body" },
  { label: "body on lavender body", fg: "#595b68", bg: "#faf7ff", size: "body" },
  { label: "ink heading on white", fg: "#2f1c6a", bg: "#ffffff", size: "body" },
  { label: "ink heading on lavender", fg: "#2f1c6a", bg: "#faf7ff", size: "body" },
  { label: "accent link on white", fg: "#673de6", bg: "#ffffff", size: "body" },
  { label: "accent text on white", fg: "#5025d1", bg: "#ffffff", size: "body" },
  { label: "accent eyebrow on lavender", fg: "#673de6", bg: "#faf7ff", size: "body" },
  { label: "secondary on violet-050 tile", fg: "#595b68", bg: "#f0edff", size: "body" },

  // Buttons / chips
  { label: "white on violet button", fg: "#ffffff", bg: "#673de6", size: "body" },
  { label: "white on violet-dark", fg: "#ffffff", bg: "#5025d1", size: "body" },
  { label: "ink on gold CTA", fg: "#2f1c6a", bg: "#ffc94b", size: "body" },
  { label: "ink on gold-light hover", fg: "#2f1c6a", bg: "#ffd97a", size: "body" },
  { label: "gold save chip text on violet-050", fg: "#5025d1", bg: "#f0edff", size: "body" },

  // Dark fields (hero, trust bar, CTA, footer)
  { label: "lavender heading on night", fg: "#faf7ff", bg: "#2f1c6a", size: "body" },
  { label: "white heading on night", fg: "#ffffff", bg: "#2f1c6a", size: "body" },
  { label: "dark-field body on night", fg: "#c5bfd5", bg: "#2f1c6a", size: "body" },
  { label: "lavender on night-deep (footer)", fg: "#faf7ff", bg: "#231252", size: "body" },
  { label: "white on night-deep", fg: "#ffffff", bg: "#231252", size: "body" },
  { label: "footer body on night-deep", fg: "#a8a8b3", bg: "#231252", size: "body" },
  { label: "gold eyebrow on night", fg: "#ffc94b", bg: "#2f1c6a", size: "large" },
  { label: "gold eyebrow on night-deep", fg: "#ffc94b", bg: "#231252", size: "large" },
  { label: "gold-light offer on night", fg: "#ffd97a", bg: "#2f1c6a", size: "body" },

  // Royal gradient band (CTA) — worst case is the lightest stop
  { label: "white on violet-light (gradient stop)", fg: "#ffffff", bg: "#7d59d9", size: "body" },
  { label: "gold on violet-light", fg: "#ffc94b", bg: "#7d59d9", size: "large" },

  // Focus rings on dark fields use lavender
  { label: "focus lavender on night", fg: "#faf7ff", bg: "#2f1c6a", size: "ui" },
  { label: "focus lavender on night-deep", fg: "#faf7ff", bg: "#231252", size: "ui" },
  { label: "focus gold on violet CTA button", fg: "#ffc94b", bg: "#673de6", size: "ui" },

  // Hero intent chips (translucent white over night, flattened)
  { label: "hero intent chip on night", fg: "#faf7ff", bg: "#3b2a75", size: "body" },
  { label: "hero intent chip hover on night", fg: "#ffffff", bg: "#473a80", size: "body" },

  // Comparison table: hovered column tint (flattened #673de6 at 6% over white)
  { label: "compare active column body", fg: "#595b68", bg: "#f4f0fd", size: "body" },
  { label: "compare active column heading", fg: "#2f1c6a", bg: "#f4f0fd", size: "body" },
  { label: "compare popular flag on violet header", fg: "#673de6", bg: "#ffffff", size: "ui" },

  { label: "benchmark scale caption on night", fg: "#c5bfd5", bg: "#2f1c6a", size: "body" },

  // Search placeholders are text, so they carry the body threshold
  { label: "search placeholder on white", fg: "#595b68", bg: "#ffffff", size: "body" },
  // Secondary button on dark fields: the border is its only shape indicator
  // (#faf7ff at 38% flattened over night)
  { label: "secondary button border on night", fg: "#7b6ea2", bg: "#2f1c6a", size: "ui" },
  // Sub-nav price line on the gold pill (no opacity — it is solid ink)
  { label: "subnav price line on gold", fg: "#2f1c6a", bg: "#ffc94b", size: "body" },

  // Plan cards v3: spec tiles and the "recommended" chip on violet-050
  { label: "spec tile value ink on violet-050", fg: "#2f1c6a", bg: "#f0edff", size: "body" },
  { label: "spec tile label on violet-050", fg: "#595b68", bg: "#f0edff", size: "body" },

  { label: "carousel inactive dot on white", fg: "#8b8c99", bg: "#ffffff", size: "ui" },

  // Status
  { label: "success check on white", fg: "#009e81", bg: "#ffffff", size: "ui" },
  { label: "error red on white", fg: "#d32f2f", bg: "#ffffff", size: "body" },
];

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
