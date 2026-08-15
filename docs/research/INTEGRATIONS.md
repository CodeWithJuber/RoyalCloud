# Royal Clouds Integration Audit

Audit snapshot: **2026-07-11 20:05 UTC**. Target: `https://royalclouds.net`. The inspection was read-only: pages and safe landing endpoints were fetched, but no form, cart, login, push permission, or support ticket was submitted.

## Exact scope

- **58** sitemap URLs plus **8** additional same-origin linked URLs were requested.
- The closed crawl found **60 unique 200 destinations**, including **58 content-bearing pages** and 2 external-gateway shells.
- Static HTML contained **2 public forms**, both on `/`.
- The content pages referenced **26 external or cross-origin hosts** when page-level references, the two link-only pages, and one browser-observed homepage load are combined.
- Browser inspection of `/` recorded **72 requests**: **49 first-party** and **23 third-party** across **13 third-party request hosts**.

## Integration matrix

| Integration | Exact live configuration | Coverage/evidence | Astro preservation rule |
|---|---|---|---|
| Google Analytics 4 | Measurement ID `G-P5KQ0VPEG6`; `gtag.js` from `www.googletagmanager.com` | Present on all **58** content pages. Browser emitted a `page_view` POST to `www.google-analytics.com`. | Preserve the property only after owner confirmation. Load through the approved consent mode and verify one pageview per navigation. |
| Microsoft Clarity | Project ID `3x1x1bd6t7` | Present on all **58** content pages; **115** loader blocks total because 57 pages contain two copies and one contains one. Browser loaded Clarity and emitted **6** collection POSTs during the observed homepage session. | Keep at most one loader. Gate recording behind consent and confirm masking/exclusion rules before production. |
| OneSignal Web Push | App ID `a5234b02-c017-42c3-aaed-f181d6b6b971`; `autoRegister: true`; notify button disabled | Present on all **58** content pages. Runtime loaded `OneSignalSDK.js`, `OneSignalPageSDKES6.js`, and a sync endpoint. | Preserve only if push remains a product requirement. Ask permission from a user action; do not auto-register on page load. |
| OneSignal workers | `/OneSignalSDKWorker.js` and `/OneSignalSDKUpdaterWorker.js` | Both return 200 and each imports `https://cdn.onesignal.com/sdks/OneSignalSDK.js`. | If retained, publish both files at the site root so service-worker scope remains valid. |
| Tawk.to chat | Property `56acad7a04c24b5047a5a90d`, widget `default` | Loader present on all **58** content pages. Exactly **117** links call `javascript:void(Tawk_API.toggle())`. The browser load failed with CORS in the audit environment. | Replace JavaScript URLs with real buttons, lazy-load after consent/interaction, and keep email/ticket fallbacks available when Tawk fails. |
| Mailchimp newsletter | `https://royalclouds.us11.list-manage.com/subscribe/post?u=78aa2ac66f8706eb3d4e378cc&id=eadb8a29c9` | One POST form on `/`, field `EMAIL`, required. No submission was made. | Preserve field name and audience identifiers only after ownership confirmation. Add explicit marketing consent, success/error states, and server-side anti-abuse where supported. |
| WHMCS/client portal | `https://my.royalclouds.net` | Login, domain registration, product checkout, knowledgebase, affiliate, and ticket destinations are linked from public pages. Safe landing endpoints returned 200 and expose WHMCS templates/session behavior. | Keep WHMCS as a separate origin unless a dedicated integration project replaces it. Preserve exact product IDs, billing cycles, and return destinations. |
| Cloudflare edge tooling | CDN/cache, email decoder, Browser Insights beacon, challenge scripts, Zaraz | Browser loaded `static.cloudflareinsights.com`, first-party `/cdn-cgi/**`, and `/cdn-cgi/zaraz/s.js`. | Do not copy generated scripts into Astro. Re-enable intentionally in Cloudflare and validate that Zaraz does not duplicate direct GA/Clarity tags. |
| Google Fonts | Open Sans and Dosis via `fonts.googleapis.com`/`fonts.gstatic.com` | Two CSS requests and three WOFF2 requests on the observed homepage load. | Prefer self-hosting; otherwise include in consent/privacy documentation and preconnect only when retained. |
| Imgur | 14 hotlinked JPGs | All 14 are referenced by `/partners`. | Migrate approved copies to first-party storage to remove availability and referrer leakage risk. |

