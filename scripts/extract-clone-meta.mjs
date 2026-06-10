/**
 * Scaffolds page-builder content files from the captured clone pages.
 *
 *   node scripts/extract-clone-meta.mjs                  # print extracted meta as JSON
 *   node scripts/extract-clone-meta.mjs --write landing  # scaffold src/data/landing/*.md
 *   node scripts/extract-clone-meta.mjs --write pages    # scaffold src/data/pages/*.md (meta only)
 *
 * SEO titles/descriptions are copied verbatim from each clone <head> so
 * rankings are preserved. Existing content files are never overwritten —
 * hand-polished copy always wins over the scaffold.
 */
import {
  readdirSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
} from "node:fs";
import { join } from "node:path";
import yaml from "js-yaml";

const ROOT = new URL("..", import.meta.url).pathname;
const CLONE = join(ROOT, "src/data/clone");

/* ---------------- slug categorisation ---------------- */

// Clone slugs that are core site/product pages (hand-authored in src/data/pages).
const CORE = [
  "index",
  "about",
  "support",
  "affiliate",
  "partners",
  "testimonials",
  "login",
  "domains",
  "datacenter",
  "speed",
  "uptime",
  "compare-royalclouds-vps-plans",
  "privacy-policy",
  "terms-of-service",
  "cookie-policy",
  "shared-hosting",
  "cpanel-hosting",
  "wordpress-hosting",
  "managed-wordpress-hosting",
  "kvm-vps-hosting",
  "cloud-ssd-hosting",
  "dedicated-servers",
];

// Long-tail SEO landing pages → which plan family powers their pricing grid.
const LANDING_PLAN = {
  "best-vps": "vps",
  "centos-vps": "vps",
  "cheap-centos-vps": "vps",
  "cheap-cpanel-vps": "vps",
  "cheap-dedicated-servers": "dedicated",
  "cheap-hosting-plans": "shared",
  "cheap-kvm-vps": "vps",
  "cheap-linux-vps": "vps",
  "cheap-managed-vps-hosting": "vps",
  "cheap-managed-wordpress-hosting": "wordpress",
  "cheap-shared-hosting": "shared",
  "cheap-ssd-hosting": "shared",
  "cheap-ssd-vps": "vps",
  "cheap-ssd-web-hosting": "shared",
  "cheap-ubuntu-vps": "vps",
  "cheap-vps-hosting": "vps",
  "cheap-web-hosting": "shared",
  "cheap-wordpress-hosting": "wordpress",
  "cpanel-ssd-hosting": "shared",
  "cpanel-vps-hosting": "vps",
  "debian-vps": "vps",
  "dedicated-vps": "vps",
  "fast-vps": "vps",
  "fedora-vps": "vps",
  "kvm-ssd-vps": "vps",
  "low-price-hosting": "shared",
  "managed-vps-hosting": "vps",
  "managed-vps-with-cpanel": "vps",
  "opensuse-vps": "vps",
  "scientific-vps": "vps",
  "ssd-hosting": "shared",
  "ssd-shared-hosting": "shared",
  "ssd-web-hosting": "shared",
  "ssd-wordpress-hosting": "wordpress",
  "ubuntu-vps": "vps",
  "unlimited-ssd-hosting": "shared",
};

const DISTROS = {
  "ubuntu-vps": "Ubuntu",
  "cheap-ubuntu-vps": "Ubuntu",
  "debian-vps": "Debian",
  "centos-vps": "CentOS",
  "cheap-centos-vps": "CentOS",
  "fedora-vps": "Fedora",
  "opensuse-vps": "openSUSE",
  "scientific-vps": "Scientific Linux",
};

/* ---------------- extraction ---------------- */

const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

