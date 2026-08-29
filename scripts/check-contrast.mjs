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

/** Decorative hairlines (--rc-border) are deliberately excluded: WCAG 1.4.11
 *  applies to elements needed to identify a control, not ornamental rules.
 *  Any border that IS the sole affordance of a control must use --rc-primary. */
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
  { label: "muted-dark on night", fg: "#a8a8b3", bg: "#2f1c6a", size: "body" },
  {
    label: "muted-dark on night-deep",
    fg: "#a8a8b3",
    bg: "#231252",
    size: "body",
  },
  {
    label: "lavender body on primary",
    fg: "#faf7ff",
    bg: "#673de6",
    size: "body",
  },
  {
    // Hero eyebrow/lede/proof on the gradient's lightest stop (worst case —
    // darker stops give more contrast for this light foreground, same logic
    // as "white on primary-light" above).
    label: "lavender on primary-light",
    fg: "#faf7ff",
    bg: "#7d59d9",
    size: "body",
  },
  {
    // Hero button :focus-visible outline (global.css's default outline is
    // --rc-primary — identical to this gradient's 45% stop, 1.00:1). Same
    // worst-case stop as the pair above; distinct entry since it gates a
    // non-text UI component (3:1), not body text.
    label: "hero focus outline on primary-light",
    fg: "#faf7ff",
    bg: "#7d59d9",
    size: "ui",
  },
  {
    // .hero__proof's decorative checkmark icon, gold on the gradient's
    // lightest stop — correct today (3.19:1), previously untested.
    label: "hero proof icon on primary-light",
    fg: "#ffc94b",
    bg: "#7d59d9",
    size: "ui",
  },
  {
    // .chip-save's actual ground on a dark field: 5% --paper mixed over the
    // field color, not the raw field itself (color-mix(in srgb, var(--paper)
    // 5%, transparent) over --rc-night).
    label: "chip lavender on night composite",
    fg: "#faf7ff",
    bg: "#392771",
    size: "body",
  },
  {
    // Same chip rule, mixed over --rc-primary (.section-royal .chip-save).
    label: "chip lavender on primary composite",
    fg: "#faf7ff",
    bg: "#6f47e7",
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
  {
    // OperatorStrip's tab/copy-button/panel :focus-visible ring. The global
    // default outline (--rc-primary) and this component's old choice
    // (--rc-primary-light) are both under 3:1 on --rc-night — 1.00:1 and
    // 2.88:1 respectively (2.59:1 against the tabbar's tinted --surface-card
    // backing, an even worse case). Re-pointed to --rc-lavender, same fix
    // Hero uses on gradient grounds.
    label: "operator strip focus ring on night",
    fg: "#faf7ff",
    bg: "#2f1c6a",
    size: "ui",
  },
  {
    // OperatorStrip's .terminal-title: rgb(255 255 255 / 0.72) composited
    // over --rc-night-deep, not opaque white — a distinct color from the
    // already-tested "white on night-deep" pair.
    label: "terminal title on night-deep",
    fg: "#c1bdcf",
    bg: "#231252",
    size: "body",
  },
  {
    // Infrastructure's .detail (location card copy, post-NetworkAtlas):
    // rgb(255 255 255 / 0.72) composited over --rc-night — distinct from the
    // night-deep composite above since the underlying field differs.
    label: "infrastructure detail on night",
    fg: "#c5bfd5",
    bg: "#2f1c6a",
    size: "body",
  },
];

/* Verified while writing this plan — all pairs pass:
   body/white 6.73 · body/lavender 6.35 · ink/white 14.05 · ink/lavender 13.25
   primary/white 6.20 · primary-dark/050 7.23 · white/primary 6.20
   white/primary-dark 8.31 · white/primary-light 4.88 · white/night 14.05
   white/night-deep 16.41 · ink/gold 9.17 · muted/white 3.33 · success/white 3.38
   success/night-deep 4.85 · terminal-out/night-deep 6.97 · muted-dark/night 5.96
   muted-dark/night-deep 6.97 · lavender/primary 5.85 · chip-lavender/night-composite
   11.64 · chip-lavender/primary-composite 5.31 · amber/white 5.38 · red/white 4.98
   gold/primary-dark 5.43 · gold/night 9.17 · operator-focus-ring/night 13.25
   · terminal-title/night-deep 8.94 · infrastructure-detail/night 7.88 */

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
