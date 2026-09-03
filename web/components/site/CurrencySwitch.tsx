"use client";

import { useEffect, useSyncExternalStore } from "react";

type Currency = "USD" | "INR";

/* Module-level currency store. The switcher only ever flips
   <html data-currency> — price spans render both variants and CSS shows the
   active one, so React text nodes are never mutated from outside. */
let current: Currency = "USD";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
const getSnapshot = (): Currency => current;
const getServerSnapshot = (): Currency => "USD";

function setGlobalCurrency(next: Currency) {
  current = next;
  document.documentElement.dataset.currency = next;
  try {
    localStorage.setItem("royalclouds-currency", next);
  } catch {
    /* ignore */
  }
  listeners.forEach((listener) => listener());
}

export function CurrencySwitch() {
  const currency = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  /* One-time sync with the external system (localStorage + locale) — writes
     to the store, not to React state directly. */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("royalclouds-currency");
      const initial: Currency =
        saved === "INR" || saved === "USD"
          ? saved
          : /^en-IN\b/i.test(navigator.language)
            ? "INR"
            : "USD";
      if (initial !== current) setGlobalCurrency(initial);
    } catch {
      /* localStorage unavailable — USD stays */
    }
  }, []);

  return (
    <div className="currency-switch" role="group" aria-label="Display currency">
      <button
        type="button"
        aria-pressed={currency === "INR"}
        onClick={() => setGlobalCurrency("INR")}
        aria-label="Display prices in Indian rupees"
      >
        ₹ INR
      </button>
      <button
        type="button"
        aria-pressed={currency === "USD"}
        onClick={() => setGlobalCurrency("USD")}
        aria-label="Display prices in US dollars"
      >
        $ USD
      </button>
    </div>
  );
}
