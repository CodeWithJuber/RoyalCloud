import { describe, expect, it } from "vitest";
import {
  BUILD_OPTIONS,
  STACK_OPTIONS,
  STACKS_FOR,
  SIZE_OPTIONS,
  budgetBands,
  deckFor,
  recommend,
  sizeTierIndex,
  type Build,
  type Size,
} from "../lib/plan-finder";
import { INTENTS, PLAN_TO_INTENT, finderHref, isIntentId } from "../lib/intents";
import { PLAN_FILES } from "../lib/plans";

const builds = BUILD_OPTIONS.map((o) => o.id);
const sizes = SIZE_OPTIONS.map((o) => o.id);

describe("plan finder logic", () => {
  it("offers only known stacks for every build, and every build is an intent", () => {
    for (const build of builds) {
      expect(STACKS_FOR[build].length).toBeGreaterThan(0);
      for (const stack of STACKS_FOR[build]) {
        expect(STACK_OPTIONS.some((o) => o.id === stack), `${build}/${stack}`).toBe(true);
      }
      expect(isIntentId(build)).toBe(true);
    }
    expect(INTENTS.map((i) => i.id).sort()).toEqual([...builds].sort());
  });

  it("lands every build + stack on a real deck", () => {
    for (const build of builds) {
      for (const stack of STACKS_FOR[build]) {
        expect(PLAN_FILES[deckFor(build, stack)], `${build}/${stack}`).toBeDefined();
      }
    }
    expect(deckFor("vps", "managed")).toBe("cloud");
    expect(deckFor("shared", "cpanel")).toBe("cpanel");
    expect(deckFor("store", "cpanel")).toBe("shared");
  });

  it("derives budget bands from prices that exist in the deck", () => {
    for (const deckId of Object.keys(PLAN_FILES)) {
      const bands = budgetBands(deckId);
      const prices = PLAN_FILES[deckId].tiers.map((t) => parseFloat(t.price));
      expect(bands.at(-1)).toEqual({ id: "open", label: "No fixed budget", max: null });
      const caps = bands.slice(0, -1).map((b) => b.max as number);
      expect(caps.length).toBeGreaterThanOrEqual(1);
      for (const cap of caps) expect(prices, `${deckId} ${cap}`).toContain(cap);
      expect([...caps]).toEqual([...caps].sort((a, b) => a - b));
    }
    expect(budgetBands("vps").map((b) => b.max)).toEqual([8, 30, null]);
    expect(budgetBands("wordpress").map((b) => b.max)).toEqual([15, 25, null]);
  });

  it("recommends a real tier for every path, within the chosen budget", () => {
    for (const build of builds) {
      for (const stack of STACKS_FOR[build]) {
        const deckId = deckFor(build, stack);
        for (const size of sizes as Size[]) {
          for (const band of budgetBands(deckId)) {
            const rec = recommend(build as Build, stack, size, band.max);
            const tier = PLAN_FILES[rec.deckId].tiers[rec.tierIndex];
            expect(tier, `${build}/${stack}/${size}/${band.id}`).toBeDefined();
            expect(rec.deckId).toBe(deckId);
            if (band.max === null) {
              expect(rec.clamped).toBe(false);
              expect(rec.tierIndex).toBe(sizeTierIndex(deckId, size));
            } else {
              expect(parseFloat(tier.price)).toBeLessThanOrEqual(band.max);
              expect(rec.clamped).toBe(rec.tierIndex !== sizeTierIndex(deckId, size));
            }
          }
        }
      }
    }
  });

  it("clamps a heavy workload down to the budget and says so", () => {
    const rec = recommend("vps", "root", "high", 8);
    expect(rec).toEqual({ deckId: "vps", tierIndex: 1, clamped: true });
    expect(PLAN_FILES.vps.tiers[1].name).toBe("VPS II");
    const open = recommend("vps", "root", "high", null);
    expect(open.clamped).toBe(false);
    expect(PLAN_FILES.vps.tiers[open.tierIndex].name).toBe("VPS V");
  });

  it("maps every deck to an intent and builds finder deep links", () => {
    for (const deckId of Object.keys(PLAN_FILES)) {
      expect(isIntentId(PLAN_TO_INTENT[deckId]), deckId).toBe(true);
    }
    expect(finderHref("vps")).toBe("/?for=vps#planfinder");
    expect(finderHref()).toBe("/#planfinder");
    expect(isIntentId("nope")).toBe(false);
  });
});
