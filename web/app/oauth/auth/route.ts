import { authorizeUrl, publicOrigin, randomState, safeScope, stateCookie } from "@/lib/cms-oauth";

/* Step 1 of the CMS login: send the editor to GitHub's authorize screen.
   Needs GITHUB_OAUTH_CLIENT_ID (and _SECRET for step 2) in the deployment's
   environment; the OAuth App's callback URL is <origin>/oauth/callback. */
export const dynamic = "force-dynamic";

export function GET(request: Request): Response {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  if (!clientId) {
    return new Response(
      "CMS login is not configured: set GITHUB_OAUTH_CLIENT_ID and GITHUB_OAUTH_CLIENT_SECRET in the deployment environment (see web/README.md).",
      { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } },
    );
  }
  const state = randomState();
  const scope = safeScope(new URL(request.url).searchParams.get("scope"));
  return new Response(null, {
    status: 302,
    headers: {
      Location: authorizeUrl(clientId, publicOrigin(request), scope, state),
      /* SameSite=Lax so the cookie survives GitHub's top-level redirect back. */
      "Set-Cookie": stateCookie(state),
      "Cache-Control": "no-store",
    },
  });
}
