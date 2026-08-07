#!/usr/bin/env node
/**
 * compare-live.mjs — the pixel-clone acceptance test.
 *
 * Screenshots the built site (dist/) at the same pages/widths as the live
 * references in refs/live/ (created by scripts/capture-live.mjs) and writes
 * side-by-side stitches plus a coarse pixel-diff ratio per pair into
 * shots/compare/ (git-ignored).
 *
 * Env: CHROMIUM_BIN — browser executable; PAGES — comma-separated slug filter.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { createServer } from "node:http";
import { mkdirSync, existsSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const OUT = "shots/compare";
const REFS = "refs/live";
const WIDTHS = [1440, 768, 390];
// dist slugs (flat .html files; home = index.html). testimonials.php → testimonials.
const PAGES = [
  ["home", "/index.html"],
  ["shared-hosting", "/shared-hosting.html"],
  ["kvm-vps-hosting", "/kvm-vps-hosting.html"],
  ["dedicated-servers", "/dedicated-servers.html"],
  ["cyberpanel-vps-hosting", "/cyberpanel-vps-hosting.html"],
  ["managed-wordpress-hosting", "/managed-wordpress-hosting.html"],
  ["cloud-ssd-hosting", "/cloud-ssd-hosting.html"],
  ["speed", "/speed.html"],
  ["uptime", "/uptime.html"],
  ["datacenter", "/datacenter.html"],
  ["support", "/support.html"],
  ["about", "/about.html"],
  ["testimonials", "/testimonials.html"],
  ["affiliate", "/affiliate.html"],
  ["partners", "/partners.html"],
  ["terms-of-service", "/terms-of-service.html"],
  ["privacy-policy", "/privacy-policy.html"],
];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain",
};

function serveDist() {
  const srv = createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    let file = join("dist", p);
    if (!existsSync(file) && existsSync(file + ".html")) file += ".html";
    if (!existsSync(file) || statSync(file).isDirectory()) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, {
      "content-type": MIME[extname(file)] ?? "application/octet-stream",
    });
    res.end(readFileSync(file));
  });
  return new Promise((resolve) =>
    srv.listen(0, "127.0.0.1", () =>
      resolve([srv, `http://127.0.0.1:${srv.address().port}`]),
    ),
  );
}

async function diffRatio(aPath, bPath, width) {
  // coarse diff: downscale both to width/8 grayscale, compare raw pixels
  const w = Math.max(32, Math.round(width / 8));
  const load = (p) =>
    sharp(p)
      .resize({ width: w })
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });
  const [a, b] = await Promise.all([load(aPath), load(bPath)]);
  const n = Math.min(a.data.length, b.data.length);
  let diff = 0;
  for (let i = 0; i < n; i++) if (Math.abs(a.data[i] - b.data[i]) > 24) diff++;
  const heightPenalty =
    Math.abs(a.data.length - b.data.length) /
    Math.max(a.data.length, b.data.length);
  return diff / n + heightPenalty;
}

const filter = process.env.PAGES?.split(",").map((s) => s.trim());
const pages = filter ? PAGES.filter(([slug]) => filter.includes(slug)) : PAGES;

if (!existsSync("dist")) {
  console.error("dist/ missing — run `npm run build` first");
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });
const [srv, base] = await serveDist();
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_BIN || undefined,
});

const rows = [];
for (const w of WIDTHS) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  for (const [slug, path] of pages) {
    const ref = `${REFS}/${slug}-${w}.png`;
    if (!existsSync(ref)) continue;
    const local = `${OUT}/${slug}-${w}-local.png`;
    try {
      await page.goto(base + path, { waitUntil: "load", timeout: 45000 });
      await page.waitForTimeout(1200);
      await page.screenshot({ path: local, fullPage: true });
      const ratio = await diffRatio(ref, local, w);
      // side-by-side stitch (live left, local right), height-capped
      const meta = await Promise.all([
        sharp(ref).metadata(),
        sharp(local).metadata(),
      ]);
      const H = Math.min(4000, Math.max(meta[0].height, meta[1].height));
      const half = 640;
      const [L, R] = await Promise.all(
        [ref, local].map((p) =>
          sharp(p).resize({ width: half }).extract
            ? sharp(p).resize({ width: half }).png().toBuffer()
            : null,
        ),
      );
      await sharp({
        create: {
          width: half * 2 + 8,
          height: H,
          channels: 3,
          background: "#ffffff",
        },
      })
        .composite([
          { input: L, left: 0, top: 0 },
          { input: R, left: half + 8, top: 0 },
        ])
        .png()
        .toFile(`${OUT}/${slug}-${w}-pair.png`);
      rows.push([`${slug}-${w}`, ratio]);
      console.log(
        `${ratio > 0.25 ? "✗" : "✓"} ${slug}-${w}  diff=${(ratio * 100).toFixed(1)}%`,
      );
    } catch (e) {
      console.error(`ERR ${slug}-${w}: ${String(e).slice(0, 100)}`);
    }
  }
  await ctx.close();
}
await browser.close();
srv.close();
rows.sort((x, y) => y[1] - x[1]);
console.log("\nWorst pairs:");
for (const [k, r] of rows.slice(0, 8))
  console.log(`  ${(r * 100).toFixed(1)}%  ${k}`);
