import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ORIGIN = "https://royalclouds.net";
const ROOT = process.cwd();
const OUTPUT_DIRECTORY = path.join(ROOT, "docs/research/live-site");
const ASSET_DIRECTORY = path.join(ROOT, "public/legacy-assets");
const CONCURRENCY = 8;
const EXTRA_ROUTES = [
  "/cyberpanel-vps-hosting",
  "/managed-digitalocean-cloud-hosting",
];
const REDIRECTS = [
  { from: "/shared-hosting.php", to: "/shared-hosting", status: 301 },
  { from: "/testimonials.php", to: "/testimonials", status: 301 },
  {
    from: "/compare-royalclouds-vps-plans.php",
    to: "/compare-royalclouds-vps-plans",
    status: 301,
  },
  {
    from: "/domains",
    to: "https://my.royalclouds.net/cart.php?a=add&domain=register",
    status: 302,
  },
  {
    from: "/login",
    to: "https://my.royalclouds.net/login",
    status: 302,
  },
  { from: "/privacy", to: "/privacy-policy", status: 301 },
  {
    from: "/third-party-data",
    to: "/privacy-policy#third-party-data",
    status: 301,
  },
];

await mkdir(OUTPUT_DIRECTORY, { recursive: true });
await mkdir(ASSET_DIRECTORY, { recursive: true });

const sitemapXml = await fetchText(`${ORIGIN}/sitemap.xml`);
const sitemapUrls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map(
  (match) => match[1],
);
const pageUrls = [
  ...new Set([
    ...sitemapUrls.filter(
      (url) => !url.endsWith("/domains") && !url.endsWith("/login"),
    ),
    ...EXTRA_ROUTES.map((route) => `${ORIGIN}${route}`),
  ]),
];

const pages = await mapLimit(pageUrls, CONCURRENCY, inspectPage);
const stylesheetUrls = [
  ...new Set(
    pages.flatMap((page) =>
      page.assets.filter((asset) => asset.kind === "stylesheet").map((asset) => asset.url),
    ),
  ),
];
const stylesheets = await mapLimit(stylesheetUrls, CONCURRENCY, inspectStylesheet);

const assetCandidates = [
  ...pages.flatMap((page) => page.assets),
  ...stylesheets.flatMap((stylesheet) => stylesheet.assets),
];
const uniqueAssets = uniqueBy(
  assetCandidates.filter((asset) => isDownloadableAsset(asset.url)),
  (asset) => normalizeAssetUrl(asset.url),
);
const downloadedAssets = await mapLimit(uniqueAssets, CONCURRENCY, downloadAsset);

const externalDomains = Object.entries(
  Object.groupBy(
    pages.flatMap((page) =>
      page.externalDomains.map((hostname) => ({ hostname, page: page.url })),
    ),
    (entry) => entry.hostname,
  ),
)
  .map(([hostname, entries]) => ({
    hostname,
    pageCount: new Set(entries.map((entry) => entry.page)).size,
  }))
  .sort((left, right) => right.pageCount - left.pageCount);

const report = {
  generatedAt: new Date().toISOString(),
  origin: ORIGIN,
  sitemapCount: sitemapUrls.length,
  canonicalPageCount: pageUrls.length,
  redirects: REDIRECTS,
  pages,
};

const assetReport = {
  generatedAt: report.generatedAt,
  total: downloadedAssets.length,
  successful: downloadedAssets.filter((asset) => asset.ok).length,
  failed: downloadedAssets.filter((asset) => !asset.ok).length,
  assets: downloadedAssets,
};

const integrationReport = {
  generatedAt: report.generatedAt,
  externalDomains,
  forms: pages.flatMap((page) =>
    page.forms.map((form) => ({ page: page.url, ...form })),
  ),
  scripts: [
    ...new Set(
      pages.flatMap((page) =>
        page.scripts.filter((script) => script.startsWith("http")),
      ),
    ),
  ],
};

await Promise.all([
  writeJson("routes-and-content.json", report),
  writeJson("assets.json", assetReport),
  writeJson("integrations.json", integrationReport),
]);

console.log(
  JSON.stringify(
    {
      pages: report.canonicalPageCount,
      sitemapUrls: report.sitemapCount,
      redirects: report.redirects.length,
      assets: {
        total: assetReport.total,
        successful: assetReport.successful,
        failed: assetReport.failed,
      },
      externalDomains: integrationReport.externalDomains.length,
      output: path.relative(ROOT, OUTPUT_DIRECTORY),
    },
    null,
    2,
  ),
);

