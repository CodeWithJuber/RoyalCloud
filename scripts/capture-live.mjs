#!/usr/bin/env node
/**
 * capture-live.mjs — full-page reference screenshots of the owner's live site
 * into refs/live/<slug>-<width>.png. These are the pixel-clone's ground truth.
 * refs/ is git-ignored.
 *
 * Default source is the local wget mirror (/tmp/rcmirror, built by
 * scripts/clone-site.sh) served on a throwaway port — deterministic and
 * works where the sandbox proxy resets browser connections. LIVE=1 hits
 * https://royalclouds.net directly instead.
 *
 * Env: CHROMIUM_BIN — browser executable; PAGES — comma-separated slug
 *      filter; LIVE=1 — capture the real site; MIRROR — mirror dir.
 */
import { chromium } from "playwright";
import { mkdirSync, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { join, extname } from "node:path";

const LIVE = process.env.LIVE === "1";
const MIRROR = process.env.MIRROR || "/tmp/rcmirror";
const OUT = "refs/live";
const WIDTHS = [1440, 768, 390];
const PAGES = [
  ["home", "/"],
  ["shared-hosting", "/shared-hosting"],
  ["kvm-vps-hosting", "/kvm-vps-hosting"],
  ["dedicated-servers", "/dedicated-servers"],
  ["cyberpanel-vps-hosting", "/cyberpanel-vps-hosting"],
  ["managed-wordpress-hosting", "/managed-wordpress-hosting"],
  ["cloud-ssd-hosting", "/cloud-ssd-hosting"],
  ["speed", "/speed"],
  ["uptime", "/uptime"],
  ["datacenter", "/datacenter"],
  ["support", "/support"],
  ["about", "/about"],
  ["testimonials", "/testimonials.php"],
  ["affiliate", "/affiliate"],
  ["partners", "/partners"],
  ["terms-of-service", "/terms-of-service"],
  ["privacy-policy", "/privacy-policy"],
];

const MIME = {
  ".css": "text/css",
  ".js": "text/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".php": "text/html", // testimonials.php etc. are saved HTML
};

function serveMirror() {
  const srv = createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    let file = join(MIRROR, p);
    if (!existsSync(file) && existsSync(file.replace(/\.html$/, "")))
      file = file.replace(/\.html$/, "");
    if (!existsSync(file) || statSync(file).isDirectory()) {
      res.writeHead(404).end();
      return;
    }
    // extensionless mirror pages are HTML
    res.writeHead(200, {
      "content-type": MIME[extname(file)] ?? "text/html; charset=utf-8",
    });
    res.end(readFileSync(file));
  });
  return new Promise((resolve) =>
    srv.listen(0, "127.0.0.1", () =>
      resolve([srv, `http://127.0.0.1:${srv.address().port}`]),
    ),
  );
}

const filter = process.env.PAGES?.split(",").map((s) => s.trim());
const pages = filter ? PAGES.filter(([slug]) => filter.includes(slug)) : PAGES;

mkdirSync(OUT, { recursive: true });
const [srv, base] = LIVE
  ? [null, "https://royalclouds.net"]
  : await serveMirror();
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_BIN || undefined,
  proxy: LIVE && proxy ? { server: proxy } : undefined,
});

for (const w of WIDTHS) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
    ignoreHTTPSErrors: true, // agent proxy re-signs TLS with its own CA
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
  });
  const page = await ctx.newPage();
  for (const [slug, path] of pages) {
    try {
      await page.goto(base + path, { waitUntil: "load", timeout: 45000 });
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: `${OUT}/${slug}-${w}.png`,
        fullPage: true,
      });
      console.log(`ok  ${slug}-${w}`);
    } catch (e) {
      console.error(`ERR ${slug}-${w}: ${String(e).slice(0, 100)}`);
    }
  }
  await ctx.close();
}
await browser.close();
srv?.close();
