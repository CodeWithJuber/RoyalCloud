// JSON-LD builders. Values come from src/data/site.json and the plans
// collection so structured data always matches the visible content.
import site from '~/data/site.json';

type Json = Record<string, unknown>;

const SCHEMA = 'https://schema.org';

export function organization(): Json {
  const sameAs = Object.values(site.social).filter(Boolean);
  return {
    '@context': SCHEMA,
    '@type': 'Organization',
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    logo: new URL(site.logo, site.url).href,
    description: site.description,
    email: site.contact.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.contact.addressLocality,
      addressCountry: site.contact.addressCountry,
    },
    sameAs,
  };
}

export function webSite(): Json {
  return {
    '@context': SCHEMA,
    '@type': 'WebSite',
    name: site.name,
    url: site.url,
    description: site.shortDescription,
  };
}

interface TierLike {
  name: string;
  price: string;
  ctaUrl: string;
}
interface PlanLike {
  name: string;
  subtitle?: string;
  tiers: TierLike[];
}

export function product(plan: PlanLike, pageUrl: string): Json {
  const prices = plan.tiers.map((t) => Number.parseFloat(t.price)).filter((n) => !Number.isNaN(n));
  return {
    '@context': SCHEMA,
    '@type': 'Product',
    name: `${site.name} ${plan.name}`,
    description: plan.subtitle,
    brand: { '@type': 'Brand', name: site.name },
    url: pageUrl,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: Math.min(...prices).toFixed(2),
      highPrice: Math.max(...prices).toFixed(2),
      offerCount: plan.tiers.length,
      offers: plan.tiers.map((t) => ({
        '@type': 'Offer',
        name: t.name,
        price: t.price,
        priceCurrency: 'USD',
        url: t.ctaUrl,
        availability: 'https://schema.org/InStock',
      })),
    },
  };
}

export function faqPage(items: { q: string; a: string }[]): Json {
  return {
    '@context': SCHEMA,
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  };
}

export function breadcrumbList(trail: { text: string; href: string }[], pageTitle: string, pageUrl: string): Json {
  const items = [
    { text: 'Home', href: '/' },
    ...trail,
    { text: pageTitle, href: pageUrl },
  ];
  return {
    '@context': SCHEMA,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.text,
      item: new URL(item.href, site.url).href,
    })),
  };
}
