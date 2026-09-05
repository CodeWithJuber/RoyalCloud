import { describe, expect, it } from "vitest";
import { isExternalCta, targetProps } from "@/lib/external-link";

describe("isExternalCta", () => {
  it("treats an absolute http(s) href as leaving the site", () => {
    expect(isExternalCta({ text: "Buy", href: "https://my.royalclouds.net/cart.php" })).toBe(true);
    expect(isExternalCta({ text: "Buy", href: "http://example.com" })).toBe(true);
  });

  it("honours an explicit external flag on a relative href", () => {
    expect(isExternalCta({ text: "Docs", href: "/docs", external: true })).toBe(true);
  });

  it("keeps in-site links in-site", () => {
    expect(isExternalCta({ text: "Plans", href: "#plans" })).toBe(false);
    expect(isExternalCta({ text: "VPS", href: "/kvm-vps-hosting" })).toBe(false);
    expect(isExternalCta(undefined)).toBe(false);
  });

  it("only sets target/rel for links that really open a tab", () => {
    expect(targetProps({ text: "Buy", href: "https://x.test" })).toEqual({
      target: "_blank",
      rel: "noopener noreferrer",
    });
    expect(targetProps({ text: "Plans", href: "#plans" })).toEqual({});
  });
});
