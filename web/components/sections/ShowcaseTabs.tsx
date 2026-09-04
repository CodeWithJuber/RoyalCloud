"use client";

import { useState } from "react";
import { TabList, Tab } from "@astryxdesign/core/TabList";
import { Badge } from "@astryxdesign/core/Badge";
import { Icon } from "../Icon";
import { Price } from "../Price";
import { ProductArt, type ProductKind } from "../art/ProductArt";
import { PLAN_FILES, type PlanFile } from "@/lib/plans";
import { sectionName, sectionTitleId } from "@/lib/section-name";

export interface ShowcaseTab {
  label: string;
  panel?: "files" | "ssl" | "backups" | "stats";
  text?: string;
  /** When set, this tab renders the rich product panel for that plan deck. */
  plan?: string;
}

interface ShowcaseTabsProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tabs?: ShowcaseTab[];
}

const PLAN_ART: Record<string, ProductKind> = {
  shared: "shared",
  cpanel: "shared",
  wordpress: "wordpress",
  vps: "vps",
  cyberpanel: "cyberpanel",
  cloud: "cloud",
  dedicated: "dedicated",
  reseller: "reseller",
};

function ProductPanel({ plan }: { plan: PlanFile }) {
  const popular = plan.tiers.find((t) => t.popular) ?? plan.tiers[0];
  const starting = plan.tiers[0];
  return (
    <div className="showcase-product">
      <div className="showcase-product-art">
        <ProductArt kind={PLAN_ART[plan.id] ?? "generic"} />
      </div>
      <div className="showcase-product-copy">
        <Badge variant="purple" label={plan.eyebrow ?? plan.name} />
        <h3>{plan.title}</h3>
        {plan.subtitle && <p className="showcase-product-sub">{plan.subtitle}</p>}
        <p className="showcase-product-price">
          Starting at{" "}
          <strong>
            <Price value={starting.price} />
            <span className="showcase-per">{starting.period ?? "/mo"}</span>
          </strong>
        </p>
        <ul className="showcase-product-features">
          {popular.features.slice(0, 4).map((feature) => (
            <li key={feature}>
              <Icon name="check" size={16} color="success" />
              {feature}
            </li>
          ))}
        </ul>
        <div className="showcase-product-actions">
          <a className="btn btn-primary" href={popular.ctaUrl} target="_blank" rel="noopener noreferrer">
            {popular.cta ?? "Get started"}
            <span className="btn-arrow" aria-hidden="true">↗</span>
          </a>
          <a className="btn btn-secondary" href={`/${plan.slug}`}>
            Compare plans
            <span className="btn-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export function ShowcaseTabs({
  id,
  eyebrow,
  title,
  subtitle,
  tabs = [],
}: ShowcaseTabsProps) {
  const [active, setActive] = useState(tabs[0]?.label ?? "");
  const baseId = "showcase";

  return (
    <section className="section section-dark showcase" id={id} {...sectionName(id, title)}>
      <div className="site-shell">
        {(eyebrow || title || subtitle) && (
          <header className="section-header center" data-reveal>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h2 id={sectionTitleId(id)}>{title}</h2>}
            {subtitle && <p className="lede">{subtitle}</p>}
          </header>
        )}

        <div className="showcase-stage" data-reveal>
          <TabList
            value={active}
            onChange={setActive}
            role="tablist"
            layout="hug"
            size="lg"
            aria-label={title ?? "Product showcase"}
          >
            {tabs.map((tab, i) => (
              <Tab
                key={tab.label}
                id={`${baseId}-tab-${i}`}
                value={tab.label}
                label={tab.label}
                panelId={`${baseId}-panel-${i}`}
              />
            ))}
          </TabList>

          {tabs.map((tab, i) => {
            const plan = tab.plan ? PLAN_FILES[tab.plan] : undefined;
            return (
              <div
                key={tab.label}
                role="tabpanel"
                id={`${baseId}-panel-${i}`}
                aria-labelledby={`${baseId}-tab-${i}`}
                className="showcase-panel-wrap"
                tabIndex={0}
                hidden={tab.label !== active}
              >
                {plan ? (
                  <ProductPanel plan={plan} />
                ) : (
                  <div className="showcase-window">
                    <div className="showcase-chrome" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                      <span>my.royalclouds.net/panel</span>
                    </div>
                    <div className="showcase-panel">
                      <h3>{tab.label}</h3>
                      {tab.text && <p>{tab.text}</p>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
