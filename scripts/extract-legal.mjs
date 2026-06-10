import { readFileSync, writeFileSync } from "node:fs";
import yaml from "js-yaml";

const META = {
  "privacy-policy": {
    title: "Royal Clouds - Privacy Policy",
    description:
      "Read Royal Clouds Privacy Policy Before Buying Web Hosting Services. We Are Providing Best SSD Web Hosting in India.",
    heading: "Privacy Policy",
    sub: "You must read and agree our Privacy Policy before buying our services.",
  },
  "terms-of-service": {
    title: "Terms Of Services | Royal Clouds",
    description:
      "Royal Clouds is affordable web hosting company in India which is providing reliable web hosting services, cheap web hosting India & reseller web hosting",
    heading: "Terms of Service",
    sub: "Please read these terms carefully before using our services.",
  },
  "cookie-policy": {
    title: "Royal Clouds - Cookies Policy",
    description:
      "Read Royal Clouds Cookies Policy before visiting RoyalClouds which is providing SSD Web Hosting.",
    heading: "Cookie Policy",
    sub: "How and why Royal Clouds uses cookies.",
  },
};

const decode = (s) =>
  s
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]+>/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n /g, "\n")
    .trim();

for (const [slug, m] of Object.entries(META)) {
  const html = readFileSync(`src/data/clone/${slug}.html`, "utf8");
  const body = (html.match(/<body[^>]*>([\s\S]*?)<\/body>/i) || ["", ""])[1];
  // grab the .knowledge container
  const kStart = body.search(/class="[^"]*knowledge[^"]*"/i);
  let region = body.slice(kStart);
  region = region.slice(0, region.search(/<footer|id="footer"|class="footer/i));
  // Walk h5/h4/h3/p/li in order
  const tokens = [...region.matchAll(/<(h[1-6]|p|li)[^>]*>([\s\S]*?)<\/\1>/gi)];
  const lines = [];
  for (const t of tokens) {
    const tag = t[1].toLowerCase();
    const text = decode(t[2]);
    if (!text) continue;
    if (/^h[1-4]$/.test(tag)) lines.push(`\n## ${text}\n`);
    else if (tag === "h5" || tag === "h6") lines.push(`\n### ${text}\n`);
    else if (tag === "li") lines.push(`- ${text}`);
    else lines.push(`${text}\n`);
  }
  const front = {
    title: m.heading,
    metadata: {
      title: m.title,
      description: m.description,
      ignoreTitleTemplate: true,
    },
    breadcrumb: [],
    sections: [
      {
        type: "hero",
        variant: "simple",
        eyebrow: "Legal",
        title: m.heading,
        subtitle: m.sub,
      },
    ],
  };
  const md = `---\n${yaml.dump(front, { lineWidth: 120 })}---\n\n${lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()}\n`;
  writeFileSync(`src/data/pages/${slug}.md`, md);
  console.log(slug, "→", lines.length, "blocks");
}
