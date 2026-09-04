import { useSyncExternalStore } from "react";
import type { Billing } from "./billing";

/**
 * Module-level billing-period store, the same shape as the currency store in
 * components/site/CurrencySwitch.tsx. Plan cards and the comparison table both
 * subscribe, so one toggle moves every price on the page. The server snapshot
 * must equal the initial value or hydration would diverge.
 * Client-only (it imports a React hook); server components use lib/billing.ts.
 */
export type { Billable, Billing } from "./billing";
export { hasAnnualSaving, maxSavePct, priceFor, savePct, termLabel } from "./billing";

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
