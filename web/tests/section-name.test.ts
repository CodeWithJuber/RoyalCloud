import { describe, expect, it } from "vitest";
import { sectionName, sectionTitleId } from "@/lib/section-name";

describe("sectionName", () => {
  it("points at the heading when the section has an anchor id", () => {
    expect(sectionName("pricing", "Plans")).toEqual({ "aria-labelledby": "pricing-title" });
    expect(sectionTitleId("pricing")).toBe("pricing-title");
  });

  it("labels the section directly when it has no id to point at", () => {
    expect(sectionName(undefined, "Why Royal Clouds")).toEqual({
      "aria-label": "Why Royal Clouds",
    });
    expect(sectionTitleId(undefined)).toBeUndefined();
  });

  it("names nothing when there is no title — an unnamed band beats a wrong name", () => {
    expect(sectionName("pricing", undefined)).toEqual({});
    expect(sectionName(undefined, undefined)).toEqual({});
    expect(sectionName("pricing", "")).toEqual({});
  });
});
