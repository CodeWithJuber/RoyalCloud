/**
 * Currency helpers for the ₹/$ toggle. USD strings in the data files are
 * the source of truth; INR is computed at build time from one rate and
 * rounded to shopper-friendly numbers. The header script swaps every
 * `.px` span (and the plan-grid price nodes) client-side.
 */
export const USD_TO_INR = 84;

const groupINR = (n: number) => n.toLocaleString("en-IN");

/** "1.99" → "169", "130" → "10,899" — nearest 9 under ₹1000, nearest 99 above. */
export function toINR(usd: string | number): string {
  const value = typeof usd === "number" ? usd : parseFloat(usd);
  if (!isFinite(value)) return String(usd);
  const raw = value * USD_TO_INR;
  const nice =
    raw < 1000
      ? Math.max(Math.round(raw / 10) * 10 - 1, 9)
      : Math.round(raw / 100) * 100 - 1;
  return groupINR(nice);
}

const PRICE_RE = /\$(\d+(?:\.\d+)?)/g;

/** Wraps every $X.XX in a string/HTML as a currency-aware span. */
export function pricify(text: string): string {
  return text.replace(
    PRICE_RE,
    (_m, num: string) =>
      `<span class="px" data-usd="$${num}" data-inr="₹${toINR(num)}">₹${toINR(num)}</span>`,
  );
}
