import { chromium } from "playwright";
import { createServer } from "node:http";
import { stat, readFile } from "node:fs/promises";
import { join, extname } from "node:path";

const DIST = "dist";
const PORT = 8131;
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

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "no-preference",
});
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) =>
  errors.push("PAGEERROR " + String(e).slice(0, 200)),
);
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text().slice(0, 160));
});

await page.goto(base + "/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(1200); // let rAF + lenis spin up

const checks = await page.evaluate(() => {
  const c = document.querySelector("[data-rc-sky]");
  const gl = c && (c.getContext("webgl") || c.getContext("experimental-webgl"));
  return {
    canvasPresent: !!c,
    canvasW: c ? c.width : 0,
    canvasH: c ? c.height : 0,
    canvasDisplayed: c ? getComputedStyle(c).display !== "none" : false,
    webglOk: !!gl,
    lenisClass: document.documentElement.className,
  };
});

// scroll a bit and confirm the hero copy actually transforms (GSAP handoff)
const before = await page.evaluate(() => {
  const el = document.querySelector(".rc-hero-copy");
  return el ? getComputedStyle(el).transform : "none";
});
await page.mouse.wheel(0, 400);
await page.waitForTimeout(700);
const after = await page.evaluate(() => {
  const el = document.querySelector(".rc-hero-copy");
  return el ? getComputedStyle(el).transform : "none";
});

await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(400);
await page.screenshot({
  path: "shots/hero-live-motion.png",
  clip: { x: 0, y: 0, width: 1440, height: 760 },
});

console.log("LIVE MOTION CHECKS:", JSON.stringify(checks, null, 1));
console.log("hero transform before scroll:", before);
console.log("hero transform after  scroll:", after);
console.log("handoff active:", before !== after || after !== "none");
console.log("errors:", JSON.stringify(errors));

await browser.close();
server.close();
