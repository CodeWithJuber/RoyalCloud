import { describe, expect, it } from "vitest";
import { localPages } from "@/data/pages";
import { sitePageSchema } from "@/lib/content-schema";
import { CONTENT_ROUTES, REDIRECTS } from "@/lib/routes";

describe("route migration contract", () => {
  it("preserves all 58 indexable content routes", () => {
    expect(CONTENT_ROUTES).toHaveLength(58);
    expect(localPages.size).toBe(58);
  });

  it("defines all seven approved redirects", () => {
    expect(REDIRECTS.size).toBe(7);
    expect(REDIRECTS.get("/domains")?.destination).toContain("domain=register");
    expect(REDIRECTS.get("/login")?.destination).toContain("/login");
  });

  it("gives every route valid structured fallback content", () => {
    for (const route of CONTENT_ROUTES) {
      const page = localPages.get(route);
      expect(page, route).toBeDefined();
      expect(sitePageSchema.safeParse(page).success, route).toBe(true);
      expect(page?.seo.canonicalPath).toBe(route);
      expect(page?.blocks[0]?.component).toBe("hero");
    }
  });

  it("keeps every page title and description unique", () => {
    const titles = [...localPages.values()].map((page) => page.seo.title);
    const descriptions = [...localPages.values()].map((page) => page.seo.description);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });
});
