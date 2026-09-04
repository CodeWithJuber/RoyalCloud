"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { Badge } from "@astryxdesign/core/Badge";
import { Collapsible } from "@astryxdesign/core/Collapsible";
import { SegmentedControl, SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";
import { Icon } from "../Icon";
import { Price } from "../Price";
import { siteSettings } from "@/lib/settings";
import {
  hasAnnualSaving,
  maxSavePct,
  priceFor,
  savePct,
  setBilling,
  termLabel,
  useBilling,
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

interface PlanCardsProps {
  id?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  tiers: PlanTier[];
  note?: string;
  showToggle?: boolean;
  badge?: string;
}

const VISIBLE_FEATURES = 6;

export function PlanCards({
  id = "pricing",
  eyebrow,
  title,
  subtitle,
  tiers,
  note,
  showToggle = true,
  badge = "Most Popular",
}: PlanCardsProps) {
  /* The shared billing store keeps these cards and the comparison table in
     lockstep; decks with no real annual saving stay on monthly pricing. */
  const canToggle = showToggle && hasAnnualSaving(tiers);
  const stored = useBilling();
  const billing = canToggle ? stored : "monthly";
  const onAnnual = billing === "annual";

  return (
    <section className="section plan-section" id={id} aria-labelledby={`${id}-title`}>
      <div className="site-shell">
        <header className="section-header center" data-reveal>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 id={`${id}-title`}>{title}</h2>
          {subtitle && <p className="lede">{subtitle}</p>}
        </header>

        <Link className="planfinder-banner" href="/#planfinder" data-reveal>
          <Icon name="search" size={15} />
          Not sure which plan fits? Answer 3 quick questions
          <span aria-hidden="true">→</span>
        </Link>

        {canToggle && (
          <div className="plan-toggle-row">
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
          </div>
        )}

        <div className="plan-grid" data-cols={tiers.length >= 5 ? 3 : Math.min(tiers.length, 5)}>
          {tiers.map((tier, i) => {
            const save = savePct(tier);
            const visible = tier.features.slice(0, VISIBLE_FEATURES);
            const hidden = tier.features.slice(VISIBLE_FEATURES);
            return (
              <article
                key={tier.name}
                className={`plan-card ${tier.popular ? "plan-popular" : ""}`}
                data-reveal
                style={{ "--reveal-i": i } as CSSProperties}
              >
                {tier.popular && (
                  <span className="plan-badge">
                    <Badge variant="purple" label={badge} />
                  </span>
                )}
                <h3>{tier.name}</h3>
                {tier.summary && <p className="plan-summary">{tier.summary}</p>}

                <div className="plan-pricing">
                  <div className="plan-price-row">
                    <span className="plan-price">
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

                <ul className="plan-features">
                  {visible.map((feature) => (
                    <li key={feature}>
                      <Icon name="check" size={14} color="success" className="plan-check" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {hidden.length > 0 && (
                  <Collapsible
                    trigger={
                      <span className="plan-more">
                        Show all features
                      </span>
                    }
                    defaultIsOpen={false}
                  >
                    <ul className="plan-features plan-features-rest">
                      {hidden.map((feature) => (
                        <li key={feature}>
                          <Icon name="check" size={14} color="success" className="plan-check" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </Collapsible>
                )}
              </article>
            );
          })}
        </div>

        <div className="plan-enterprise" data-reveal>
          <div>
            <h3>Running high-traffic or agency workloads?</h3>
            <p>Fully managed and custom configurations · free migration · an engineer on the ticket, not a queue.</p>
          </div>
          <a className="btn btn-primary" href={`${siteSettings.whmcsUrl}/submitticket.php`} target="_blank" rel="noopener noreferrer">
            Talk to sales
            <span className="btn-arrow" aria-hidden="true">↗</span>
          </a>
        </div>

        {note && <p className="plan-note">{note}</p>}
      </div>
    </section>
  );
}
