"use client";

import { useEffect, useState, type RefObject } from "react";

export interface OverflowState {
  /** The box's content is wider than the box. */
  overflowing: boolean;
  atStart: boolean;
  atEnd: boolean;
}

const SETTLED: OverflowState = { overflowing: false, atStart: true, atEnd: false };

/**
 * Tracks whether a horizontally scrolling box actually overflows and which end
 * it rests at.
 *
 * Anything that only makes sense while it scrolls — prev/next buttons, dots,
 * the tab stop the box needs to be pannable at all, carousel semantics —
 * should be conditioned on `overflowing`. A dead arrow or a focus stop on a
 * box that fits is furniture, and a static grid that announces itself as a
 * carousel is a lie.
 *
 * State is only replaced when a value actually changes, so a scroll gesture
 * costs one render per edge crossing rather than one per frame.
 */
export function useOverflow(ref: RefObject<HTMLElement | null>): OverflowState {
  const [state, setState] = useState<OverflowState>(SETTLED);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const next: OverflowState = {
        overflowing: el.scrollWidth > el.clientWidth + 1,
        atStart: el.scrollLeft <= 1,
        atEnd: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1,
      };
      setState((prev) =>
        prev.overflowing === next.overflowing &&
        prev.atStart === next.atStart &&
        prev.atEnd === next.atEnd
          ? prev
          : next,
      );
    };
    measure();
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(el);
    el.addEventListener("scroll", measure, { passive: true });
    return () => {
      observer?.disconnect();
      el.removeEventListener("scroll", measure);
    };
  }, [ref]);

  return state;
}
