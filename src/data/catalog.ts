/**
 * The real Royal Clouds product catalogue.
 *
 * PROVENANCE — every number below was read from a Royal Clouds system, not authored:
 *   - Prices (USD + INR), plan names, VPS/dedicated specs:
 *     https://my.royalclouds.net/store/{optimized-ssd-hosting-with-litespeed,
 *     semi-managed-ssd-kvm-vps,dedicated-servers}?currency={1,2}   read 2026-07-12
 *   - Shared-plan resource limits: https://royalclouds.net/shared-hosting   read 2026-07-11
 *
 * TWO FACTS THIS FILE ENCODES, BOTH VERIFIED AGAINST WHMCS:
 *
 * 1. BILLING IS MONTHLY-ONLY. Every product in the billing system is sold Monthly and
 *    only Monthly — there is no term ladder, no introductory rate, no renewal uplift.
 *    So `renewal === monthly` below is NOT a placeholder standing in for a number we
 *    could not find; it is the commercial fact, and it is the strongest thing the
 *    pricing page has to say. Do not "fix" it by inventing 12/24/48-month discount
 *    tiers — that would be fabricating a claim (DESIGN.md 3, 11).
 *
 * 2. INR IS REAL. WHMCS serves it live (currency=2). It was never a null to fill in.
 *
 * Prices flow one way: WHMCS -> here -> the page. Nothing downstream may invent one.
 */
import type {
  HostingPlan,
  PlanTelemetry,
  PlanTerm,
  PriceValue,
} from "@/types/content";

export const CATALOG_SOURCE = "https://my.royalclouds.net/store";
export const CATALOG_READ_AT = "2026-07-12";

const WHMCS_CART = "https://my.royalclouds.net/cart.php?a=add";

/** A plan exactly as the billing system sells it. `usd`/`inr` are the monthly rate. */
interface CatalogPlan {
  id: string;
  name: string;
  audience: string;
  usd: number;
  inr: number;
  features: string[];
  /* Real resource numbers, used to derive telemetry bars. Absent where a plan is
     genuinely unmetered — we chart what we can measure and stay quiet otherwise. */
  resources?: Record<string, number>;
  featured?: boolean;
}

/* ---------------------------------------------------------------------------
   Optimized SSD Hosting with LiteSpeed — 5 plans.
   The pre-redesign site advertised only 3 of these. All 5 are orderable today.
   --------------------------------------------------------------------------- */
export const SHARED_PLANS: CatalogPlan[] = [
  {
    id: "shared-starter",
    name: "Starter",
    audience: "One focused website",
    usd: 1.99,
    inr: 189.71,
    features: [
      "Host 1 domain",
      "10 GB SSD disk space",
      "100 GB bandwidth",
      "3 databases",
      "5 email accounts",
    ],
    resources: { storage: 10, bandwidth: 100, domains: 1 },
  },
  {
    id: "shared-economy",
    name: "Economy",
    audience: "A growing portfolio",
    usd: 3.99,
    inr: 380.38,
    features: [
      "Host 3 domains",
      "20 GB SSD disk space",
      "200 GB bandwidth",
      "10 databases",
      "10 email accounts",
    ],
    resources: { storage: 20, bandwidth: 200, domains: 3 },
  },
  {
    id: "shared-deluxe",
    name: "Deluxe",
    audience: "Multiple active sites",
    usd: 4.99,
    inr: 475.72,
    features: [
      "Host 5 domains",
      "30 GB SSD disk space",
      "300 GB bandwidth",
      "15 databases",
      "15 email accounts",
    ],
    resources: { storage: 30, bandwidth: 300, domains: 5 },
    featured: true,
  },
  {
    id: "shared-ultimate",
    name: "Ultimate",
    audience: "A busy agency roster",
    usd: 9.99,
    inr: 952.38,
    features: [
      "Host 10 domains",
      "50 GB SSD disk space",
      "500 GB bandwidth",
      "20 databases",
      "20 email accounts",
    ],
    resources: { storage: 50, bandwidth: 500, domains: 10 },
  },
  {
    id: "shared-expert",
    name: "Expert",
    audience: "Unmetered transfer and databases",
    usd: 19.99,
    inr: 1905.72,
    features: [
      "Host 20 domains",
      "100 GB SSD disk space",
      "Unlimited bandwidth",
      "Unlimited databases",
      "Unlimited email accounts",
    ],
    resources: { storage: 100, domains: 20 },
  },
];

