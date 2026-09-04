import type { PlanTier } from "@/components/sections/PlanCards";
import type { PlanFile } from "@/lib/plans";

/**
 * Comparison-table helpers — pure, unit-tested. Rows are built by feature
 * index (tier N's feature i sits under tier 1's feature i, as the decks are
 * authored), then grouped by a deterministic keyword map. Cells are never
 * re-indexed, so a row always compares like with like.
 */
export const GROUP_ORDER = [
  "Compute",
  "Storage & transfer",
  "Network",
  "Sites & email",
  "Included",
] as const;
export type Group = (typeof GROUP_ORDER)[number];

const RULES: [Group, RegExp][] = [
  ["Compute", /\b(vcpu|cores?|cpu|ghz|ram|ddr\d?)\b/i],
  ["Storage & transfer", /\b(ssd|nvme|storage|disk|raid|bandwidth|transfer)\b/i],
  ["Network", /\b(ipv4|ipv6|ips?|ddos|network|uplink|port)\b/i],
  ["Sites & email", /\b(domains?|websites?|sites?|email|mailboxes|databases?|accounts?|subdomains?)\b/i],
];

export function groupFor(feature: string): Group {
  for (const [group, pattern] of RULES) {
    if (pattern.test(feature)) return group;
  }
  return "Included";
}

/* "10 GB SSD Storage" → "SSD Storage", "2 × 250 GB SSD" → "SSD",
   "8 Cores @ 2.26 GHz" → "Cores" — the quantity lives in the cells. */
export function featureLabel(feature: string): string {
  const label = feature
    .replace(/\s*@.*$/, "")
    .replace(/^\d+\s*[×x]\s*/i, "")
    .replace(/^(unlimited|free|\d+[\w.]*)\s+(gb\s+|tb\s+|mb\s+)?/i, "")
    .trim();
  return label.length > 0 ? label : feature;
}

export interface CompareRow {
  label: string;
  cells: string[];
  /** Real explanatory copy from the deck's highlights, when a title matches. */
  tooltip?: string;
}

export interface RowGroup {
  group: Group;
  rows: CompareRow[];
}

const normalise = (text: string) => text.toLowerCase().replace(/^free\s+/, "").trim();

/** Only real copy: a highlight whose title matches the row label, else nothing. */
export function tooltipFor(label: string, highlights?: PlanFile["highlights"]): string | undefined {
  if (!highlights) return undefined;
  const wanted = normalise(label);
  if (wanted.length < 4) return undefined;
  const hit = highlights.find((h) => {
    const title = normalise(h.title);
    return title === wanted || title.includes(wanted) || wanted.includes(title);
  });
  return hit?.text;
}

export function groupRows(tiers: PlanTier[], highlights?: PlanFile["highlights"]): RowGroup[] {
  const first = tiers[0];
  if (!first) return [];
  const rowCount = Math.max(0, ...tiers.map((tier) => tier.features.length));
  const buckets = new Map<Group, CompareRow[]>();
  for (let i = 0; i < rowCount; i += 1) {
    const source = first.features[i] ?? tiers.find((tier) => tier.features[i])?.features[i] ?? "";
    if (!source) continue;
    const label = featureLabel(source);
    const row: CompareRow = {
      label,
      cells: tiers.map((tier) => tier.features[i] ?? "—"),
      tooltip: tooltipFor(label, highlights),
    };
    const group = groupFor(source);
    buckets.set(group, [...(buckets.get(group) ?? []), row]);
  }
  return GROUP_ORDER.filter((group) => buckets.has(group)).map((group) => ({
    group,
    rows: buckets.get(group) ?? [],
  }));
}
