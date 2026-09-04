#!/usr/bin/env node
/**
 * vendor-brands.mjs — regenerates lib/brand-icons.ts from Simple Icons.
 * Simple Icons is not a runtime dependency; install it ad hoc:
 *   npm i --no-save simple-icons@16.29.0 && node scripts/vendor-brands.mjs
 * Only the slugs listed below are vendored (the registry is server-only,
 * but keeping it small keeps the repo diff reviewable).
 */
import { writeFileSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const si = require("simple-icons");
const version = JSON.parse(readFileSync(require.resolve("simple-icons/package.json"), "utf8")).version;

const SLUGS = [
  "cpanel", "cloudflare", "wordpress", "letsencrypt", "ubuntu", "debian", "almalinux",
  "rockylinux", "centos", "fedora", "opensuse", "digitalocean", "woocommerce", "joomla",
  "drupal", "php", "mysql", "mariadb", "apache",
];

let out = `/**
 * Brand marks — a vendored subset of Simple Icons ${version} (CC0 1.0,
 * https://github.com/simple-icons/simple-icons). Every path is the upstream
 * 24×24 glyph, untouched, and \`hex\` is the brand colour Simple Icons
 * publishes. Brands the set does not carry (LiteSpeed, CloudLinux,
 * CyberPanel, Softaculous, WHMCS) render as wordmarks — never an invented
 * logo. Regenerate with scripts/vendor-brands.mjs; do not hand-edit paths.
 *
 * Server-only by design: the registry is ~25 KB of path data, so components
 * render <BrandMark> on the server and pass the node to client components.
 */
export interface BrandIcon {
  slug: string;
  title: string;
  /** Brand colour as published by Simple Icons (no leading #). */
  hex: string;
  /** SVG path data for a 24×24 viewBox. */
  path: string;
}

export const BRAND_ICONS: Record<string, BrandIcon> = {
`;
for (const slug of SLUGS) {
  const icon = si[`si${slug[0].toUpperCase()}${slug.slice(1)}`];
  if (!icon) throw new Error(`simple-icons has no "${slug}"`);
  out += `  ${slug}: {\n    slug: ${JSON.stringify(slug)},\n    title: ${JSON.stringify(icon.title)},\n    hex: ${JSON.stringify(icon.hex)},\n    path: ${JSON.stringify(icon.path)},\n  },\n`;
}
out += "};\n";
writeFileSync(new URL("../lib/brand-icons.ts", import.meta.url), out);
console.log(`lib/brand-icons.ts: ${SLUGS.length} icons from simple-icons ${version}`);
