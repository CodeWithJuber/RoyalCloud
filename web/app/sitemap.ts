import type { MetadataRoute } from "next";
import { siteSettings } from "@/lib/settings";
import { CONTENT_ROUTES } from "@/lib/routes";
import { loadPage } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  return CONTENT_ROUTES.flatMap((route) => {
    const name = route === "/" ? "index" : route.slice(1);
    const page = loadPage(name);
    if (!page || page.metadata?.noindex) return [];

    return [
      {
        url: new URL(route, siteSettings.siteUrl).toString(),
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: route === "/" ? 1 : 0.8,
      },
    ];
  });
}
