# Royal Clouds Redesign

A from-scratch Next.js App Router redesign for `royalclouds.net`, built in an isolated folder so the existing Astro code remains untouched.

## Plan
- Build a unique custom hosting landing page rather than a generic AI/template layout.
- Reuse Royal Clouds brand assets: logo, mascot character, cloud/server artwork, blue/gold/mint color direction.
- Use real Royal Clouds public content for plans, support promises, trust badges, and testimonials.
- Add mobile-first responsive sections for hero, plans, domain search, features, managed operations, proof, support, and final CTA.
- Include validation, typed schemas, logging, retryable network utility, tests, and production notes.

## Assumptions
- The redesign can live as a separate deployable Next.js app under `royalclouds-redesign/`.
- Domain availability continues through the existing Royal Clouds WHMCS/cart portal rather than a new third-party domain API.
- Product prices and plan facts are copied from public Royal Clouds content available at implementation time.

## Data Sources
https://royalclouds.net
https://my.royalclouds.net
Repository source files: `src/data/site.json`, `src/data/plans/shared.json`, and brand assets under `src/assets/images/brand/`.

## UX Flow Summary
- **Hero:** introduces the redesigned Royal Clouds experience with mascot, launch offer, trust badges, and primary CTAs.
- **Plans:** compares SSD shared hosting, KVM VPS/cloud, managed WordPress, and dedicated servers with real prices and features.
- **Domain Search:** validates domain labels locally, then opens the secure Royal Clouds cart for the real availability check.
- **Feature System:** summarizes installer, performance, support, and managed security benefits.
- **Managed Operations:** explains server care as a visible operations loop.
- **Testimonials:** reuses real public testimonials from the current site.
- **Support:** routes users to chat/contact, email, or support ticket.

## Component Inventory
- `Header` — sticky responsive navigation with skip link.
- `Hero` — brand-led above-the-fold section.
- `Section` — reusable layout wrapper.
- `PlanCards` — validated hosting plan cards.
- `DomainSearch` — client-side validated domain form.
- `FeatureGrid` — reusable benefits grid.
- `SupportBand` — multi-channel support CTA.
- `Footer` — footer navigation and brand summary.

## Responsive Strategy
- Mobile-first CSS with Tailwind.
- Minimum supported viewport: 320px.
- Layout rules:
  - Single-column on mobile.
  - Two-column content blocks from `lg`.
  - Plan cards move from one column to two columns to four columns.
  - Domain form stacks on mobile and becomes input/select/button grid from `md`.
- No horizontal scrolling; `body` has `overflow-x: hidden` and cards use fluid widths.

## Accessibility Checklist
- Semantic `header`, `main`, `section`, `article`, `figure`, `footer`, and navigation landmarks.
- Skip link for keyboard users.
- Visible focus styles through `.focus-ring`.
- Form labels and `role="status"` for domain-search feedback.
- Meaningful image alt text for logos, mascot, and illustrations; decorative images use empty alt text.
- High-contrast dark hero and CTA areas with readable text.
- `prefers-reduced-motion` disables animations/transitions.
- Mobile navigation button is labelled.

## File Structure
```text
royalclouds-redesign/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── DomainSearch.tsx
│   ├── FeatureGrid.tsx
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── PlanCards.tsx
│   ├── Section.tsx
│   └── SupportBand.tsx
├── artifacts/
│   └── README.md
├── e2e/
│   └── home.spec.ts
├── lib/
│   ├── content.ts
│   ├── domain.ts
│   ├── logger.ts
│   ├── network.ts
│   ├── schemas.ts
│   └── utils.ts
├── public/
│   └── brand/
├── tests/
│   ├── integration/royalclouds.test.ts
│   ├── setup.ts
│   └── unit/
├── .env.example
├── next.config.mjs
├── package.json
├── playwright.config.ts
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

## Complete Code
All complete runnable source files are committed inside this folder. No pseudocode or snippets are required to assemble the app.

## Setup Instructions
```bash
cd royalclouds-redesign
npm install
cp .env.example .env.local
```

## Run Instructions
```bash
npm run dev
```

Open http://localhost:3000.

## Test Instructions
```bash
npm run typecheck
npm test
RUN_INTEGRATION=1 npm run test:integration
npm run e2e
```

Optional screenshot generation is documented in `artifacts/README.md`; screenshots are intentionally not committed because this PR workflow rejects binary files.

The integration test is behind `RUN_INTEGRATION=1` because it performs a real network request to the public Royal Clouds homepage.

## Key Design Decisions
- **Isolated app:** created in `royalclouds-redesign/` to avoid touching existing production code.
- **No fake data:** content is derived from public Royal Clouds pages and existing repository data/assets.
- **No copied binary assets:** `public/brand/` uses Git symlinks to the existing repository assets so PR creation does not fail with binary-file diff errors.
- **No committed screenshots:** screenshots are generated locally under `artifacts/` and documented in `artifacts/README.md` instead of being committed as binary files.
- **No domain API key:** the form validates input locally and hands off to the real billing portal.
- **Security:** only HTTPS portal URLs are allowed; outbound fetch helper rejects non-HTTPS requests, uses timeout, retries, jitter, and structured logs.
- **Performance:** server-rendered Next page, optimized package imports, compressed static assets, and responsive images.
