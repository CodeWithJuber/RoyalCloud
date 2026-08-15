import { chromium } from 'playwright';
const pages = [
  ['index', 'http://localhost:4321/index.html'],
  ['shared-hosting', 'http://localhost:4321/shared-hosting.html'],
  ['kvm-vps-hosting', 'http://localhost:4321/kvm-vps-hosting.html'],
  ['dedicated-servers', 'http://localhost:4321/dedicated-servers.html'],
];
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_BIN || undefined });
for (const [name, url] of pages) {
  for (const [w, tag] of [[1440, 'desktop'], [390, 'mobile']]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await p.waitForTimeout(1500);
    await p.screenshot({ path: `/tmp/shots/${name}-${tag}.png`, fullPage: true });
    await p.close();
    console.log(`shot ${name}-${tag}`);
  }
}
await b.close();
