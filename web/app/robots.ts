import type { MetadataRoute } from "next";
import { siteSettings } from "@/lib/settings";

export default function robots(): MetadataRoute.Robots {
  const { allowGptBot, allowOaiSearchBot } = siteSettings.crawlerPolicy;
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/api/" },
      { userAgent: "OAI-SearchBot", ...(allowOaiSearchBot ? { allow: "/" } : { disallow: "/" }) },
      { userAgent: "GPTBot", ...(allowGptBot ? { allow: "/" } : { disallow: "/" }) },
    ],
    sitemap: new URL("/sitemap.xml", siteSettings.siteUrl).toString(),
  };
}
