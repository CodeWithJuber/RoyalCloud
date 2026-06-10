import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { stat, readFile, mkdir } from 'node:fs/promises';
import { join, extname } from 'node:path';

const DIST = 'dist';
const PORT = 8124;
const types = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.xml': 'application/xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
};

const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    let fp = join(DIST, p);
    if (!extname(fp)) {
      try { await stat(fp + '.html'); fp += '.html'; }
      catch { try { const s = await stat(fp); if (s.isDirectory()) fp = join(fp, 'index.html'); } catch {} }
    }
    const body = await readFile(fp);
    res.writeHead(200, { 'content-type': types[extname(fp)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end('nf'); }
});
await new Promise((r) => server.listen(PORT, r));
const base = `http://localhost:${PORT}`;

const pages = (process.env.PAGES || 'home:/,shared:/shared-hosting,vps:/kvm-vps-hosting,blog:/blog,about:/about,contact:/contact')
  .split(',').map((s) => s.split(':'));
const viewports = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };
const themes = ['light', 'dark'];
await mkdir('shots', { recursive: true });

const browser = await chromium.launch();
for (const theme of themes) {
  for (const [vp, size] of Object.entries(viewports)) {
    const ctx = await browser.newContext({ viewport: size, deviceScaleFactor: 1, colorScheme: theme, reducedMotion: 'reduce' });
    await ctx.addInitScript((t) => { try { localStorage.setItem('theme', t); } catch {} }, theme);
    const page = await ctx.newPage();
    for (const [name, path] of pages) {
      const full = name === 'home' || theme === 'light';
      if (!full) continue;
      await page.goto(base + path, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
      await page.evaluate(async () => {
        await new Promise((res) => { let y = 0; const s = () => { y += innerHeight * 0.8; scrollTo(0, y); if (y < document.body.scrollHeight) setTimeout(s, 60); else res(null); }; s(); });
      });
      await page.waitForTimeout(600);
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForTimeout(300);
      await page.screenshot({ path: `shots/${name}-${vp}-${theme}.png`, fullPage: name === 'home' });
      console.log('shot', `${name}-${vp}-${theme}`);
    }
    await ctx.close();
  }
}
await browser.close();
server.close();
console.log('done');
