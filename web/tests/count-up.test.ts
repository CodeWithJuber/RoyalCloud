import { describe, expect, it } from "vitest";
import { easeOutCubic, formatCountable, parseCountable } from "../lib/count-up";

/* Every stat value currently authored in content/ — the animated ones must
   land on the exact string, the rest must stay static. */
const ANIMATED = ["99.99%", "15x", "9.6/10", "200+", "6", "30", "10x", "1,000+", "100%", "$12"];
const STATIC = ["24/7", "1-click", "<1s", "Daily", "N+1", "1M+", "24/7/365", "2-3 days", "1", "$1.99", "Free"];

describe("count-up parsing", () => {
  it("parses plain leading numbers with harmless suffixes", () => {
    expect(parseCountable("99.99%")).toMatchObject({ value: 99.99, decimals: 2, suffix: "%", prefix: "" });
    expect(parseCountable("15x")).toMatchObject({ value: 15, decimals: 0, suffix: "x" });
    expect(parseCountable("9.6/10")).toMatchObject({ value: 9.6, decimals: 1, suffix: "/10" });
    expect(parseCountable("1,000+")).toMatchObject({ value: 1000, grouped: true, suffix: "+" });
    expect(parseCountable("$12")).toMatchObject({ prefix: "$", value: 12, decimals: 0 });
    for (const raw of ANIMATED) expect(parseCountable(raw), raw).not.toBeNull();
  });

  it("leaves labels, ratios, ranges and tiny numbers static", () => {
    for (const raw of STATIC) expect(parseCountable(raw), raw).toBeNull();
  });

  it("formats intermediate frames and lands on the authored string", () => {
    const pct = parseCountable("99.99%")!;
    expect(formatCountable(pct, 0)).toBe("0.00%");
    expect(formatCountable(pct, 1)).toBe("99.99%");
    expect(formatCountable(parseCountable("80%")!, 0.5)).toBe("40%");
    const big = parseCountable("1,000+")!;
    expect(formatCountable(big, 0.5)).toBe("500+");
    expect(formatCountable(big, 0.9995)).toBe("1,000+");
    expect(formatCountable(big, 1)).toBe("1,000+");
    for (const raw of ANIMATED) expect(formatCountable(parseCountable(raw)!, 1), raw).toBe(raw);
  });

  it("eases out and stays within [0, 1]", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
    expect(easeOutCubic(0.5)).toBeLessThan(1);
  });
});
