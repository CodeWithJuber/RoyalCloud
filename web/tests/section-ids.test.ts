import { describe, expect, it } from "vitest";
import { withSectionIds } from "../lib/section-ids";
import { loadPage } from "../lib/content";
import { CONTENT_ROUTES } from "../lib/routes";

const slugOf = (route: string) => (route === "/" ? "index" : route.slice(1));

describe("section anchors", () => {
  it("prefers an explicit id and falls back to a per-type default", () => {
    const out = withSectionIds([
      { type: "hero" },
      { type: "products", id: "plans" },
      { type: "pricing" },
      { type: "comparison" },
      { type: "faq" },
      { type: "cta" },
    ]);
    expect(out.map((s) => s.anchor)).toEqual([null, "plans", "pricing", "compare", "faq", null]);
  });

  it("suffixes repeated types so anchors stay unique", () => {
    const out = withSectionIds([{ type: "features" }, { type: "features" }, { type: "features" }]);
    expect(out.map((s) => s.anchor)).toEqual(["features", "features-2", "features-3"]);
  });

  it("ignores empty or non-string ids", () => {
    const out = withSectionIds([{ type: "pricing", id: "" }, { type: "pricing", id: 42 }]);
    expect(out.map((s) => s.anchor)).toEqual(["pricing", "pricing-2"]);
  });

  it("yields unique anchors on every content route", () => {
    for (const route of CONTENT_ROUTES) {
      const page = loadPage(slugOf(route));
      expect(page, route).not.toBeNull();
      const anchors = withSectionIds(page!.sections)
        .map((s) => s.anchor)
        .filter((a): a is string => a !== null);
      expect(new Set(anchors).size, route).toBe(anchors.length);
    }
  });
});
