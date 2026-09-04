"use client";

import { useEffect, useState } from "react";

/* Reads a CSS length custom property from <html> in px (rem fallback aware). */
function rootLengthPx(name: string): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const value = parseFloat(raw);
  if (!Number.isFinite(value)) return 0;
  if (raw.endsWith("rem")) {
    return value * (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16);
  }
  return value;
}

/**
 * Which of the given section ids is "current" while scrolling: the topmost
 * section intersecting the band just under the sticky header (and sub-nav),
 * falling back to the last section that has scrolled past the header so the
 * final entry stays active at the bottom of the page. One observer, no
 * scroll listeners.
 */
export function useScrollspy(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join("|");

  useEffect(() => {
    const list = key.split("|").filter(Boolean);
    if (list.length === 0 || typeof IntersectionObserver === "undefined") return;
    const targets = list
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    const offset = rootLengthPx("--site-header-h") + rootLengthPx("--subnav-h");
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        /* The section under the line just below the sticky chrome wins —
           adjacent sections both "intersect" the band, so intersection alone
           cannot break the tie. Re-read the chrome height: the sub-nav
           publishes --subnav-h after mount. */
        const line = rootLengthPx("--site-header-h") + rootLengthPx("--subnav-h") + 1;
        const containing = targets.find((el) => {
          const rect = el.getBoundingClientRect();
          return rect.top <= line && rect.bottom > line;
        });
        if (containing) {
          setActive(containing.id);
          return;
        }
        const first = list.find((id) => visible.has(id));
        if (first) {
          setActive(first);
          return;
        }
        const passed = targets.filter((el) => el.getBoundingClientRect().top < line);
        setActive(passed.length > 0 ? passed[passed.length - 1].id : null);
      },
      { rootMargin: `-${Math.round(offset)}px 0px -55% 0px`, threshold: 0 },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [key]);

  return active;
}
