"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { useOverflow } from "@/lib/use-overflow";

/**
 * ScrollRail — the container for a card row that is a grid at most widths and
 * a horizontal snap rail on phones. CSS decides which; this only supplies the
 * part CSS cannot: a tab stop, and only while the row actually overflows.
 *
 * A scroll container no keyboard can reach is an axe failure
 * (scrollable-region-focusable). A permanent tab stop is the opposite mistake
 * — at desktop these rows are plain grids that fit, and a focus stop on a box
 * with nothing to scroll is furniture. `useOverflow` measures the real box, so
 * the stop appears and disappears with the rail.
 *
 * Children render as direct grid items, with no slide wrapper. That is the
 * difference from `Rail`, which wraps each child to carry carousel semantics
 * and paints dots: right for a five-tier plan deck, wrong for fifteen feature
 * cards, where fifteen dots are worse than none.
 */
interface ScrollRailProps {
  children: ReactNode;
  /** Grid class for the family, e.g. "grid grid-3" or "product-grid". */
  className: string;
  /** Names the region for assistive tech while it is pannable. */
  label: string;
}

export function ScrollRail({ children, className, label }: ScrollRailProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { overflowing } = useOverflow(ref);

  return (
    <div
      ref={ref}
      className={className}
      data-rail={overflowing ? "true" : undefined}
      /* role and name only while it scrolls: a focusable generic box is
         announced as nothing at all, and a static grid should not claim to
         be a region a screen-reader user must pan. */
      role={overflowing ? "group" : undefined}
      aria-label={overflowing ? `${label} — scroll sideways for more` : undefined}
      tabIndex={overflowing ? 0 : undefined}
    >
      {children}
    </div>
  );
}
