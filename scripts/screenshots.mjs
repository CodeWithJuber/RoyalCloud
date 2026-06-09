import { chromium } from "playwright";
import { createServer } from "node:http";
import { stat, readFile, mkdir } from "node:fs/promises";
import { join, extname } from "node:path";

const DIST = "dist";
const PORT = 8123;
const types = { ".html":"text/html", ".css":"text/css", ".js":"text/javascript", ".svg":"image/svg+xml", ".png":"image/png", ".json":"application/json", ".webmanifest":"application/manifest+json", ".xml":"application/xml", ".woff2":"font/woff2", ".woff":"font/woff" };

const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p.endsWith("/")) p += "index.html";
    let fp = join(DIST, p);
    if (!extname(fp)) {
      // Prefer "<path>.html" (Astro file format) over a same-named directory.
      try { await stat(fp + ".html"); fp = fp + ".html"; }
      catch {
        try { const s = await stat(fp); if (s.isDirectory()) fp = join(fp, "index.html"); } catch {}
      }
    }
    const body = await readFile(fp);
    res.writeHead(200, { "content-type": types[extname(fp)] || "application/octet-stream" });
    res.end(body);
  } catch { res.writeHead(404); res.end("nf"); }
});
await new Promise((r) => server.listen(PORT, r));

const base = `http://localhost:${PORT}`;
const pages = [
  ["home", "/"],
  ["shared", "/shared-hosting"],
  ["vps", "/kvm-vps-hosting"],
  ["dedicated", "/dedicated-servers"],
  ["blog", "/blog"],
  ["contact", "/contact"],
];
const viewports = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };
const themes = ["light", "dark"];
await mkdir("shots", { recursive: true });

const browser = await chromium.launch();
for (const theme of themes) {
  for (const [vp, size] of Object.entries(viewports)) {
    // Only full set for home; key pages desktop-light + mobile-light to keep it focused.
    const ctx = await browser.newContext({ viewport: size, deviceScaleFactor: 1 });
    await ctx.addInitScript((t) => { try { localStorage.setItem("rc-theme", t); } catch {} }, theme);
    const page = await ctx.newPage();
    for (const [name, path] of pages) {
      const full = (name === "home") || (theme === "light");
      if (!full) continue;
      await page.goto(base + path, { waitUntil: "networkidle", timeout: 30000 }).catch(()=>{});
      // Scroll through to trigger reveal-on-scroll, then back to top.
      await page.evaluate(async () => {
        await new Promise((res) => {
          let y = 0; const step = () => {
            y += window.innerHeight * 0.8; window.scrollTo(0, y);
            if (y < document.body.scrollHeight) setTimeout(step, 60); else res(null);
          }; step();
        });
      });
      await page.waitForTimeout(700);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      const file = `shots/${name}-${vp}-${theme}.png`;
      await page.screenshot({ path: file, fullPage: name === "home" });
      console.log("shot", file);
    }
    await ctx.close();
  }
}
await browser.close();
server.close();
console.log("done");
