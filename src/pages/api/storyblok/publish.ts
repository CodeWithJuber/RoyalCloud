import { getSecret } from "astro:env/server";
import type { APIRoute } from "astro";
import { z } from "zod";

import { siteSettings } from "@/data/settings";
import { CONTENT_ROUTES, isContentRoute, slugToRoute } from "@/lib/routes";

const MAX_BODY_BYTES = 64 * 1024;
const STORY_ACTIONS = ["published", "unpublished", "deleted", "moved"] as const;

const webhookSchema = z.object({
  action: z.enum(STORY_ACTIONS),
  full_slug: z.string().trim().min(1).max(500).optional(),
  old_full_slug: z.string().trim().min(1).max(500).optional(),
  space_id: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]),
  story_id: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]).optional(),
  text: z.string().max(5_000)
}).loose();

type WebhookPayload = z.infer<typeof webhookSchema>;

interface ErrorBody {
  ok: false;
  error: { code: string; message: string };
  requestId: string;
}

interface CacheStorageWithDefault extends CacheStorage {
  default?: Cache;
}

function jsonResponse(body: unknown, status: number): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

function errorResponse(requestId: string, status: number, code: string, message: string): Response {
  const body: ErrorBody = { ok: false, error: { code, message }, requestId };
  return jsonResponse(body, status);
}

function logError(requestId: string, code: string, error: unknown): void {
  console.error(JSON.stringify({
    level: "error",
    message: code,
    requestId,
    service: "storyblok-webhook",
    detail: error instanceof Error ? error.message : "Unknown internal error"
  }));
}

function hexToBytes(value: string): Uint8Array | null {
  if (!/^[a-f\d]{40}$/i.test(value)) return null;
  const bytes = new Uint8Array(value.length / 2);
  for (let index = 0; index < value.length; index += 2) {
    const byte = Number.parseInt(value.slice(index, index + 2), 16);
    if (!Number.isFinite(byte)) return null;
    bytes[index / 2] = byte;
  }
  return bytes;
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return mismatch === 0;
}

async function verifySignature(body: string, signature: string, secret: string): Promise<boolean> {
  const suppliedSignature = hexToBytes(signature);
  if (!suppliedSignature) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { hash: "SHA-1", name: "HMAC" },
    false,
    ["sign"]
  );
  const generatedSignature = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(body)));
  return constantTimeEqual(generatedSignature, suppliedSignature);
}

function routeFromSlug(slug: string | undefined): string | null {
  if (!slug) return null;
  const normalized = slug.replace(/^pages\//, "").replace(/^\/+|\/+$/g, "");
  const route = normalized === "home" ? "/" : slugToRoute(normalized);
  return isContentRoute(route) ? route : null;
}

function affectedRoutes(payload: WebhookPayload): string[] {
  const routes = [routeFromSlug(payload.full_slug), routeFromSlug(payload.old_full_slug)]
    .filter((route): route is string => route !== null);

  return routes.length > 0 ? [...new Set(routes)] : [...CONTENT_ROUTES];
}

async function purgeCachedUrls(urls: string[]): Promise<{ attempted: number; purged: number; available: boolean }> {
  const cache = (globalThis.caches as CacheStorageWithDefault | undefined)?.default;
  if (!cache) return { attempted: 0, purged: 0, available: false };

  const results = await Promise.allSettled(urls.map((url) => cache.delete(new Request(url))));
  const purged = results.filter((result) => result.status === "fulfilled" && result.value).length;
  return { attempted: urls.length, purged, available: true };
}

function validIndexNowConfiguration(): { key: string; keyLocation: string } | null {
  const key = getSecret("INDEXNOW_KEY")?.trim();
  const keyLocation = getSecret("INDEXNOW_KEY_LOCATION")?.trim();
  if (!key || !keyLocation || !/^[A-Za-z0-9-]{8,128}$/.test(key)) return null;

  try {
    const location = new URL(keyLocation);
    const site = new URL(siteSettings.siteUrl);
    if (location.protocol !== "https:" || location.hostname !== site.hostname) return null;
    return { key, keyLocation: location.href };
  } catch {
    return null;
  }
}

async function submitIndexNow(urls: string[]): Promise<{ submitted: boolean; status?: number }> {
  const configuration = validIndexNowConfiguration();
  if (!configuration) return { submitted: false };

  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(siteSettings.siteUrl).hostname,
      key: configuration.key,
      keyLocation: configuration.keyLocation,
      urlList: urls
    }),
    signal: AbortSignal.timeout(8_000)
  });

  if (!response.ok) {
    throw new Error(`IndexNow returned HTTP ${response.status}`);
  }

  return { submitted: true, status: response.status };
}