## Public forms

Exactly **2** forms exist across the 58 public content pages, both on `/`:

| Purpose | Method and action | Fields | Preservation requirement |
|---|---|---|---|
| Domain search | `POST https://my.royalclouds.net/cart.php?a=add&domain=register` | Text field `query`; submit button; visual TLD `<select>` has no `name` | Preserve `query` exactly. Confirm whether WHMCS should receive a TLD; the current unnamed select is not submitted. |
| Newsletter | `POST https://royalclouds.us11.list-manage.com/subscribe/post?u=78aa2ac66f8706eb3d4e378cc&id=eadb8a29c9` | Required email field `EMAIL` | Preserve `EMAIL`; add clear consent copy, validation, loading, success, duplicate, and error states. |

There is **no public contact form** on `/support`. Public support routes are Tawk chat, Cloudflare-decoded email links, and the WHMCS ticket flow.

## WHMCS flows

### Gateways and account flow

- `/login` is a 200 HTML shell with a zero-second meta refresh to `https://my.royalclouds.net/login`.
- `/domains` is a 200 HTML shell with a zero-second meta refresh to `https://my.royalclouds.net/cart.php?a=add&domain=register`.
- `https://my.royalclouds.net/` redirects to `/login`.
- The WHMCS login form posts to `/login` with `username`, `password`, `rememberme`, and a hidden CSRF token. Google account sign-in and a reCAPTCHA configuration are present.
- Preserve these as server redirects from Astro, not client-side meta-refresh pages. Do not proxy credentials through Astro.

### Product checkout

Exactly **18** unique public product-add URLs were found, using product IDs:

`10`, `11`, `12`, `13`, `14`, `17`, `55`, `57`, `60`, `61`, `62`, `70`, `71`, `72`, `73`, `74`, `77`, `78`.

Products `70`–`74` explicitly include `billingcycle=annually`; the other 13 URLs do not set a billing cycle. Preserve every `pid` and existing billing-cycle query exactly until the WHMCS catalog owner validates a replacement mapping.

`/dedicated-servers` also contains **3 malformed concatenated links** such as:

`https://my.royalclouds.net/store/dedicated-servershttps://my.royalclouds.net/store/dedicated-servers`

Do not preserve the concatenations. Link once to the intended `https://my.royalclouds.net/store/dedicated-servers` destination.

### Support and knowledgebase

- Public ticket entry: `https://my.royalclouds.net/submitticket.php`.
- Two ticket departments are exposed: `deptid=1` (**Sales/Billing**) and `deptid=3` (**Abuse**).
- The next step posts to `/submitticket.php?step=3` with `name`, `email`, `subject`, `deptid`, `urgency`, `message`, and two `attachments[]` inputs, plus WHMCS security fields.
- Knowledgebase entry: `https://my.royalclouds.net/knowledgebase`; search posts to `/knowledgebase/search` with field `search`.
- Affiliate entry: `https://my.royalclouds.net/affiliates.php`; unauthenticated access redirects to login.
- Keep direct WHMCS links and do not recreate ticket submission without CSRF, attachment validation, spam controls, and ownership checks.

## External domain inventory

Exactly **26** external or cross-origin hosts were observed.

### Commerce and owned content — 3

- `my.royalclouds.net` — WHMCS login, cart, domain, affiliate, knowledgebase, and ticket flows.
- `blog.royalclouds.net` — blog link.
- `royalclouds.us11.list-manage.com` — Mailchimp newsletter POST.

### Analytics and telemetry — 8

- `www.googletagmanager.com`
- `www.google-analytics.com`
- `www.clarity.ms`
- `scripts.clarity.ms`
- `e.clarity.ms`
- `c.clarity.ms`
- `c.bing.com`
- `static.cloudflareinsights.com`

### Chat and push — 3

- `embed.tawk.to`
- `cdn.onesignal.com`
- `onesignal.com`

### Fonts, libraries, and media CDNs — 6

- `fonts.googleapis.com`
- `fonts.gstatic.com`
- `cdn.jsdelivr.net`
- `ajax.googleapis.com`
- `ajax.cloudflare.com`
- `i.imgur.com`

### Social and policy destinations — 6

- `facebook.com`
- `instagram.com`
- `twitter.com`
- `www.linkedin.com`
- `www.youtube.com`
- `www.google.com`

## Analytics and runtime behavior

The observed homepage load made **72** network requests:

