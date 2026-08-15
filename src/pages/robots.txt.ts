import type { APIRoute } from "astro";

import { siteSettings } from "@/data/settings";

function crawlerRule(userAgent: string, allowed: boolean): string[] {
  return [`User-agent: ${userAgent}`, allowed ? "Allow: /" : "Disallow: /"];
}

export const GET: APIRoute = () => {
  const { allowGptBot, allowOaiSearchBot } = siteSettings.crawlerPolicy;
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "",
    ...crawlerRule("OAI-SearchBot", allowOaiSearchBot),
    "",
    ...crawlerRule("GPTBot", allowGptBot),
    "",
    `Sitemap: ${new URL("/sitemap.xml", siteSettings.siteUrl).href}`,
    ""
  ].join("\n");

  return new Response(body, {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff"
    }
  });
};
