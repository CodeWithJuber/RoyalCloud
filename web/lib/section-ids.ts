/**
 * Stable in-page anchors for every section: the product sub-nav, the plan
 * finder's "Compare all tiers" link and hero chips all point at these.
 * An explicit `id` authored in content wins; otherwise each type gets a
 * readable default, and repeats on the same page get `-2`, `-3`… so ids stay
 * unique without content authors having to think about it.
 */
export interface SectionLike {
  type: string;
  id?: unknown;
}

export type AnchoredSection<T extends SectionLike> = T & { anchor: string | null };

const DEFAULT_ANCHOR: Record<string, string> = {
  pricing: "pricing",
  features: "features",
  comparison: "compare",
  faq: "faq",
  testimonials: "reviews",
  osstrip: "deploy",
  planfinder: "planfinder",
  stats: "stats",
  benchmark: "benchmark",
  race: "benchmark",
  steps: "how-it-works",
  security: "security",
  mapband: "locations",
  showcase: "showcase",
  domainsearch: "domains",
  storycards: "stories",
  techlogos: "stack",
};

export function withSectionIds<T extends SectionLike>(sections: T[]): AnchoredSection<T>[] {
  const used = new Map<string, number>();
  return sections.map((section) => {
    const explicit =
      typeof section.id === "string" && section.id.length > 0 ? section.id : undefined;
    const base = explicit ?? DEFAULT_ANCHOR[section.type];
    if (!base) return { ...section, anchor: null };
    const count = (used.get(base) ?? 0) + 1;
    used.set(base, count);
    return { ...section, anchor: count === 1 ? base : `${base}-${count}` };
  });
}
