# Visual Artifacts

Screenshots are generated locally for review but intentionally not committed because the PR viewer used by this workflow rejects binary files.

Generate a fresh screenshot with:

```bash
cd royalclouds-redesign
npm run build
npm run start -- --hostname 127.0.0.1 --port 3000
npx playwright screenshot --viewport-size=1440,1200 http://127.0.0.1:3000 artifacts/home-desktop-production.png
```
