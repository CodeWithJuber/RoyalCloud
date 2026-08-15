import type { APIRoute } from "astro";

import { getLocalPage } from "@/data/pages";
import { siteSettings } from "@/data/settings";
import { INDEXABLE_ROUTES } from "@/lib/routes";

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z)?$/.test(value)
    && !Number.isNaN(Date.parse(value));
}

export const GET: APIRoute = () => {
  const entries = INDEXABLE_ROUTES.map((route) => {
    const page = getLocalPage(route);
    if (!page || page.seo.noindex || !isIsoDate(page.seo.updatedAt)) return null;

    const location = new URL(page.seo.canonicalPath, siteSettings.siteUrl).href;
    return [
      "  <url>",
      `    <loc>${escapeXml(location)}</loc>`,
      `    <lastmod>${escapeXml(page.seo.updatedAt)}</lastmod>`,
      "  </url>"
    ].join("\n");
  }).filter((entry): entry is string => entry !== null);

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    "</urlset>",
    ""
  ].join("\n");

  return new Response(body, {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Content-Type": "application/xml; charset=utf-8",
      "X-Content-Type-Options": "nosniff"
    }
  });
};
