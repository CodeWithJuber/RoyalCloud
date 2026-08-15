/**
 * Visual audit harness — serves the built dist/ and captures full-page
 * screenshots of every key page across desktop/tablet/mobile, plus the
 * interactive states (mobile menu, mega-menu hover, billing toggle, FAQ).
 *
 *   npm run build && node scripts/screenshots.mjs
 *   PAGES="home:/,vps:/kvm-vps-hosting" node scripts/screenshots.mjs
 *
 * Output lands in shots/ (gitignored). Console errors found on any page are
 * printed at the end — an empty object means a clean run.
 */
import { chromium } from "playwright";
import { createServer } from "node:http";
import { stat, readFile, mkdir } from "node:fs/promises";
import { join, extname } from "node:path";

const DIST = "dist";
const PORT = 8124;
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".xml": "application/xml",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
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
        try {
          const s = await stat(fp);
          if (s.isDirectory()) fp = join(fp, "index.html");
        } catch {
          /* leave fp as-is */
        }
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

const pages = (
  process.env.PAGES ||
  "home:/,shared:/shared-hosting,vps:/kvm-vps-hosting,landing:/cheap-kvm-vps," +
    "compare:/compare-royalclouds-vps-plans,about:/about,contact:/contact," +
    "domains:/domains,privacy:/privacy-policy,blog:/blog,post:/blog/why-ssd-litespeed-hosting-is-faster"
)
  .split(",")
  .map((s) => {
    const i = s.indexOf(":");
    return [s.slice(0, i), s.slice(i + 1)];
  });
const viewports = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 390, height: 844 },
};
await mkdir("shots", { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_BIN || undefined });
const consoleErrors = {};

for (const [vp, size] of Object.entries(viewports)) {
  const ctx = await browser.newContext({
    viewport: size,
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  page.on("console", (m) => {
    if (m.type() === "error")
      (consoleErrors[vp] ??= []).push(m.text().slice(0, 160));
  });
  page.on("pageerror", (e) =>
    (consoleErrors[vp] ??= []).push("PAGEERROR " + String(e).slice(0, 160)),
  );
  for (const [name, path] of pages) {
    await page
      .goto(base + path, { waitUntil: "networkidle", timeout: 30000 })
      .catch(() => {});
    // make reveal-gated and content-visibility-skipped content render for the
    // full-page capture (both only affect off-viewport sections)
    await page.addStyleTag({
      content: ".cv-auto { content-visibility: visible !important; }",
    });
    await page.evaluate(() =>
      document
        .querySelectorAll(".reveal")
        .forEach((el) => el.classList.add("in")),
    );
    await page.waitForTimeout(250);
    await page.screenshot({ path: `shots/${name}-${vp}.png`, fullPage: true });
    console.log("shot", `${name}-${vp}`);
  }
  await ctx.close();
}

/* ---------------- interactive states ---------------- */

const mctx = await browser.newContext({
  viewport: viewports.mobile,
  reducedMotion: "reduce",
});
const m = await mctx.newPage();
await m.goto(base + "/", { waitUntil: "networkidle" });
await m
  .click("#rcMenuBtn")
  .catch((e) => console.log("menu:", String(e).slice(0, 80)));
await m.waitForTimeout(300);
await m.screenshot({ path: "shots/ix-mobile-menu-open.png" });
console.log("shot", "ix-mobile-menu-open");

const g = await mctx.newPage();
await g.goto(base + "/shared-hosting", { waitUntil: "networkidle" });
await g.evaluate(() =>
  document
    .querySelector('[data-bill="annual"]')
    ?.scrollIntoView({ block: "center" }),
);
await g
  .click('[data-bill="annual"]')
  .catch((e) => console.log("toggle:", String(e).slice(0, 80)));
await g.waitForTimeout(300);
await g.screenshot({ path: "shots/ix-mobile-annual-toggle.png" });
console.log("shot", "ix-mobile-annual-toggle");
await g.evaluate(() => {
  const f = document.querySelector("details.faq");
  f?.setAttribute("open", "");
  f?.scrollIntoView({ block: "center" });
});
await g.waitForTimeout(200);
await g.screenshot({ path: "shots/ix-mobile-faq-open.png" });
console.log("shot", "ix-mobile-faq-open");
await mctx.close();

const dctx = await browser.newContext({
  viewport: viewports.desktop,
  reducedMotion: "reduce",
});
const d = await dctx.newPage();
await d.goto(base + "/", { waitUntil: "networkidle" });
await d
  .hover(".nav-dd >> nth=0")
  .catch((e) => console.log("hover:", String(e).slice(0, 80)));
await d.waitForTimeout(400);
await d.screenshot({ path: "shots/ix-desktop-megamenu.png" });
console.log("shot", "ix-desktop-megamenu");
await dctx.close();

await browser.close();
server.close();
console.log("console errors:", JSON.stringify(consoleErrors, null, 1));
console.log("done");
