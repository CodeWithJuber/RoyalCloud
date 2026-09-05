"use client";

import { Rail } from "../Rail";

/**
 * Customer-stories carousel: the shared scroll-snap Rail (1 / 2 / 3 slides
 * per view) with previous/next buttons, dots and a live "n of N". No
 * autoplay. The rail behaviour lives in components/Rail.tsx; this file only
 * renders a story card per slide.
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

export function TestimonialCarousel({
  items,
  label = "Customer stories",
}: {
  items: Testimonial[];
  label?: string;
}) {
  return (
    <Rail
      label={label}
      itemNoun="story"
      className="testi-carousel"
      railClassName="testi-rail"
      slideClassName="testi-slide"
      controlsClassName="testi-controls"
      navClassName="testi-nav"
      dotsClassName="testi-dots"
      keys={items.map((t, i) => `${t.name}-${i}`)}
    >
      {items.map((t) => (
        <figure className="card testi-card" key={t.name + t.quote.slice(0, 12)}>
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
      ))}
    </Rail>
  );
}
