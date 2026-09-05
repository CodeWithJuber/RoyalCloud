"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { useOverflow } from "@/lib/use-overflow";

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
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { overflowing, atStart, atEnd } = useOverflow(railRef);
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

    return () => observer.disconnect();
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

  /* CSS decides whether this is a rail or a plain grid at a given width, so
     the carousel semantics — and the rail's tab stop — are attached only when
     it genuinely scrolls. Announcing "carousel, slide 1 of 5" over a static
     three-up grid describes a widget that is not there. */
  const isCarousel = overflowing;

  return (
    <div
      className={className}
      role="region"
      aria-roledescription={isCarousel ? "carousel" : undefined}
      aria-label={label}
      data-controls={isCarousel ? "true" : "false"}
    >
      {/* Divs, not ul/li: each slide needs role="group" to carry
          aria-roledescription="slide", and a role on an <li> strips the
          list semantics its <ul> parent requires. */}
      <div
        className={railClassName}
        ref={railRef}
        tabIndex={isCarousel ? 0 : undefined}
        aria-label={isCarousel ? `${label} — scroll sideways` : undefined}
      >
        {children.map((child, i) => (
          <div
            key={keys?.[i] ?? i}
            className={slideClassName}
            role={isCarousel ? "group" : undefined}
            aria-roledescription={isCarousel ? "slide" : undefined}
            aria-label={isCarousel ? `${i + 1} of ${count}` : undefined}
            data-index={i}
            data-reveal={reveal ? "" : undefined}
            style={reveal ? ({ "--reveal-i": i } as CSSProperties) : undefined}
          >
            {child}
          </div>
        ))}
      </div>

      <div className={controlsClassName}>
        <button
          type="button"
          className={navClassName}
          aria-label={`Previous ${itemNoun}`}
          disabled={atStart}
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
          disabled={atEnd}
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
