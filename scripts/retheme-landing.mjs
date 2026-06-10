/**
 * Rebuilds the 36 landing pages into 6 themed families with distinct
 * section orders. Bespoke content (title, metadata, breadcrumb, hero copy,
 * pricing plan, inline FAQs, feature items, CTA copy) is carried over from
 * the existing frontmatter; new themed sections come from family templates.
 *
 * Run: node scripts/retheme-landing.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import yaml from "js-yaml";

const DIR = "src/data/landing";

const FAMILIES = {
  money: [
    "cheap-web-hosting",
    "cheap-hosting-plans",
    "low-price-hosting",
    "cheap-shared-hosting",
  ],
  linux: [
    "centos-vps",
    "cheap-centos-vps",
    "ubuntu-vps",
    "cheap-ubuntu-vps",
    "debian-vps",
    "fedora-vps",
    "opensuse-vps",
    "scientific-vps",
    "cheap-linux-vps",
  ],
  panel: [
    "cheap-cpanel-vps",
    "cpanel-vps-hosting",
    "managed-vps-with-cpanel",
    "managed-vps-hosting",
    "cheap-managed-vps-hosting",
    "cpanel-ssd-hosting",
  ],
  speed: [
    "fast-vps",
    "best-vps",
    "kvm-ssd-vps",
    "cheap-kvm-vps",
    "cheap-ssd-vps",
    "cheap-vps-hosting",
    "dedicated-vps",
    "cheap-dedicated-servers",
  ],
  wordpress: [
    "cheap-wordpress-hosting",
    "cheap-managed-wordpress-hosting",
    "ssd-wordpress-hosting",
  ],
  server: [
    "ssd-hosting",
    "cheap-ssd-hosting",
    "ssd-shared-hosting",
    "ssd-web-hosting",
    "cheap-ssd-web-hosting",
    "unlimited-ssd-hosting",
  ],
};

const HERO_ART = {
  money: "working",
  linux: null, // per-distro terminal flavor, set below
  panel: "panel",
  speed: "rocket",
  wordpress: "panel",
  server: "datacenter",
};

const distroOf = (slug) => {
  for (const d of [
    "centos",
    "ubuntu",
    "debian",
    "fedora",
    "opensuse",
    "scientific",
  ]) {
    if (slug.includes(d)) return d;
  }
  return "linux";
};

const DISTROS = [
  { name: "Ubuntu", color: "#e95420", key: "ubuntu" },
  { name: "Debian", color: "#a81d33", key: "debian" },
  { name: "CentOS", color: "#932279", key: "centos" },
  { name: "Fedora", color: "#3c6eb4", key: "fedora" },
  { name: "openSUSE", color: "#73ba25", key: "opensuse" },
  { name: "Scientific", color: "#7a99ac", key: "scientific" },
];

const DISTRO_COPY = {
  ubuntu: {
    title: "Why developers pick <em>Ubuntu</em> here",
    items: [
      {
        icon: "rocket",
        title: "LTS images, always current",
        text: "Ubuntu 22.04 and 24.04 LTS templates stay patched and deploy in seconds.",
      },
      {
        icon: "package",
        title: "The biggest ecosystem",
        text: "apt gives you the largest package universe — every tutorial just works.",
      },
      {
        icon: "refresh",
        title: "One-click reinstall",
        text: "Rebuild a clean Ubuntu image from the panel any time, in under a minute.",
      },
    ],
  },
  debian: {
    title: "Why sysadmins trust <em>Debian</em>",
    items: [
      {
        icon: "shield",
        title: "Rock-solid stable",
        text: "Debian's release discipline makes it the favourite base for production servers.",
      },
      {
        icon: "feather",
        title: "Lean by default",
        text: "A minimal install leaves nearly all your RAM and CPU for your actual workload.",
      },
      {
        icon: "refresh",
        title: "One-click reinstall",
        text: "Swap between bookworm and older releases from the control panel.",
      },
    ],
  },
  centos: {
    title: "Enterprise Linux, <em>RHEL-compatible</em>",
    items: [
      {
        icon: "building",
        title: "Enterprise lineage",
        text: "CentOS-family images (incl. AlmaLinux) track Red Hat Enterprise Linux.",
      },
      {
        icon: "layout",
        title: "cPanel's favourite home",
        text: "The control-panel ecosystem is built and tested on EL distributions first.",
      },
      {
        icon: "refresh",
        title: "One-click reinstall",
        text: "Reimage to any EL release from the panel whenever you need a clean start.",
      },
    ],
  },
  fedora: {
    title: "The <em>newest</em> Linux, first",
    items: [
      {
        icon: "bolt",
        title: "Latest kernels & toolchains",
        text: "Fedora ships new compilers, runtimes and kernel features months ahead.",
      },
      {
        icon: "box",
        title: "Container-first",
        text: "Podman and the modern container stack come ready out of the box.",
      },
      {
        icon: "refresh",
        title: "One-click reinstall",
        text: "Track each new Fedora release with a sixty-second reimage.",
      },
    ],
  },
  opensuse: {
    title: "Admin superpowers with <em>openSUSE</em>",
    items: [
      {
        icon: "settings",
        title: "YaST does everything",
        text: "One tool configures services, storage and networking — no hunting for files.",
      },
      {
        icon: "history",
        title: "Btrfs snapshots",
        text: "Roll the whole system back to before that bad change in one command.",
      },
      {
        icon: "refresh",
        title: "One-click reinstall",
        text: "Leap and Tumbleweed images reimage from the panel in a minute.",
      },
    ],
  },
  scientific: {
    title: "Built for <em>research</em> workloads",
    items: [
      {
        icon: "flask",
        title: "Research heritage",
        text: "The EL base trusted by labs and universities for long-running computation.",
      },
      {
        icon: "shield",
        title: "Long support windows",
        text: "Enterprise-length lifecycles keep your environment reproducible for years.",
      },
      {
        icon: "refresh",
        title: "One-click reinstall",
        text: "Reimage a clean research stack from the panel whenever you need it.",
      },
    ],
  },
  linux: {
    title: "Any distro. <em>Your</em> rules.",
    items: [
      {
        icon: "terminal",
        title: "Six distros ready",
        text: "Ubuntu, Debian, CentOS, Fedora, openSUSE and Scientific Linux out of the box.",
      },
      {
        icon: "refresh",
        title: "Swap any time",
        text: "Reinstall a different distribution from the control panel in one click.",
      },
      {
        icon: "key",
        title: "Full root access",
        text: "Your kernel, your packages, your firewall — complete control via SSH.",
      },
    ],
  },
};

const TRUSTBAR = {
  type: "trustbar",
  items: [
    { icon: "activity", text: "99.99% Uptime SLA" },
    { icon: "lock", text: "Free SSL Certificate" },
    { icon: "wallet", text: "30-Day Money-Back" },
    { icon: "rocket", text: "Instant Setup" },
    { icon: "headset", text: "24/7 Human Support" },
  ],
};

const BENCH_ITEMS = [
  {
    label: "Royal Clouds (SSD + LiteSpeed)",
    value: 0.4,
    display: "0.4s",
    highlight: true,
  },
  { label: "Typical shared hosting", value: 1.9, display: "1.9s" },
  { label: "Budget HDD server", value: 3.2, display: "3.2s" },
];
const BENCH_NOTE =
  "Median full-page load of a standard WordPress site in our lab tests. Results vary by site and region.";

const benchmark = (title, subtitle) => ({
  type: "benchmark",
  eyebrow: "Speed Test",
  title,
  ...(subtitle ? { subtitle } : {}),
  note: BENCH_NOTE,
  items: BENCH_ITEMS,
});

const MAPBAND = {
  type: "mapband",
  eyebrow: "Global Reach",
  title: "Low latency, wherever your visitors are",
  subtitle: "Premium network blends and smart routing keep round-trips short.",
  note: "Pick your server location at checkout — more regions coming online.",
};

const SECURITY_VPS = {
  type: "security",
  eyebrow: "Managed Security",
  title: "Four layers between attacks and your site",
  layers: [
    {
      title: "Smart network firewall",
      text: "Always-on filtering absorbs DDoS floods before they reach your server.",
    },
    {
      title: "Malware scanning",
      text: "Daily scans catch infected files early — with free cleanup if needed.",
    },
    {
      title: "Automatic backups",
      text: "Daily snapshots mean one click brings everything back.",
    },
    {
      title: "24/7 human monitoring",
      text: "Engineers watch the platform around the clock and fix issues proactively.",
    },
  ],
  stats: [
    { value: "1M+", label: "attacks blocked daily" },
    { value: "30", label: "days of backups" },
    { value: "24/7", label: "expert monitoring" },
  ],
};

const SECURITY_SHARED = {
  type: "security",
  eyebrow: "Built-in Protection",
  title: "Security that's simply included",
  layers: [
    {
      title: "Free SSL on every site",
      text: "Certificates install and renew automatically — your visitors always see the padlock.",
    },
    {
      title: "Account isolation",
      text: "CloudLinux keeps every account in its own container, so neighbours never affect you.",
    },
    {
      title: "Daily backups",
      text: "Your files, databases and email are snapshotted every day, restorable in one click.",
    },
    {
      title: "DDoS filtering",
      text: "Network-level protection absorbs attack traffic before it touches your site.",
    },
  ],
  stats: [
    { value: "1M+", label: "attacks blocked daily" },
    { value: "100%", label: "accounts isolated" },
    { value: "24/7", label: "expert monitoring" },
  ],
};

const STORIES_VALUE = {
  type: "storycards",
  eyebrow: "Success Stories",
  title: "Real savings. Real growth.",
  items: [
    {
      tag: "Online Store",
      metric: "75%",
      metricLabel: "lower monthly hosting bill",
      quote:
        "We moved three stores over and our bill dropped by three quarters — and pages actually open faster now.",
      name: "Arjun Mehta",
      site: "Furniture retailer",
    },
    {
      tag: "Creative Agency",
      metric: "40+",
      metricLabel: "client sites on one account",
      quote:
        "Cheap doesn't mean compromised here. Every client site gets SSL, backups and real support.",
      name: "Sara Pinto",
      site: "Design studio",
    },
    {
      tag: "Personal Blog",
      metric: "2x",
      metricLabel: "traffic after the switch",
      quote:
        "My blog stopped timing out on traffic spikes. Search rankings followed within a couple of months.",
      name: "Kabir Shah",
      site: "Travel blogger",
    },
  ],
};

const STORIES_WP = {
  type: "storycards",
  eyebrow: "WordPress Stories",
  title: "WordPress owners who made the move",
  items: [
    {
      tag: "WooCommerce",
      metric: "0.9s",
      metricLabel: "checkout page load",
      quote:
        "LiteSpeed plus their cache plugin took our checkout under a second. Abandonment fell immediately.",
      name: "Meera Iyer",
      site: "Fashion store",
    },
    {
      tag: "Publisher",
      metric: "85%",
      metricLabel: "faster than the old host",
      quote:
        "The free migration was genuinely free and genuinely painless. The speed jump shocked us.",
      name: "Dan Kowalski",
      site: "News site",
    },
    {
      tag: "Agency",
      metric: "30+",
      metricLabel: "WordPress sites managed",
      quote:
        "Staging, daily backups and one-click restores — managing client WordPress finally feels safe.",
      name: "Lena Fischer",
      site: "Web agency",
    },
  ],
};

const SHOWCASE = {
  type: "showcase",
  eyebrow: "Control Panel",
  title: "Manage everything with friendly clicks",
  subtitle:
    "Files, SSL, backups and stats — all in one clean panel, no command line needed.",
};

const STEPS_MANAGED = {
  type: "steps",
  eyebrow: "Fully Managed",
  title: "We do the server work. You do your thing.",
  items: [
    {
      title: "Pick your plan",
      text: "Choose the resources you need — your panel-ready server is provisioned instantly.",
    },
    {
      title: "We migrate & harden",
      text: "Our engineers move your sites for free, then tune caching, firewall and backups.",
    },
    {
      title: "You stay in control",
      text: "Point-and-click management for everything, with 24/7 experts one chat away.",
    },
  ],
};

const STEPS_WP = {
  type: "steps",
  eyebrow: "Free Migration",
  title: "Move your WordPress in three easy steps",
  items: [
    {
      title: "Request your migration",
      text: "Open a ticket from the client area — first migration is completely free.",
    },
    {
      title: "We move and test it",
      text: "Files, database, plugins and media transferred and verified by real engineers.",
    },
    {
      title: "Go live, zero downtime",
      text: "Your site stays online the whole time; DNS flips only when everything's perfect.",
    },
  ],
};

const osstrip = (activeKey) => ({
  type: "osstrip",
  eyebrow: "Operating Systems",
  title: "Your distro, ready in one click",
  items: DISTROS.map((d) => ({
    name: d.name,
    color: d.color,
    ...(d.key === activeKey ? { active: true } : {}),
  })),
});

const distroContent = (key) => ({
  type: "content",
  eyebrow: "Why This Distro",
  ...DISTRO_COPY[key],
  image: "datacenter",
  reverse: true,
});

/* ------------------------------------------------------------------ */

