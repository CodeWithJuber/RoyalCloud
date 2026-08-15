import { siteSettings } from "@/data/settings";
import type {
  HostingPlan,
  PriceValue,
  SitePage,
  SiteSettings
} from "@/types/content";

export type JsonLdNode = Record<string, unknown>;

const SERVICE_FAMILIES = new Set<SitePage["family"]>([
  "shared",
  "vps",
  "wordpress",
  "dedicated"
]);

function absoluteUrl(value: string, baseUrl: string): string | null {
  try {
    const url = new URL(value, baseUrl);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

function canonicalUrl(page: SitePage, settings: SiteSettings): string {
  return absoluteUrl(page.seo.canonicalPath, settings.siteUrl) ?? settings.siteUrl;
}

function visibleHeroTitle(page: SitePage): string | null {
  const hero = page.blocks.find((block) => block.component === "hero");
  return hero?.component === "hero" && hero.title.trim() ? hero.title.trim() : null;
}

function offerForPrice(
  plan: HostingPlan,
  price: PriceValue,
  settings: SiteSettings
): JsonLdNode | null {
  if (price.amount === null || !Number.isFinite(price.amount) || price.amount < 0) return null;

  const checkoutUrl = absoluteUrl(plan.checkoutUrl, settings.siteUrl);
  if (!checkoutUrl) return null;

  return {
    "@type": "Offer",
    name: `${plan.name} introductory price`,
    description: plan.audience,
    price: price.amount.toString(),
    priceCurrency: price.currency,
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: price.amount.toString(),
      priceCurrency: price.currency,
      unitCode: plan.billingPeriod === "month" ? "MON" : "ANN"
    },
    url: checkoutUrl
  };
}

function visibleOffers(page: SitePage, settings: SiteSettings): JsonLdNode[] {
  return page.blocks
    .filter((block) => block.component === "pricing-grid")
    .flatMap((block) => block.component === "pricing-grid" ? block.plans : [])
    .flatMap((plan) => plan.introductory.map((price) => offerForPrice(plan, price, settings)))
    .filter((offer): offer is JsonLdNode => offer !== null);
}

export function organizationJsonLd(settings: SiteSettings): JsonLdNode {
  const organizationId = new URL("/#organization", settings.siteUrl).href;
  const logo = absoluteUrl(settings.logoDark, settings.siteUrl);
  const sameAs = settings.socials
    .map((social) => absoluteUrl(social.href, settings.siteUrl))
    .filter((url): url is string => url !== null);

  return {
    "@type": "Organization",
    "@id": organizationId,
    name: settings.organizationName,
    url: settings.siteUrl,
    ...(logo ? { logo } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {})
  };
}

export function websiteJsonLd(settings: SiteSettings): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": new URL("/#website", settings.siteUrl).href,
    name: settings.organizationName,
    url: settings.siteUrl,
    publisher: { "@id": new URL("/#organization", settings.siteUrl).href }
  };
}

export function webpageJsonLd(page: SitePage, settings: SiteSettings): JsonLdNode {
  const url = canonicalUrl(page, settings);
  const breadcrumbs = breadcrumbJsonLd(page, settings);

  return {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: visibleHeroTitle(page) ?? page.seo.title,
    description: page.seo.description,
    dateModified: page.seo.updatedAt,
    isPartOf: { "@id": new URL("/#website", settings.siteUrl).href },
    ...(breadcrumbs ? { breadcrumb: { "@id": `${url}#breadcrumb` } } : {})
  };
}

export function breadcrumbJsonLd(page: SitePage, settings: SiteSettings): JsonLdNode | null {
  if (page.breadcrumbs.length === 0) return null;

  const visibleBreadcrumbs = page.breadcrumbs.flatMap((breadcrumb) => {
    const item = absoluteUrl(breadcrumb.href, settings.siteUrl);
    if (!item || !breadcrumb.label.trim()) return [];

    return [{
      name: breadcrumb.label.trim(),
      item
    }];
  });

  if (visibleBreadcrumbs.length === 0) return null;

  const items = visibleBreadcrumbs.map((breadcrumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    ...breadcrumb
  }));

  return {
    "@type": "BreadcrumbList",
    "@id": `${canonicalUrl(page, settings)}#breadcrumb`,
    itemListElement: items
  };
}

export function serviceJsonLd(page: SitePage, settings: SiteSettings): JsonLdNode | null {
  const serviceType = visibleHeroTitle(page);
  if (!SERVICE_FAMILIES.has(page.family) || !serviceType) return null;

  const offers = visibleOffers(page, settings);
  const url = canonicalUrl(page, settings);

  return {
    "@type": "Service",
    "@id": `${url}#service`,
    name: serviceType,
    serviceType,
    description: page.seo.description,
    url,
    provider: { "@id": new URL("/#organization", settings.siteUrl).href },
    ...(offers.length > 0 ? { offers } : {})
  };
}

export function structuredDataGraph(page: SitePage, settings: SiteSettings): JsonLdNode {
  const breadcrumb = breadcrumbJsonLd(page, settings);
  const service = serviceJsonLd(page, settings);
  const graph = [
    organizationJsonLd(settings),
    websiteJsonLd(settings),
    webpageJsonLd(page, settings),
    ...(breadcrumb ? [breadcrumb] : []),
    ...(service ? [service] : [])
  ];

  return {
    "@context": "https://schema.org",
    "@graph": graph
  };
}

export function buildStructuredData(
  page: SitePage,
  settings: SiteSettings = siteSettings
): Record<string, unknown>[] {
  return [structuredDataGraph(page, settings)];
}
