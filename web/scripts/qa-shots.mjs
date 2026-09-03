/**
 * qa-shots.mjs — batch screenshots of the Next.js dev server for visual QA.
 * Uses the parent repo's playwright install (../node_modules).
 *
 *   node scripts/qa-shots.mjs            # all pages, desktop+mobile
 *   PAGES="home:/,vps:/kvm-vps-hosting" node scripts/qa-shots.mjs
 */
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";

const require = createRequire(new URL("../../package.json", import.meta.url));
const { chromium } = require("playwright");

const DEFAULT_PAGES = [
  ["home", "/"],
  ["shared", "/shared-hosting"],
  ["cpanel", "/cpanel-hosting"],
  ["vps", "/kvm-vps-hosting"],
  ["cyberpanel", "/cyberpanel-vps-hosting"],
  ["wordpress", "/managed-wordpress-hosting"],
  ["cloud", "/cloud-ssd-hosting"],
  ["dedicated", "/dedicated-servers"],
  ["reseller", "/reseller-hosting"],
  ["contact", "/contact"],
  ["about", "/about"],
  ["support", "/support"],
  ["testimonials", "/testimonials"],
  ["affiliate", "/affiliate"],
  ["partners", "/partners"],
  ["speed", "/speed"],
  ["uptime", "/uptime"],
  ["datacenter", "/datacenter"],
  ["compare", "/compare-royalclouds-vps-plans"],
  ["landing-vps", "/cheap-vps-hosting"],
  ["landing-shared", "/cheap-ssd-hosting"],
  ["landing-distro", "/ubuntu-vps"],
  ["legal-terms", "/terms-of-service"],
  ["legal-privacy", "/privacy-policy"],
  ["404", "/definitely-not-a-page"],
];

const BASE = process.env.BASE ?? "http://localhost:3000";
const PAGES = process.env.PAGES
  ? process.env.PAGES.split(",").map((pair) => pair.split(":"))
  : DEFAULT_PAGES;
const WIDTHS = process.env.WIDTHS
  ? process.env.WIDTHS.split(",").map(Number)
  : [1440, 390];

await mkdir(new URL("../shots/qa", import.meta.url).pathname, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_BIN || undefined,
});
const errors = {};
for (const [name, path] of PAGES) {
  for (const width of WIDTHS) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(String(err)));
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(1200);
    const file = `shots/qa/${name}-${width}.png`;
    await page.screenshot({
      path: new URL(`../${file}`, import.meta.url).pathname,
      fullPage: true,
    });
    if (consoleErrors.length > 0) errors[`${name}-${width}`] = consoleErrors;
    await page.close();
    console.log(`shot ${name}-${width}`);
  }
}
await browser.close();

if (Object.keys(errors).length > 0) {
  console.error("\nConsole errors found:\n" + JSON.stringify(errors, null, 2));
  process.exit(1);
}
console.log("\nQA shots complete, no console errors.");