const byType = (sections, type) => sections.find((s) => s.type === type);

const buildSections = (family, slug, old) => {
  const hero = byType(old, "hero");
  const pricing = byType(old, "pricing");
  const features = byType(old, "features");
  const faq = byType(old, "faq");
  const testimonials = byType(old, "testimonials");
  const cta = byType(old, "cta");
  const flavor = distroOf(slug);

  if (hero) {
    hero.art = family === "linux" ? `terminal:${flavor}` : HERO_ART[family];
  }

  const seq = {
    money: [
      hero,
      TRUSTBAR,
      pricing,
      STORIES_VALUE,
      features && { ...features, variant: "tiles" },
      faq,
      cta,
    ],
    linux: [
      hero,
      osstrip(flavor),
      pricing,
      distroContent(flavor),
      features,
      faq,
      cta,
    ],
    panel: [
      hero,
      SHOWCASE,
      pricing,
      STEPS_MANAGED,
      SECURITY_VPS,
      testimonials ?? {
        type: "testimonials",
        eyebrow: "Reviews",
        title: "Loved by website owners",
        source: "global",
        limit: 3,
      },
      cta,
    ],
    speed: [
      hero,
      benchmark("Why sites feel instantly faster here"),
      pricing,
      MAPBAND,
      features,
      faq,
      cta,
    ],
    wordpress: [
      hero,
      STEPS_WP,
      pricing,
      benchmark("WordPress simply loads faster on LiteSpeed"),
      STORIES_WP,
      faq,
      cta,
    ],
    server: [
      hero,
      TRUSTBAR,
      pricing,
      benchmark("Pure SSD + LiteSpeed, measured"),
      SECURITY_SHARED,
      faq,
      cta,
    ],
  }[family];

  return seq.filter(Boolean);
};

let count = 0;
for (const [family, slugs] of Object.entries(FAMILIES)) {
  for (const slug of slugs) {
    const path = join(DIR, `${slug}.md`);
    const raw = readFileSync(path, "utf8");
    const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!m) throw new Error(`No frontmatter: ${slug}`);
    const data = yaml.load(m[1]);
    const body = m[2] ?? "";

    data.theme = family;
    data.sections = buildSections(family, slug, data.sections ?? []);

    const fm = yaml.dump(data, { lineWidth: 110, quotingType: '"' });
    writeFileSync(path, `---\n${fm}---\n${body}`);
    count++;
  }
}
console.log(
  `Rewrote ${count} landing pages across ${Object.keys(FAMILIES).length} families.`,
);
