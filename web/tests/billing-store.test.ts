import { describe, expect, it } from "vitest";
import {
  getBilling,
  hasAnnualSaving,
  maxSavePct,
  priceFor,
  savePct,
  setBilling,
  subscribeBilling,
  termLabel,
} from "../lib/billing-store";
import { PLAN_FILES } from "../lib/plans";

describe("billing store", () => {
  it("starts on annual, notifies subscribers once per change, and unsubscribes", () => {
    expect(getBilling()).toBe("annual");
    let seen = 0;
    const unsubscribe = subscribeBilling(() => {
      seen += 1;
    });
    setBilling("monthly");
    expect(getBilling()).toBe("monthly");
    expect(seen).toBe(1);
    setBilling("monthly");
    expect(seen).toBe(1);
    setBilling("annual");
    expect(seen).toBe(2);
    unsubscribe();
    setBilling("monthly");
    expect(seen).toBe(2);
    setBilling("annual");
  });

  it("computes real savings only", () => {
    expect(savePct({ price: "1.99", priceAnnual: "1.59" })).toBe(20);
    expect(savePct({ price: "4", priceAnnual: "3" })).toBe(25);
    expect(savePct({ price: "10", priceAnnual: "10" })).toBe(0);
    expect(savePct({ price: "10", priceAnnual: "12" })).toBe(0);
    expect(savePct({ price: "10" })).toBe(0);
    expect(savePct({ price: "Custom", priceAnnual: "Custom" })).toBe(0);
  });

  it("keeps every catalog saving inside 0–100 and reports the deck maximum", () => {
    for (const file of Object.values(PLAN_FILES)) {
      for (const tier of file.tiers) {
        const pct = savePct(tier);
        expect(pct, `${file.id} ${tier.name}`).toBeGreaterThanOrEqual(0);
        expect(pct, `${file.id} ${tier.name}`).toBeLessThan(100);
      }
      expect(maxSavePct(file.tiers)).toBe(Math.max(...file.tiers.map(savePct)));
    }
    expect(hasAnnualSaving(PLAN_FILES.vps.tiers)).toBe(true);
  });

  it("shows the active period's price with its term stated, never a renewal claim", () => {
    const tier = { price: "8", priceAnnual: "6" };
    expect(priceFor(tier, "annual")).toBe("6");
    expect(priceFor(tier, "monthly")).toBe("8");
    expect(priceFor({ price: "8" }, "annual")).toBe("8");
    expect(termLabel("annual")).toMatch(/billed yearly/);
    expect(termLabel("monthly")).toMatch(/billed monthly/);
    expect(termLabel("annual")).not.toMatch(/renew/i);
    expect(termLabel("monthly")).not.toMatch(/renew/i);
  });
});
