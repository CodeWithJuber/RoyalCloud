import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
try {
  await p.goto('https://www.siteground.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(4000);
  await p.screenshot({ path: '/tmp/sg-home1.png' });
  await p.evaluate(() => window.scrollTo(0, 900)); await p.waitForTimeout(1500);
  await p.screenshot({ path: '/tmp/sg-home2.png' });
  await p.evaluate(() => window.scrollTo(0, 1800)); await p.waitForTimeout(1500);
  await p.screenshot({ path: '/tmp/sg-home3.png' });
  await p.evaluate(() => window.scrollTo(0, 2800)); await p.waitForTimeout(1500);
  await p.screenshot({ path: '/tmp/sg-home4.png' });
  await p.evaluate(() => window.scrollTo(0, 3800)); await p.waitForTimeout(1500);
  await p.screenshot({ path: '/tmp/sg-home5.png' });
  console.log('home ok');
} catch (e) { console.log('ERR home', e.message); }
try {
  await p.goto('https://www.siteground.com/web-hosting.htm', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(4000);
  await p.screenshot({ path: '/tmp/sg-wh1.png' });
  await p.evaluate(() => window.scrollTo(0, 900)); await p.waitForTimeout(1500);
  await p.screenshot({ path: '/tmp/sg-wh2.png' });
  console.log('wh ok');
} catch (e) { console.log('ERR wh', e.message); }
await b.close();
