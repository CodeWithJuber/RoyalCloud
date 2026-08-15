import { getSecret } from "astro:env/server";
import { getLocalPage } from "@/data/pages";
import { routeToSlug } from "@/lib/routes";
import { sitePageSchema } from "@/lib/content-schema";
import type { SitePage } from "@/types/content";

interface StoryblokResponse {
  story?: {
    content?: unknown;
  };
}

function storyblokApiOrigin(region: string): string {
  if (region === "us") return "https://api-us.storyblok.com/v2";
  if (region === "ca") return "https://api-ca.storyblok.com/v2";
  if (region === "ap") return "https://api-ap.storyblok.com/v2";
  return "https://api.storyblok.com/v2";
}

export async function getPageContent(route: string, preview = false): Promise<SitePage | null> {
  const fallback = getLocalPage(route);
  const token = import.meta.env.PUBLIC_STORYBLOK_ACCESS_TOKEN;

  if (!token) return fallback;

  const region = import.meta.env.STORYBLOK_REGION ?? "eu";
  const endpoint = new URL(`${storyblokApiOrigin(region)}/cdn/stories/${routeToSlug(route)}`);
  endpoint.searchParams.set("token", token);
  endpoint.searchParams.set("version", preview ? "draft" : "published");

  try {
    const response = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      cf: preview ? undefined : { cacheTtl: 300, cacheEverything: true }
    } as RequestInit);

    if (!response.ok) return fallback;

    const payload = await response.json() as StoryblokResponse;
    const parsed = sitePageSchema.safeParse(payload.story?.content);
    return parsed.success ? parsed.data : fallback;
  } catch {
    return fallback;
  }
}

export function isPreviewRequest(url: URL): boolean {
  const secret = getSecret("STORYBLOK_PREVIEW_SECRET") ?? process.env.STORYBLOK_PREVIEW_SECRET;
  const supplied = url.searchParams.get("preview");
  return Boolean(secret && supplied && supplied === secret);
}