- **49** to `royalclouds.net`.
- **23** to 13 third-party request hosts.
- One GA4 `page_view` request.
- Six Clarity collection POSTs.
- One OneSignal sync request plus two OneSignal SDK requests.
- One Cloudflare Browser Insights POST and Cloudflare challenge/Zaraz requests.
- Tawk loader request failed with `net::ERR_FAILED`/CORS, producing 2 console errors.
- Chart.js produced 2 deprecation warnings.

The source includes direct GA4 plus Cloudflare Zaraz carrying the same measurement ID. The observed session emitted one GA pageview, but the migration must verify production analytics in debug/realtime tools to rule out duplicate navigation events.

## Privacy and consent concerns

### Tracking before consent

No consent-management platform or cookie banner was found in source or the browser snapshot. Without any user interaction, the homepage created:

- **14 cookie records** across **7 cookie domains**.
- Cookie names included `_ga`, `_ga_P5KQ0VPEG6`, `_clck`, `_clsk`, `CLID`, `MUID`, `ANONCHK`, `MR`, `SM`, `SRM_B`, `__cf_bm`, and `cf_clearance`.
- **4** local-storage entries related to OneSignal/push state: `isPushNotificationsEnabled`, `onesignal-notification-prompt`, `isOptedOut`, and `os_pageViews`.

Analytics, session recording, push, and chat must be classified and gated under the approved consent policy. Essential Cloudflare security cookies should be documented separately from optional analytics/marketing storage.

### Policy mismatch

- `/cookie-policy` discusses Google Analytics and generic third-party cookies, but does not name the observed Clarity, OneSignal, Tawk, Mailchimp, Imgur, or Cloudflare telemetry flows.
- `/privacy-policy` describes broad personal, payment, support, and analytics data handling and states a retention period of up to seven years, but the live integration list should be reconciled with the actual vendors and purposes.
- The policy links `/privacy` and `/third-party-data` are broken. Do not invent a destination; publish the promised rights/vendor disclosures or update the approved legal copy.
- The newsletter form exposes no visible consent checkbox or vendor notice in the form itself.

### Browser/security headers

The sampled public HTML response did not include `Strict-Transport-Security`, `Content-Security-Policy`, `Permissions-Policy`, `Referrer-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Cross-Origin-Opener-Policy`, or `Cross-Origin-Resource-Policy`.

Astro/edge launch should add an integration-aware CSP and related headers only after the final vendor list is known. A CSP must account for WHMCS navigation, Mailchimp form submission, approved font sources, GA/Clarity endpoints, OneSignal workers, and Tawk frames/scripts if those services remain.

## Negative findings

- No Facebook/Meta Pixel loader or `fbq(...)` call was found; Facebook is only a social link/icon.
- No active Stripe client script was found.
- PayPal appears as a payment icon, not a public-site JavaScript integration. Actual payment processors remain inside WHMCS and were not exercised.
- No public reCAPTCHA script was observed on `royalclouds.net`; WHMCS exposes reCAPTCHA configuration on its own origin.
- No public contact-form submission endpoint exists despite legacy contact/form-validation scripts being loaded.

Do not add Meta Pixel, Stripe, or any other vendor merely because its icon, CSS class, or policy text exists.

## Preservation rules

1. Preserve WHMCS product IDs, annual billing-cycle parameters, domain `query`, login/ticket/knowledgebase destinations, and server-side redirect behavior.
2. Keep `my.royalclouds.net` credential and payment handling isolated; Astro should link or redirect, not relay sensitive data.
3. Preserve Mailchimp's `EMAIL` field and audience identifiers only after account ownership and consent language are confirmed.
4. Publish OneSignal worker files at the root only if push remains; replace `autoRegister` with an explicit permission action.
5. Replace all `javascript:void(Tawk_API.toggle())` links with accessible buttons and retain email/ticket fallbacks.
6. Load GA, Clarity, Tawk, and OneSignal once, after the approved consent condition; verify Astro client navigation does not duplicate events.
7. Configure Cloudflare integrations at the edge rather than copying `/cdn-cgi/**` assets.
8. Self-host hotlinked media/fonts where approved and minimize referrer leakage to third parties.
9. Update the privacy/cookie/vendor disclosures before enabling optional tracking in production.
10. Re-run a clean-browser network capture after migration and compare request hosts, cookies, storage, form actions, and WHMCS destinations against this audit.
