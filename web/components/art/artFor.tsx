import type { ReactNode } from "react";
import { ProductArt, type ProductKind } from "./ProductArt";
import { SectionArt, type SectionArtKind } from "./SectionArt";

/**
 * Maps the content's `art` / `image` keys to the illustration scene.
 * il-* keys are product art; terminal:* shares the VPS scene; the rest map
 * onto section scenes. Unknown keys fall back to the generic scene.
 */
export function artFor(key?: string): ReactNode {
  if (!key) return undefined;
  const [name, flavor] = key.split(":");
  void flavor;

  const products: Record<string, ProductKind> = {
    "il-shared": "shared",
    "il-cpanel": "shared",
    "il-vps": "vps",
    "il-cyberpanel": "cyberpanel",
    "il-cloud": "cloud",
    "il-reseller": "reseller",
    "il-wordpress": "wordpress",
    "il-dedicated": "dedicated",
    terminal: "vps",
    panel: "cyberpanel",
  };
  const sections: Record<string, SectionArtKind> = {
    speed: "speed",
    shield: "shield",
    support: "support",
    working: "support",
    datacenter: "datacenter",
    "il-domains": "domains",
    rocket: "speed",
  };

  const product = products[name];
  if (product) return <ProductArt kind={product} />;
  return <SectionArt kind={sections[key] ?? sections[name] ?? "generic"} />;
}
