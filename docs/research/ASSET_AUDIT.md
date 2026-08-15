# Royal Clouds Asset Audit

Audit snapshot: **2026-07-11 20:05 UTC**. Target: `https://royalclouds.net`. Network work was read-only; no form was submitted and no authenticated page was opened.

## Crawl scope

- Started from all **58** sitemap URLs and followed every same-origin anchor.
- Requested **66** unique same-origin URLs: **63 returned 200** after redirects and **3 returned 404**.
- Three of the successful requests are one-hop `.php` aliases, leaving **60 unique 200 destinations**.
- Of those 60 destinations, **58 are content-bearing pages** and **2** (`/domains`, `/login`) are zero-second meta-refresh gateways to `my.royalclouds.net`.
- The two content pages omitted from the sitemap are `/cyberpanel-vps-hosting` and `/managed-digitalocean-cloud-hosting`; their assets are included below.
- Counts include `<img>`, image `srcset`, CSS `url(...)`, favicon links, preload links, and `og:image` metadata. Query-string variants are distinct URLs because the live templates request them distinctly.

## Exact asset totals

### Images and SVGs

| Type | Referenced URLs | HTTP 200 | Broken | Notes |
|---|---:|---:|---:|---|
| PNG | **86** | **75** | **11** | Includes logos, plan art, client/partner art, backgrounds, and 7 Open Graph PNGs. |
| SVG | **67** | **66** | **1** | Includes illustrations, UI icons, partner marks, patterns, and legacy font SVGs. |
| JPG/JPEG | **40** | **23** | **17** | Includes 14 Imgur images, product art, location art, and 1 Open Graph JPG. |
| GIF | **1** | **0** | **1** | Missing `AjaxLoader.gif`. |
| **Total** | **194** | **164** | **30** | **180** first-party URLs and **14** Imgur URLs; **193** unique host/path pairs. |

Directory distribution for the 194 references:

| Location | Count | Representative paths |
|---|---:|---|
| `/assets/img/**` excluding `/og/` | **80** | `/assets/img/royalclouds_w_logo.png?w=200`, `/assets/img/icons/gradient/data-center.svg`, `/assets/img/partners/cloudflare-logo.png` |
| `/assets/extended/**` | **44** | `/assets/extended/patterns/ssd.svg`, `/assets/extended/fonts/svg/livechat.svg`, `/assets/extended/img/topbanner01.jpg` |
| `/assets/images/**` | **33** | `/assets/images/cheapvps.png`, `/assets/images/cyberpanel-vps-hosting.png`, `/assets/images/managed-do-hosting.svg` |
| `i.imgur.com` | **14** | `https://i.imgur.com/0huPQxc.jpg`, `https://i.imgur.com/7PVAApJ.jpg` |
| `/assets/img/og/**` | **8** | `/assets/img/og/main.png`, `/assets/img/og/vps.png`, `/assets/img/og/managed.jpg` |
| `/img/**` | **8** | `/img/page-bg.png`, `/img/news-details/news-img-four.png` |
| `/doprice/**` | **3** | `/doprice/vps-locations.jpg`, `/doprice/windows-vps-location-flags.jpg` |
| `/assets/fonts/**` SVGs | **2** | `/assets/fonts/boxicons.svg`, `/assets/fonts/Flaticon.svg` |
| Other first-party | **2** | `/AjaxLoader.gif`, `/owl.video.play.png` |

### Brand assets

| Asset | Live facts | Migration rule |
|---|---|---|
| `/assets/img/royalclouds_w_logo.png?w=200` | PNG, 1434×490, 13,390 bytes | Preserve the artwork and visual aspect ratio; generate an optimized display-size derivative. |
| `/assets/img/royalclouds_w_logo.png?w=250` | Byte-identical to `?w=200`; the query does not resize the file | Deduplicate to one source asset while keeping old query URLs redirected or otherwise valid. |
| `/assets/img/royalclouds-blues.png` | Alternate blue PNG logo, 970×207, 18,118 bytes; used on link-only pages | Retain until the header/footer variant decision is approved. |
| `/assets/img/favi.png` | The only declared favicon; PNG, 17×17, 249 bytes | Preserve this URL for compatibility, then add modern SVG/PNG sizes, `apple-touch-icon`, and a manifest. |
| `/assets/img/og/main.png` | Main social image, 3000×1688, 932,150 bytes | Preserve social composition but export a smaller 1200×630-class derivative. |

