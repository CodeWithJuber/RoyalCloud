# Royal Clouds — web

The Next.js 16 + Astryx marketing site for royalclouds.net. Content lives in `content/` (Sveltia CMS at `/admin`), plan decks in `data/plans/`, sections in `components/sections/`.

- **Design system, interactions and rules:** [`DESIGN.md`](./DESIGN.md)
- **Theme source:** `theme/royal.theme.ts` → `npm run theme:build` (generated files are never edited by hand)

```bash
npm ci
npm run dev          # http://localhost:3000
npm run check        # theme drift, typegen, tsc, eslint, vitest, cms lockstep, contrast
npm run build        # static export of all routes
node scripts/qa-shots.mjs   # screenshots + console/above-the-fold assertions (dev server running)
```

## Editing content with the CMS

`/admin` serves [Sveltia CMS](https://github.com/sveltia/sveltia-cms) (Decap-compatible `public/admin/config.yml`, phone-friendly UI). It commits straight to `CodeWithJuber/RoyalCloud` → `main`, which Vercel deploys.

**Sign in with a token (works today):** on the login screen choose *Sign in with Token* and paste a GitHub personal access token with the `repo` scope. No server setup needed.

**Sign in with GitHub (one-time setup by the owner):** the login popup uses the OAuth proxy built into this app (`app/oauth/auth`, `app/oauth/callback`, helpers in `lib/cms-oauth.ts`).

1. GitHub → Settings → Developer settings → OAuth Apps → New: Homepage URL `https://royal-cloud.vercel.app`, Authorization callback URL `https://royal-cloud.vercel.app/oauth/callback`.
2. Vercel → project `royal-cloud` → Settings → Environment Variables: `GITHUB_OAUTH_CLIENT_ID` and `GITHUB_OAUTH_CLIENT_SECRET` (Production; add Preview if previews should log in through production's proxy, which `base_url` already points at). Redeploy.
3. When a custom domain is attached, change `base_url` in `public/admin/config.yml` and the OAuth App's callback URL together.

Until the variables exist, `/oauth/auth` answers 503 with that instruction instead of failing silently.
