"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";

/**
 * Rail — a CSS scroll-snap rail with previous/next buttons, dots and a live
 * "n of N" for assistive tech. Slides are the children, each wrapped in a
 * snap-aligned list item. No autoplay; controls only appear when the rail
 * actually overflows; programmatic scrolling honours prefers-reduced-motion.
 * Class names are configurable so existing brand CSS (testimonials) and new
 * rails (plan cards) share one behaviour.
 */
export interface RailProps {
  children: ReactNode[];
  label: string;
  /** Region wrapper class (e.g. "testi-carousel"). */
  className?: string;
  railClassName?: string;
  slideClassName?: string;
  controlsClassName?: string;
  navClassName?: string;
  dotsClassName?: string;
  /** Extra class on every slide list item's inner content is the child's own job. */
  itemNoun?: string;
  /** Keys for the slides (defaults to index). */
  keys?: string[];
  /** Stagger reveal on slides (adds data-reveal + --reveal-i). */
  reveal?: boolean;
}

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Rail({
  children,
  label,
  className = "rail-region",
  railClassName = "rail",
  slideClassName = "rail-slide",
  controlsClassName = "rail-controls",
  navClassName = "rail-nav",
  dotsClassName = "rail-dots",
  itemNoun = "item",
  keys,
  reveal = true,
}: RailProps) {
  const railRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [overflowing, setOverflowing] = useState(false);
  const [edges, setEdges] = useState({ start: true, end: false });
  const count = children.length;

  /* Which slide leads the viewport, and whether the rail overflows at all. */
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || typeof IntersectionObserver === "undefined") return;
    const visible = new Set<number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number((entry.target as HTMLElement).dataset.index);
          if (entry.isIntersecting) visible.add(index);
          else visible.delete(index);
        }
        if (visible.size > 0) setActive(Math.min(...visible));
      },
      { root: rail, threshold: 0.6 },
    );
    rail.querySelectorAll<HTMLElement>("[data-index]").forEach((slide) => observer.observe(slide));

    const measure = () => {
      setOverflowing(rail.scrollWidth > rail.clientWidth + 1);
      setEdges({
        start: rail.scrollLeft <= 1,
        end: rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 1,
      });
    };
    const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    resize?.observe(rail);
    rail.addEventListener("scroll", measure, { passive: true });
    return () => {
      observer.disconnect();
      resize?.disconnect();
      rail.removeEventListener("scroll", measure);
    };
  }, [count]);

  function go(index: number) {
    const rail = railRef.current;
    if (!rail) return;
    const target = Math.max(0, Math.min(count - 1, index));
    const slide = rail.querySelector<HTMLElement>(`[data-index="${target}"]`);
    if (!slide) return;
    rail.scrollTo({ left: slide.offsetLeft - rail.offsetLeft, behavior: reducedMotion() ? "auto" : "smooth" });
  }

  const Noun = itemNoun.charAt(0).toUpperCase() + itemNoun.slice(1);

  return (
    <div
      className={className}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      data-controls={overflowing ? "true" : "false"}
    >
      <ul className={railClassName} ref={railRef} tabIndex={0} aria-label={`${label} — scroll sideways`}>
        {children.map((child, i) => (
          <li
            key={keys?.[i] ?? i}
            className={slideClassName}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            data-index={i}
            data-reveal={reveal ? "" : undefined}
            style={reveal ? ({ "--reveal-i": i } as CSSProperties) : undefined}
          >
            {child}
          </li>
        ))}
      </ul>

      <div className={controlsClassName}>
        <button
          type="button"
          className={navClassName}
          aria-label={`Previous ${itemNoun}`}
          disabled={edges.start}
          onClick={() => go(active - 1)}
        >
          <Icon name="chevronLeft" size={16} />
        </button>
        <ol className={dotsClassName} aria-label={`Choose a ${itemNoun}`}>
          {children.map((_, i) => (
            <li key={keys?.[i] ?? i}>
              <button
                type="button"
                aria-label={`Go to ${itemNoun} ${i + 1}`}
                aria-current={i === active ? "true" : undefined}
                onClick={() => go(i)}
              />
            </li>
          ))}
        </ol>
        <button
          type="button"
          className={navClassName}
          aria-label={`Next ${itemNoun}`}
          disabled={edges.end}
          onClick={() => go(active + 1)}
        >
          <Icon name="chevronRight" size={16} />
        </button>
        <span className="visually-hidden" aria-live="polite">
          {Noun} {active + 1} of {count}
        </span>
      </div>
    </div>
  );
}
