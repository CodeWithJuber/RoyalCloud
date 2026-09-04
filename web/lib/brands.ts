import { BRAND_ICONS, type BrandIcon } from "@/lib/brand-icons";

/**
 * Brand lookup for product names the site states — "Free SSL & cPanel",
 * "Rocky Linux", "LiteSpeed Cache". A hit is either a vendored Simple Icons
 * glyph (`icon`) or a wordmark for brands the set lacks; anything else is
 * `null` and callers fall back to a generic icon or a letter mark. Matching
 * is whole-word and case-insensitive, so "cpanel accounts" hits and
 * "panel" alone never does.
 */
export interface Brand {
  slug: string;
  title: string;
  icon: BrandIcon | null;
}

/* Aliases → registry slug (icon) or wordmark slug (no icon). Longer aliases
   first so "whm/cpanel" and "centos stream" win over their substrings. */
const ALIASES: [RegExp, string][] = [
  [/\bwhm\s*\/\s*cpanel\b|\bwhm\b|\bcpanel\b/i, "cpanel"],
  [/\bcloudflare\b/i, "cloudflare"],
  [/\bwoocommerce\b/i, "woocommerce"],
  [/\bwordpress\b/i, "wordpress"],
  [/\blet'?s\s*encrypt\b/i, "letsencrypt"],
  [/\bubuntu\b/i, "ubuntu"],
  [/\bdebian\b/i, "debian"],
  [/\balmalinux\b/i, "almalinux"],
  [/\brocky\s*linux\b/i, "rockylinux"],
  [/\bcentos(\s+stream)?\b/i, "centos"],
  [/\bfedora\b/i, "fedora"],
  [/\bopensuse\b/i, "opensuse"],
  [/\bdigital\s*ocean\b/i, "digitalocean"],
  [/\bjoomla\b/i, "joomla"],
  [/\bdrupal\b/i, "drupal"],
  [/\bphp\b/i, "php"],
  [/\bmysql\b/i, "mysql"],
  [/\bmariadb\b/i, "mariadb"],
  [/\bapache\b/i, "apache"],
  /* Wordmarks — no glyph in Simple Icons; never invent one. */
  [/\bopenlitespeed\b|\blitespeed\b|\blscache\b/i, "litespeed"],
  [/\bcloudlinux\b/i, "cloudlinux"],
  [/\bcyberpanel\b/i, "cyberpanel"],
  [/\bsoftaculous\b/i, "softaculous"],
  [/\bwhmcs\b/i, "whmcs"],
  [/\bscientific(\s+linux)?\b/i, "scientific"],
];

const WORDMARKS: Record<string, string> = {
  litespeed: "LiteSpeed",
  cloudlinux: "CloudLinux",
  cyberpanel: "CyberPanel",
  softaculous: "Softaculous",
  whmcs: "WHMCS",
  scientific: "Scientific Linux",
};

export function brandFor(text: string): Brand | null {
  for (const [pattern, slug] of ALIASES) {
    if (!pattern.test(text)) continue;
    const icon = BRAND_ICONS[slug];
    if (icon) return { slug, title: icon.title, icon };
    const title = WORDMARKS[slug];
    return title ? { slug, title, icon: null } : null;
  }
  return null;
}

/** Every brand a list of names mentions, in order, without repeats. */
export function brandsIn(names: string[]): Brand[] {
  const seen = new Set<string>();
  const out: Brand[] = [];
  for (const name of names) {
    const brand = brandFor(name);
    if (brand && !seen.has(brand.slug)) {
      seen.add(brand.slug);
      out.push(brand);
    }
  }
  return out;
}
