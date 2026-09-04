import { describe, expect, it } from "vitest";
import { PLAN_FILES } from "@/lib/plans";
import {
  groupFeatures,
  includeIcon,
  parseIncludes,
  pickSpecs,
  restFeatures,
  splitSpec,
} from "@/lib/plan-specs";

describe("splitSpec", () => {
  it("separates the quantity from the label", () => {
    expect(splitSpec("10 GB SSD Storage")).toEqual({ value: "10 GB", label: "SSD Storage" });
    expect(splitSpec("4 vCPU Cores")).toEqual({ value: "4", label: "vCPU Cores" });
    expect(splitSpec("8 Cores @ 2.26 GHz")).toEqual({ value: "8", label: "Cores @ 2.26 GHz" });
    expect(splitSpec("2 × 250 GB SSD")).toEqual({ value: "2 × 250 GB", label: "SSD" });
    expect(splitSpec("Unlimited Bandwidth")).toEqual({ value: "Unlimited", label: "Bandwidth" });
    expect(splitSpec("1 Website")).toEqual({ value: "1", label: "Website" });
  });

  it("returns null for features without a leading quantity", () => {
    expect(splitSpec("Full Root Access")).toBeNull();
    expect(splitSpec("Free SSL & cPanel")).toBeNull();
    expect(splitSpec("")).toBeNull();
  });
});

describe("pickSpecs", () => {
  it("leads with compute for server decks", () => {
    const keys = pickSpecs(PLAN_FILES.vps.tiers[0].features).map((s) => s.key);
    expect(keys).toEqual(["cpu", "ram", "storage", "bandwidth"]);
  });

  it("leads with sites for shared and WordPress decks", () => {
    expect(pickSpecs(PLAN_FILES.wordpress.tiers[0].features).map((s) => s.key)).toEqual([
      "sites",
      "storage",
      "bandwidth",
      "email",
    ]);
    expect(pickSpecs(PLAN_FILES.shared.tiers[0].features).map((s) => s.key)).toEqual([
      "sites",
      "storage",
      "bandwidth",
      "email",
    ]);
  });

  it("leads with cPanel accounts for the reseller deck", () => {
    const specs = pickSpecs(PLAN_FILES.reseller.tiers[0].features);
    expect(specs[0]).toMatchObject({ key: "accounts", value: "25", label: "cPanel Accounts" });
  });

  it("gives every tier of every deck at least three specs, all read from real features", () => {
    for (const file of Object.values(PLAN_FILES)) {
      for (const tier of file.tiers) {
        const specs = pickSpecs(tier.features);
        expect(specs.length).toBeGreaterThanOrEqual(3);
        expect(specs.length).toBeLessThanOrEqual(4);
        for (const spec of specs) expect(tier.features).toContain(spec.feature);
        const rest = restFeatures(tier.features, specs);
        expect(rest.length + specs.length).toBe(tier.features.length);
      }
    }
  });
});

describe("groupFeatures", () => {
  it("buckets like the comparison table and drops empty groups", () => {
    const groups = groupFeatures(["1 Dedicated IPv4", "Full Root Access", "Free Setup"]);
    expect(groups.map((g) => g.group)).toEqual(["Network", "Included"]);
    expect(groups[1].features).toEqual(["Full Root Access", "Free Setup"]);
  });
});

describe("parseIncludes", () => {
  it("splits a dotted deck note into items and strips the final period", () => {
    expect(parseIncludes("cPanel · LiteSpeed + LSCache · Cloudflare CDN · Free SSL.")).toEqual([
      "cPanel",
      "LiteSpeed + LSCache",
      "Cloudflare CDN",
      "Free SSL",
    ]);
  });

  it("leaves prose notes alone", () => {
    expect(parseIncludes("We manage the server, you ship the project.")).toBeNull();
    expect(parseIncludes("A · B")).toBeNull();
    expect(parseIncludes(undefined)).toBeNull();
  });

  it("every dotted billingNote in the catalog parses into a strip", () => {
    for (const file of Object.values(PLAN_FILES)) {
      if (!file.billingNote?.includes("·")) continue;
      const items = parseIncludes(file.billingNote);
      expect(items).not.toBeNull();
      expect(items?.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("includeIcon", () => {
  it("picks a semantic icon and falls back to a check", () => {
    expect(includeIcon("Free SSL")).toBe("lock");
    expect(includeIcon("24/7 support")).toBe("headset");
    expect(includeIcon("DDoS protection")).toBe("shield");
    expect(includeIcon("LiteSpeed + LSCache")).toBe("bolt");
    expect(includeIcon("Softaculous")).toBe("apps");
    expect(includeIcon("Something else")).toBe("check");
  });
});
