import testimonialsData from "@/data/testimonials.json";
import { RatingBadge } from "../RatingBadge";
import { TestimonialCarousel, type Testimonial } from "./TestimonialCarousel";

interface TestimonialsProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  /** "inline" renders the page's own items; anything else uses data/testimonials.json. */
  source?: "global" | "inline";
  items?: Testimonial[];
  limit?: number;
}

/* Server shell: picks the list (page-inline or global), adds the aggregate
   rating, and hands plain data to the client carousel. */
export function Testimonials({
  id,
  eyebrow,
  title = "What our customers say",
  subtitle,
  source,
  items,
  limit,
}: TestimonialsProps) {
  const all: Testimonial[] =
    source === "inline" && items && items.length > 0 ? items : testimonialsData.items;
  const list = typeof limit === "number" && limit > 0 ? all.slice(0, limit) : all;
  if (list.length === 0) return null;

  return (
    <section className="section testimonials" id={id}>
      <div className="site-shell">
        <header className="section-header center" data-reveal>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2>{title}</h2>
          {subtitle && <p className="lede">{subtitle}</p>}
          <RatingBadge className="testi-aggregate" />
        </header>
        <TestimonialCarousel items={list} label={title} />
      </div>
    </section>
  );
}
