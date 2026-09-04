/**
 * One-click deploy catalogue: groups the names authored in `osstrip` items
 * into operating systems, control panels and apps. Descriptions and links
 * are only present where they are copied from a real source (a plan deck's
 * highlights or the page's own copy) — the test suite enforces it — so the
 * grid never claims an offering the site doesn't state.
 */
export type DeployGroup = "os" | "panel" | "app";

export const GROUP_ORDER: DeployGroup[] = ["os", "panel", "app"];
export const GROUP_LABEL: Record<DeployGroup, string> = {
  os: "Operating systems",
  panel: "Control panels",
  app: "Apps",
};

export interface DeployEntry {
  group: DeployGroup;
  /** Product page for the entry (must be a content route). */
  href?: string;
  /** Real copy; `source` names where it was taken from verbatim. */
  text?: string;
  source?: { deck: string } | { page: string };
}

export const DEPLOY_CATALOG: Record<string, DeployEntry> = {
  Ubuntu: { group: "os" },
  Debian: { group: "os" },
  Fedora: { group: "os" },
  CentOS: { group: "os" },
  "CentOS Stream": { group: "os" },
  "Rocky Linux": { group: "os" },
  AlmaLinux: { group: "os" },
  openSUSE: { group: "os" },
  Scientific: { group: "os" },
  cPanel: {
    group: "panel",
    href: "/cpanel-hosting",
    text: "Manage domains, email, databases and files from the world's favourite panel.",
    source: { deck: "cpanel" },
  },
  CyberPanel: {
    group: "panel",
    href: "/cyberpanel-vps-hosting",
    text: "CyberPanel + OpenLiteSpeed and LSCache deploy a tuned WordPress stack instantly.",
    source: { deck: "cyberpanel" },
  },
  "WHM/cPanel": {
    group: "panel",
    href: "/reseller-hosting",
    text: "Industry-standard control panels to manage every client account.",
    source: { deck: "reseller" },
  },
  WordPress: {
    group: "app",
    text: "Create WordPress sites, manage files and databases from one CyberPanel dashboard.",
    source: { page: "cyberpanel-vps-hosting" },
  },
};

export const groupOf = (name: string): DeployGroup | "other" =>
  DEPLOY_CATALOG[name]?.group ?? "other";

/** Distinct groups present in a list of authored names, in display order. */
export const groupsIn = (names: string[]): DeployGroup[] =>
  GROUP_ORDER.filter((group) => names.some((name) => groupOf(name) === group));
