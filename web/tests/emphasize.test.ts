import { describe, expect, it } from "vitest";
import { isValidElement } from "react";
import { emphasize, plainTitle } from "@/lib/emphasize";

describe("emphasize", () => {
  it("turns <em> accents into elements and keeps the surrounding text", () => {
    const nodes = emphasize("Hosting with <em>24/7 Friendly Support</em> included");
    expect(nodes).toHaveLength(3);
    expect(nodes[0]).toBe("Hosting with ");
    expect(isValidElement(nodes[1])).toBe(true);
    expect((nodes[1] as { props: { children: string } }).props.children).toBe("24/7 Friendly Support");
    expect(nodes[2]).toBe(" included");
  });

  it("returns a single string when there is no accent", () => {
    expect(emphasize("Plain title")).toEqual(["Plain title"]);
  });

  it("decodes entities and drops any other tag", () => {
    expect(emphasize("Fast &amp; secure <strong>hosting</strong>")).toEqual(["Fast & secure hosting"]);
    expect(plainTitle("A <em>B</em> &nbsp;C")).toBe("A B  C");
  });

  it("handles empty and accent-only titles", () => {
    expect(emphasize("")).toEqual([]);
    const only = emphasize("<em>Only</em>");
    expect(only).toHaveLength(1);
    expect(isValidElement(only[0])).toBe(true);
  });
});
