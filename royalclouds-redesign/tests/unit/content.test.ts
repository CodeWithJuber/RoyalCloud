import { describe, expect, it } from "vitest";
import { siteContent } from "@/lib/content";

describe("siteContent", () => {
  it("contains validated real Royal Clouds plan data", () => {
    expect(siteContent.plans.length).toBeGreaterThanOrEqual(4);
    expect(siteContent.plans.map((plan) => plan.name)).toContain("SSD Shared Hosting");
    expect(siteContent.trustBadges).toContain("99.99% Uptime SLA");
  });
});
