/**
 * GitHub OAuth proxy for the CMS at /admin — pure helpers, unit-tested.
 * Decap/Sveltia cannot hold the client secret in the browser, so the flow
 * runs here: /oauth/auth → GitHub authorize → /oauth/callback → token
 * exchange → postMessage the token to the popup that opened the flow (the
 * "authorization:github:<status>:<json>" handshake both editors speak).
 * Ported from the legacy Cloudflare Worker (src/worker.ts) so the CMS and
 * its login live in the same deployment.
 */
export const OAUTH_STATE_COOKIE = "cms_oauth_state";
export const STATE_MAX_AGE = 600;

/** Random hex string for the OAuth CSRF `state` parameter. */
export function randomState(bytes = 16): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Read one cookie value from a Cookie header. */
export function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(/;\s*/)) {
    if (part.startsWith(`${name}=`)) {
      try {
        return decodeURIComponent(part.slice(name.length + 1));
      } catch {
        return null;
      }
    }
  }
  return null;
}

/** Public origin of the deployment — behind Vercel's proxy the forwarded
    headers are authoritative; the OAuth App's callback must match it. */
export function publicOrigin(request: Request): string {
  const url = new URL(request.url);
  const proto = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (host) return `${proto}://${host}`;
  return url.origin;
}

export function authorizeUrl(clientId: string, origin: string, scope: string, state: string): string {
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", `${origin}/oauth/callback`);
  url.searchParams.set("scope", scope);
  url.searchParams.set("state", state);
  return url.toString();
}

/** Only GitHub's documented scopes for a CMS; anything else falls back to repo. */
export function safeScope(raw: string | null): string {
  return raw && /^[a-z_:, ]{1,40}$/i.test(raw) ? raw : "repo";
}

export function stateCookie(state: string): string {
  return `${OAUTH_STATE_COOKIE}=${state}; Path=/oauth; HttpOnly; Secure; SameSite=Lax; Max-Age=${STATE_MAX_AGE}`;
}
export const CLEAR_STATE_COOKIE = `${OAUTH_STATE_COOKIE}=; Path=/oauth; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;

/**
 * The tiny page GitHub redirects back to. The opener posts "authorizing:github"
 * and we answer "authorization:github:<status>:<json>". `<` inside the JSON is
 * escaped so a token or error text can never break out of the inline script.
 */
export function renderHandshake(result: { token?: string; error?: string }): string {
  const status = result.token ? "success" : "error";
  const payload = JSON.stringify(
    result.token ? { token: result.token, provider: "github" } : { error: result.error ?? "Unknown error" },
  ).replace(/</g, "\\u003c");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Authorizing…</title></head><body><p>Authorizing…</p><script>
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

export interface TokenExchangeResult {
  token?: string;
  error?: string;
}

/** Exchange the code for a token. Network and JSON failures become an error string. */
export async function exchangeCode(
  params: { clientId: string; clientSecret: string; code: string; origin: string },
  fetchImpl: typeof fetch = fetch,
): Promise<TokenExchangeResult> {
  try {
    const res = await fetchImpl("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "royalclouds-cms-oauth",
      },
      body: JSON.stringify({
        client_id: params.clientId,
        client_secret: params.clientSecret,
        code: params.code,
        redirect_uri: `${params.origin}/oauth/callback`,
      }),
    });
    const data = (await res.json()) as {
      access_token?: string;
      error_description?: string;
      error?: string;
    };
    if (data.access_token) return { token: data.access_token };
    return { error: data.error_description || data.error || "No access token returned." };
  } catch {
    return { error: "Token exchange request failed." };
  }
}