function extract(html) {
  const pick = (re) => {
    const m = html.match(re);
    return m ? decode(m[1]) : "";
  };
  return {
    title: pick(/<title[^>]*>([\s\S]*?)<\/title>/i),
    description: pick(
      /<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i,
    ),
    keywords: pick(
      /<meta\s+name=["']keywords["']\s+content=["']([\s\S]*?)["']/i,
    ),
    h1: pick(/<h1[^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]+>/g, ""),
  };
}

const humanize = (slug) =>
  slug
    .split("-")
    .map((w) =>
      ["vps", "ssd", "kvm", "cpanel"].includes(w)
        ? w === "cpanel"
          ? "cPanel"
          : w.toUpperCase()
        : w[0].toUpperCase() + w.slice(1),
    )
    .join(" ");

/* ---------------- landing-page section templates ---------------- */

const FAMILY = {
  vps: {
    badge: ["Full Root Access", "Pure SSD Storage", "99.99% Uptime SLA"],
    features: (kw, distro) => [
      {
        icon: "cpu",
        title: "KVM Virtualization",
        text: `True hardware isolation — your ${kw.toLowerCase()} gets dedicated resources that are never oversold.`,
      },
      {
        icon: "bolt",
        title: "Pure SSD RAID-10",
        text: "Enterprise SSDs in RAID-10 deliver up to 15x faster disk I/O than HDD servers.",
      },
      distro
        ? {
            icon: "terminal",
            title: `${distro} Pre-Installed`,
            text: `Deploy ${distro} in one click — or reload to any other Linux distribution from the panel, any time.`,
          }
        : {
            icon: "terminal",
            title: "Any Linux Distro",
            text: "Ubuntu, Debian, CentOS, Fedora, openSUSE & more — reinstall from the control panel in one click.",
          },
      {
        icon: "shield",
        title: "DDoS Protection",
        text: "Always-on network filtering keeps your server online through volumetric attacks.",
      },
      {
        icon: "scale",
        title: "Instant Scaling",
        text: "Upgrade CPU, RAM and storage in seconds from the client area — no migration needed.",
      },
      {
        icon: "headset",
        title: "24/7 Expert Support",
        text: "Real engineers on live chat and tickets around the clock, every day of the year.",
      },
    ],
    faq: (kw, distro) => [
      {
        q: `What do I get with ${kw}?`,
        a: "Every plan includes full root access, a dedicated IP, pure SSD RAID-10 storage, KVM virtualization with guaranteed resources, DDoS protection and 24/7 support.",
      },
      distro
        ? {
            q: `Which ${distro} versions are available?`,
            a: `We keep current ${distro} releases ready to deploy, and you can reload your VPS with any supported version from the control panel at any time.`,
          }
        : {
            q: "Which operating systems can I install?",
            a: "Ubuntu, Debian, CentOS, Fedora, openSUSE and Scientific Linux are available out of the box, and you can reinstall any of them in one click.",
          },
      {
        q: "How fast is my VPS deployed?",
        a: "Instantly. As soon as your order is confirmed, your VPS is provisioned automatically and login details are emailed to you.",
      },
      {
        q: "Can I upgrade later?",
        a: "Yes — upgrade to a bigger plan at any time from the client area. Your data stays in place; only the resources change.",
      },
    ],
  },
  shared: {
    badge: ["Free cPanel & SSL", "LiteSpeed Servers", "30-Day Money-Back"],
    features: (kw) => [
      {
        icon: "bolt",
        title: "LiteSpeed + LSCache",
        text: `Our ${kw.toLowerCase()} runs on LiteSpeed web servers with pure SSD storage — pages load up to 15x faster.`,
      },
      {
        icon: "apps",
        title: "Free cPanel & Softaculous",
        text: "Manage everything from the familiar cPanel and install WordPress, Joomla & 400+ apps in one click.",
      },
      {
        icon: "lock",
        title: "Free SSL Certificates",
        text: "Every domain gets a free Let's Encrypt SSL — automatically installed and renewed.",
      },
      {
        icon: "backup",
        title: "Daily Backups",
        text: "Automatic daily backups with easy one-click restore keep your data safe.",
      },
      {
        icon: "refresh",
        title: "Free Migration",
        text: "Our team moves your existing websites over for free, with zero downtime.",
      },
      {
        icon: "headset",
        title: "24/7 Friendly Support",
        text: "Hosting specialists on live chat, email and tickets — around the clock.",
      },
    ],
    faq: (kw) => [
      {
        q: `What is included with ${kw.toLowerCase()}?`,
        a: "Free cPanel, free SSL certificates, free website migration, daily backups, LiteSpeed caching and 24/7 support are included on every plan.",
      },
      {
        q: "Is there a money-back guarantee?",
        a: "Yes — all shared hosting plans come with a 30-day money-back guarantee, no questions asked.",
      },
      {
        q: "Can you move my website for free?",
        a: "Absolutely. Our migration team transfers your sites, emails and databases for free, usually within 24 hours.",
      },
      {
        q: "How fast will my website be?",
        a: "With pure SSD RAID-10 storage, LiteSpeed web servers and LSCache, sites typically load several times faster than on traditional HDD hosting.",
      },
    ],
  },
  wordpress: {
    badge: ["WordPress Pre-Installed", "LiteSpeed Cache", "Free Migration"],
    features: (kw) => [
      {
        icon: "wordpress",
        title: "Optimized for WordPress",
        text: `Our ${kw.toLowerCase()} stack is tuned end-to-end for WordPress — LiteSpeed, LSCache and PHP workers configured for you.`,
      },
      {
        icon: "refresh",
        title: "Auto Updates",
        text: "Core and plugin updates handled automatically, with safe rollbacks.",
      },
      {
        icon: "bolt",
        title: "SSD + LiteSpeed Speed",
        text: "Pure SSD RAID-10 storage and the LiteSpeed Cache plugin deliver blazing-fast TTFB.",
      },
      {
        icon: "shield",
        title: "Hardened Security",
        text: "Web application firewall, malware scanning and free SSL on every site.",
      },
      {
        icon: "backup",
        title: "Daily Backups",
        text: "Your site is backed up every day with one-click restore.",
      },
      {
        icon: "headset",
        title: "WordPress Experts 24/7",
        text: "Support staff who actually know WordPress, on live chat and tickets.",
      },
    ],
    faq: (kw) => [
      {
        q: `Why choose ${kw.toLowerCase()} from Royal Clouds?`,
        a: "WordPress comes pre-installed on a LiteSpeed + SSD stack with LSCache configured, free SSL, daily backups and experts available 24/7.",
      },
      {
        q: "Do you migrate my WordPress site for free?",
        a: "Yes — we move your WordPress site for free, including the database, themes, plugins and media, usually within 24 hours.",
      },
      {
        q: "Are updates handled for me?",
        a: "On managed plans, WordPress core and plugin updates are applied automatically with safety checks.",
      },
      {
        q: "Can I host WooCommerce?",
        a: "Definitely. The LiteSpeed stack with object caching is an excellent fit for WooCommerce stores of any size.",
      },
    ],
  },
  dedicated: {
    badge: ["Bare-Metal Power", "Custom Configs", "DDoS Protection"],
    features: (kw) => [
      {
        icon: "database",
        title: "Dedicated Hardware",
        text: `With ${kw.toLowerCase()} the entire machine is yours — every CPU core, every gigabyte of RAM.`,
      },
      {
        icon: "bolt",
        title: "Enterprise SSD / NVMe",
        text: "High-performance storage options in RAID for speed and redundancy.",
      },
      {
        icon: "settings",
        title: "Custom Configurations",
        text: "Need more RAM, storage or a specific layout? We build the server to your spec.",
      },
      {
        icon: "shield",
        title: "DDoS Protection",
        text: "Network-level mitigation keeps your server reachable under attack.",
      },
      {
        icon: "gauge",
        title: "Premium Network",
        text: "Low-latency, high-bandwidth uplinks with a 99.99% uptime SLA.",
      },
      {
        icon: "headset",
        title: "24/7 Server Engineers",
        text: "Hardware replaced fast, issues handled by real engineers around the clock.",
      },
    ],
    faq: (kw) => [
      {
        q: `Who is ${kw.toLowerCase()} for?`,
        a: "High-traffic applications, large e-commerce stores, game servers and any workload that needs guaranteed, single-tenant performance.",
      },
      {
        q: "Can I customize the hardware?",
        a: "Yes — CPU, RAM, storage and RAID layout can all be tailored. Contact us with your requirements for a custom quote.",
      },
      {
        q: "Is the server managed?",
        a: "Both managed and unmanaged options are available. Managed servers include OS updates, monitoring and security hardening by our team.",
      },
      {
        q: "How long does provisioning take?",
        a: "Standard configurations are typically online within a few hours; custom builds may take up to 1–2 business days.",
      },
    ],
  },
};

function landingDoc(slug, meta) {
  const plan = LANDING_PLAN[slug];
  const distro = DISTROS[slug];
  const kw = humanize(slug);
  const fam = FAMILY[plan];
  const title = meta.title || `${kw} — Royal Clouds`;
  const description = meta.description || "";

  const front = {
    title: kw,
    metadata: { title, description, ignoreTitleTemplate: true },
    breadcrumb: [
      plan === "shared"
        ? { text: "SSD Shared Hosting", href: "/shared-hosting" }
        : plan === "wordpress"
          ? { text: "WordPress Hosting", href: "/managed-wordpress-hosting" }
          : plan === "dedicated"
            ? { text: "Dedicated Servers", href: "/dedicated-servers" }
            : { text: "KVM VPS Hosting", href: "/kvm-vps-hosting" },
    ],
    transparentHeader: true,
    sections: [
      {
        type: "hero",
        variant: "gradient",
        eyebrow: kw,
        title: `${kw} on <em>Pure SSD</em> — Built for Speed`,
        subtitle:
          description ||
          `Premium ${kw.toLowerCase()} with instant setup, DDoS protection and friendly 24/7 support.`,
        primaryCta: {
          text: "Get Started",
          href: "https://my.royalclouds.net/cart.php",
          external: true,
        },
        secondaryCta: { text: "View Plans", href: "#pricing" },
        badges: fam.badge,
      },
      {
        type: "pricing",
        id: "pricing",
        plan,
        eyebrow: "Plans & Pricing",
        title: `Choose your ${kw.toLowerCase()} plan`,
        showToggle: true,
        note: "30-day money-back guarantee · Instant setup · Free migration.",
      },
      {
        type: "features",
        eyebrow: "Why Royal Clouds",
        title: `Everything your ${kw.toLowerCase()} needs`,
        columns: 3,
        items: fam.features(kw, distro),
      },
      {
        type: "techlogos",
        eyebrow: "Powered By",
        title: "Technology partners we build on",
      },
      {
        type: "testimonials",
        eyebrow: "Reviews",
        title: "Loved by website owners",
        source: "global",
        limit: 3,
      },
      {
        type: "faq",
        eyebrow: "FAQ",
        title: `${kw} — common questions`,
        source: "inline",
        items: fam.faq(kw, distro),
      },
      {
        type: "cta",
        title: `Launch your ${kw.toLowerCase()} today`,
        subtitle: "Instant setup · 99.99% uptime SLA · 24/7 friendly support.",
        primaryCta: {
          text: "Get Started Now",
          href: "https://my.royalclouds.net/cart.php",
          external: true,
        },
      },
    ],
  };
  return `---\n${yaml.dump(front, { lineWidth: 120 })}---\n`;
}

function pageDoc(slug, meta) {
  const front = {
    title: humanize(slug === "index" ? "home" : slug),
    metadata: {
      title: meta.title || "",
      description: meta.description || "",
      ignoreTitleTemplate: true,
    },
    sections: [],
  };
  return `---\n${yaml.dump(front, { lineWidth: 120 })}---\n`;
}

/* ---------------- main ---------------- */

const args = process.argv.slice(2);
const writeIdx = args.indexOf("--write");
const target = writeIdx >= 0 ? args[writeIdx + 1] : null;

const all = {};
for (const file of readdirSync(CLONE).filter((f) => f.endsWith(".html"))) {
  const slug = file.replace(/\.html$/, "");
  all[slug] = extract(readFileSync(join(CLONE, file), "utf8"));
}

if (!target) {
  console.log(JSON.stringify(all, null, 2));
  process.exit(0);
}

const outDir = join(ROOT, "src/data", target);
mkdirSync(outDir, { recursive: true });
let written = 0;

const slugs = target === "landing" ? Object.keys(LANDING_PLAN) : CORE;
for (const slug of slugs) {
  const out = join(outDir, `${slug}.md`);
  if (existsSync(out)) continue; // never clobber hand-polished pages
  const meta = all[slug] || {
    title: "",
    description: "",
    keywords: "",
    h1: "",
  };
  writeFileSync(
    out,
    target === "landing" ? landingDoc(slug, meta) : pageDoc(slug, meta),
  );
  written++;
}
console.log(`${written} file(s) written to src/data/${target}`);
