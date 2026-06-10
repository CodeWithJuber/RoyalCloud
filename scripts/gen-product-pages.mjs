import { readFileSync, writeFileSync, existsSync } from "node:fs";
import yaml from "js-yaml";

const meta = JSON.parse(readFileSync("/tmp/meta.json", "utf8"));

// page slug → { plan id, breadcrumb parent, hero eyebrow }
const PAGES = {
  "shared-hosting": { plan: "shared", eyebrow: "SSD Shared Hosting" },
  "cpanel-hosting": { plan: "cpanel", eyebrow: "cPanel Hosting" },
  "kvm-vps-hosting": { plan: "vps", eyebrow: "KVM VPS Hosting" },
  "wordpress-hosting": { plan: "wordpress", eyebrow: "WordPress Hosting" },
  "managed-wordpress-hosting": {
    plan: "wordpress",
    eyebrow: "Managed WordPress",
  },
  "cloud-ssd-hosting": { plan: "cloud", eyebrow: "Managed Cloud" },
  "dedicated-servers": { plan: "dedicated", eyebrow: "Dedicated Servers" },
  "cyberpanel-vps-hosting": {
    plan: "cyberpanel",
    eyebrow: "CyberPanel VPS",
    m: {
      title: "CyberPanel VPS Hosting - OpenLiteSpeed KVM VPS | Royal Clouds",
      description:
        "Deploy blazing-fast WordPress on CyberPanel & OpenLiteSpeed VPS with pure SSD storage, full root access and 24/7 support at Royal Clouds.",
    },
  },
  "reseller-hosting": {
    plan: "reseller",
    eyebrow: "Reseller Hosting",
    m: {
      title:
        "Reseller Hosting - White-Label cPanel/WHM Reseller | Royal Clouds",
      description:
        "Start your own hosting business with Royal Clouds white-label reseller hosting — WHM/cPanel, free SSL, free WHMCS billing and 24/7 support.",
    },
  },
};

for (const [slug, cfg] of Object.entries(PAGES)) {
  if (existsSync(`src/data/pages/${slug}.md`)) {
    console.log("skip", slug);
    continue;
  }
  const plan = JSON.parse(
    readFileSync(`src/data/plans/${cfg.plan}.json`, "utf8"),
  );
  const m = cfg.m || meta[slug] || {};
  const lowest = plan.tiers
    .map((t) => parseFloat(t.price))
    .sort((a, b) => a - b)[0];

  const front = {
    title: cfg.eyebrow,
    metadata: {
      title: m.title || plan.title,
      description: m.description || plan.subtitle,
      ignoreTitleTemplate: true,
    },
    breadcrumb: [],
    transparentHeader: true,
    sections: [
      {
        type: "hero",
        variant: "product",
        eyebrow: cfg.eyebrow,
        title: plan.title,
        subtitle: plan.subtitle,
        offer: `From ${plan.currency || "$"}${lowest}/mo · Free Setup`,
        primaryCta: {
          text: "Get Started",
          href: "https://my.royalclouds.net/cart.php",
          external: true,
        },
        secondaryCta: { text: "View Pricing", href: "#pricing" },
        badges: [
          "99.99% Uptime SLA",
          "Free SSL",
          "24/7 Support",
          "Instant Setup",
        ],
      },
      {
        type: "trustbar",
        items: [
          { icon: "bolt", text: "LiteSpeed Powered" },
          { icon: "lock", text: "Free SSL" },
          { icon: "backup", text: "Daily Backups" },
          { icon: "shield", text: "DDoS Protection" },
          { icon: "headset", text: "24/7 Support" },
        ],
      },
      {
        type: "pricing",
        id: "pricing",
        plan: cfg.plan,
        eyebrow: plan.eyebrow,
        title: `${plan.name} plans`,
        subtitle: "Transparent pricing with everything you need included.",
      },
      {
        type: "features",
        eyebrow: "Why Royal Clouds",
        title: `Everything your ${cfg.eyebrow.toLowerCase()} needs`,
        columns: plan.highlights.length === 4 ? 4 : 3,
        items: plan.highlights.map((h) => ({
          icon: h.icon,
          title: h.title,
          text: h.text,
        })),
      },
      {
        type: "techlogos",
        eyebrow: "Powered By",
        title: "Built on technology you can trust",
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
        title: "Frequently asked questions",
        source: "global",
      },
      {
        type: "cta",
        title: `Ready to launch your ${cfg.eyebrow.toLowerCase()}?`,
        subtitle:
          "Instant setup · Free migration · 30-day money-back guarantee.",
        primaryCta: {
          text: "Get Started Now",
          href: "https://my.royalclouds.net/cart.php",
          external: true,
        },
        secondaryCta: { text: "Talk to Sales", href: "/contact" },
      },
    ],
  };
  writeFileSync(
    `src/data/pages/${slug}.md`,
    `---\n${yaml.dump(front, { lineWidth: 120 })}---\n`,
  );
  console.log("wrote", slug, "(plan:", cfg.plan + ")");
}
