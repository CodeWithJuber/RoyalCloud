# Royal Clouds SEO Audit

Audit snapshot: **2026-07-11 19:50 UTC**. Target: `https://royalclouds.net`. This was a read-only live-network audit for the Astro migration.

## Executive summary

The crawl began with all **58** sitemap URLs and recursively followed every same-origin anchor until the queue closed. It found **66 unique same-origin URLs** represented by **5,832 anchor occurrences**. All 66 were fetched without transport errors: **63 returned 200** and **3 returned 404**. Three of the 200 requests were `.php` aliases that first returned 301, leaving **60 unique 200 destinations**.

The migration has four launch-blocking SEO/routing issues:

1. **All 59 tested non-root trailing-slash variants return HTTP 500.** Normalize them permanently to the non-slash route at the edge.
2. **The `www` host serves duplicate 200 pages.** Permanently redirect every `www` URL to the HTTPS apex host, preserving path and query.
3. **No live 200 destination emits a canonical tag or structured data, and 58/60 lack an H1.** The Astro head/layout and page templates must enforce these signals.
4. **Two privacy links are broken destinations and two sitemap routes are client-side redirect shells.** Resolve them as explicit routes or redirects; do not carry the current behavior into Astro.

The complete route-level title, description, H1, canonical, schema, family, and migration disposition is in `ROUTE_MATRIX.md`.

## Crawl and indexability findings

### Sitemap and robots

- `robots.txt` allows all crawlers (`Disallow:` is empty) and declares `https://royalclouds.net/sitemap.xml`.
- The sitemap contains exactly **58 `<url>` entries**.
- All 58 entries use the identical stale `<lastmod>` value `2020-12-19T01:51:20+00:00`.
- Priorities are **1 × 1.00**, **55 × 0.80**, and **2 × 0.64**. These values add no migration value; generate a clean sitemap from canonical routes instead.
- Two strongly linked 200 pages are omitted: `/cyberpanel-vps-hosting` and `/managed-digitalocean-cloud-hosting`.
- Two sitemap entries, `/domains` and `/login`, are zero-second meta-refresh shells to `my.royalclouds.net` and should become server redirects, not sitemap URLs.

### HTTP and host behavior

- **60 unique 200 destinations** exist after resolving the three linked `.php` aliases.
- **3 same-origin URLs return 404:** `/third-party-data`, `/privacy`, and Cloudflare’s generated `/cdn-cgi/l/email-protection` endpoint.
- `http://royalclouds.net/*` currently uses temporary 302 redirects to HTTPS; the migration should use permanent 308 redirects.
- `https://www.royalclouds.net/` and `https://www.royalclouds.net/shared-hosting` both return 200, confirming a duplicate-host surface.
- Every one of the **59** tested trailing-slash variants for non-root live destinations returned **500**, with no `Location` header.
- Unknown content paths correctly return a 404 status, but the site’s own privacy destinations are genuinely missing rather than soft-404ing.

### Internal-link integrity

- `/third-party-data`: **2** links on `/privacy-policy`; the surrounding copy promises partner and third-party service-provider disclosure details. Create that disclosure or retarget both links to an approved page.
- `/privacy`: **2** links on `/privacy-policy`; both say “Privacy Center” in consent/data-rights contexts. Point them to the actual rights/consent workflow rather than assuming `/privacy-policy` is equivalent.
- `/cdn-cgi/l/email-protection`: **181** generated anchors across the **58 content-bearing pages**. Treat this as Cloudflare email obfuscation, not a route; use stable contact links in Astro.
- Linked legacy aliases remain in templates: `/shared-hosting.php` once, `/testimonials.php` twice, and `/compare-royalclouds-vps-plans.php` 23 times. Update source links to canonical paths even while preserving redirects.

## On-page SEO findings

Counts below use the **60 unique 200 destinations** (redirect sources excluded).

| Signal | Exact result | Migration requirement |
|---|---:|---|
| Title | 58 present; **2 missing**; **11 over 60 characters** | Add titles to `/domains` and `/login` only if they remain HTML; gateways should redirect. Review the 11 long titles for SERP truncation, not as a ranking rule. |
| Meta description | 58 present; **2 missing**; **12 are 1–119 chars**; **45 are 120–160**; **1 exceeds 160** | Keep one intentional, page-specific summary per canonical content route. |
| H1 | **2 present**, **58 missing**, 0 pages with multiple H1s | Render one visible, descriptive H1 per content page. |
| Canonical | **0 present**, **60 missing** | Emit one absolute self-canonical on every canonical content page; redirect/gateway responses do not need HTML canonicals. |
| Structured data | **0 JSON-LD**, **0 Microdata**, **0 RDFa** across all 60 | Add validated JSON-LD by route family; never mark up content that is not visible. |
| `<html lang>` | **0 present**, **60 missing** | Set the correct language, expected `en`, in the shared Astro document shell. |
| Meta robots | No indexable 200 destination declares one | Default canonical pages to index/follow; explicitly keep non-content utility/error responses out of the sitemap. |

### Exact missing and duplicate metadata

