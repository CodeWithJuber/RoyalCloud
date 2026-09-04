import { GROUP_ORDER, groupFor, type Group } from "@/lib/feature-groups";

/**
 * Plan-card helpers — pure and unit-tested. Cards read their headline specs
 * straight from the deck's feature strings ("4 vCPU Cores" → 4 / vCPU Cores),
 * so a VPS card leads with compute and a shared card with sites and mail,
 * without a second copy of the data to keep in sync.
 */
export interface Spec {
  key: SpecKey;
  icon: string;
  /** The quantity — "4 GB", "Unlimited", "2 × 250 GB". */
  value: string;
  /** What it measures — "DDR4 RAM", "Bandwidth". */
  label: string;
  /** The feature string the spec was read from. */
  feature: string;
}

export type SpecKey = "cpu" | "ram" | "storage" | "bandwidth" | "sites" | "accounts" | "email";

const SPEC_RULES: { key: SpecKey; icon: string; test: RegExp }[] = [
  { key: "cpu", icon: "cpu", test: /\b(vcpu|cores?|cpu)\b/i },
  { key: "ram", icon: "server", test: /\b(ram|memory)\b/i },
  { key: "storage", icon: "database", test: /\b(ssd|nvme|storage|disk)\b/i },
  { key: "bandwidth", icon: "activity", test: /\b(bandwidth|transfer)\b/i },
  { key: "accounts", icon: "users", test: /\bcpanel\s+accounts?\b/i },
  { key: "sites", icon: "globe", test: /\b(websites?|domains?|sites)\b/i },
  { key: "email", icon: "mail", test: /\b(email|mailbox)/i },
];

/* Compute-first for servers; sites-first for shared and WordPress; storage-first
   for reseller decks (their headline unit is cPanel accounts). */
const ORDER_SERVER: SpecKey[] = ["cpu", "ram", "storage", "bandwidth"];
const ORDER_RESELLER: SpecKey[] = ["accounts", "storage", "bandwidth", "email"];
const ORDER_SITES: SpecKey[] = ["sites", "storage", "bandwidth", "email"];

const QUANTITY =
  /^(unlimited|\d[\d.,]*(?:\s*[×x]\s*\d[\d.,]*)?(?:\s*(?:gb|tb|mb|gbps|mbps))?)\s+(.+)$/i;

/** "10 GB SSD Storage" → { value: "10 GB", label: "SSD Storage" }; null when no leading quantity. */
export function splitSpec(feature: string): { value: string; label: string } | null {
  const match = feature.trim().match(QUANTITY);
  if (!match) return null;
  const value = match[1].replace(/\s+/g, " ").trim();
  const label = match[2].trim();
  if (label.length === 0) return null;
  return { value: /^unlimited$/i.test(value) ? "Unlimited" : value, label };
}

const specKeyFor = (feature: string): SpecKey | null =>
  SPEC_RULES.find((rule) => rule.test.test(feature))?.key ?? null;

/** Up to four headline specs, in the order that fits the deck family. */
export function pickSpecs(features: string[]): Spec[] {
  const found = new Map<SpecKey, Spec>();
  for (const feature of features) {
    const key = specKeyFor(feature);
    if (!key || found.has(key)) continue;
    const parts = splitSpec(feature);
    if (!parts) continue;
    const icon = SPEC_RULES.find((rule) => rule.key === key)?.icon ?? "check";
    found.set(key, { key, icon, feature, ...parts });
  }
  const order = found.has("cpu") || found.has("ram")
    ? ORDER_SERVER
    : found.has("accounts")
      ? ORDER_RESELLER
      : ORDER_SITES;
  return order.flatMap((key) => {
    const spec = found.get(key);
    return spec ? [spec] : [];
  }).slice(0, 4);
}

/** Features the spec tiles did not consume, in authored order. */
export function restFeatures(features: string[], specs: Spec[]): string[] {
  const used = new Set(specs.map((spec) => spec.feature));
  return features.filter((feature) => !used.has(feature));
}

export interface FeatureGroupList {
  group: Group;
  features: string[];
}

/** Remaining features bucketed like the comparison table, empty groups dropped. */
export function groupFeatures(features: string[]): FeatureGroupList[] {
  const buckets = new Map<Group, string[]>();
  for (const feature of features) {
    const group = groupFor(feature);
    buckets.set(group, [...(buckets.get(group) ?? []), feature]);
  }
  return GROUP_ORDER.filter((group) => buckets.has(group)).map((group) => ({
    group,
    features: buckets.get(group) ?? [],
  }));
}

/**
 * A deck note written as a "·"-separated list ("cPanel · Free SSL · 24/7
 * support.") becomes an "every plan includes" strip; prose stays a note.
 */
export function parseIncludes(note: string | undefined): string[] | null {
  if (!note || !note.includes("·")) return null;
  const parts = note
    .split("·")
    .map((part) => part.replace(/\.\s*$/, "").trim())
    .filter((part) => part.length > 0);
  return parts.length >= 3 ? parts : null;
}

/* Generic icon for an included item without a brand glyph. */
const INCLUDE_ICONS: [RegExp, string][] = [
  [/\blitespeed\b|\blscache\b|\bcache\b/i, "bolt"],
  [/\bcyberpanel\b|\bsoftaculous\b|\bcpanel\b|\bwhm\b/i, "apps"],
  [/\bcloudlinux\b/i, "server"],
  [/\bwhmcs\b/i, "billing"],
  [/\bssl\b|\bhttps\b/i, "lock"],
  [/\bbackups?\b|\bsnapshots?\b/i, "backup"],
  [/\bsupport\b|\b24\/7\b/i, "headset"],
  [/\bsetup\b|\bdeploy/i, "rocket"],
  [/\bddos\b|\bfirewall\b|\bsecurity\b|\bprotection\b/i, "shield"],
  [/\bip\b|\bipv4\b|\bipv6\b|\bcdn\b/i, "globe"],
  [/\bmigration\b/i, "migrate"],
  [/\broot\b|\bssh\b/i, "terminal"],
  [/\bwhite-?label\b|\bclients?\b/i, "users"],
  [/\bbilling\b/i, "billing"],
  [/\bmonitor/i, "activity"],
  [/\bupdates?\b/i, "refresh"],
  [/\bmanaged\b/i, "settings"],
  [/\bhardware\b|\bsingle-tenant\b/i, "server"],
];

export function includeIcon(label: string): string {
  return INCLUDE_ICONS.find(([pattern]) => pattern.test(label))?.[1] ?? "check";
}