/** Carried by every shared plan. Stated once rather than repeated on each card. */
export const SHARED_INCLUDED = [
  "Free SSL",
  "Free migration",
  "cPanel",
  "LiteSpeed web server",
  "1-click script installer",
  "24/7 technical support",
];

/* ---------------------------------------------------------------------------
   Semi-Managed SSD KVM VPS — 6 plans, specs verbatim from WHMCS.
   These six are also the price points the Configurator (DESIGN.md 11.1) snaps to,
   which is precisely why it never has to invent a per-unit rate.
   --------------------------------------------------------------------------- */
export const VPS_PLANS: CatalogPlan[] = [
  {
    id: "kvm-1",
    name: "KVM 1",
    audience: "Development and small services",
    usd: 4,
    inr: 381.34,
    features: [
      "1 vCPU",
      "1 GB RAM",
      "10 GB SSD",
      "0.5 TB bandwidth",
      "1 dedicated IP",
    ],
    resources: { vcpu: 1, ram: 1, ssd: 10, bandwidth: 0.5 },
  },
  {
    id: "kvm-2",
    name: "KVM 2",
    audience: "Production web workloads",
    usd: 8,
    inr: 762.67,
    features: [
      "2 vCPU",
      "2 GB RAM",
      "20 GB SSD",
      "1 TB bandwidth at 1 Gbps",
      "1 dedicated IP",
    ],
    resources: { vcpu: 2, ram: 2, ssd: 20, bandwidth: 1 },
  },
  {
    id: "kvm-3",
    name: "KVM 3",
    audience: "Higher-traffic applications",
    usd: 16,
    inr: 1525.34,
    features: [
      "4 vCPU",
      "4 GB RAM",
      "40 GB SSD",
      "2 TB bandwidth at 1 Gbps",
      "1 dedicated IP",
    ],
    resources: { vcpu: 4, ram: 4, ssd: 40, bandwidth: 2 },
    featured: true,
  },
  {
    id: "kvm-4",
    name: "KVM 4",
    audience: "Memory-hungry services",
    usd: 30,
    inr: 2860.01,
    features: [
      "4 vCPU",
      "8 GB RAM",
      "70 GB SSD",
      "3 TB bandwidth at 1 Gbps",
      "1 dedicated IP",
    ],
    resources: { vcpu: 4, ram: 8, ssd: 70, bandwidth: 3 },
  },
  {
    id: "kvm-5",
    name: "KVM 5",
    audience: "Multi-service production",
    usd: 60,
    inr: 5720.03,
    features: [
      "8 vCPU",
      "16 GB RAM",
      "100 GB SSD",
      "4 TB bandwidth at 1 Gbps",
      "1 dedicated IP",
    ],
    resources: { vcpu: 8, ram: 16, ssd: 100, bandwidth: 4 },
  },
  {
    id: "kvm-6",
    name: "KVM 6",
    audience: "The largest single node",
    usd: 100,
    inr: 9533.38,
    features: [
      "8 vCPU",
      "32 GB RAM",
      "150 GB SSD",
      "5 TB bandwidth at 1 Gbps",
      "1 dedicated IP",
    ],
    resources: { vcpu: 8, ram: 32, ssd: 150, bandwidth: 5 },
  },
];

/** A real machine in the fleet. Feeds the inventory ledger (DESIGN.md 12.4). */
export interface DedicatedServer {
  id: string;
  cpu: string;
  ram: string;
  storage: string;
  network: string;
  usd: number;
  managed: "Self-managed" | "Fully managed" | "cPanel/WHM";
}