- Missing title and description: `/domains`, `/login` (both are meta-refresh gateways).
- The only duplicate non-empty title group among unique destinations: `/shared-hosting` and `/ssd-shared-hosting`.
- Duplicate description groups: `/shared-hosting` + `/ssd-shared-hosting`; `/speed` + `/uptime`.
- Exact visible-content duplicates: `/shared-hosting` + `/ssd-shared-hosting`. `/domains` and `/login` share an empty visible shell but refresh to different external destinations.
- The only H1s found are `/` → “Experience The Premium & Speed Optimized Hosting with 24/7 Friendly Support” and `/cookie-policy` → “Cookie Policy for Royal Clouds”.

### Titles over 60 characters

| Route | Chars | Live title |
|---|---:|---|
| `/cpanel-hosting` | 61 | Cpanel Hosting - SSD Cpanel Hosting \| SSD Hosting With Cpanel |
| `/cheap-centos-vps` | 62 | Cheap Centos VPS Hosting - Best & Cheap Centos SSD VPS Hosting |
| `/cheap-hosting-plans` | 62 | Buy Cheapest Hosting Plans - Cheap SSD Web Hosting Plans India |
| `/cheap-linux-vps` | 61 | Cheap Linux VPS Hosting - Best Linux VPS Server Hosting India |
| `/cheap-vps-hosting` | 61 | Cheap VPS Hosting - Buy Cheapest KVM VPS Hosting Server India |
| `/cheap-wordpress-hosting` | 65 | Cheap WordPress Hosting - Cheapest Hosting For WordPress in India |
| `/managed-vps-with-cpanel` | 63 | Managed VPS With Cpanel - Managed VPS Hosting With Cpanel India |
| `/opensuse-vps` | 63 | Fast Opensuse VPS Hosting - Best Opensuse SSD VPS Hosting India |
| `/scientific-vps` | 67 | Fast Scientific VPS Hosting - Best Scientific SSD VPS Hosting India |
| `/ssd-wordpress-hosting` | 64 | SSD WordPress Hosting- Best SSD WordPress Hosting Services India |
| `/managed-digitalocean-cloud-hosting` | 73 | Fully Managed DigitalOcean Cloud Hosting \| DigitalOcean Server Management |

### Description outliers

- **12 below 120 characters:** `/speed` (73), `/uptime` (73), `/datacenter` (109), `/support` (112), `/about` (108), `/testimonials` (113), `/best-vps` (119), `/privacy-policy` (116), `/affiliate` (90), `/partners` (89), `/compare-royalclouds-vps-plans` (91), `/cookie-policy` (96).
- **1 above 160 characters:** `/managed-digitalocean-cloud-hosting` (174).
- The full exact descriptions and character counts are recorded in `ROUTE_MATRIX.md`.

## Route-family migration rules

| Family | Routes | Required Astro behavior |
|---|---:|---|
| Home | 1 | Keep `/`; add `WebSite` and organization identity JSON-LD if the facts are verified and visible. |
| Core product | 6 | Keep stable slugs; one unique H1/title/description; self-canonical; use `Service` plus visible `Offer`/`OfferCatalog` data when accurate. |
| VPS SEO landing | 22 | Preserve all current paths initially; build from one typed template but retain genuinely unique copy and intent; use `BreadcrumbList` where visible. |
| Hosting SEO landing | 17 | Preserve paths except consolidate `/ssd-shared-hosting`; avoid template-only doorway duplication; add schema only for visible facts. |
| Company/support | 8 | Use semantic `AboutPage`, `ContactPage`, or generic `WebPage` types as applicable; keep contact methods crawlable and accessible. |
| Legal | 3 | Preserve exact slugs and content; use `WebPage`; repair the two promised privacy destinations before launch. |
| Comparison | 1 | Preserve the path; keep claims current and sourceable; use visible table semantics and `BreadcrumbList`. |
| External gateway | 2 | Replace meta refresh with server-side 302/307 to the exact `my.royalclouds.net` destination; exclude from sitemap. |

## Canonical and redirect policy

1. Canonical origin is `https://royalclouds.net` (apex, HTTPS).
2. Canonical path style has **no trailing slash**, except `/`.
3. Normalize HTTP, `www`, and trailing slashes in one edge hop, preserving path and query.
4. Preserve the three observed `.php` redirects and add the proposed `/ssd-shared-hosting` → `/shared-hosting` consolidation.
5. Update every internal link to the final canonical URL; redirects are for external/backward compatibility, not navigation.
6. Emit exactly one absolute self-canonical per canonical HTML page.
7. Return real 404 status for unknown routes. Do not redirect all missing URLs to `/`.
8. Keep `/third-party-data` and `/privacy` unresolved until their promised product/legal destinations are approved; a guessed redirect would change meaning.

## Sitemap migration rule

Generate the sitemap from Astro’s canonical route inventory rather than copying the legacy XML. Under the proposed rules it should contain **57 URLs**: the 60 unique 200 destinations, minus 2 external gateways and minus 1 consolidated duplicate. This count already includes the 2 currently omitted live pages. Add `/third-party-data` only if a real indexable disclosure is published, raising the expected total to **58**. Use truthful per-page modification dates; omit `<priority>` unless the team has a concrete consumer for it.

