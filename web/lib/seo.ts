import type { Metadata } from "next";
import { siteSettings } from "@/lib/settings";
import { PLAN_FILES } from "@/lib/plans";
import type { PageContent } from "@/lib/content";

type JsonLd = Record<string, unknown>;

export function pageMetadata(page: PageContent): Metadata {
  const title = page.metadata?.title ?? `${page.title} | Royal Clouds`;
  const description =
    page.metadata?.description ?? siteSettings.defaultSeo.description;
  const canonical = new URL(page.route, siteSettings.siteUrl).toString();

  return {
    title,
    description,
    robots: page.metadata?.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true, "max-image-preview": "large" },
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: siteSettings.organizationName,
      title,
      description,
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function absoluteUrl(value: string): string | null {
  try {
    const url = new URL(value, siteSettings.siteUrl);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function organizationJsonLd(): JsonLd {
  return {
    "@type": "Organization",
    "@id": new URL("/#organization", siteSettings.siteUrl).href,
    name: siteSettings.organizationName,
    url: siteSettings.siteUrl,
  };
}

function websiteJsonLd(): JsonLd {
  return {
    "@type": "WebSite",
    "@id": new URL("/#website", siteSettings.siteUrl).href,
    name: siteSettings.organizationName,
    url: siteSettings.siteUrl,
    publisher: { "@id": new URL("/#organization", siteSettings.siteUrl).href },
  };
}

function breadcrumbJsonLd(page: PageContent): JsonLd | null {
  if (page.breadcrumb.length === 0) return null;
  const items = page.breadcrumb.flatMap((crumb, index) => {
    const item = absoluteUrl(crumb.href);
    if (!item || !crumb.text.trim()) return [];
    return [{ "@type": "ListItem", position: index + 1, name: crumb.text.trim(), item }];
  });
  if (items.length === 0) return null;
  return {
    "@type": "BreadcrumbList",
    "@id": `${absoluteUrl(page.route)}#breadcrumb`,
    itemListElement: items,
  };
}

function serviceJsonLd(page: PageContent): JsonLd | null {
  const pricingSection = page.sections.find(
    (s) => s.type === "pricing" && "plan" in s && typeof s.plan === "string",
  );
  if (!pricingSection || !("plan" in pricingSection)) return null;
  const planFile = PLAN_FILES[pricingSection.plan as string];
  if (!planFile) return null;

  const url = absoluteUrl(page.route);
  const offers = planFile.tiers.flatMap((tier) => {
    const price = parseFloat(tier.price);
    const checkout = absoluteUrl(tier.ctaUrl);
    if (!Number.isFinite(price) || !checkout) return [];
    return [
      {
        "@type": "Offer",
        name: `${planFile.name} — ${tier.name}`,
        price: price.toString(),
        priceCurrency: "USD",
        url: checkout,
      },
    ];
  });

  return {
    "@type": "Service",
    "@id": `${url}#service`,
    name: planFile.name,
    serviceType: planFile.name,
    description: planFile.subtitle,
    url,
    provider: { "@id": new URL("/#organization", siteSettings.siteUrl).href },
    ...(offers.length > 0 ? { offers } : {}),
  };
}

export function buildJsonLd(page: PageContent): JsonLd[] {
  const breadcrumb = breadcrumbJsonLd(page);
  const service = serviceJsonLd(page);
  const graph: JsonLd[] = [
    organizationJsonLd(),
    websiteJsonLd(),
    {
      "@type": "WebPage",
      "@id": `${absoluteUrl(page.route)}#webpage`,
      url: absoluteUrl(page.route),
      name: page.metadata?.title ?? page.title,
      description: page.metadata?.description ?? siteSettings.defaultSeo.description,
      isPartOf: { "@id": new URL("/#website", siteSettings.siteUrl).href },
    },
    ...(breadcrumb ? [breadcrumb] : []),
    ...(service ? [service] : []),
  ];
  return [{ "@context": "https://schema.org", "@graph": graph }];
}
