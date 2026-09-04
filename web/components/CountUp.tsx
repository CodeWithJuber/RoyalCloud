"use client";

import { useEffect, useRef, useState } from "react";
import { easeOutCubic, formatCountable, parseCountable } from "@/lib/count-up";

/**
 * Counts an authored stat up from zero the first time it scrolls into view.
 * Server and first client render print the authored string (no hydration
 * drift); the animation only starts from an IntersectionObserver callback,
 * and never under prefers-reduced-motion. Screen readers get the final
 * value only — the ticking digits are aria-hidden.
 */
export function CountUp({
  value,
  duration = 1200,
  className,
}: {
  value: string;
  duration?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const parsed = parseCountable(value);
    if (!el || !parsed) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    let frame = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const progress = Math.min(1, (now - start) / duration);
      setDisplay(formatCountable(parsed, easeOutCubic(progress)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        cancelAnimationFrame(frame);
        /* Start from zero only once the element is in view: until then the
           authored value stays visible, so a stat never reads "0.0". */
        setDisplay(formatCountable(parsed, 0));
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.3 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">{display}</span>
      <span className="visually-hidden">{value}</span>
    </span>
  );
}
