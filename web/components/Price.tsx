import { toINR } from "@/lib/currency";

/**
 * Dual-currency price. Both spans render; CSS shows the one matching
 * <html data-currency>. Never mutated externally — the currency switcher only
 * flips the attribute, so React's text nodes are never detached.
 */
export function Price({ value, strike = false }: { value: string; strike?: boolean }) {
  return (
    <span className={`px${strike ? " px-strike" : ""}`}>
      <span className="px-usd">${value}</span>
      <span className="px-inr">₹{toINR(value)}</span>
    </span>
  );
}
