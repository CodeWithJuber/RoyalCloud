"use client";

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@astryxdesign/core/Badge";
import { SegmentedControl, SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";
import { Icon } from "../Icon";
import { Price } from "../Price";
import { Rail } from "../Rail";
import { siteSettings } from "@/lib/settings";
import { PLAN_TO_INTENT, finderHref } from "@/lib/intents";
import { groupFeatures, pickSpecs, restFeatures } from "@/lib/plan-specs";
import { planCardId, useRecommended } from "@/lib/recommend-store";
import {
  hasAnnualSaving,
  maxSavePct,
  priceFor,
  savePct,
  setBilling,
  termLabel,
  useBilling,
  type Billing,
} from "@/lib/billing-store";

export interface PlanTier {
  name: string;
  price: string;
  priceAnnual?: string;
  period?: string;
  popular?: boolean;
  summary?: string;
  cta?: string;
  ctaUrl: string;
  features: string[];
}

/** "Every plan includes" item: label + a server-rendered mark (brand glyph or icon). */
export interface IncludeItem {
  label: string;
  mark: ReactNode;
}

export interface PlanHighlight {
  icon: string;
  title: string;
  text: string;
}

interface PlanCardsProps {
  id?: string;
  /** Deck id — the finder banner pre-answers this product. */
  planId?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  tiers: PlanTier[];
  /** Prose note under the cards (used when the deck note is not a list). */
  note?: string;
  /** Parsed deck note, one chip per item. */
  includes?: IncludeItem[];
  /** Deck highlights — real copy shown under "All features". */
  highlights?: PlanHighlight[];
  showToggle?: boolean;
  badge?: string;
}

/* Rest-of-list features shown before the "All features" disclosure. */
const VISIBLE_REST = 3;

/**
 * Plan cards, product-aware: the headline specs are read from each tier's
 * own features (compute-first for servers, sites-first for shared), the
 * remaining features list under them, and "All features" — a native
 * <details>, so it works without JS — reveals the rest grouped like the
 * comparison table plus the deck's real highlights.
 */
export function PlanCards({
  id = "pricing",
  planId = "shared",
  eyebrow,
  title,
  subtitle,
  tiers,
  note,
  includes,
  highlights = [],
  showToggle = true,
  badge = "Most Popular",
}: PlanCardsProps) {
  /* The shared billing store keeps these cards and the comparison table in
     lockstep; decks with no real annual saving stay on monthly pricing. */
  const canToggle = showToggle && hasAnnualSaving(tiers);
  const stored = useBilling();
  const billing: Billing = canToggle ? stored : "monthly";
  const recommended = useRecommended();
  const intent = PLAN_TO_INTENT[planId];

  return (
    <section className="section plan-section" id={id} aria-labelledby={`${id}-title`}>
      <div className="site-shell">
        <header className="section-header center" data-reveal>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 id={`${id}-title`}>{title}</h2>
          {subtitle && <p className="lede">{subtitle}</p>}
        </header>

        <div className="plan-controls" data-reveal>
          {canToggle && (
            <SegmentedControl
              value={billing}
              onChange={(value) => setBilling(value === "annual" ? "annual" : "monthly")}
              label="Billing period"
              layout="hug"
            >
              <SegmentedControlItem value="monthly" label="Monthly" />
              <SegmentedControlItem
                value="annual"
                label={`Annual — save up to ${maxSavePct(tiers)}%`}
              />
            </SegmentedControl>
          )}
          <Link className="planfinder-banner" href={finderHref(intent)} data-finder={intent ?? ""}>
            <Icon name="search" size={15} />
            Not sure which plan fits? Answer 4 quick questions
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* One DOM, three layouts. CSS makes this a stacked column on phones,
            a two-up snap rail on tablets (where a 5-tier deck used to squeeze
            into 225px columns) and an auto-fit grid from 1024px. Rail turns
            its controls and carousel semantics off in the two grid states
            because it measures whether it actually overflows. */}
        <Rail
          className="plan-carousel"
          railClassName="plan-rail"
          slideClassName="plan-slide"
          controlsClassName="plan-rail-controls"
          navClassName="plan-rail-nav"
          dotsClassName="plan-rail-dots"
          label={title}
          itemNoun="plan"
          keys={tiers.map((tier) => tier.name)}
          reveal={false}
        >
          {tiers.map((tier, i) => (
            <PlanCard
              key={tier.name}
              tier={tier}
              index={i}
              planId={planId}
              billing={billing}
              badge={badge}
              highlights={highlights}
              recommended={recommended?.deck === planId && recommended.tier === tier.name}
            />
          ))}
        </Rail>

        {includes && includes.length > 0 ? (
          <div className="plan-includes" data-reveal>
            <p className="plan-includes-label">Every plan includes</p>
            <ul>
              {includes.map((item) => (
                <li key={item.label}>
                  <span className="plan-include-mark" aria-hidden="true">
                    {item.mark}
                  </span>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          note && <p className="plan-note">{note}</p>
        )}

        <div className="plan-enterprise" data-reveal>
          <div>
            <h3>Running high-traffic or agency workloads?</h3>
            <p>Fully managed and custom configurations · free migration · an engineer on the ticket, not a queue.</p>
          </div>
          <a
            className="btn btn-primary"
            href={`${siteSettings.whmcsUrl}/submitticket.php`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Talk to sales
            <span className="btn-arrow" aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}

function FeatureList({ features }: { features: string[] }) {
  return (
    <ul className="plan-features">
      {features.map((feature) => (
        <li key={feature}>
          <Icon name="check" size={16} color="success" className="plan-check" />
          {feature}
        </li>
      ))}
    </ul>
  );
}

function PlanCard({
  tier,
  index,
  planId,
  billing,
  badge,
  highlights,
  recommended,
}: {
  tier: PlanTier;
  index: number;
  planId: string;
  billing: Billing;
  badge: string;
  highlights: PlanHighlight[];
  recommended: boolean;
}) {
  const save = savePct(tier);
  const onAnnual = billing === "annual";
  const specs = pickSpecs(tier.features);
  const rest = restFeatures(tier.features, specs);
  const visible = rest.slice(0, VISIBLE_REST);
  const hiddenGroups = groupFeatures(rest.slice(VISIBLE_REST));
  const hasMore = hiddenGroups.length > 0 || highlights.length > 0;

  return (
    <article
      id={planCardId(planId, tier.name)}
      className={`plan-card${tier.popular ? " plan-popular" : ""}`}
      data-tier={tier.name}
      data-recommended={recommended ? "true" : undefined}
      tabIndex={-1}
      data-reveal
      style={{ "--reveal-i": index } as CSSProperties}
    >
      {tier.popular && (
        <span className="plan-badge">
          <Badge variant="purple" label={badge} />
        </span>
      )}
      <div className="plan-head">
        <h3>{tier.name}</h3>
        {tier.summary && <p className="plan-summary">{tier.summary}</p>}
        {recommended && (
          <p className="plan-reco" role="status">
            <Icon name="check" size={16} />
            Recommended for you
          </p>
        )}
      </div>

      <div className="plan-pricing">
        <div className="plan-price-row">
          {/* Keyed on the term so the price re-enters when the toggle flips. */}
          <span className="plan-price" key={billing}>
            <Price value={priceFor(tier, billing)} />
            <span className="plan-period">{tier.period ?? "/mo"}</span>
          </span>
          {save > 0 && onAnnual && (
            <span className="plan-was-inline">
              <Price value={tier.price} strike />
              <Badge variant="green" label={`Save ${save}%`} />
            </span>
          )}
        </div>
        <span className="plan-ledger">{termLabel(billing)}</span>
      </div>

      <a
        className={`btn ${tier.popular ? "btn-primary" : "btn-secondary"} btn-block`}
        href={tier.ctaUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        {tier.cta ?? "Get Started"}
        <span className="btn-arrow" aria-hidden="true">↗</span>
      </a>

      {/* Always rendered, even when it has nothing in it: the card is a
          four-row grid whose rows are shared across the deck (subgrid), so
          head, price and CTA line up across a row however long each tier's
          copy runs. A card that skipped this row would shift its neighbours. */}
      <div className="plan-body">
        {specs.length > 0 && (
          <dl className="plan-specs" data-count={specs.length}>
            {specs.map((spec) => (
              <div key={spec.key} className="plan-spec">
                <dt>
                  <Icon name={spec.icon} size={16} />
                  {spec.label}
                </dt>
                <dd>{spec.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {visible.length > 0 && <FeatureList features={visible} />}

        {hasMore && (
          <details className="plan-more">
            <summary>
              <span className="plan-more-closed">All features</span>
              <span className="plan-more-open">Fewer features</span>
              <Icon name="chevronDown" size={16} className="plan-more-chevron" />
            </summary>
            <div className="plan-more-panel">
              {hiddenGroups.map((group) => (
                <div key={group.group} className="plan-feature-group">
                  <h4>{group.group}</h4>
                  <FeatureList features={group.features} />
                </div>
              ))}
              {highlights.length > 0 && (
                <div className="plan-feature-group">
                  <h4>Also included</h4>
                  <ul className="plan-highlights">
                    {highlights.map((item) => (
                      <li key={item.title}>
                        <span className="plan-highlight-icon">
                          <Icon name={item.icon} size={16} />
                        </span>
                        <span>
                          <b>{item.title}</b>
                          <small>{item.text}</small>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    </article>
  );
}
