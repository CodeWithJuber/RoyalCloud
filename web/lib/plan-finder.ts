import { PLAN_FILES } from "@/lib/plans";
import type { IntentId } from "@/lib/intents";

/**
 * Plan finder logic — pure, so every path is unit-tested. Each answer set
 * maps onto a REAL tier of a REAL deck in the catalog (lib/plans.ts); budget
 * bands are derived from the deck's actual prices, never typed by hand.
 */
export type Build = IntentId;
export type Stack = "cpanel" | "cyberpanel" | "wpmanaged" | "root" | "managed" | "unsure";
export type Size = "low" | "mid" | "high";

export interface FinderOption<Id extends string = string> {
  id: Id;
  icon: string;
  title: string;
  text: string;
}

export const BUILD_OPTIONS: FinderOption<Build>[] = [
  { id: "shared", icon: "globe", title: "A website or blog", text: "Company site, portfolio or blog" },
  { id: "wordpress", icon: "wordpress", title: "A WordPress site", text: "WordPress with updates and caching handled" },
  { id: "store", icon: "wallet", title: "An online store", text: "WooCommerce or another shop on WordPress" },
  { id: "vps", icon: "terminal", title: "An app or custom stack", text: "Root access, your own OS and services" },
  { id: "reseller", icon: "users", title: "Hosting for my clients", text: "White-label cPanel accounts under your brand" },
  { id: "dedicated", icon: "server", title: "High-traffic or enterprise", text: "Single-tenant hardware, maximum resources" },
];

export const STACK_OPTIONS: FinderOption<Stack>[] = [
  { id: "cpanel", icon: "apps", title: "cPanel", text: "The familiar panel for domains, email and files" },
  { id: "cyberpanel", icon: "bolt", title: "CyberPanel + OpenLiteSpeed", text: "A tuned WordPress stack with LSCache" },
  { id: "wpmanaged", icon: "wordpress", title: "Managed WordPress", text: "Updates, security and backups handled for you" },
  { id: "root", icon: "terminal", title: "Plain OS, root access", text: "Bring your own stack — Ubuntu, Debian, AlmaLinux…" },
  { id: "managed", icon: "shield", title: "Managed for me", text: "We patch, secure, monitor and back up" },
  { id: "unsure", icon: "settings", title: "Not sure yet", text: "We'll pick the simplest fit" },
];

export const SIZE_OPTIONS: FinderOption<Size>[] = [
  { id: "low", icon: "rocket", title: "Just starting out", text: "A first site, a test project, light traffic" },
  { id: "mid", icon: "gauge", title: "Growing steadily", text: "Regular visitors, a store, several sites" },
  { id: "high", icon: "scale", title: "Heavy or critical", text: "High traffic, production apps, many sites" },
];

/** Which stacks make sense for each build — the second step shows only these. */
export const STACKS_FOR: Record<Build, Stack[]> = {
  shared: ["cpanel", "wpmanaged", "unsure"],
  wordpress: ["wpmanaged", "cyberpanel", "cpanel"],
  store: ["wpmanaged", "cyberpanel", "cpanel"],
  vps: ["root", "cyberpanel", "managed", "unsure"],
  reseller: ["cpanel"],
  dedicated: ["root", "managed"],
};

/** The deck a build + stack pair lands on. Every value is a key of PLAN_FILES. */
export function deckFor(build: Build, stack: Stack): string {
  switch (build) {
    case "shared":
      return stack === "cpanel" ? "cpanel" : stack === "wpmanaged" ? "wordpress" : "shared";
    case "wordpress":
    case "store":
      return stack === "cyberpanel" ? "cyberpanel" : stack === "cpanel" ? "shared" : "wordpress";
    case "vps":
      return stack === "cyberpanel" ? "cyberpanel" : stack === "managed" ? "cloud" : "vps";
    case "reseller":
      return "reseller";
    case "dedicated":
      return "dedicated";
  }
}

/* Tier index per size, by deck. Indexes name real tiers (see data/plans):
   shared/cpanel: Starter / Deluxe / Ultimate · wordpress: Managed I / II / III
   cyberpanel: VPS I / III / V · vps: VPS II / III / V · cloud: S / M / L
   reseller: R1 / R2 / R3 · dedicated: Dual Xeon L5520 / E3-1230v5 / Dual E5-2650v3 */
const SIZE_INDEX: Record<string, [number, number, number]> = {
  shared: [0, 2, 3],
  cpanel: [0, 2, 3],
  wordpress: [0, 1, 2],
  cyberpanel: [0, 2, 4],
  vps: [1, 2, 4],
  cloud: [0, 1, 2],
  reseller: [0, 1, 2],
  dedicated: [0, 1, 3],
};

export function sizeTierIndex(deckId: string, size: Size): number {
  const table = SIZE_INDEX[deckId] ?? [0, 1, 2];
  const index = size === "low" ? table[0] : size === "mid" ? table[1] : table[2];
  const last = (PLAN_FILES[deckId]?.tiers.length ?? 1) - 1;
  return Math.min(index, last);
}

export interface BudgetBand {
  id: string;
  label: string;
  /** Monthly USD cap; null = no fixed budget. */
  max: number | null;
}

const deckPrices = (deckId: string): number[] =>
  [...new Set((PLAN_FILES[deckId]?.tiers ?? []).map((tier) => parseFloat(tier.price)))]
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b);

/**
 * Two "up to" bands at roughly a third and two-thirds of the deck's price
 * ladder, plus an open band. Every cap is a price that really exists.
 */
export function budgetBands(deckId: string): BudgetBand[] {
  const prices = deckPrices(deckId);
  const open: BudgetBand = { id: "open", label: "No fixed budget", max: null };
  if (prices.length === 0) return [open];
  const n = prices.length;
  const lo = prices[Math.floor((n - 1) / 3)];
  const hi = prices[Math.round((2 * (n - 1)) / 3)];
  const bands: BudgetBand[] = [{ id: `upto-${lo}`, label: `Up to $${lo}/mo`, max: lo }];
  if (hi > lo) bands.push({ id: `upto-${hi}`, label: `Up to $${hi}/mo`, max: hi });
  bands.push(open);
  return bands;
}

export interface Recommendation {
  deckId: string;
  tierIndex: number;
  /** True when the budget cap forced a smaller tier than the size answer. */
  clamped: boolean;
}

export function recommend(build: Build, stack: Stack, size: Size, budgetMax: number | null): Recommendation {
  const deckId = deckFor(build, stack);
  const tiers = PLAN_FILES[deckId].tiers;
  const start = sizeTierIndex(deckId, size);
  if (budgetMax === null) return { deckId, tierIndex: start, clamped: false };
  let index = start;
  while (index > 0 && parseFloat(tiers[index].price) > budgetMax) index -= 1;
  return { deckId, tierIndex: index, clamped: index !== start };
}
