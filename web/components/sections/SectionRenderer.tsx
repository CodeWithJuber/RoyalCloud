import { Fragment } from "react";
import type { ReactNode } from "react";

import { Hero, type CtaLink } from "./Hero";
import { DomainSearch } from "./DomainSearch";
import { PlanFinder } from "./PlanFinder";
import { PlanCards } from "./PlanCards";
import { TrustBar, type TrustItem } from "./TrustBar";
import { FeatureGrid, type FeatureItem } from "./FeatureGrid";
import { ProductGrid, type ProductItem } from "./ProductGrid";
import { ContentSplit, type ChecklistItem } from "./ContentSplit";
import { StepProcess, type StepItem } from "./StepProcess";
import { StatsBand, type StatItem } from "./StatsBand";
import { ComparisonTable } from "./ComparisonTable";
import { Testimonials } from "./Testimonials";
import { FaqAccordion } from "./FaqAccordion";
import { TechLogos } from "./TechLogos";
import { CtaBand } from "./CtaBand";
import { OsStrip, type OsItem } from "./OsStrip";
import { StoryCards, type StoryItem } from "./StoryCards";
import { BenchmarkBars, type BenchItem } from "./BenchmarkBars";
import { SecurityLayers, type SecurityLayer, type SecurityStat } from "./SecurityLayers";
import { MapBand, type MapPin } from "./MapBand";
import { ShowcaseTabs, type ShowcaseTab } from "./ShowcaseTabs";
import { artFor } from "../art/artFor";

import { PLAN_FILES } from "@/lib/plans";

export interface Section {
  type: string;
  [key: string]: unknown;
}

interface SectionRendererProps {
  sections: Section[];
}

/* --------------------------------------------------------------------------
 * Content arrives from local page data as unknown JSON-ish values. These
 * small guards turn it into typed props per section — no blanket `as any`.
 * ------------------------------------------------------------------------ */
const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;
const isString = (v: unknown): v is string => typeof v === "string";
const str = (v: unknown): string | undefined =>
  typeof v === "string" && v.length > 0 ? v : undefined;
const bool = (v: unknown): boolean | undefined =>
  typeof v === "boolean" ? v : undefined;

function list<T>(v: unknown, guard: (x: unknown) => x is T): T[] {
  return Array.isArray(v) ? v.filter(guard) : [];
}

const isCta = (v: unknown): v is CtaLink =>
  isRecord(v) && isString(v.text) && isString(v.href);
const isTrustItem = (v: unknown): v is TrustItem =>
  isRecord(v) && isString(v.text);
const isFeatureItem = (v: unknown): v is FeatureItem =>
  isRecord(v) && isString(v.title) && isString(v.text);
const isProductItem = (v: unknown): v is ProductItem =>
  isRecord(v) && isString(v.title) && isString(v.text) && isString(v.href);
const isChecklistItem = (v: unknown): v is ChecklistItem =>
  isRecord(v) && isString(v.title) && isString(v.text);
const isStepItem = (v: unknown): v is StepItem =>
  isRecord(v) && isString(v.title) && isString(v.text);
const isStatItem = (v: unknown): v is StatItem =>
  isRecord(v) && isString(v.value) && isString(v.label);
const isOsItem = (v: unknown): v is OsItem => isRecord(v) && isString(v.name);
const isStoryItem = (v: unknown): v is StoryItem =>
  isRecord(v) &&
  isString(v.tag) &&
  isString(v.metric) &&
  isString(v.metricLabel) &&
  isString(v.quote) &&
  isString(v.name);
const isBenchItem = (v: unknown): v is BenchItem =>
  isRecord(v) &&
  isString(v.label) &&
  typeof v.value === "number" &&
  isString(v.display);
const isSecurityLayer = (v: unknown): v is SecurityLayer =>
  isRecord(v) && isString(v.title) && isString(v.text);
const isSecurityStat = (v: unknown): v is SecurityStat =>
  isRecord(v) && isString(v.value) && isString(v.label);