No SVG logo was found. Do not redraw or substitute the wordmark without brand approval.

### Open Graph images

Exactly **8** unique `og:image` URLs were found and all returned 200:

- `/assets/img/og/aff.png` — 1,545,933 bytes.
- `/assets/img/og/contact.png` — 1,016,270 bytes.
- `/assets/img/og/dedi.png` — 946,068 bytes.
- `/assets/img/og/main.png` — 932,150 bytes.
- `/assets/img/og/managed.jpg` — 116,647 bytes.
- `/assets/img/og/speed.png` — 444,362 bytes.
- `/assets/img/og/ssdshared.png` — 592,420 bytes.
- `/assets/img/og/vps.png` — 1,466,917 bytes.

Preserve each route-to-image association. Optimize copies rather than changing the social creative silently.

### Reusable visual families

- Hosting/product art: `/assets/images/*.png`, including VPS, Linux distribution, WordPress, cPanel, and shared-hosting illustrations.
- Gradient feature icons: `/assets/img/icons/gradient/{bandwidth,data-center,development}.svg`.
- Infrastructure icons: `/assets/img/icons/{001-database,002-cloud,004-backup,010-dns,014-firewall,019-maintenance,020-raid,026-tech-support}.svg` and the `*-color.svg` variants.
- Plan transport icons: `/assets/img/icons/plans/{mountain-bike,motorcycle,car,train-station,plane}.svg`.
- Uptime/security icons: `/assets/img/uptime/{backup,ddos,firewall,malware,update}.svg`.
- Partner marks: `/assets/img/partners/{LiteSpeed,cloudflare-logo,cloudlinux-logo,cpanel-logo,intel-logo,lets-encrypt-logo,softaculous-logo,twak}.*`.
- Comparison marks: `/assets/images/compare/{aws,do,linode,rc,vultr}.png`.
- Decorative backgrounds/shapes: `/assets/img/banner-one/**`, `/assets/img/banner-shape/**`, `/assets/img/shape/**`, and `/assets/extended/patterns/**`.

## Broken asset references

Exactly **30** referenced image URLs did not return an image:

- **16** missing banners: `/assets/extended/img/topbanner01.jpg` through `/assets/extended/img/topbanner16.jpg`.
- **3** missing carousel arrows: `/assets/extended/img/arrow-left-2.png`, `/assets/extended/img/arrow-left-2-act.png`, `/assets/extended/img/arrow-right-2.png`.
- **8** missing template backgrounds/news images: `/img/banner-two/banner-two-bg.jpg`, `/img/coming-soon-bg.png`, `/img/news-details/news-img-{four,five,six,seven}.png`, `/img/page-bg.png`, `/img/sign-up-bg.png`.
- **3** other missing files: `/AjaxLoader.gif`, `/assets/fonts/Flaticon.svg`, `/owl.video.play.png`.

Do not copy these failed HTML/404 bodies into `public/`. Either remove the dead CSS/markup references or recover the intended originals from an approved source.

## Image markup quality

Across the 58 content-bearing pages:

- **1,798** `<img>` occurrences.
- **1,798/1,798** use `loading="lazy"`, including above-the-fold and likely LCP images.
- **0** declare both `width` and `height`.
- **0** use `srcset`.
- **742** omit `alt`; another **250** have an empty `alt`.

Migration rules:

1. Do not lazy-load the header logo or route LCP image; use eager loading and `fetchpriority="high"` only for the actual LCP candidate.
2. Supply intrinsic dimensions or `aspect-ratio` for every image to prevent layout shift.
3. Generate responsive AVIF/WebP plus fallback sources for raster content; keep SVGs as SVG when safe.
4. Preserve meaningful alt text and write missing text from the visible purpose, not filenames. Keep `alt=""` only for genuinely decorative images.
5. Self-host or replace the 14 Imgur assets before launch so presentation does not depend on a third-party hotlink.

