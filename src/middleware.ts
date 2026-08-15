import { defineMiddleware } from "astro:middleware";
import { REDIRECTS } from "@/lib/routes";
import { isPreviewRequest } from "@/lib/storyblok";

const canonicalHost = "royalclouds.net";

interface CacheStorageWithDefault extends CacheStorage {
  default?: Cache;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const url = context.url;
  const redirect = REDIRECTS.get(url.pathname);
  const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  const preview = isPreviewRequest(url);

  if (redirect) {
    return context.redirect(redirect.destination, redirect.status);
  }

  if (!isLocal && (url.hostname === `www.${canonicalHost}` || url.protocol === "http:")) {
    const canonical = new URL(url);
    canonical.protocol = "https:";
    canonical.hostname = canonicalHost;
    if (canonical.pathname.length > 1) canonical.pathname = canonical.pathname.replace(/\/+$/, "");
    return context.redirect(canonical.toString(), 301);
  }

  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    const normalized = new URL(url);
    normalized.pathname = url.pathname.replace(/\/+$/, "");
    return context.redirect(normalized.toString(), 301);
  }

  const edgeCache = (globalThis.caches as CacheStorageWithDefault | undefined)?.default;
  const cacheKey = new Request(new URL(url.pathname, url.origin), context.request);
  const canUseEdgeCache = context.request.method === "GET" && !preview && Boolean(edgeCache);

  if (canUseEdgeCache && edgeCache) {
    try {
      const cached = await edgeCache.match(cacheKey);
      if (cached) return cached;
    } catch {}
  }

  const response = await next();
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("text/html")) {
    const headers = new Headers(response.headers);
    headers.set(
      "Cache-Control",
      preview ? "private, no-store" : "public, max-age=0, s-maxage=300, stale-while-revalidate=86400"
    );
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", preview ? "SAMEORIGIN" : "DENY");
    headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    const finalResponse = new Response(response.body, { status: response.status, statusText: response.statusText, headers });

    if (canUseEdgeCache && edgeCache && response.status === 200) {
      const write = edgeCache.put(cacheKey, finalResponse.clone());
      const executionContext = context.locals.cfContext;
      if (executionContext) executionContext.waitUntil(write);
      else await write;
    }

    return finalResponse;
  }

  return response;
});
