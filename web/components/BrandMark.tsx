import type { CSSProperties } from "react";
import { brandFor } from "@/lib/brands";

/**
 * A real brand glyph for a product name (cPanel, Cloudflare, Ubuntu…) —
 * Simple Icons paths vendored in lib/brand-icons.ts. `tone="brand"` paints
 * the published brand colour (light fields); `tone="mono"` inherits
 * currentColor (dark fields, where brand guidelines allow a white mark).
 * Renders nothing for names without a glyph, so callers keep their own
 * fallback (a letter mark or a generic icon). Server-only: the registry is
 * ~25 KB, so pass the rendered node into client components as a prop.
 */
export function BrandMark({
  name,
  size = 20,
  tone = "brand",
  className,
  label,
}: {
  name: string;
  size?: number;
  tone?: "brand" | "mono";
  className?: string;
  /** Accessible name; omit when the brand name sits beside the mark. */
  label?: string;
}) {
  const brand = brandFor(name);
  if (!brand?.icon) return null;
  const style: CSSProperties | undefined =
    tone === "brand" ? { color: `#${brand.icon.hex}` } : undefined;
  return (
    <svg
      className={`brand-mark${className ? ` ${className}` : ""}`}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      style={style}
      data-brand={brand.slug}
    >
      <path d={brand.icon.path} fill="currentColor" />
    </svg>
  );
}

/** Does this name have a real glyph? Lets callers choose a fallback. */
export const hasBrandMark = (name: string): boolean => brandFor(name)?.icon != null;
