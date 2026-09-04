import { describe, expect, it } from "vitest";
import { GROUP_ORDER, featureLabel, groupFor, groupRows, tooltipFor } from "../lib/feature-groups";
import { PLAN_FILES } from "../lib/plans";

describe("comparison feature groups", () => {
  it("assigns every catalog feature to exactly one known group", () => {
    for (const file of Object.values(PLAN_FILES)) {
      for (const tier of file.tiers) {
        for (const feature of tier.features) {
          expect(GROUP_ORDER, `${file.id}: ${feature}`).toContain(groupFor(feature));
        }
      }
    }
  });

  it("groups the obvious spec lines where a buyer expects them", () => {
    expect(groupFor("2 vCPU Cores")).toBe("Compute");
    expect(groupFor("24 GB DDR3 RAM")).toBe("Compute");
    expect(groupFor("8 Cores @ 2.26 GHz")).toBe("Compute");
    expect(groupFor("2 × 250 GB SSD")).toBe("Storage & transfer");
    expect(groupFor("Unlimited Bandwidth")).toBe("Storage & transfer");
    expect(groupFor("1 Dedicated IPv4")).toBe("Network");
    expect(groupFor("DDoS Protection")).toBe("Network");
    expect(groupFor("25 cPanel Accounts")).toBe("Sites & email");
    expect(groupFor("5 Domains")).toBe("Sites & email");
    expect(groupFor("Full Root Access")).toBe("Included");
    expect(groupFor("Free Setup")).toBe("Included");
  });

  it("keeps the quantity in the cells and the noun in the label", () => {
    expect(featureLabel("10 GB SSD Storage")).toBe("SSD Storage");
    expect(featureLabel("2 × 250 GB SSD")).toBe("SSD");
    expect(featureLabel("8 Cores @ 2.26 GHz")).toBe("Cores");
    expect(featureLabel("Unlimited Bandwidth")).toBe("Bandwidth");
    expect(featureLabel("1 Dedicated IPv4")).toBe("Dedicated IPv4");
    expect(featureLabel("Full Root Access")).toBe("Full Root Access");
    expect(featureLabel("500")).toBe("500");
  });

  it("never re-indexes cells when grouping", () => {
    const vps = PLAN_FILES.vps;
    const groups = groupRows(vps.tiers, vps.highlights);
    expect(groups.map((g) => g.group)).toEqual(["Compute", "Storage & transfer", "Network", "Included"]);
    const allRows = groups.flatMap((g) => g.rows);
    expect(allRows).toHaveLength(vps.tiers[0].features.length);
    const cpu = allRows.find((r) => r.label === "vCPU Core");
    expect(cpu?.cells).toEqual(vps.tiers.map((t) => t.features[0]));
    for (const row of allRows) expect(row.cells).toHaveLength(vps.tiers.length);
  });

  it("only attaches tooltips backed by real highlight copy", () => {
    const vps = PLAN_FILES.vps;
    expect(tooltipFor("Full Root Access", vps.highlights)).toBe(
      vps.highlights?.find((h) => h.title === "Full Root Access")?.text,
    );
    expect(tooltipFor("DDoS Protection", vps.highlights)).toMatch(/DDoS|attack/i);
    expect(tooltipFor("Domains", PLAN_FILES.shared.highlights)).toBeUndefined();
    expect(tooltipFor("SSD", vps.highlights)).toBeUndefined();
    expect(tooltipFor("Setup", undefined)).toBeUndefined();
  });

  it("handles ragged decks by falling back to the first tier that has the row", () => {
    const groups = groupRows([
      { name: "A", price: "1", ctaUrl: "https://my.royalclouds.net/x", features: ["1 vCPU Core"] },
      { name: "B", price: "2", ctaUrl: "https://my.royalclouds.net/y", features: ["2 vCPU Cores", "Free Setup"] },
    ]);
    const rows = groups.flatMap((g) => g.rows);
    expect(rows.map((r) => r.label)).toEqual(["vCPU Core", "Setup"]);
    expect(rows[1].cells).toEqual(["—", "Free Setup"]);
  });
});