async function inspectPage(url) {
  try {
    const response = await fetchWithRetry(url);
    const html = await response.text();
    const links = extractAttributeUrls(html, "a", "href", url);
    const assets = extractAssets(html, url);
    const headings = [...html.matchAll(/<h([1-3])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map(
      (match) => ({ level: Number(match[1]), text: cleanText(match[2]) }),
    );
    const externalDomains = [
      ...new Set(
        [...links, ...assets.map((asset) => asset.url)]
          .map((candidate) => safeUrl(candidate, url))
          .filter((candidate) => candidate && candidate.origin !== ORIGIN)
          .map((candidate) => candidate.hostname),
      ),
    ];

    return {
      url,
      route: new URL(url).pathname,
      status: response.status,
      finalUrl: response.url,
      bytes: Buffer.byteLength(html),
      title: cleanText(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ""),
      description: getMetaContent(html, "name", "description"),
      canonical: getLinkHref(html, "canonical"),
      openGraphImage: getMetaContent(html, "property", "og:image"),
      headings,
      h1Count: headings.filter((heading) => heading.level === 1).length,
      jsonLdCount: (html.match(/type=["']application\/ld\+json["']/gi) ?? []).length,
      text: cleanText(
        (html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1 ?? 0] ?? html)
          .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
          .replace(/<style\b[\s\S]*?<\/style>/gi, " "),
      ).slice(0, 24000),
      internalLinks: [
        ...new Set(
          links
            .map((link) => safeUrl(link, url))
            .filter((link) => link?.origin === ORIGIN)
            .map((link) => `${link.pathname}${link.search}${link.hash}`),
        ),
      ],
      externalDomains,
      forms: extractForms(html, url),
      scripts: extractAttributeUrls(html, "script", "src", url),
      assets,
    };
  } catch (error) {
    return {
      url,
      route: new URL(url).pathname,
      status: 0,
      finalUrl: url,
      error: error instanceof Error ? error.message : String(error),
      bytes: 0,
      title: "",
      description: "",
      canonical: "",
      openGraphImage: "",
      headings: [],
      h1Count: 0,
      jsonLdCount: 0,
      text: "",
      internalLinks: [],
      externalDomains: [],
      forms: [],
      scripts: [],
      assets: [],
    };
  }
}

async function inspectStylesheet(url) {
  try {
    const css = await fetchText(url);
    const assets = [...css.matchAll(/url\((['"]?)(.*?)\1\)/gi)]
      .map((match) => match[2].trim())
      .filter((candidate) => !candidate.startsWith("data:"))
      .map((candidate) => ({
        url: safeUrl(candidate, url)?.href ?? candidate,
        kind: inferAssetKind(candidate),
        source: url,
      }));
    return { url, assets };
  } catch (error) {
    return {
      url,
      assets: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function downloadAsset(asset) {
  const normalizedUrl = normalizeAssetUrl(asset.url);
  try {
    const response = await fetchWithRetry(normalizedUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const body = Buffer.from(await response.arrayBuffer());
    const remotePath = decodeURIComponent(new URL(normalizedUrl).pathname).replace(/^\/+/, "");
    const safePath = remotePath
      .split("/")
      .filter((segment) => segment && segment !== "." && segment !== "..")
      .join("/");
    const localPath = path.join(ASSET_DIRECTORY, safePath || "asset.bin");
    await mkdir(path.dirname(localPath), { recursive: true });
    await writeFile(localPath, body);
    return {
      ...asset,
      url: normalizedUrl,
      ok: true,
      bytes: body.byteLength,
      contentType: response.headers.get("content-type") ?? "",
      sha256: createHash("sha256").update(body).digest("hex"),
      localPath: path.relative(ROOT, localPath),
    };
  } catch (error) {
    return {
      ...asset,
      url: normalizedUrl,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function extractAssets(html, baseUrl) {
  const assets = [];
  const patterns = [
    { tag: "img", attribute: "src", kind: "image" },
    { tag: "source", attribute: "src", kind: "media" },
    { tag: "video", attribute: "poster", kind: "image" },
    { tag: "link", attribute: "href", kind: "link" },
  ];

  for (const pattern of patterns) {
    for (const url of extractAttributeUrls(html, pattern.tag, pattern.attribute, baseUrl)) {
      const kind =
        pattern.tag === "link" && /\.css(?:\?|$)/i.test(url)
          ? "stylesheet"
          : inferAssetKind(url, pattern.kind);
      assets.push({ url, kind, source: baseUrl });
    }
  }

  for (const match of html.matchAll(/(?:srcset|data-src|data-background|data-bg)=["']([^"']+)["']/gi)) {
    for (const candidate of match[1].split(",")) {
      const rawUrl = candidate.trim().split(/\s+/)[0];
      const resolved = safeUrl(rawUrl, baseUrl);
      if (resolved) {
        assets.push({
          url: resolved.href,
          kind: inferAssetKind(resolved.pathname),
          source: baseUrl,
        });
      }
    }
  }

  for (const match of html.matchAll(/url\((['"]?)(.*?)\1\)/gi)) {
    const resolved = safeUrl(match[2], baseUrl);
    if (resolved) {
      assets.push({
        url: resolved.href,
        kind: inferAssetKind(resolved.pathname),
        source: baseUrl,
      });
    }
  }

  return uniqueBy(assets, (asset) => asset.url);
}

function extractForms(html, baseUrl) {
  return [...html.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/gi)].map((match) => {
    const attributes = match[1];
    const body = match[2];
    const action = getAttribute(attributes, "action");
    return {
      action: safeUrl(action || baseUrl, baseUrl)?.href ?? action,
      method: (getAttribute(attributes, "method") || "get").toUpperCase(),
      fields: [...body.matchAll(/<(?:input|textarea|select)\b([^>]*)>/gi)].map(
        (field) => ({
          name: getAttribute(field[1], "name"),
          type: getAttribute(field[1], "type"),
          required: /\brequired\b/i.test(field[1]),
        }),
      ),
    };
  });
}

function extractAttributeUrls(html, tag, attribute, baseUrl) {
  const expression = new RegExp(`<${tag}\\b[^>]*${attribute}=["']([^"']+)["']`, "gi");
  return [...html.matchAll(expression)]
    .map((match) => safeUrl(match[1], baseUrl)?.href)
    .filter(Boolean);
}

function getMetaContent(html, attribute, value) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  const tag = tags.find((candidate) =>
    new RegExp(`${attribute}=["']${value}["']`, "i").test(candidate),
  );
  return tag ? getAttribute(tag, "content") : "";
}

function getLinkHref(html, relation) {
  const tags = html.match(/<link\b[^>]*>/gi) ?? [];
  const tag = tags.find((candidate) =>
    new RegExp(`rel=["'][^"']*${relation}[^"']*["']`, "i").test(candidate),
  );
  return tag ? getAttribute(tag, "href") : "";
}

function getAttribute(fragment, name) {
  return fragment.match(new RegExp(`${name}=["']([^"']*)["']`, "i"))?.[1] ?? "";
}

function cleanText(value) {
  return decodeEntities(
    value
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function decodeEntities(value) {
  const entities = {
    "&amp;": "&",
    "&quot;": '"',
    "&#039;": "'",
    "&apos;": "'",
    "&lt;": "<",
    "&gt;": ">",
    "&nbsp;": " ",
  };
  return value.replace(
    /&(amp|quot|#039|apos|lt|gt|nbsp);/g,
    (entity) => entities[entity] ?? entity,
  );
}

function safeUrl(candidate, baseUrl) {
  if (!candidate || /^(?:data:|javascript:|mailto:|tel:|#)/i.test(candidate)) {
    return null;
  }
  try {
    return new URL(candidate, baseUrl);
  } catch {
    return null;
  }
}

function normalizeAssetUrl(url) {
  const parsed = new URL(url);
  parsed.hash = "";
  return parsed.href;
}

function isDownloadableAsset(url) {
  const parsed = safeUrl(url, ORIGIN);
  if (!parsed || parsed.origin !== ORIGIN) {
    return false;
  }
  return /\.(?:avif|css|eot|gif|ico|jpe?g|json|mp4|png|svg|ttf|webm|webp|woff2?)(?:$|\?)/i.test(
    parsed.href,
  );
}

function inferAssetKind(url, fallback = "asset") {
  if (/\.css(?:\?|$)/i.test(url)) return "stylesheet";
  if (/\.(?:avif|gif|ico|jpe?g|png|svg|webp)(?:\?|$)/i.test(url)) return "image";
  if (/\.(?:eot|ttf|woff2?)(?:\?|$)/i.test(url)) return "font";
  if (/\.(?:mp4|webm)(?:\?|$)/i.test(url)) return "media";
  return fallback;
}

async function fetchText(url) {
  const response = await fetchWithRetry(url);
  if (!response.ok) {
    throw new Error(`${url} returned HTTP ${response.status}`);
  }
  return response.text();
}

async function fetchWithRetry(url, attempt = 0) {
  try {
    const response = await fetch(url, {
      headers: { "user-agent": "RoyalCloud migration audit/1.0" },
      redirect: "follow",
      signal: AbortSignal.timeout(30000),
    });
    if (response.status >= 500 && attempt < 2) {
      return fetchWithRetry(url, attempt + 1);
    }
    return response;
  } catch (error) {
    if (attempt < 2) {
      return fetchWithRetry(url, attempt + 1);
    }
    throw error;
  }
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function uniqueBy(items, key) {
  const seen = new Set();
  return items.filter((item) => {
    const value = key(item);
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

async function writeJson(filename, value) {
  await writeFile(
    path.join(OUTPUT_DIRECTORY, filename),
    `${JSON.stringify(value, null, 2)}\n`,
  );
}
