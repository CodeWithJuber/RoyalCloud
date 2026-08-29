import { describe, expect, it } from "vitest";
import {
  contrastRatio,
  relativeLuminance,
  checkPair,
} from "./check-contrast.mjs";

describe("relativeLuminance", () => {
  it("returns 0 for black and 1 for white", () => {
    expect(relativeLuminance("#000000")).toBeCloseTo(0, 5);
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1, 5);
  });

  it("accepts shorthand hex", () => {
    expect(relativeLuminance("#fff")).toBeCloseTo(1, 5);
  });

  it("throws on malformed input rather than silently scoring it", () => {
    expect(() => relativeLuminance("not-a-color")).toThrow();
    expect(() => relativeLuminance("#12345")).toThrow();
  });
});

describe("contrastRatio", () => {
  it("gives 21:1 for black on white", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
  });

  it("gives 1:1 for a color against itself", () => {
    expect(contrastRatio("#673de6", "#673de6")).toBeCloseTo(1, 5);
  });

  it("is order-independent", () => {
    expect(contrastRatio("#673de6", "#ffffff")).toBeCloseTo(
      contrastRatio("#ffffff", "#673de6"),
      5,
    );
  });
});

describe("checkPair", () => {
  it("requires 4.5:1 for body text and fails a known-bad pair", () => {
    // #999 on white is 2.85:1 — one of the three documented v2 failures.
    const result = checkPair({
      fg: "#999999",
      bg: "#ffffff",
      label: "old body",
      size: "body",
    });
    expect(result.required).toBe(4.5);
    expect(result.pass).toBe(false);
  });

  it("requires only 3:1 for large text", () => {
    const result = checkPair({
      fg: "#767676",
      bg: "#ffffff",
      label: "large",
      size: "large",
    });
    expect(result.required).toBe(3);
    expect(result.pass).toBe(true);
  });

  it("passes the new body color on white", () => {
    const result = checkPair({
      fg: "#595b68",
      bg: "#ffffff",
      label: "new body",
      size: "body",
    });
    expect(result.pass).toBe(true);
  });
});
