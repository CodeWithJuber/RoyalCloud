/// <reference types="@cloudflare/workers-types" />

/**
 * Preview-lock + security-headers Worker.
 *
 * Runs in front of the static `dist/` assets (bound as ASSETS). While the
 * BASIC_AUTH_USER / BASIC_AUTH_PASS secrets are set, the whole site is gated
 * behind an HTTP Basic Auth prompt so the public can't see it. Remove those
 * secrets (Cloudflare → Workers → royalfront → Settings → Variables & Secrets)
 * to make the site public again — no code change needed.
 */

interface Env {
  ASSETS: Fetcher;
  BASIC_AUTH_USER?: string;
  BASIC_AUTH_PASS?: string;
}

const REALM = "Royal Clouds (Preview)";

/** Timing-safe string comparison to avoid leaking length/contents via timing. */
function safeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) {
    // Still run a comparison to keep timing roughly constant.
    let acc = 0;
    for (let i = 0; i < ab.length; i++) acc |= ab[i];
    // `acc` can never be negative, so this always returns false while keeping
    // the loop (and its timing) from being optimized away.
    return acc < 0;
  }
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

/** Parse a `Basic` Authorization header into { user, pass }, or null. */
export function parseBasicAuth(
  header: string | null,
): { user: string; pass: string } | null {
  if (!header) return null;
  const [scheme, encoded] = header.split(" ");
  if (!encoded || scheme.toLowerCase() !== "basic") return null;
  let decoded: string;
  try {
    decoded = atob(encoded);
  } catch {
    return null;
  }
  const idx = decoded.indexOf(":");
  if (idx === -1) return null;
  return { user: decoded.slice(0, idx), pass: decoded.slice(idx + 1) };
}

/** True if the request carries valid credentials (or no lock is configured). */
export function isAuthorized(header: string | null, env: Env): boolean {
  // No credentials configured → site is public.
  if (!env.BASIC_AUTH_USER && !env.BASIC_AUTH_PASS) return true;
  const creds = parseBasicAuth(header);
  if (!creds) return false;
  return (
    safeEqual(creds.user, env.BASIC_AUTH_USER ?? "") &&
    safeEqual(creds.pass, env.BASIC_AUTH_PASS ?? "")
  );
}

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "SAMEORIGIN",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

function withSecurityHeaders(res: Response): Response {
  const out = new Response(res.body, res);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) out.headers.set(k, v);
  return out;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (!isAuthorized(request.headers.get("Authorization"), env)) {
      return new Response("Authentication required.", {
        status: 401,
        headers: {
          "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
          "Content-Type": "text/plain; charset=utf-8",
          // Don't let preview pages get indexed even if exposed.
          "X-Robots-Tag": "noindex, nofollow",
        },
      });
    }
    const assetResponse = await env.ASSETS.fetch(request);
    return withSecurityHeaders(assetResponse);
  },
};