const isMapPin = (v: unknown): v is MapPin =>
  isRecord(v) &&
  isString(v.label) &&
  typeof v.x === "number" &&
  typeof v.y === "number";
const isShowcaseTab = (v: unknown): v is ShowcaseTab =>
  isRecord(v) && isString(v.label);

const columns = (v: unknown): 2 | 3 | 4 | undefined =>
  v === 2 || v === 3 || v === 4 ? v : undefined;

function renderSection(section: Section): ReactNode {
  const s = section;
  switch (s.type) {
    case "hero": {
      const title = str(s.title);
      if (!title) return null;
      const variant = str(s.variant);
      const badges = list(s.badges, isString);
      return (
        <Hero
          variant={variant === "gradient" ? "home" : variant === "simple" ? "simple" : "product"}
          eyebrow={str(s.eyebrow)}
          title={title}
          subtitle={str(s.subtitle)}
          offer={str(s.offer)}
          primaryCta={isCta(s.primaryCta) ? s.primaryCta : undefined}
          secondaryCta={isCta(s.secondaryCta) ? s.secondaryCta : undefined}
          badges={badges.length > 0 ? badges : undefined}
          art={artFor(str(s.art) ?? str(s.image))}
        />
      );
    }

    case "trustbar": {
      const items = list(s.items, isTrustItem);
      return items.length > 0 ? <TrustBar items={items} /> : null;
    }

    case "pricing": {
      const planFile = PLAN_FILES[str(s.plan) ?? "shared"];
      if (!planFile) return null;
      const featured = list(s.featured, isString);
      const tiers =
        featured.length > 0
          ? planFile.tiers.filter((tier) => featured.includes(tier.name))
          : planFile.tiers;
      if (tiers.length === 0) return null;
      return (
        <PlanCards
          id={str(s.id)}
          eyebrow={str(s.eyebrow) ?? planFile.eyebrow}
          title={str(s.title) ?? planFile.title}
          subtitle={str(s.subtitle) ?? planFile.subtitle}
          tiers={tiers}
          note={str(s.note) ?? planFile.billingNote}
          showToggle={bool(s.showToggle)}
        />
      );
    }

    case "features": {
      const items = list(s.items, isFeatureItem);
      return items.length > 0 ? (
        <FeatureGrid
          eyebrow={str(s.eyebrow)}
          title={str(s.title)}
          subtitle={str(s.subtitle)}
          columns={columns(s.columns)}
          items={items}
        />
      ) : null;
    }

    case "products": {
      const items = list(s.items, isProductItem);
      return items.length > 0 ? (
        <ProductGrid
          eyebrow={str(s.eyebrow)}
          title={str(s.title)}
          subtitle={str(s.subtitle)}
          items={items}
        />
      ) : null;
    }

    case "content": {
      const items = list(s.items, isChecklistItem);
      return (
        <ContentSplit
          eyebrow={str(s.eyebrow)}
          title={str(s.title)}
          subtitle={str(s.subtitle)}
          body={str(s.body)}
          image={str(s.image)}
          reverse={bool(s.reverse)}
          items={items.length > 0 ? items : undefined}
        />
      );
    }

    case "steps": {
      const items = list(s.items, isStepItem);
      return items.length > 0 ? (
        <StepProcess
          eyebrow={str(s.eyebrow)}
          title={str(s.title)}
          subtitle={str(s.subtitle)}
          items={items}
        />
      ) : null;
    }

    case "stats": {
      const items = list(s.items, isStatItem);
      return items.length > 0 ? <StatsBand items={items} /> : null;
    }

    case "comparison":
      return (
        <ComparisonTable
          eyebrow={str(s.eyebrow)}
          title={str(s.title)}
          subtitle={str(s.subtitle)}
          plan={str(s.plan)}
          note={str(s.note)}
        />
      );

    case "testimonials":
      return (
        <Testimonials
          eyebrow={str(s.eyebrow)}
          title={str(s.title)}
          subtitle={str(s.subtitle)}
          limit={typeof s.limit === "number" ? s.limit : undefined}
        />
      );

    case "faq":
      return (
        <FaqAccordion
          eyebrow={str(s.eyebrow)}
          title={str(s.title)}
          subtitle={str(s.subtitle)}
        />
      );

    case "planfinder":
      return (
        <section className="section section-tint planfinder-section" aria-labelledby="planfinder-title">
          <div className="site-shell planfinder-shell">
            <header className="section-header center" data-reveal>
              <p className="eyebrow">{str(s.eyebrow) ?? "Help me choose"}</p>
              <h2 id="planfinder-title">{str(s.title) ?? "Not sure which plan fits?"}</h2>
              <p className="lede">{str(s.subtitle) ?? "Answer three quick questions and we'll point you at the right plan — a real one, with its real price."}</p>
            </header>
            <PlanFinder />
          </div>
        </section>
      );

    case "domainsearch":
      return (
        <DomainSearch
          eyebrow={str(s.eyebrow)}
          title={str(s.title)}
          subtitle={str(s.subtitle)}
        />
      );

    case "techlogos":
      return (
        <TechLogos
          eyebrow={str(s.eyebrow)}
          title={str(s.title)}
          subtitle={str(s.subtitle)}
        />
      );

    case "cta": {
      const title = str(s.title);
      if (!title) return null;
      return (
        <CtaBand
          title={title}
          subtitle={str(s.subtitle)}
          primaryCta={isCta(s.primaryCta) ? s.primaryCta : undefined}
          secondaryCta={isCta(s.secondaryCta) ? s.secondaryCta : undefined}
        />
      );
    }

    case "osstrip": {
      const items = list(s.items, isOsItem);
      return items.length > 0 ? (
        <OsStrip
          eyebrow={str(s.eyebrow)}
          title={str(s.title)}
          subtitle={str(s.subtitle)}
          items={items}
        />
      ) : null;
    }

    case "storycards": {
      const items = list(s.items, isStoryItem);
      return items.length > 0 ? (
        <StoryCards
          eyebrow={str(s.eyebrow)}
          title={str(s.title)}
          subtitle={str(s.subtitle)}
          items={items}
        />
      ) : null;
    }

    case "benchmark":
    case "race": {
      const items = list(s.items, isBenchItem);
      return items.length > 0 ? (
        <BenchmarkBars
          eyebrow={str(s.eyebrow)}
          title={str(s.title)}
          subtitle={str(s.subtitle)}
          note={str(s.note)}
          items={items}
        />
      ) : null;
    }

    case "security": {
      const layers = list(s.layers, isSecurityLayer);
      if (layers.length === 0) return null;
      const stats = list(s.stats, isSecurityStat);
      return (
        <SecurityLayers
          eyebrow={str(s.eyebrow)}
          title={str(s.title)}
          subtitle={str(s.subtitle)}
          layers={layers}
          stats={stats.length > 0 ? stats : undefined}
        />
      );
    }

    case "mapband": {
      const pins = list(s.pins, isMapPin);
      return (
        <MapBand
          eyebrow={str(s.eyebrow)}
          title={str(s.title)}
          subtitle={str(s.subtitle)}
          note={str(s.note)}
          pins={pins.length > 0 ? pins : undefined}
        />
      );
    }

    case "showcase": {
      const tabs = list(s.tabs, isShowcaseTab);
      return (
        <ShowcaseTabs
          eyebrow={str(s.eyebrow)}
          title={str(s.title)}
          subtitle={str(s.subtitle)}
          tabs={tabs.length > 0 ? tabs : undefined}
        />
      );
    }

    default:
      return null;
  }
}

export function SectionRenderer({ sections }: SectionRendererProps) {
  return (
    <>
      {sections.map((section, i) => (
        <Fragment key={`${section.type}-${i}`}>
          {renderSection(section)}
        </Fragment>
      ))}
    </>
  );
}