/* Fifteen real machines, verbatim from the WHMCS dedicated group. */
export const DEDICATED_SERVERS: DedicatedServer[] = [
  {
    id: "ded-l5520",
    cpu: "Dual L5520",
    ram: "24 GB DDR3 ECC",
    storage: "250 GB SSD",
    network: "10 TB @ 1 Gbps · 5x IPv4",
    usd: 130,
    managed: "Self-managed",
  },
  {
    id: "ded-l5650-24",
    cpu: "Dual Xeon L5650",
    ram: "24 GB DDR3 ECC",
    storage: "250 GB SSD",
    network: "5 TB @ 1 Gbps · 2x IPv4",
    usd: 140,
    managed: "Self-managed",
  },
  {
    id: "ded-e3-1230v5",
    cpu: "Xeon E3-1230v5",
    ram: "16 GB",
    storage: "2x 250 GB SSD + 1 TB SATA",
    network: "5 TB @ 1 Gbps",
    usd: 150,
    managed: "Self-managed",
  },
  {
    id: "ded-e5-2670-dual",
    cpu: "Dual Xeon E5-2670",
    ram: "32 GB",
    storage: "250 GB SSD",
    network: "10 TB @ 1 Gbps",
    usd: 200,
    managed: "Self-managed",
  },
  {
    id: "ded-e3-1275v6",
    cpu: "Xeon E3-1275v6",
    ram: "16 GB",
    storage: "2x 250 GB SSD + 1 TB SATA",
    network: "5 TB @ 1 Gbps",
    usd: 210,
    managed: "Self-managed",
  },
  {
    id: "ded-i7-7700k",
    cpu: "Core i7-7700K",
    ram: "32 GB",
    storage: "500 GB SSD",
    network: "10 TB @ 1 Gbps",
    usd: 210,
    managed: "Self-managed",
  },
  {
    id: "ded-e3-1230v2",
    cpu: "Xeon E3-1230v2",
    ram: "32 GB",
    storage: "2x 250 GB SSD",
    network: "5 TB @ 1 Gbps · 1x IPv4",
    usd: 224.01,
    managed: "Fully managed",
  },
  {
    id: "ded-e5-2670-cpanel",
    cpu: "Xeon E5-2670",
    ram: "32 GB",
    storage: "250 GB SSD",
    network: "10 TB @ 1 Gbps · 2x IPv4",
    usd: 230,
    managed: "cPanel/WHM",
  },
  {
    id: "ded-l5650-48",
    cpu: "Dual Xeon L5650",
    ram: "48 GB DDR3 ECC",
    storage: "4x 250 GB SSD · RAID-10",
    network: "10 TB @ 1 Gbps · 5x IPv4",
    usd: 250,
    managed: "Self-managed",
  },
  {
    id: "ded-e5-2680v2",
    cpu: "Xeon E5-2680v2",
    ram: "32 GB",
    storage: "2x 500 GB SSD + 1 TB SATA",
    network: "10 TB @ 1 Gbps",
    usd: 250,
    managed: "Self-managed",
  },
  {
    id: "ded-e5-2670-lsw2",
    cpu: "Dual Xeon E5-2670",
    ram: "32 GB",
    storage: "250 GB SSD",
    network: "10 TB @ 1 Gbps · 2x IPv4",
    usd: 318,
    managed: "cPanel/WHM",
  },
  {
    id: "ded-e5-2690",
    cpu: "Dual Xeon E5-2690",
    ram: "192 GB",
    storage: "4x 250 GB SSD · LSI HW RAID w/ BBU",
    network: "20 TB @ 1 Gbps",
    usd: 400,
    managed: "Self-managed",
  },
  {
    id: "ded-e5-2650v3",
    cpu: "Dual Xeon E5-2650v3",
    ram: "128 GB DDR4",
    storage: "4x 250 GB SSD · RAID-10",
    network: "10 TB @ 1 Gbps · 20 Gbps anti-DDoS",
    usd: 500,
    managed: "Self-managed",
  },
  {
    id: "ded-e5-2650v3-cpanel",
    cpu: "Xeon E5-2650v3",
    ram: "128 GB",
    storage: "4x 250 GB SSD · HW RAID BBU",
    network: "10 TB @ 1 Gbps · 8x IPv4",
    usd: 550,
    managed: "cPanel/WHM",
  },
  {
    id: "ded-e7-4850",
    cpu: "Quad Xeon E7-4850",
    ram: "192 GB",
    storage: "4x 250 GB SSD · RAID-10",
    network: "10 TB @ 1 Gbps · 2x IPv4",
    usd: 700,
    managed: "Self-managed",
  },
];

/* --------------------------------------------------------------------------- */

const usd = (amount: number): PriceValue => ({
  amount,
  currency: "USD",
  prefix: "$",
  suffix: "/mo",
});
const inr = (amount: number): PriceValue => ({
  amount,
  currency: "INR",
  prefix: "₹",
  suffix: "/mo",
});

