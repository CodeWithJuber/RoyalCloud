import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/** Every content file, so a dead anchor cannot be added to a new page either. */
function contentFiles(dir = "content"): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return contentFiles(path);
    return entry.name.endsWith(".md") ? [path] : [];
  });
}

describe("in-page anchors", () => {
  it("every href: '#target' has a section with that id on the same page", () => {
    const dead: string[] = [];
    for (const file of contentFiles()) {
      const text = readFileSync(file, "utf8");
      const ids = new Set(
        [...text.matchAll(/^\s+id:\s*([A-Za-z0-9_-]+)\s*$/gm)].map((m) => m[1]),
      );
      /* The plan finder mints its own anchor when the page does not name one. */
      if (/^\s+- type: planfinder\s*$/m.test(text)) ids.add("planfinder");
      for (const m of text.matchAll(/href:\s*"?#([A-Za-z0-9_-]+)"?/g)) {
        if (!ids.has(m[1])) dead.push(`${file} -> #${m[1]}`);
      }
    }
    expect(dead).toEqual([]);
  });
});
