import type { ReactNode } from "react";
import { BrandMark } from "./BrandMark";

/**
 * Brand glyphs for the plan finder's options, rendered on the server and
 * handed to the client flow as nodes (the icon registry never ships to the
 * browser). Mono tone: the option tile paints the colour — violet at rest,
 * white on hover — so a brand colour never sits on the violet field.
 */
export function finderMarks(): Record<string, ReactNode> {
  return {
    wordpress: <BrandMark name="WordPress" size={22} tone="mono" />,
    wpmanaged: <BrandMark name="WordPress" size={22} tone="mono" />,
    store: <BrandMark name="WooCommerce" size={22} tone="mono" />,
    cpanel: <BrandMark name="cPanel" size={22} tone="mono" />,
  };
}
