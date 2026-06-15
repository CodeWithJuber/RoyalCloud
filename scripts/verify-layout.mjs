import { chromium } from "playwright";
import { createServer } from "node:http";
import { stat, readFile, mkdir } from "node:fs/promises";
import { join, extname } from "node:path";

const DIST = "dist";
const PORT = 8137;
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".json": "application/json",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".xml": "application/xml",
};
const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p.endsWith("/")) p += "index.html";
    let fp = join(DIST, p);
    if (!extname(fp)) {
      try {
        await stat(fp + ".html");
        fp += ".html";
      } catch {
        const s = await stat(fp).catch(() => null);
        if (s?.isDirectory()) fp = join(fp, "index.html");
      }
    }
    const body = await readFile(fp);
    res.writeHead(200, {
      "content-type": types[extname(fp)] || "application/octet-stream",
    });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("nf");
  }
});
await new Promise((r) => server.listen(PORT, r));
const base = `http://localhost:${PORT}`;
await mkdir("shots", { recursive: true });

const pages = [
  ["home", "/"],
  ["shared", "/shared-hosting"],
  ["vps", "/kvm-vps-hosting"],
  ["speed", "/speed"],
  ["compare", "/compare-royalclouds-vps-plans"],
  ["domains", "/domains"],
  ["about", "/about"],
  ["contact", "/contact"],
  ["landing", "/cheap-kvm-vps"],
  ["blog", "/blog"],
  ["privacy", "/privacy-policy"],
];
const widths = [320, 360, 375, 390, 393, 412, 430, 768, 1024, 1280, 1440];

const browser = await chromium.launch();
const report = [];

for (const w of widths) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push("PAGEERR " + String(e).slice(0, 120)));
  page.on("console", (m) => {
    if (m.type() === "error") errs.push(m.text().slice(0, 100));
  });

  for (const [name, path] of pages) {
    await page
      .goto(base + path, { waitUntil: "networkidle", timeout: 30000 })
      .catch(() => {});
    await page.evaluate(() =>
      document
        .querySelectorAll(".reveal")
        .forEach((el) => el.classList.add("in")),
    );
    await page.waitForTimeout(150);

    const result = await page.evaluate((vw) => {
      const docW = document.documentElement.scrollWidth;
      const overflow = docW - vw;
      // elements that stick out past the right edge (real horizontal-scroll causes)
      const offenders = [];
      const all = document.body.querySelectorAll("*");
      for (const el of all) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.right > vw + 2 || r.left < -2) {
          const cs = getComputedStyle(el);
          if (cs.position === "fixed") continue;
          const sel =
            el.tagName.toLowerCase() +
            (el.className && typeof el.className === "string"
              ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".")
              : "");
          offenders.push(
            `${sel} [${Math.round(r.left)}..${Math.round(r.right)}]`,
          );
        }
      }
      // small tap targets among buttons / nav links / cta links
      const tap = [];
      const interactive = document.querySelectorAll(
        "a.btn, button, .nav a, .header-cta a, .m-item, .bill-toggle button, summary",
      );
      for (const el of interactive) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.height < 40 || r.width < 40) {
          const sel =
            el.tagName.toLowerCase() +
            (typeof el.className === "string" && el.className
              ? "." + el.className.trim().split(/\s+/)[0]
              : "");
          tap.push(`${sel} ${Math.round(r.width)}x${Math.round(r.height)}`);
        }
      }
      return {
        overflow,
        offenders: [...new Set(offenders)].slice(0, 8),
        tap: [...new Set(tap)].slice(0, 8),
      };
    }, w);

    if (
      result.overflow > 1 ||
      result.offenders.length ||
      result.tap.length ||
      errs.length
    ) {
      report.push({
        page: name,
        w,
        overflow: result.overflow,
        offenders: result.offenders,
        tap: result.tap,
        errs: [...errs],
      });
    }
    errs.length = 0;
  }
  await ctx.close();
}

await browser.close();
server.close();
console.log("=== LAYOUT AUDIT ===");
if (!report.length) console.log("No issues found across all pages/widths.");
for (const r of report) {
  console.log(`\n[${r.page} @ ${r.w}px] overflow=${r.overflow}`);
  if (r.offenders.length)
    console.log("  overflow offenders:", r.offenders.join(" | "));
  if (r.tap.length) console.log("  small tap targets:", r.tap.join(" | "));
  if (r.errs.length) console.log("  errors:", r.errs.join(" | "));
}
