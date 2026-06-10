// Maps our editable plan JSON (src/data/plans/*.json) onto AstroWind's
// Pricing widget `prices` prop and Features `items` prop.

interface Tier {
  name: string;
  price: string;
  priceAnnual?: string;
  period: string;
  popular?: boolean;
  summary?: string;
  cta: string;
  ctaUrl: string;
  features: string[];
}
export interface Plan {
  id: string;
  name: string;
  slug: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  currency: string;
  billingNote?: string;
  tiers: Tier[];
  highlights: { icon: string; title: string; text: string }[];
}

// Our semantic icon names → Tabler icon names (AstroWind uses astro-icon/tabler).
const ICONS: Record<string, string> = {
  server: 'tabler:server', cpu: 'tabler:cpu', database: 'tabler:database-cog',
  cloud: 'tabler:cloud', wordpress: 'tabler:brand-wordpress', users: 'tabler:users',
  bolt: 'tabler:bolt', shield: 'tabler:shield-check', apps: 'tabler:apps',
  headset: 'tabler:headset', terminal: 'tabler:terminal-2', settings: 'tabler:settings',
  refresh: 'tabler:refresh', backup: 'tabler:database-export', scale: 'tabler:arrows-maximize',
  billing: 'tabler:receipt', rocket: 'tabler:rocket', failover: 'tabler:git-fork',
  uptime: 'tabler:activity-heartbeat', gauge: 'tabler:gauge', report: 'tabler:file-text',
  audit: 'tabler:shield-search', logs: 'tabler:list-details', firewall: 'tabler:wall',
  globe: 'tabler:world', lock: 'tabler:lock',
};

export const tablerIcon = (name: string): string => ICONS[name] ?? 'tabler:point';

export function toPrices(plan: Plan, billed: 'monthly' | 'annual' = 'monthly') {
  return plan.tiers.map((t) => ({
    title: t.name,
    subtitle: t.summary,
    price: billed === 'annual' && t.priceAnnual ? t.priceAnnual : t.price,
    period: 'per month',
    items: t.features.map((f) => ({ description: f })),
    callToAction: { text: t.cta, href: t.ctaUrl, target: '_blank' },
    hasRibbon: !!t.popular,
    ribbonTitle: 'Popular',
  }));
}

export function toFeatureItems(plan: Plan) {
  return plan.highlights.map((h) => ({
    title: h.title,
    description: h.text,
    icon: tablerIcon(h.icon),
  }));
}
