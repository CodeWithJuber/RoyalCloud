import { describe, expect, it } from "vitest";
import { BRAND_ICONS } from "@/lib/brand-icons";
import { brandFor, brandsIn } from "@/lib/brands";

describe("brand-icons registry", () => {
  it("every vendored icon has a 24×24 path and a six-digit brand colour", () => {
    for (const [slug, icon] of Object.entries(BRAND_ICONS)) {
      expect(icon.slug).toBe(slug);
      expect(icon.title.length).toBeGreaterThan(0);
      expect(icon.hex).toMatch(/^[0-9A-F]{6}$/);
      expect(icon.path.length).toBeGreaterThan(20);
      expect(icon.path.startsWith("M")).toBe(true);
    }
  });
});

describe("brandFor", () => {
  it("matches whole words inside feature copy, case-insensitively", () => {
    expect(brandFor("Free SSL & cPanel")?.slug).toBe("cpanel");
    expect(brandFor("25 cPanel Accounts")?.slug).toBe("cpanel");
    expect(brandFor("Free WHM/cPanel")?.slug).toBe("cpanel");
    expect(brandFor("Cloudflare CDN")?.slug).toBe("cloudflare");
    expect(brandFor("Rocky Linux")?.slug).toBe("rockylinux");
    expect(brandFor("CentOS Stream")?.slug).toBe("centos");
    expect(brandFor("Let's Encrypt")?.slug).toBe("letsencrypt");
  });

  it("returns wordmarks (no glyph) for brands Simple Icons lacks", () => {
    const ls = brandFor("LiteSpeed + LSCache");
    expect(ls?.slug).toBe("litespeed");
    expect(ls?.icon).toBeNull();
    expect(brandFor("CyberPanel Pre-Installed")?.icon).toBeNull();
    expect(brandFor("Softaculous Installer")?.title).toBe("Softaculous");
  });

  it("never matches a fragment or a generic word", () => {
    expect(brandFor("Control panel")).toBeNull();
    expect(brandFor("Weekly Backups")).toBeNull();
    expect(brandFor("Unlimited Bandwidth")).toBeNull();
    expect(brandFor("")).toBeNull();
  });
});

describe("brandsIn", () => {
  it("lists each brand once, in first-mention order", () => {
    const brands = brandsIn(["cPanel", "LiteSpeed + LSCache", "Cloudflare CDN", "Free SSL", "cPanel again"]);
    expect(brands.map((b) => b.slug)).toEqual(["cpanel", "litespeed", "cloudflare"]);
  });
});
