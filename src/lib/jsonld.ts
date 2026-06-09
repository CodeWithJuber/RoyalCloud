// Helpers that build Yoast-equivalent structured data for product pages.

interface Tier {
  name: string;
  price: string;
  period: string;
  ctaUrl: string;
}
interface Plan {
  name: string;
  slug: string;
  title: string;
  subtitle: string;
  currency: string;
  tiers: Tier[];
}
interface Site {
  url: string;
  name: string;
}

const currencyCode = (symbol: string): string => {
  switch (symbol) {
    case "$": return "USD";
    case "₹": return "INR";
    case "€": return "EUR";
    case "£": return "GBP";
    default: return "USD";
  }
};

/** Product + Offer schema and a BreadcrumbList for a hosting product page. */
export function productJsonLd(plan: Plan, site: Site): Record<string, unknown>[] {
  const pageUrl = `${site.url}/${plan.slug}`;
  const prices = plan.tiers.map((t) => parseFloat(t.price)).filter((n) => !isNaN(n));
  const low = Math.min(...prices).toFixed(2);
  const high = Math.max(...prices).toFixed(2);

  const product = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: plan.name,
    description: plan.subtitle,
    brand: { "@type": "Brand", name: site.name },
    url: pageUrl,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: currencyCode(plan.currency),
      lowPrice: low,
      highPrice: high,
      offerCount: plan.tiers.length,
      availability: "https://schema.org/InStock",
      url: pageUrl,
    },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      { "@type": "ListItem", position: 2, name: plan.name, item: pageUrl },
    ],
  };

  return [product, breadcrumb];
}
