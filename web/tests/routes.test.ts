import { describe, expect, it } from "vitest";
import { loadPage } from "../lib/content";
import { CONTENT_ROUTES, REDIRECTS } from "../lib/routes";

describe("route migration contract", () => {
  it("preserves all 60 content routes", () => {
    expect(CONTENT_ROUTES).toHaveLength(60);
  });

  it("defines all seven approved redirects", () => {
    expect(REDIRECTS).toHaveLength(7);
    const map = new Map(REDIRECTS.map((r) => [r.source, r]));
    expect(map.get("/domains")?.destination).toContain("domain=register");
    expect(map.get("/login")?.destination).toContain("/login");
    expect(map.get("/shared-hosting.php")?.statusCode).toBe(301);
  });

  it("gives every route valid, renderable content", () => {
    for (const route of CONTENT_ROUTES) {
      const name = route === "/" ? "index" : route.slice(1);
      const page = loadPage(name);
      expect(page, route).toBeDefined();
      expect(page!.sections.length, route).toBeGreaterThan(0);
    }
  });

  it("keeps every page title and description unique", () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    for (const route of CONTENT_ROUTES) {
      const name = route === "/" ? "index" : route.slice(1);
      const page = loadPage(name)!;
      const title = page.metadata?.title ?? page.title;
      const description = page.metadata?.description ?? "";
      expect(titles.has(title), `duplicate title: ${title}`).toBe(false);
      expect(descriptions.has(description), `duplicate description on ${route}`).toBe(false);
      titles.add(title);
      descriptions.add(description);
    }
  });

  it("never lets WHMCS checkout links drift", () => {
    for (const route of CONTENT_ROUTES) {
      const name = route === "/" ? "index" : route.slice(1);
      const page = loadPage(name)!;
      for (const section of page.sections) {
        for (const key of ["primaryCta", "secondaryCta"] as const) {
          const cta = (section as Record<string, unknown>)[key] as
            | { href?: string }
            | undefined;
          if (!cta?.href) continue;
          if (cta.href.startsWith("http")) {
            expect(
              cta.href.startsWith("https://my.royalclouds.net"),
              `${route} CTA points off-platform: ${cta.href}`,
            ).toBe(true);
          }
        }
      }
    }
  });
});
