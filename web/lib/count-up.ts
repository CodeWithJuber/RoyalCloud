/**
 * Count-up parsing for authored stat strings ("99.99%", "15x", "9.6/10").
 * Pure and unit-tested. Anything that is not a plain leading number with a
 * harmless suffix stays static: "24/7", "1-click", "<1s", "N+1". The final
 * frame always prints the authored string verbatim.
 */
export interface Countable {
  raw: string;
  prefix: string;
  value: number;
  decimals: number;
  grouped: boolean;
  suffix: string;
}

const PATTERN = /^(\$?)(\d[\d,]*(?:\.\d+)?)(.*)$/;

export function parseCountable(raw: string): Countable | null {
  const text = raw.trim();
  const match = PATTERN.exec(text);
  if (!match) return null;
  const [, prefix, digits, suffix] = match;
  /* Ratios like 24/7 and ranges like 2-3 are labels, not quantities. */
  if (/^\d+(?:\/\d+)+$/.test(text)) return null;
  if (/^\s*[-–\d]/.test(suffix)) return null;
  const value = parseFloat(digits.replace(/,/g, ""));
  if (!Number.isFinite(value) || value < 2) return null;
  const decimals = digits.includes(".") ? digits.split(".")[1].length : 0;
  return { raw: text, prefix, value, decimals, grouped: digits.includes(","), suffix };
}

const group = (digits: string) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export function formatCountable(countable: Countable, progress: number): string {
  if (progress >= 1) return countable.raw;
  const current = countable.value * Math.max(0, progress);
  let digits = current.toFixed(countable.decimals);
  if (countable.grouped) digits = group(digits);
  return `${countable.prefix}${digits}${countable.suffix}`;
}

export const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3;