## Verification commands

The snapshot is exact as of the audit timestamp; a live site can change. These commands are read-only.

### Robots and sitemap count

```bash
curl -fsSL https://royalclouds.net/robots.txt
python3 - <<'PY'
import requests
from collections import Counter
from xml.etree import ElementTree as ET
xml = ET.fromstring(requests.get('https://royalclouds.net/sitemap.xml', timeout=30).content)
ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
rows = xml.findall('s:url', ns)
print('urls', len(rows))
print('lastmod', Counter(row.find('s:lastmod', ns).text for row in rows))
print('priority', Counter(row.find('s:priority', ns).text for row in rows))
PY
```

Expected snapshot output: `urls 58`; all 58 lastmods are `2020-12-19T01:51:20+00:00`; priorities are `0.80: 55`, `0.64: 2`, `1.00: 1`.

### Closed same-origin crawl and metadata counts

Requires Python packages `requests` and `beautifulsoup4`.

```bash
python3 - <<'PY'
import json
from collections import Counter, deque
from urllib.parse import urljoin, urlsplit, urlunsplit
from xml.etree import ElementTree as ET
import requests
from bs4 import BeautifulSoup

origin = 'https://royalclouds.net'
session = requests.Session()
session.headers['User-Agent'] = 'RoyalClouds-Astro-Migration-Verify/1.0'
xml = ET.fromstring(session.get(origin + '/sitemap.xml', timeout=30).content)
ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
seeds = [node.text.strip() for node in xml.findall('s:url/s:loc', ns)]
queue, seen, pages, edges = deque(seeds), set(seeds), {}, []

def clean(url):
    p = urlsplit(url)
    return urlunsplit((p.scheme.lower(), p.netloc.lower(), p.path or '/', p.query, ''))

while queue:
    requested = queue.popleft()
    response = session.get(requested, timeout=30, allow_redirects=True)
    soup = BeautifulSoup(response.content, 'html.parser') if 'html' in response.headers.get('content-type', '') else BeautifulSoup('', 'html.parser')
    pages[requested] = {
        'status': response.status_code,
        'final': clean(response.url),
        'redirects': len(response.history),
        'title': soup.title.get_text(' ', strip=True) if soup.title else '',
        'description': (soup.select_one('meta[name="description" i]') or {}).get('content', '').strip(),
        'h1': len(soup.find_all('h1')),
        'canonical': len(soup.select('link[rel~="canonical" i][href]')),
        'jsonld': len(soup.select('script[type="application/ld+json"]')),
        'microdata': len(soup.select('[itemscope], [itemtype]')),
        'rdfa': len(soup.select('[typeof], [vocab]')),
    }
    for anchor in soup.find_all('a', href=True):
        resolved = clean(urljoin(response.url, anchor['href']))
        p = urlsplit(resolved)
        if p.scheme == 'https' and p.netloc == 'royalclouds.net':
            edges.append(resolved)
            if resolved not in seen:
                seen.add(resolved)
                queue.append(resolved)

destinations = {}
for page in pages.values():
    if page['status'] == 200:
        destinations.setdefault(page['final'], page)
print('sitemap', len(seeds))
print('fetched', len(pages), 'unique_internal', len(set(edges)), 'anchor_occurrences', len(edges))
print('statuses', Counter(page['status'] for page in pages.values()))
print('redirecting_requests', sum(page['redirects'] > 0 for page in pages.values()))
print('unique_200_destinations', len(destinations))
print('missing_title', sum(not page['title'] for page in destinations.values()))
print('missing_description', sum(not page['description'] for page in destinations.values()))
print('missing_h1', sum(page['h1'] == 0 for page in destinations.values()))
print('missing_canonical', sum(page['canonical'] == 0 for page in destinations.values()))
print('any_schema', sum(bool(page['jsonld'] or page['microdata'] or page['rdfa']) for page in destinations.values()))
PY
```

Expected snapshot totals: `sitemap 58`, `fetched 66`, `unique_internal 66`, `anchor_occurrences 5832`, statuses `200: 63` and `404: 3`, `redirecting_requests 3`, `unique_200_destinations 60`, `missing_title 2`, `missing_description 2`, `missing_h1 58`, `missing_canonical 60`, `any_schema 0`.

### Host, protocol, and slash behavior

```bash
python3 - <<'PY'
import requests
tests = [
  'http://royalclouds.net/',
  'https://www.royalclouds.net/',
  'http://www.royalclouds.net/',
  'https://royalclouds.net/shared-hosting/',
]
for url in tests:
    response = requests.get(url, timeout=30, allow_redirects=False)
    print(response.status_code, response.headers.get('location', '-'), url)
PY
```

Expected snapshot: apex HTTP returns 302 to HTTPS apex; HTTPS `www` returns 200; HTTP `www` returns 302 to HTTPS `www`; the trailing-slash product URL returns 500. The audit tested all 59 non-root live destinations and all 59 returned 500.
