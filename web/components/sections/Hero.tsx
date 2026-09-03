import type { ReactNode } from "react";
import { HeroArt } from "../art/HeroArt";
import { Icon } from "../Icon";

export interface CtaLink {
  text: string;
  href: string;
  external?: boolean;
}

interface HeroProps {
  variant?: "home" | "product" | "simple";
  eyebrow?: string;
  title: string; // may contain <em> accents — trusted local content
  subtitle?: string;
  offer?: string;
  primaryCta?: CtaLink;
  secondaryCta?: CtaLink;
  badges?: string[];
  art?: ReactNode;
}

const targetProps = (cta?: CtaLink) =>
  cta?.external || /^https?:\/\//.test(cta?.href ?? "")
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

function HeroActions({
  primaryCta,
  secondaryCta,
}: {
  primaryCta?: CtaLink;
  secondaryCta?: CtaLink;
}) {
  if (!primaryCta && !secondaryCta) return null;
  return (
    <div className="hero-actions">
      {primaryCta && (
        <a className="btn btn-primary" href={primaryCta.href} {...targetProps(primaryCta)}>
          {primaryCta.text}
          <span className="btn-arrow" aria-hidden="true">↗</span>
        </a>
      )}
      {secondaryCta && (
        <a className="btn btn-secondary" href={secondaryCta.href} {...targetProps(secondaryCta)}>
          {secondaryCta.text}
          <span className="btn-arrow" aria-hidden="true">→</span>
        </a>
      )}
    </div>
  );
}

function HeroBadges({ badges }: { badges?: string[] }) {
  if (!badges || badges.length === 0) return null;
  return (
    <ul className="hero-badges">
      {badges.map((badge) => (
        <li key={badge}>
          <Icon name="check" size={14} color="inherit" className="hero-badge-icon" />
          {badge}
        </li>
      ))}
    </ul>
  );
}

/* Home hero: Bluehost composition — 2-col (copy + scene), domain search card
   embedded in the copy column, trust tile row under. */
function HomeHero({
  eyebrow,
  title,
  subtitle,
  offer,
  primaryCta,
  secondaryCta,
  badges,
}: Omit<HeroProps, "variant" | "art">) {
  return (
    <section className="hero hero-home" aria-labelledby="hero-title">
      <div className="site-shell hero-home-grid" data-reveal>
        <div className="hero-copy">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 id="hero-title" dangerouslySetInnerHTML={{ __html: title }} />
          {subtitle && <p className="hero-lede">{subtitle}</p>}

          <div className="hero-rating">
            <span className="hero-stars" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <svg key={i} viewBox="0 0 20 20" width="15" height="15" focusable="false">
                  <path d="M10 1.7l2.6 5.2 5.7.8-4.1 4 1 5.7L10 14.7l-5.2 2.7 1-5.7-4.1-4 5.7-.8Z" fill="#ffc94b" />
                </svg>
              ))}
            </span>
            <span>
              Rated <strong>9.6/10</strong> by our customers
            </span>
          </div>

          <form
            className="hero-search"
            method="get"
            action="https://my.royalclouds.net/cart.php"
            target="_blank"
            rel="noopener noreferrer"
          >
            <input type="hidden" name="a" value="add" />
            <input type="hidden" name="domain" value="register" />
            <label htmlFor="hero-domain" className="sr-only">Domain name</label>
            <Icon name="search" size={18} className="hero-search-icon" />
            <input
              id="hero-domain"
              name="query"
              type="text"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              placeholder="Find your domain name…"
              required
            />
            <button className="btn btn-primary" type="submit">
              Search
              <span className="btn-arrow" aria-hidden="true">↗</span>
            </button>
          </form>

          <HeroActions primaryCta={primaryCta} secondaryCta={secondaryCta} />
          {offer && <p className="hero-offer">{offer}</p>}
          <HeroBadges badges={badges} />
        </div>

        <div className="hero-art">
          <HeroArt />
        </div>
      </div>
    </section>
  );
}

export function Hero({
  variant = "product",
  eyebrow,
  title,
  subtitle,
  offer,
  primaryCta,
  secondaryCta,
  badges,
  art,
}: HeroProps) {
  if (variant === "home") {
    return (
      <HomeHero
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        offer={offer}
        primaryCta={primaryCta}
        secondaryCta={secondaryCta}
        badges={badges}
      />
    );
  }

  return (
    <section className={`hero hero-${variant}`} aria-labelledby="hero-title">
      <div className={`site-shell hero-inner${art ? "" : " hero-no-art"}`} data-reveal>
        <div className="hero-copy">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 id="hero-title" dangerouslySetInnerHTML={{ __html: title }} />
          {subtitle && <p className="hero-lede">{subtitle}</p>}
          {offer && <p className="hero-offer">{offer}</p>}
          <HeroActions primaryCta={primaryCta} secondaryCta={secondaryCta} />
          <HeroBadges badges={badges} />
        </div>

        {art && variant === "product" && <div className="hero-art">{art}</div>}
      </div>
    </section>
  );
}
