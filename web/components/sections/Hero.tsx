import type { ReactNode } from "react";
import Link from "next/link";
import { HeroArt } from "../art/HeroArt";
import { Icon } from "../Icon";
import { RatingBadge } from "../RatingBadge";
import { INTENTS, PLAN_TO_INTENT, finderHref } from "@/lib/intents";
import { emphasize } from "@/lib/emphasize";

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
  /** Deck id of the page's product — prefills the plan finder link. */
  plan?: string;
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

/* "Help me choose" — links to the plan finder, pre-answering the page's product. */
function HelpMeChoose({ plan }: { plan?: string }) {
  const intent = plan ? PLAN_TO_INTENT[plan] : undefined;
  return (
    <Link className="hero-help" href={finderHref(intent)} data-finder={intent ?? ""}>
      <Icon name="search" size={16} />
      Help me choose
    </Link>
  );
}

/* "What are you building?" — intent chips; each lands on the finder's second
   step with the build pre-answered, the last one starts from scratch. */
function HeroIntents() {
  return (
    <nav className="hero-intents" aria-label="What are you building?">
      <span className="hero-intents-label" aria-hidden="true">
        What are you building?
      </span>
      <ul>
        {INTENTS.filter((intent) => intent.chip).map((intent) => (
          <li key={intent.id}>
            <Link className="hero-intent" href={finderHref(intent.id)} data-finder={intent.id}>
              <Icon name={intent.icon} size={16} />
              {intent.label}
            </Link>
          </li>
        ))}
        <li>
          <Link className="hero-intent hero-intent-help" href={finderHref()} data-finder="">
            <Icon name="search" size={16} />
            Not sure? Help me choose
          </Link>
        </li>
      </ul>
    </nav>
  );
}

function HeroBadges({ badges }: { badges?: string[] }) {
  if (!badges || badges.length === 0) return null;
  return (
    <ul className="hero-badges">
      {badges.map((badge) => (
        <li key={badge}>
          <Icon name="check" size={16} color="inherit" className="hero-badge-icon" />
          {badge}
        </li>
      ))}
    </ul>
  );
}

/**
 * Home hero: hosting first. Headline, proof, then the hosting CTA pair —
 * no domain field. Domains stay reachable from the header and the /domains
 * route; leading with a search box asked the visitor to name a domain before
 * the page had said what it sells.
 *
 * The offer sits with the CTA it qualifies rather than below the chips, and
 * `art` / `plan` are honoured so the 36 landing pages that share this hero
 * stop discarding their authored scene.
 */
function HomeHero({
  eyebrow,
  title,
  subtitle,
  offer,
  primaryCta,
  secondaryCta,
  badges,
  art,
  plan,
}: Omit<HeroProps, "variant">) {
  return (
    <section className="hero hero-home" aria-labelledby="hero-title">
      <div className="site-shell hero-home-grid" data-reveal>
        <div className="hero-copy">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 id="hero-title">{emphasize(title)}</h1>
          {subtitle && <p className="hero-lede">{subtitle}</p>}

          <RatingBadge className="hero-rating" />

          {offer && <p className="hero-offer">{offer}</p>}
          <HeroActions primaryCta={primaryCta} secondaryCta={secondaryCta} />
          {plan ? <HelpMeChoose plan={plan} /> : <HeroIntents />}
          <HeroBadges badges={badges} />
        </div>

        <div className="hero-art">{art ?? <HeroArt />}</div>
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
  plan,
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
        art={art}
        plan={plan}
      />
    );
  }

  return (
    <section className={`hero hero-${variant}`} aria-labelledby="hero-title">
      <div className={`site-shell hero-inner${art ? "" : " hero-no-art"}`} data-reveal>
        <div className="hero-copy">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 id="hero-title">{emphasize(title)}</h1>
          {subtitle && <p className="hero-lede">{subtitle}</p>}
          {offer && <p className="hero-offer">{offer}</p>}
          <HeroActions primaryCta={primaryCta} secondaryCta={secondaryCta} />
          <HelpMeChoose plan={plan} />
          <HeroBadges badges={badges} />
        </div>

        {art && variant === "product" && <div className="hero-art">{art}</div>}
      </div>
    </section>
  );
}