export const POST: APIRoute = async ({ request }) => {
  const requestId = crypto.randomUUID();
  const webhookSecret = getSecret("STORYBLOK_WEBHOOK_SECRET")?.trim();
  if (!webhookSecret) {
    return errorResponse(requestId, 503, "WEBHOOK_NOT_CONFIGURED", "Webhook verification is not configured.");
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return errorResponse(requestId, 413, "PAYLOAD_TOO_LARGE", "Webhook payload exceeds the allowed size.");
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch (error) {
    logError(requestId, "WEBHOOK_BODY_READ_FAILED", error);
    return errorResponse(requestId, 400, "INVALID_BODY", "Webhook body could not be read.");
  }

  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return errorResponse(requestId, 413, "PAYLOAD_TOO_LARGE", "Webhook payload exceeds the allowed size.");
  }

  const signature = request.headers.get("webhook-signature")?.trim();
  if (!signature) {
    return errorResponse(requestId, 401, "MISSING_SIGNATURE", "Webhook signature is required.");
  }

  try {
    const signatureIsValid = await verifySignature(rawBody, signature, webhookSecret);
    if (!signatureIsValid) {
      return errorResponse(requestId, 401, "INVALID_SIGNATURE", "Webhook signature is invalid.");
    }
  } catch (error) {
    logError(requestId, "WEBHOOK_SIGNATURE_CHECK_FAILED", error);
    return errorResponse(requestId, 500, "SIGNATURE_CHECK_FAILED", "Webhook signature could not be verified.");
  }

  let payload: WebhookPayload;
  try {
    const parsedJson: unknown = JSON.parse(rawBody);
    const result = webhookSchema.safeParse(parsedJson);
    if (!result.success) {
      return errorResponse(requestId, 422, "INVALID_PAYLOAD", "Webhook payload does not match the expected Storyblok event.");
    }
    payload = result.data;
  } catch {
    return errorResponse(requestId, 400, "INVALID_JSON", "Webhook body must be valid JSON.");
  }

  const routes = affectedRoutes(payload);
  const canonicalUrls = routes.map((route) => new URL(route, siteSettings.siteUrl).href);
  const purgeUrls = [...canonicalUrls, new URL("/sitemap.xml", siteSettings.siteUrl).href];

  const [cacheResult, indexNowResult] = await Promise.allSettled([
    purgeCachedUrls(purgeUrls),
    submitIndexNow(canonicalUrls)
  ]);

  if (cacheResult.status === "rejected") logError(requestId, "CACHE_PURGE_FAILED", cacheResult.reason);
  if (indexNowResult.status === "rejected") logError(requestId, "INDEXNOW_SUBMISSION_FAILED", indexNowResult.reason);

  return jsonResponse({
    ok: true,
    requestId,
    action: payload.action,
    affectedRoutes: routes,
    cache: cacheResult.status === "fulfilled"
      ? cacheResult.value
      : { attempted: purgeUrls.length, purged: 0, available: true },
    indexNow: indexNowResult.status === "fulfilled"
      ? indexNowResult.value
      : { submitted: false }
  }, 202);
};