## Fonts and icon systems

Exactly **23** unique local font URLs returned 200:

| Family | Files | Formats | Usage |
|---|---:|---|---|
| Cloudicon | **3** | EOT, TTF, WOFF | Large custom hosting/UI glyph map; the browser preloads the TTF. |
| Font Awesome 5 Brands | **4** | EOT, TTF, WOFF, WOFF2 | Social/payment brand icons. |
| Font Awesome 5 Regular | **4** | EOT, TTF, WOFF, WOFF2 | Regular icons. |
| Font Awesome 5 Solid | **4** | EOT, TTF, WOFF, WOFF2 | Solid UI icons. |
| Flaticon | **4** | EOT, TTF, WOFF, WOFF2 | Feature/UI icons. |
| Boxicons | **4** | EOT, TTF, WOFF, WOFF2 | Navigation, social, and UI icons. |

The content pages also import Google-hosted **Open Sans** and **Dosis** CSS. On the homepage the browser loaded **8 font files**: 5 local icon fonts and 3 Google WOFF2 files.

Preservation rules:

- Preserve icon appearance and semantics, not the legacy font implementation. Prefer a reviewed inline-SVG icon component.
- If icon fonts remain temporarily, preserve every class-to-codepoint mapping until template usage is audited.
- Keep only required WOFF2 files after confirming browser support; do not ship EOT/TTF/WOFF variants by default.
- Decide whether to self-host Open Sans/Dosis. If Google Fonts remains, account for its external requests and privacy implications.
- Preload only fonts used above the fold; the current four local preloads are not evidence that all four are critical.

## CSS and JavaScript assets

- **30** unique static `<script src>` URLs across the 58 content pages: **25** first-party and **5** third-party.
- **29** returned 200. The malformed `/https://cdn.jsdelivr.net/npm/typed.js@2.0.11` occurs on **21** pages and returned 403.
- The same Typed.js URL is correct on **22** pages as `https://cdn.jsdelivr.net/npm/typed.js@2.0.11`.
- Shared first-party libraries include two jQuery builds, Bootstrap, Popper, Owl Carousel, WOW, Nice Select, Chart.js, form-validator, Flying Pages, and custom/contact/map scripts.
- The 58 content pages contain **931** external-script tag occurrences.
- Inline CSS totals **34,170,089 decoded bytes** in **895** `<style>` tags. A typical content page embeds about **587 KB** of CSS; `/managed-digitalocean-cloud-hosting` embeds **708,046 bytes**.
- No active first-party stylesheet link was found on the main template; the legacy CSS is embedded in HTML, while Google Fonts is imported from inline CSS.

Migration rules:

1. Extract shared CSS into Astro-managed, cacheable stylesheets and page-level chunks; do not reproduce the repeated 587 KB inline payload.
2. Remove duplicate jQuery/Bootstrap loads and replace plugins with CSS/native behavior where practical.
3. Preserve only interactions that are still visible and required: menus, pricing toggles, comparison charts, carousels, countdowns, and form affordances.
4. Fix or remove the malformed Typed.js source before migration; never preserve `/https://...` paths.
5. Do not copy Cloudflare challenge or email-decoder URLs as application assets; they are edge-generated.
6. Verify each page without JavaScript. Commerce/support integrations may enhance navigation but must not hide essential links or content.

## Launch preservation checklist

- [ ] Keep every approved image association by route, including all 8 `og:image` mappings.
- [ ] Preserve the white and blue logo variants until design sign-off; keep old logo/favicons URLs valid.
- [ ] Replace 14 Imgur hotlinks with approved local copies.
- [ ] Resolve all 30 broken image references intentionally.
- [ ] Map or replace all five icon systems without losing glyph meaning.
- [ ] Add responsive image generation, dimensions, alt text, and correct LCP loading.
- [ ] Extract repeated inline CSS and remove duplicate/obsolete script libraries.
- [ ] Re-crawl the built Astro site and require zero missing first-party assets.