/**
 * The single term Royal Clouds actually sells.
 *
 * monthly === renewal === billedTotal, because the price genuinely does not change
 * when the month rolls over. The Honest Ledger (DESIGN.md 10.5) therefore renders a
 * disclosure that happens to be a selling point. That equality is load-bearing: it is
 * the fact, not a shortcut around missing data.
 */
function monthlyTerm(plan: CatalogPlan): PlanTerm {
  const prices = [inr(plan.inr), usd(plan.usd)];
  return { months: 1, monthly: prices, renewal: prices, billedTotal: prices };
}

/**
 * Capacity bars, normalised against the largest plan in the SAME deck — so a bar says
 * "this plan, against our range", never an absolute the data cannot support. A plan
 * missing a resource (an unmetered one) simply omits that bar rather than guessing.
 */
function telemetryFor(
  plan: CatalogPlan,
  deck: CatalogPlan[],
  bars: Array<[key: string, label: string, unit: string]>,
): PlanTelemetry[] {
  return bars.flatMap(([key, label, unit]) => {
    const value = plan.resources?.[key];
    if (value === undefined) return [];

    const ceiling = Math.max(
      ...deck.map((candidate) => candidate.resources?.[key] ?? 0),
    );
    if (ceiling <= 0) return [];

    return [{ label, value: `${value}${unit}`, fill: value / ceiling }];
  });
}

const SHARED_BARS: Array<[string, string, string]> = [
  ["storage", "SSD", " GB"],
  ["bandwidth", "Bandwidth", " GB"],
  ["domains", "Domains", ""],
];

const VPS_BARS: Array<[string, string, string]> = [
  ["vcpu", "vCPU", ""],
  ["ram", "RAM", " GB"],
  ["ssd", "SSD", " GB"],
];

function toHostingPlan(
  plan: CatalogPlan,
  deck: CatalogPlan[],
  bars: Array<[string, string, string]>,
): HostingPlan {
  const prices = [inr(plan.inr), usd(plan.usd)];
  return {
    id: plan.id,
    name: plan.name,
    audience: plan.audience,
    billingPeriod: "month",
    introductory: prices,
    /* There is no intro/renewal split to represent, so both point at the same real
       price. See the monthly-only note at the top of this file. */
    renewal: prices,
    terms: [monthlyTerm(plan)],
    telemetry: telemetryFor(plan, deck, bars),
    features: plan.features,
    checkoutUrl: WHMCS_CART,
    featured: plan.featured,
    /* Read from the live billing system, so approved by construction: this is what a
       customer is charged today. */
    approvalState: "approved",
  };
}

export const sharedHostingPlans = (): HostingPlan[] =>
  SHARED_PLANS.map((plan) => toHostingPlan(plan, SHARED_PLANS, SHARED_BARS));

export const vpsHostingPlans = (): HostingPlan[] =>
  VPS_PLANS.map((plan) => toHostingPlan(plan, VPS_PLANS, VPS_BARS));

/**
 * Configurator axes (DESIGN.md 11.1) — index-aligned with VPS_PLANS, so every
 * reachable slider position IS one of the six real plans. That alignment is what lets
 * the configurator price a build by LOOKING IT UP rather than computing it from an
 * invented per-unit rate.
 */
const DEFAULT_PLAN_INDEX = VPS_PLANS.findIndex((plan) => plan.featured);

/* `default` is a step VALUE, not an index — the schema refines on exactly that, so
   an index here would boot the sliders into a machine that does not exist. Both the
   steps and the default are read from the same plan, which keeps them in step (and
   makes it impossible for a price change to desync them). */
function axis(id: string, label: string, unit: string, key: string) {
  const steps = VPS_PLANS.map((plan) => plan.resources?.[key] ?? 0);
  return {
    id,
    label,
    unit,
    steps,
    default: steps[DEFAULT_PLAN_INDEX] ?? steps[0],
  };
}

export const vpsConfiguratorAxes = () => [
  axis("vcpu", "vCPU", "", "vcpu"),
  axis("ram", "RAM", " GB", "ram"),
  axis("ssd", "SSD", " GB", "ssd"),
];

/** The real plan at a configurator position. Undefined if the index is out of range. */
export const vpsPlanAtStep = (index: number): CatalogPlan | undefined =>
  VPS_PLANS[index];
