import {
  CLEAR_STATE_COOKIE,
  OAUTH_STATE_COOKIE,
  exchangeCode,
  publicOrigin,
  readCookie,
  renderHandshake,
} from "@/lib/cms-oauth";

/* Step 2 of the CMS login: verify the CSRF state, exchange the code for a
   token and hand it to the editor's popup via the Decap/Sveltia handshake. */
export const dynamic = "force-dynamic";

const html = (body: string, status: number) =>
  new Response(body, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Set-Cookie": CLEAR_STATE_COOKIE,
      "Cache-Control": "no-store",
    },
  });

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expected = readCookie(request.headers.get("cookie"), OAUTH_STATE_COOKIE);

  if (!code || !state || !expected || state !== expected) {
    return html(renderHandshake({ error: "Invalid OAuth state — start the login again." }), 400);
  }
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return html(renderHandshake({ error: "CMS login is not configured on this deployment." }), 503);
  }
  const result = await exchangeCode({ clientId, clientSecret, code, origin: publicOrigin(request) });
  return html(renderHandshake(result), result.token ? 200 : 502);
}
