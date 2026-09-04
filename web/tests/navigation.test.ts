import { describe, expect, it } from "vitest";
import {
  HEADER_ACTIONS,
  HEADER_GROUPS,
  HEADER_LINKS,
  isReachable,
  primaryAction,
  signInAction,
} from "../lib/navigation";
import { royalIconRegistry } from "../theme/icons";

describe("header navigation", () => {
  it("only links to content routes, declared redirects or absolute URLs", () => {
    for (const group of HEADER_GROUPS) {
      expect(group.links.length, group.text).toBeGreaterThan(0);
      for (const link of group.links) expect(isReachable(link.href), `${group.text} → ${link.href}`).toBe(true);
    }
    for (const link of HEADER_LINKS) expect(isReachable(link.href), link.href).toBe(true);
    expect(isReachable("/blog")).toBe(false);
    expect(HEADER_LINKS.find((l) => l.text === "Blog")?.href).toMatch(/^https:\/\//);
  });

  it("exposes every hosting product with an icon that exists in the theme registry", () => {
    const hosting = HEADER_GROUPS.find((g) => g.text === "Hosting");
    expect(hosting?.links.length).toBeGreaterThanOrEqual(8);
    for (const group of HEADER_GROUPS) {
      for (const link of group.links) {
        expect(link.icon, `${link.text} has no icon`).toBeTruthy();
        expect(Object.keys(royalIconRegistry), `${link.text}: icon ${link.icon}`).toContain(link.icon);
        expect(link.description, `${link.text} has no description`).toBeTruthy();
      }
    }
  });

  it("keeps both account actions on the WHMCS portal", () => {
    expect(HEADER_ACTIONS).toHaveLength(2);
    for (const action of HEADER_ACTIONS) expect(action.href).toMatch(/^https:\/\/my\.royalclouds\.net\//);
    expect(signInAction().text).toBe("Sign in");
    expect(primaryAction().text).toBe("Get started");
  });
});
