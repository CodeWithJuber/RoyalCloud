"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { Icon } from "../Icon";

/**
 * Customer-stories carousel: a CSS scroll-snap rail (1 / 2 / 3 slides per
 * view) with previous/next buttons, dots and a live "n of N" for assistive
 * tech. No autoplay. Controls only appear when the rail actually overflows,
 * and programmatic scrolling honours prefers-reduced-motion.
 */
export interface Testimonial {
  name: string;
  site?: string;
  rating?: number;
  quote: string;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

function Star() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" focusable="false">
      <path
        d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.35l-5.8 3.05 1.1-6.47-4.7-4.58 6.5-.95L12 2.5z"
        fill="currentColor"
      />
    </svg>
  );
}

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function TestimonialCarousel({
  items,
  label = "Customer stories",
}: {
  items: Testimonial[];
  label?: string;
}) {
  const railRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [overflowing, setOverflowing] = useState(false);
  const [edges, setEdges] = useState({ start: true, end: false });

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
  }, [items.length]);

  function go(index: number) {
    const rail = railRef.current;
    if (!rail) return;
    const target = Math.max(0, Math.min(items.length - 1, index));
    const slide = rail.querySelector<HTMLElement>(`[data-index="${target}"]`);
    if (!slide) return;
    rail.scrollTo({ left: slide.offsetLeft - rail.offsetLeft, behavior: reducedMotion() ? "auto" : "smooth" });
  }

  return (
    <div
      className="testi-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      data-controls={overflowing ? "true" : "false"}
    >
      <ul className="testi-rail" ref={railRef} tabIndex={0} aria-label={`${label} — scroll sideways`}>
        {items.map((t, i) => (
          <li
            key={`${t.name}-${i}`}
            className="testi-slide"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${items.length}`}
            data-index={i}
            data-reveal
            style={{ "--reveal-i": i } as CSSProperties}
          >
            <figure className="card testi-card">
              <div className="testi-stars" role="img" aria-label={`Rated ${t.rating ?? 5} out of 5`}>
                {Array.from({ length: t.rating ?? 5 }, (_, s) => (
                  <Star key={s} />
                ))}
              </div>
              <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="testi-footer">
                <span className="avatar-chip" aria-hidden="true">
                  {initials(t.name)}
                </span>
                <span>
                  <strong>{t.name}</strong>
                  {t.site && <small>{t.site}</small>}
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <div className="testi-controls">
        <button
          type="button"
          className="testi-nav"
          aria-label="Previous story"
          disabled={edges.start}
          onClick={() => go(active - 1)}
        >
          <Icon name="chevronLeft" size={16} />
        </button>
        <ol className="testi-dots" aria-label="Choose a story">
          {items.map((t, i) => (
            <li key={`${t.name}-dot-${i}`}>
              <button
                type="button"
                aria-label={`Go to story ${i + 1}`}
                aria-current={i === active ? "true" : undefined}
                onClick={() => go(i)}
              />
            </li>
          ))}
        </ol>
        <button
          type="button"
          className="testi-nav"
          aria-label="Next story"
          disabled={edges.end}
          onClick={() => go(active + 1)}
        >
          <Icon name="chevronRight" size={16} />
        </button>
        <span className="visually-hidden" aria-live="polite">
          Story {active + 1} of {items.length}
        </span>
      </div>
    </div>
  );
}
