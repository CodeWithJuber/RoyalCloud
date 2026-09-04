# Royal Clouds — web

The Next.js 16 + Astryx marketing site for royalclouds.net. Content lives in `content/` (Decap CMS at `/admin`), plan decks in `data/plans/`, sections in `components/sections/`.

- **Design system, interactions and rules:** [`DESIGN.md`](./DESIGN.md)
- **Theme source:** `theme/royal.theme.ts` → `npm run theme:build` (generated files are never edited by hand)

```bash
npm ci
npm run dev          # http://localhost:3000
npm run check        # theme drift, typegen, tsc, eslint, vitest, cms lockstep, contrast
npm run build        # static export of all routes
node scripts/qa-shots.mjs   # screenshots + console/above-the-fold assertions (dev server running)
```
