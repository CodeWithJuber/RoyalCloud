import { describe, expect, it } from "vitest";
import {
  authorizeUrl,
  exchangeCode,
  publicOrigin,
  randomState,
  readCookie,
  renderHandshake,
  safeScope,
} from "@/lib/cms-oauth";

describe("cms-oauth helpers", () => {
  it("generates a 32-hex state that differs per call", () => {
    const a = randomState();
    const b = randomState();
    expect(a).toMatch(/^[0-9a-f]{32}$/);
    expect(a).not.toBe(b);
  });

  it("reads one cookie from a header and tolerates junk", () => {
    expect(readCookie("a=1; cms_oauth_state=abc; b=2", "cms_oauth_state")).toBe("abc");
    expect(readCookie("a=1", "cms_oauth_state")).toBeNull();
    expect(readCookie(null, "cms_oauth_state")).toBeNull();
    expect(readCookie("cms_oauth_state=%E0%A4%A", "cms_oauth_state")).toBeNull();
  });

  it("prefers forwarded headers for the public origin", () => {
    const forwarded = new Request("http://127.0.0.1:3000/oauth/auth", {
      headers: { "x-forwarded-proto": "https", "x-forwarded-host": "royal-cloud.vercel.app" },
    });
    expect(publicOrigin(forwarded)).toBe("https://royal-cloud.vercel.app");
    expect(publicOrigin(new Request("http://localhost:3000/oauth/auth"))).toBe("http://localhost:3000");
    const plainHost = new Request("http://localhost:3000/oauth/auth", { headers: { host: "localhost:3000" } });
    expect(publicOrigin(plainHost)).toBe("http://localhost:3000");
  });

  it("builds the GitHub authorize URL with the callback on the same origin", () => {
    const url = new URL(authorizeUrl("id123", "https://royal-cloud.vercel.app", "repo", "st"));
    expect(url.origin + url.pathname).toBe("https://github.com/login/oauth/authorize");
    expect(url.searchParams.get("redirect_uri")).toBe("https://royal-cloud.vercel.app/oauth/callback");
    expect(url.searchParams.get("client_id")).toBe("id123");
    expect(url.searchParams.get("state")).toBe("st");
  });

  it("only passes plausible scopes through", () => {
    expect(safeScope("repo")).toBe("repo");
    expect(safeScope("public_repo,user:email")).toBe("public_repo,user:email");
    expect(safeScope("<script>")).toBe("repo");
    expect(safeScope(null)).toBe("repo");
  });

  it("escapes the handshake payload so a token cannot break out of the script", () => {
    const page = renderHandshake({ token: "abc</script><img src=x>" });
    expect(page).toContain("authorization:github:success:");
    expect(page).not.toContain("</script><img");
    expect(page).toContain("\\u003c/script>");
    expect(renderHandshake({ error: "nope" })).toContain("authorization:github:error:");
  });

  it("turns GitHub's token response, error response and network failure into a result", async () => {
    const ok = async () => new Response(JSON.stringify({ access_token: "tok" }));
    const bad = async () => new Response(JSON.stringify({ error: "bad_verification_code", error_description: "Bad code" }));
    const down = async () => {
      throw new Error("offline");
    };
    const params = { clientId: "i", clientSecret: "s", code: "c", origin: "https://x" };
    expect(await exchangeCode(params, ok as typeof fetch)).toEqual({ token: "tok" });
    expect(await exchangeCode(params, bad as typeof fetch)).toEqual({ error: "Bad code" });
    expect(await exchangeCode(params, down as typeof fetch)).toEqual({ error: "Token exchange request failed." });
  });
});
