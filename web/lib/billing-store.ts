import { useSyncExternalStore } from "react";

/**
 * Module-level billing-period store, the same shape as the currency store in
 * components/site/CurrencySwitch.tsx. Plan cards and the comparison table both
 * subscribe, so one toggle moves every price on the page. The server snapshot
 * must equal the initial value or hydration would diverge.
 */
export type Billing = "monthly" | "annual";

const INITIAL: Billing = "annual";
let current: Billing = INITIAL;
const listeners = new Set<() => void>();

export function subscribeBilling(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const getBilling = (): Billing => current;
export const getServerBilling = (): Billing => INITIAL;

export function setBilling(next: Billing): void {
  if (next === current) return;
  current = next;
  if (typeof document !== "undefined") {
    document.documentElement.dataset.billing = next;
  }
  listeners.forEach((listener) => listener());
}

export function useBilling(): Billing {
  return useSyncExternalStore(subscribeBilling, getBilling, getServerBilling);
}

export interface Billable {
  price: string;
  priceAnnual?: string;
}

/** Percent saved on the annual rate versus monthly; 0 when there is no real saving. */
export function savePct(tier: Billable): number {
  const monthly = parseFloat(tier.price);
  const annual = parseFloat(tier.priceAnnual ?? tier.price);
  if (!monthly || !annual || annual >= monthly) return 0;
  return Math.round((1 - annual / monthly) * 100);
}

export const hasAnnualSaving = (tiers: Billable[]): boolean =>
  tiers.some((tier) => savePct(tier) > 0);

export const maxSavePct = (tiers: Billable[]): number =>
  Math.max(0, ...tiers.map(savePct));

/** The price a tier shows under the active billing period. */
export const priceFor = (tier: Billable, billing: Billing): string =>
  billing === "annual" ? (tier.priceAnnual ?? tier.price) : tier.price;

/* The term is always stated next to a price. Renewal pricing is never claimed:
   the catalog carries no renewal data, so any "renews at" line would be invented. */
export const termLabel = (billing: Billing): string =>
  billing === "annual" ? "per month, billed yearly" : "per month, billed monthly";
