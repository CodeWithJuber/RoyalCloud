import { describe, expect, it } from "vitest";
import { buildSubnav } from "../lib/subnav";
import { withSectionIds } from "../lib/section-ids";
import { loadPage } from "../lib/content";
import { CONTENT_ROUTES } from "../lib/routes";

const navFor = (slug: string) => {
  const page = loadPage(slug);
  if (!page) throw new Error(`missing page ${slug}`);
  return buildSubnav(withSectionIds(page.sections));
};

describe("product sub-navigation", () => {
  it("is absent on pages without both pricing and a comparison table", () => {
    expect(navFor("index")).toBeNull();
    expect(navFor("compare-royalclouds-vps-plans")).toBeNull();
    expect(navFor("about")).toBeNull();
  });

  it("lists the KVM VPS page's sections in page order with its cheapest real tier", () => {
    const nav = navFor("kvm-vps-hosting");
    expect(nav).not.toBeNull();
    expect(nav!.links.map((l) => l.label)).toEqual(["Plans", "Compare", "Features", "FAQ"]);
    expect(nav!.links[0].href).toBe("#pricing");
    expect(nav!.cta).toEqual({ price: "4", period: "/mo", href: "#pricing" });
  });

  it("gives every product page a nav with at least Plans and Compare and a real price", () => {
    let count = 0;
    for (const route of CONTENT_ROUTES) {
      const nav = navFor(route === "/" ? "index" : route.slice(1));
      if (!nav) continue;
      count += 1;
      expect(nav.links.map((l) => l.label), route).toContain("Plans");
      expect(nav.links.map((l) => l.label), route).toContain("Compare");
      expect(nav.cta, route).not.toBeNull();
      expect(parseFloat(nav.cta!.price), route).toBeGreaterThan(0);
      expect(nav.cta!.href, route).toMatch(/^#/);
    }
    expect(count).toBeGreaterThanOrEqual(10);
  });

  it("dedupes repeated section types and skips sections without anchors", () => {
    const nav = buildSubnav(
      withSectionIds([
        { type: "hero" },
        { type: "pricing", plan: "vps" },
        { type: "features" },
        { type: "features" },
        { type: "comparison" },
      ]),
    );
    expect(nav!.links.map((l) => l.href)).toEqual(["#pricing", "#features", "#compare"]);
  });
});
