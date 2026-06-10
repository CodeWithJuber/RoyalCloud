// Verifies every original clone slug still emits a page in dist/.
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const expected = readFileSync(new URL('./clone-slugs.txt', import.meta.url), 'utf8')
  .split('\n')
  .filter(Boolean);
const dist = new Set(readdirSync('dist').filter((f) => f.endsWith('.html')).map((f) => f.replace(/\.html$/, '')));

const missing = expected.filter((s) => !dist.has(s));
if (!existsSync('dist')) {
  console.error('dist/ not found — run `npm run build` first');
  process.exit(1);
}
if (missing.length) {
  console.error(`MISSING ${missing.length} slug(s):\n` + missing.join('\n'));
  process.exit(1);
}
console.log(`OK — all ${expected.length} original slugs present (${dist.size} pages total in dist/)`);
