/**
 * "What are you building?" — one vocabulary shared by the hero chips, the
 * plan finder's first step and product-page banners. Ids are finder builds,
 * so a chip deep-links straight into the finder's second step
 * (`/?for=<id>#planfinder`) and a product page prefills its own product.
 */
export type IntentId = "shared" | "wordpress" | "vps" | "store" | "reseller" | "dedicated";

export interface Intent {
  id: IntentId;
  label: string;
  /** Product page for this intent. */
  href: string;
  icon: string;
  /** Shown as a hero chip (the rest are reachable through the finder). */
  chip: boolean;
}

export const INTENTS: readonly Intent[] = [
  { id: "wordpress", label: "WordPress site", href: "/managed-wordpress-hosting", icon: "wordpress", chip: true },
  { id: "shared", label: "Business site", href: "/shared-hosting", icon: "globe", chip: true },
  { id: "vps", label: "App or VPS", href: "/kvm-vps-hosting", icon: "terminal", chip: true },
  { id: "store", label: "Online store", href: "/managed-wordpress-hosting", icon: "wallet", chip: true },
  { id: "reseller", label: "Reseller", href: "/reseller-hosting", icon: "users", chip: false },
  { id: "dedicated", label: "Dedicated server", href: "/dedicated-servers", icon: "server", chip: false },
];

export const isIntentId = (value: unknown): value is IntentId =>
  typeof value === "string" && INTENTS.some((intent) => intent.id === value);

export const finderHref = (id?: IntentId): string =>
  id ? `/?for=${id}#planfinder` : "/#planfinder";

/** Plan deck id → the intent that leads to it (product pages prefill the finder). */
export const PLAN_TO_INTENT: Record<string, IntentId> = {
  shared: "shared",
  cpanel: "shared",
  wordpress: "wordpress",
  vps: "vps",
  cyberpanel: "vps",
  cloud: "vps",
  dedicated: "dedicated",
  reseller: "reseller",
};
