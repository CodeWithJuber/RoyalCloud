import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DEPLOY_CATALOG, GROUP_ORDER, groupOf, groupsIn } from "../lib/deploy-catalog";
import { PLAN_FILES } from "../lib/plans";
import { CONTENT_ROUTES } from "../lib/routes";

describe("deploy catalogue", () => {
  it("only carries descriptions copied verbatim from a named real source", () => {
    for (const [name, entry] of Object.entries(DEPLOY_CATALOG)) {
      if (!entry.text) continue;
      expect(entry.source, `${name} has text without a source`).toBeDefined();
      if (entry.source && "deck" in entry.source) {
        const deck = PLAN_FILES[entry.source.deck];
        expect(deck, `${name}: deck ${entry.source.deck}`).toBeDefined();
        expect(
          deck.highlights?.some((h) => h.text === entry.text),
          `${name}: text not found in ${entry.source.deck} highlights`,
        ).toBe(true);
      } else if (entry.source && "page" in entry.source) {
        const page = readFileSync(join(process.cwd(), "content", "pages", `${entry.source.page}.md`), "utf8");
        expect(page.includes(entry.text), `${name}: text not found in page copy`).toBe(true);
      }
    }
  });

  it("links only to content routes", () => {
    for (const [name, entry] of Object.entries(DEPLOY_CATALOG)) {
      if (entry.href) expect(CONTENT_ROUTES as readonly string[], name).toContain(entry.href);
    }
  });

  it("groups every authored OS name and leaves unknown names out of the tabs", () => {
    for (const name of ["Ubuntu", "Debian", "Fedora", "CentOS", "openSUSE", "Scientific", "Rocky Linux", "AlmaLinux", "CentOS Stream"]) {
      expect(groupOf(name), name).toBe("os");
    }
    expect(groupOf("CyberPanel")).toBe("panel");
    expect(groupOf("WordPress")).toBe("app");
    expect(groupOf("Plesk")).toBe("other");
    expect(groupsIn(["Ubuntu", "Debian"])).toEqual(["os"]);
    expect(groupsIn(["WordPress", "Ubuntu", "CyberPanel"])).toEqual(GROUP_ORDER);
    expect(groupsIn([])).toEqual([]);
  });
});
