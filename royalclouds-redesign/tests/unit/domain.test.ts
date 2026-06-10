import { describe, expect, it } from "vitest";
import { buildDomainSearchUrl } from "@/lib/domain";

describe("buildDomainSearchUrl", () => {
  it("builds a secure Royal Clouds cart URL for a valid domain", () => {
    const url = buildDomainSearchUrl({ name: "ExampleSite", tld: ".net" }, "https://my.royalclouds.net");
    expect(url).toBe("https://my.royalclouds.net/cart.php?a=add&domain=register&query=examplesite.net");
  });

  it("rejects unsafe domain labels", () => {
    expect(() => buildDomainSearchUrl({ name: "bad/name", tld: ".com" }, "https://my.royalclouds.net")).toThrow();
  });

  it("rejects non-HTTPS portals", () => {
    expect(() => buildDomainSearchUrl({ name: "safe", tld: ".com" }, "http://example.com")).toThrow("Portal base must use HTTPS");
  });
});
