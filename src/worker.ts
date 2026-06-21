/// <reference types="@cloudflare/workers-types" />

/**
 * Preview-lock + security-headers Worker.
 *
 * Runs in front of the static `dist/` assets (bound as ASSETS). While the
 * BASIC_AUTH_USER / BASIC_AUTH_PASS secrets are set, the whole site is gated
 * behind an HTTP Basic Auth prompt so the public can't see it. Remove those
 * secrets (Cloudflare → Workers → royalfront → Settings → Variables & Secrets)
 * to make the site public again, no code change needed.
 */

interface Env {
  ASSETS: Fetcher;
  BASIC_AUTH_USER?: string;
  BASIC_AUTH_PASS?: string;
  // GitHub OAuth for the Decap CMS login at /admin. The client id is public
  // (declared as a [vars] entry in wrangler.toml); the secret must be set with
  // `npx wrangler secret put GITHUB_OAUTH_CLIENT_SECRET` and is never committed.
  GITHUB_OAUTH_CLIENT_ID?: string;
  GITHUB_OAUTH_CLIENT_SECRET?: string;
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

/* ------------------------------------------------------------------------- */
/* Decap CMS ↔ GitHub OAuth proxy                                            */
/*                                                                           */
/* Decap's GitHub backend needs a server-side OAuth handshake (the client    */
/* secret can't live in the browser). These routes implement it on the       */
/* Worker itself, so the CMS at /admin can log in without any third-party     */
/* proxy: /oauth/auth → GitHub authorize → /oauth/callback → token exchange   */
/* → postMessage the token back to the Decap popup that opened the flow.      */
/* ------------------------------------------------------------------------- */

const OAUTH_STATE_COOKIE = "decap_oauth_state";

/** Random hex string for the OAuth CSRF `state` parameter. */
function randomState(bytes = 16): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Read a single cookie value from the request's Cookie header. */
function readCookie(request: Request, name: string): string | null {
  const raw = request.headers.get("Cookie");
  if (!raw) return null;
  for (const part of raw.split(/;\s*/)) {
    if (part.startsWith(name + "=")) {
      return decodeURIComponent(part.slice(name.length + 1));
    }
  }
  return null;
}

/** Step 1, redirect the editor to GitHub's authorize screen. */
function handleOAuthAuth(url: URL, env: Env): Response {
  if (!env.GITHUB_OAUTH_CLIENT_ID) {
    return new Response("GitHub OAuth is not configured on this Worker.", {
      status: 500,
    });
  }
  const state = randomState();
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", env.GITHUB_OAUTH_CLIENT_ID);
  authorize.searchParams.set("redirect_uri", `${url.origin}/oauth/callback`);
  authorize.searchParams.set("scope", url.searchParams.get("scope") || "repo");
  authorize.searchParams.set("state", state);
  return new Response(null, {
    status: 302,
    headers: {
      Location: authorize.toString(),
      // SameSite=Lax so the cookie survives GitHub's top-level redirect back.
      "Set-Cookie": `${OAUTH_STATE_COOKIE}=${state}; Path=/oauth; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
}

/** Step 2, exchange the code for a token and hand it to the Decap popup. */
async function handleOAuthCallback(
  url: URL,
  request: Request,
  env: Env,
): Promise<Response> {
  const clearCookie = `${OAUTH_STATE_COOKIE}=; Path=/oauth; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
  const htmlHeaders = {
    "Content-Type": "text/html; charset=utf-8",
    "Set-Cookie": clearCookie,
  };

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expected = readCookie(request, OAUTH_STATE_COOKIE);

  // CSRF: state must be present and match the cookie set in step 1.
  if (!code || !state || !expected || state !== expected) {
    return new Response(renderHandshake({ error: "Invalid OAuth state." }), {
      status: 400,
      headers: htmlHeaders,
    });
  }
  if (!env.GITHUB_OAUTH_CLIENT_ID || !env.GITHUB_OAUTH_CLIENT_SECRET) {
    return new Response(
      renderHandshake({ error: "GitHub OAuth is not configured." }),
      { status: 500, headers: htmlHeaders },
    );
  }

  let token: string | undefined;
  let error: string | undefined;
  try {
    const res = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "royalfront-decap-oauth",
      },
      body: JSON.stringify({
        client_id: env.GITHUB_OAUTH_CLIENT_ID,
        client_secret: env.GITHUB_OAUTH_CLIENT_SECRET,
        code,
        redirect_uri: `${url.origin}/oauth/callback`,
      }),
    });
    const data = (await res.json()) as {
      access_token?: string;
      error_description?: string;
      error?: string;
    };
    token = data.access_token;
    error = data.error_description || data.error;
  } catch {
    error = "Token exchange request failed.";
  }

  return new Response(
    token
      ? renderHandshake({ token })
      : renderHandshake({ error: error || "No access token returned." }),
    { status: token ? 200 : 502, headers: htmlHeaders },
  );
}

/**
 * The tiny HTML page GitHub redirects back to. It speaks Decap's popup
 * handshake: the opener posts "authorizing:github" and we reply with
 * "authorization:github:<status>:<json>". `<` inside the JSON is escaped so a
 * token can never break out of the inline <script>.
 */
function renderHandshake(result: { token?: string; error?: string }): string {
  const status = result.token ? "success" : "error";
  const payload = JSON.stringify(
    result.token
      ? { token: result.token, provider: "github" }
      : { error: result.error },
  ).replace(/</g, "\\u003c");
  return `<!doctype html><html><head><meta charset="utf-8"><title>Authorizing…</title></head><body><p>Authorizing…</p><script>
(function () {
  function send() {
    if (window.opener) {
      window.opener.postMessage('authorization:github:${status}:${payload}', '*');
    }
  }
  window.addEventListener('message', function (e) {
    if (e.data === 'authorizing:github') send();
  }, false);
  send();
})();
</script></body></html>`;
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
    const url = new URL(request.url);

    // Decap CMS OAuth, handled BEFORE the Basic Auth gate, because GitHub's
    // redirect to /oauth/callback carries no Basic Auth credentials.
    if (url.pathname === "/oauth/auth") return handleOAuthAuth(url, env);
    if (url.pathname === "/oauth/callback") {
      return handleOAuthCallback(url, request, env);
    }

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
