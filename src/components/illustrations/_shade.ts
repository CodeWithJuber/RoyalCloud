/**
 * Tiny color-mix helper for the illustration system. Shades a base hex toward
 * space-ink (the locked illustration shadow color) or tints toward white (the
 * locked highlight). Computed at build time in component frontmatter so the
 * two-tone face shading is deterministic and cross-browser (no runtime
 * color-mix). One shared light source = one shared shade ramp.
 */
const INK: [number, number, number] = [10, 14, 31]; // #0a0e1f
const WHITE: [number, number, number] = [255, 255, 255];

function parse(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function toHex(rgb: number[]): string {
  return (
    "#" +
    rgb
      .map((v) =>
        Math.max(0, Math.min(255, Math.round(v)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

function lerp(a: number[], b: number[], t: number): number[] {
  return a.map((v, i) => v + (b[i] - v) * t);
}

/** Mix `hex` toward space-ink by `amt` (0..1). Used for shadowed iso faces. */
export function shade(hex: string, amt: number): string {
  return toHex(lerp(parse(hex), INK, amt));
}

/** Mix `hex` toward white by `amt` (0..1). Used for top-left lit highlights. */
export function tint(hex: string, amt: number): string {
  return toHex(lerp(parse(hex), WHITE, amt));
}
