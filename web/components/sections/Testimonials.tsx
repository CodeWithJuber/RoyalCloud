import testimonialsData from "@/data/testimonials.json";

interface Testimonial {
  name: string;
  site?: string;
  rating?: number;
  quote: string;
}

interface TestimonialsProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  limit?: number;
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

export function Testimonials({
  id,
  eyebrow,
  title = "What our customers say",
  subtitle,
  limit,
}: TestimonialsProps) {
  const all: Testimonial[] = testimonialsData.items;
  const list = typeof limit === "number" && limit > 0 ? all.slice(0, limit) : all;

  return (
    <section className="section testimonials" id={id}>
      <div className="site-shell">
        <header className="section-header center" data-reveal>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2>{title}</h2>
          {subtitle && <p className="lede">{subtitle}</p>}
        </header>
        <div className="grid grid-3">
          {list.map((t) => (
            <figure key={t.name} className="card testi-card" data-reveal>
              <div
                className="testi-stars"
                role="img"
                aria-label={`Rated ${t.rating ?? 5} out of 5`}
              >
                {Array.from({ length: t.rating ?? 5 }, (_, i) => (
                  <Star key={i} />
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
        </div>
      </div>
    </section>
  );
}
