import { PLAN_FILES } from "@/lib/plans";
import type { AnchoredSection, SectionLike } from "@/lib/section-ids";

/**
 * Product-page sub-navigation (Plans · Features · Compare · FAQ) plus the
 * "From $X/mo" anchor. Only pages that carry both a pricing deck and a
 * comparison table get one; the price is the deck's cheapest real tier.
 */
export interface SubnavLink {
  href: string;
  label: string;
}

export interface SubnavCta {
  price: string;
  period: string;
  href: string;
}

export interface Subnav {
  links: SubnavLink[];
  cta: SubnavCta | null;
}

const LABELS: Record<string, string> = {
  pricing: "Plans",
  features: "Features",
  comparison: "Compare",
  faq: "FAQ",
};

type NavSection = AnchoredSection<SectionLike & { plan?: unknown }>;

export function buildSubnav(sections: NavSection[]): Subnav | null {
  const pricing = sections.find((section) => section.type === "pricing");
  const hasCompare = sections.some((section) => section.type === "comparison");
  if (!pricing || !hasCompare) return null;

  const seen = new Set<string>();
  const links: SubnavLink[] = [];
  for (const section of sections) {
    const label = LABELS[section.type];
    if (!label || seen.has(section.type) || !section.anchor) continue;
    seen.add(section.type);
    links.push({ href: `#${section.anchor}`, label });
  }

  const deckId = typeof pricing.plan === "string" ? pricing.plan : "shared";
  const tiers = PLAN_FILES[deckId]?.tiers ?? [];
  const cheapest = tiers.reduce<(typeof tiers)[number] | null>((best, tier) => {
    const price = parseFloat(tier.price);
    if (!Number.isFinite(price)) return best;
    return best === null || price < parseFloat(best.price) ? tier : best;
  }, null);
  const cta =
    cheapest && pricing.anchor
      ? { price: cheapest.price, period: cheapest.period ?? "/mo", href: `#${pricing.anchor}` }
      : null;

  return { links, cta };
}
