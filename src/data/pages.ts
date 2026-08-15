import {
  sharedHostingPlans,
  vpsConfiguratorAxes,
  vpsHostingPlans,
} from "@/data/catalog";
import { CONTENT_ROUTES, humanizeRoute, type ContentRoute } from "@/lib/routes";
import type {
  AnswerBlock,
  CtaBlock,
  PageBlock,
  SitePage,
} from "@/types/content";

const updatedAt = "2026-07-11";
const whmcsCart = "https://my.royalclouds.net/cart.php";
const ticketUrl = "https://my.royalclouds.net/submitticket.php";
const clientArea = "https://my.royalclouds.net";

/* ------------------------------------------------------------------ pricing */

/* Plans are no longer authored here. They come from src/data/catalog.ts, which
   mirrors the WHMCS billing system: real names, real USD *and* INR, real specs.
   Reading billing directly changed two assumptions this file used to make:
     - INR is not null. WHMCS serves it live; nobody had wired the second currency.
     - Billing is monthly-only on every product, so a plan renews at the price it
       advertises. The Honest Ledger (DESIGN.md 10.5) can state that as fact.
   Prices flow one way: WHMCS -> catalog.ts -> here. Never author one in this file.

   WordPress note: WHMCS has no managed-WordPress product — the store sells SSD
   Hosting, KVM VPS, Dedicated, SiteLock and CodeGuard, full stop. WordPress runs on
   the shared stack (cPanel + LiteSpeed + 1-click installer), so the WordPress routes
   quote the shared plans, which a customer can actually buy. The previous
   "Managed I/II/III at $15/$25/$35" plans were not orderable and are gone. */
const sharedPlans = sharedHostingPlans();
const vpsPlans = vpsHostingPlans();
const wordpressPlans = sharedHostingPlans();

/* --------------------------------------------------------------- templates */

type Template =
  | "home"
  | "shared"
  | "wordpress"
  | "vps"
  | "dedicated"
  | "pricing"
  | "comparison"
  | "network"
  | "about"
  | "support"
  | "company"
  | "legal";

const NETWORK_ROUTES = ["/datacenter", "/speed", "/uptime"];
const PRICING_ROUTES = ["/cheap-hosting-plans", "/low-price-hosting"];
const COMPANY_ROUTES = ["/testimonials", "/affiliate", "/partners"];

function templateFor(
  route: ContentRoute,
  family: SitePage["family"],
): Template {
  if (route === "/") return "home";
  if (family === "legal") return "legal";
  if (route === "/about") return "about";
  if (route === "/support") return "support";
  if (route === "/compare-royalclouds-vps-plans") return "comparison";
  if (NETWORK_ROUTES.includes(route)) return "network";
  if (COMPANY_ROUTES.includes(route)) return "company";
  if (PRICING_ROUTES.includes(route)) return "pricing";
  if (family === "wordpress") return "wordpress";
  if (family === "dedicated") return "dedicated";
  if (family === "vps") return "vps";
  return "shared";
}

/* VPS is checked before dedicated so /dedicated-vps lands with the VPS deck it
   is actually sold from, and /managed-digitalocean-cloud-hosting is cloud
   compute, not shared hosting, despite the word "hosting" in its slug. */
function classifyRoute(route: ContentRoute): SitePage["family"] {
  if (
    ["/terms-of-service", "/privacy-policy", "/cookie-policy"].includes(route)
  )
    return "legal";
  if (
    ["/about", "/support", "/testimonials", "/affiliate", "/partners"].includes(
      route,
    )
  )
    return "company";
  if (route.includes("wordpress")) return "wordpress";
  if (route === "/managed-digitalocean-cloud-hosting") return "vps";
  if (/vps|centos|ubuntu|debian|fedora|opensuse|scientific/.test(route))
    return "vps";
  if (route.includes("dedicated")) return "dedicated";
  if (route.includes("hosting") || route.includes("cpanel")) return "shared";
  return "core";
}

/* ------------------------------------------------------------ shared pieces */

const supportAction = {
  label: "Talk to an engineer",
  href: ticketUrl,
  external: true,
};

function ctaBlock(
  title: string,
  summary: string,
  label = "Open a support ticket",
): CtaBlock {
  return {
    component: "cta",
    eyebrow: "Next step",
    title,
    summary,
    action: { label, href: ticketUrl, external: true },
  };
}

function answersFor(title: string, family: SitePage["family"]): AnswerBlock {
  const service = title.toLowerCase();
  return {
    component: "answers",
    eyebrow: "Straight answers",
    title: `What to know about ${service}`,
    answers: [
      {
        question: `Who is ${service} built for?`,
        answer:
          family === "vps" || family === "dedicated"
            ? "Teams that want isolated resources, operating-system access, and room to run their own stack rather than fit inside someone else's."
            : "People who want a clearly scoped hosting service, visible limits, and an upgrade path that does not require rebuilding the site.",
      },
      {
        question: "What happens when the term ends?",
        answer:
          "The renewal rate is printed next to the price before you buy. Monthly plans renew at the same figure you paid. There is no introductory rate that quietly triples in year two.",
      },
      {
        question: "Can you move an existing site across?",
        answer:
          "Yes. Send support the current host, the platform, the data size, and the window you can accept downtime in, and an engineer will plan the move with you before anything is touched.",
      },
      {
        question: "Where do billing and account changes happen?",
        answer:
          "Orders, invoices, upgrades, domains, and tickets all stay in the Royal Clouds client area. The marketing site never holds your account state.",
      },
    ],
  };
}

const shieldStack = (summary: string): PageBlock => ({
  component: "shield-stack",
  eyebrow: "Protection layers",
  title: "Every request passes five gates.",
  summary,
  layers: [
    {
      name: "Edge filtering",
      detail:
        "Traffic is screened before it reaches your origin, so volumetric noise never becomes your CPU load.",
    },
    {
      name: "DDoS mitigation",
      detail:
        "Network-level scrubbing sits in front of the fleet. It is part of the platform, not a paid add-on.",
    },
    {
      name: "Account isolation",
      detail:
        "Accounts are contained: one tenant's runaway process is not another tenant's outage.",
    },
    {
      name: "Access control",
      detail:
        "Panel, SSH, and client-area access are separately credentialed and separately revocable.",
    },
    {
      name: "Backups",
      detail:
        "Restore points are configurable per plan. Support will tell you exactly what is covered before you rely on it.",
    },
  ],
});

const consoleShowcase = (summary: string): PageBlock => ({
  component: "console-showcase",
  eyebrow: "Royal Console",
  title: "The panel is the product.",
  summary,
  screens: [
    {
      label: "Services",
      caption:
        "Every active service, its plan, and its renewal date on one row.",
    },
    {
      label: "Billing",
      caption:
        "Invoices, payment methods, and the exact next charge. No surprise line items.",
    },
    {
      label: "Tickets",
      caption: "One thread per problem, with the engineer's name on it.",
    },
  ],
  action: { label: "Open the client area", href: clientArea, external: true },
});

/* ------------------------------------------------------------------- 12.1 */

function homeBlocks(): PageBlock[] {
  return [
    {
      component: "hero",
      eyebrow: "Royal Clouds",
      title: "Hosting that shows its work.",
      summary:
        "Isolated compute, visible limits, and a renewal price printed next to every plan. Infrastructure you can reason about.",
      primaryAction: { label: "See plans", href: "#plans" },
      secondaryAction: { label: "Compare KVM VPS", href: "/kvm-vps-hosting" },
      visual: "/legacy-assets/assets/images/cloudhost.png",
      proof: [
        "SSD across every plan",
        "Root access on KVM",
        "Renewal rate shown up front",
      ],
    },
    {
      component: "trust-strip",
      items: [
        { label: "01", detail: "Pick the workload, not the marketing tier" },
        { label: "02", detail: "Read the exact limits before you pay" },
        { label: "03", detail: "Deploy and manage from the client area" },
      ],
    },
    {
      component: "feature-narrative",
      eyebrow: "One stack, four altitudes",
      title: "Move up a layer without relearning the platform.",
      summary:
        "Shared, managed WordPress, KVM VPS, and dedicated hardware are the same operation seen from different heights. The panel, the billing, and the people do not change when you climb.",
      visual: "/legacy-assets/assets/img/025-cloud-server.svg",
      items: [
        {
          title: "Shared hosting",
          body: "A managed foundation for sites that do not need server-level control.",
        },
        {
          title: "Managed WordPress",
          body: "WordPress with the updates, caching, and backups handled as part of the service.",
        },
        {
          title: "KVM VPS",
          body: "Dedicated virtual cores, guaranteed memory, and root on the box.",
        },
        {
          title: "Dedicated servers",
          body: "Single-tenant hardware, specified with an engineer before it is quoted.",
        },
      ],
    },
    {
      component: "operator-strip",
      eyebrow: "Operator tools",
      title: "It is a real machine. Treat it like one.",
      summary:
        "KVM plans hand you the root account. These are the commands you would actually run on the first day.",
      tabs: [
        {
          label: "SSH",
          title: "first-login.sh",
          lines: [
            { kind: "cmd", text: "ssh root@your-vps" },
            {
              kind: "out",
              text: "The authenticity of host 'your-vps' can't be established.",
            },
            { kind: "ok", text: "Connection established." },
            { kind: "cmd", text: "adduser deploy && usermod -aG sudo deploy" },
          ],
        },
        {
          label: "Deploy",
          title: "deploy.sh",
          lines: [
            {
              kind: "cmd",
              text: "git clone git@github.com:you/app.git /srv/app",
            },
            { kind: "cmd", text: "docker compose up -d" },
            { kind: "ok", text: "Containers started." },
          ],
        },
      ],
    },
    {
      component: "infrastructure",
      eyebrow: "The route your traffic takes",
      title: "Nothing between you and the origin that you cannot name.",
      summary:
        "DNS, edge, compute, storage. Four hops, each one legible, each one somebody's responsibility.",
      visual: "/legacy-assets/assets/img/map.svg",
      locations: [
        {
          city: "Client",
          region: "Global",
          detail: "DNS resolution, browser, and client-area entry points",
        },
        {
          city: "Edge",
          region: "Global",
          detail: "Caching, filtering, and static delivery ahead of the origin",
        },
        {
          city: "Origin",
          region: "Your plan",
          detail: "Shared, managed, virtual, or single-tenant compute",
        },
      ],
    },
    {
      component: "pricing-grid",
      eyebrow: "Plan deck",
      title: "Start where the workload is.",
      summary:
        "USD prices are the audited live rates. Monthly plans renew at the price you paid — the ledger line on each plane says so.",
      plans: vpsPlans,
    },
    consoleShowcase(
      "Billing, services, and tickets in one place. If you cannot see it in the console, we have not done our job.",
    ),
    answersFor("Royal Clouds hosting", "core"),
    ctaBlock(
      "Bring the workload. We will map the control plane.",
      "Tell us the platform, the traffic, the storage, and how much of it you want to run yourself. An engineer answers, not a form.",
      "Talk to an engineer",
    ),
  ];
}

/* ------------------------------------------------------------------- 12.2 */

function sharedBlocks(title: string): PageBlock[] {
  return [
    {
      component: "hero",
      eyebrow: "SSD shared hosting",
      title,
      summary:
        "A managed foundation with limits you can read, a panel you already know, and a renewal price that matches what you paid.",
      primaryAction: { label: "See plans", href: "#plans" },
      secondaryAction: supportAction,
      visual: "/legacy-assets/assets/images/cloudhost.png",
      proof: ["SSD storage", "cPanel", "Renewal rate shown up front"],
    },
    consoleShowcase(
      "Domains, mailboxes, databases, and files — all from the panel your host should have given you in the first place.",
    ),
    {
      component: "spec-plates",
      eyebrow: "What you actually get",
      title: "The specification, without the asterisk.",
      summary:
        "Every figure below is the figure sold on the plan you choose. Nothing is averaged and nothing is aspirational.",
      plates: [
        { label: "Storage", value: "10 – 30 GB SSD" },
        { label: "Bandwidth", value: "100 – 300 GB / mo" },
        { label: "Domains", value: "1 – 5" },
        { label: "Mailboxes", value: "5 – 15" },
        { label: "Control panel", value: "cPanel" },
        { label: "Billing term", value: "Monthly · renews at the same rate" },
      ],
    },
    {
      component: "pricing-grid",
      eyebrow: "Plan deck",
      title: "Three planes. One honest ledger line each.",
      summary:
        "Pick the plane whose limits fit the site. The bars compare the plans against each other, not against a claim.",
      plans: sharedPlans,
    },
    shieldStack(
      "Shared does not mean exposed. The same filtering and isolation that protect the fleet protect your account.",
    ),
    answersFor(title, "shared"),
    ctaBlock(
      "Not sure which plane fits?",
      "Send support the site, the traffic, and the mailboxes you need. We will name the plan — including when the answer is the cheapest one.",
    ),
  ];
}

function wordpressBlocks(title: string): PageBlock[] {
  return [
    {
      component: "hero",
      eyebrow: "Managed WordPress",
      title,
      summary:
        "WordPress with the maintenance work moved off your desk: updates applied, cache configured, backups running, support that knows the stack.",
      primaryAction: { label: "See plans", href: "#plans" },
      secondaryAction: supportAction,
      visual: "/legacy-assets/assets/img/wp-hosting.svg",
      proof: [
        "Automated core updates",
        "LiteSpeed cache",
        "Backups on managed plans",
      ],
    },
    {
      component: "launch-sequence",
      eyebrow: "Getting live",
      title: "Three steps, in this order, every time.",
      summary:
        "The sequence is numbered because it is a real sequence — you cannot point DNS at a site that does not exist yet.",
      steps: [
        {
          title: "Move or install",
          body: "Bring an existing WordPress site across, or start a clean install. Support handles the migration if you would rather not.",
        },
        {
          title: "Check it on the staging host",
          body: "Look at the moved site on Royal Clouds before the world does. Plugins, theme, mail, forms.",
        },
        {
          title: "Cut DNS over",
          body: "Switch the record when you are ready. Nothing goes live because a clock ran out.",
        },
      ],
      action: { label: "Plan the migration", href: ticketUrl, external: true },
    },
    consoleShowcase(
      "WordPress-specific controls sit alongside the rest of your services — no second login, no separate invoice.",
    ),
    {
      component: "spec-plates",
      eyebrow: "The managed layer",
      title: "What managed actually covers.",
      summary: "Managed is a scope, not a mood. This is the scope.",
      plates: [
        { label: "Storage", value: "5 – 30 GB SSD" },
        { label: "Hosted domains", value: "1 – 5" },
        { label: "Core updates", value: "Automated" },
        { label: "Backups", value: "Weekly on Managed II and above" },
        { label: "Cache", value: "LiteSpeed on Managed III" },
        { label: "Billing term", value: "Monthly · renews at the same rate" },
      ],
    },
    {
      component: "pricing-grid",
      eyebrow: "Plan deck",
      title: "Managed plans, priced in the open.",
      summary:
        "The bars compare storage and site count across the three managed planes. The ledger line states what renews.",
      plans: wordpressPlans,
    },
    answersFor(title, "wordpress"),
    ctaBlock(
      "Move the site. Keep the traffic.",
      "Tell support what the site runs on today and how much downtime you can accept. The migration is planned before it is started.",
    ),
  ];
}

/* ------------------------------------------------------------------- 12.3 */

function vpsBlocks(title: string): PageBlock[] {
  return [
    {
      component: "hero",
      eyebrow: "KVM cloud compute",
      title,
      summary:
        "Root access on the Royal backbone. Dedicated cores, guaranteed memory, and a machine that behaves the same at 3am as it did at noon.",
      primaryAction: { label: "Configure a server", href: "#configurator" },
      secondaryAction: { label: "See plans", href: "#plans" },
      visual: "/legacy-assets/assets/images/vps-hosting.png",
      proof: ["KVM virtualisation", "Root access", "SSD storage"],
    },
    {
      component: "operator-strip",
      eyebrow: "Operator tools",
      title: "Push. Provision. Roll back.",
      summary:
        "Real commands against a real machine. Nothing here is a mock-up of a workflow you cannot run.",
      tabs: [
        {
          label: "SSH",
          title: "provision.sh",
          lines: [
            { kind: "cmd", text: "ssh root@your-vps" },
            { kind: "ok", text: "Connection established." },
            { kind: "cmd", text: "apt update && apt install -y nginx" },
            { kind: "cmd", text: "systemctl enable --now nginx" },
          ],
        },
        {
          label: "Docker",
          title: "deploy.sh",
          lines: [
            { kind: "cmd", text: "git pull origin main" },
            { kind: "cmd", text: "docker compose up -d --build" },
            { kind: "ok", text: "Containers started." },
            { kind: "cmd", text: "docker compose logs -f app" },
          ],
        },
        {
          label: "Rollback",
          title: "rollback.sh",
          lines: [
            { kind: "cmd", text: "git checkout $PREVIOUS_TAG" },
            { kind: "cmd", text: "docker compose up -d" },
            { kind: "ok", text: "Previous release running." },
          ],
        },
      ],
    },
    {
      component: "configurator",
      eyebrow: "Size the machine",
      /* The axes carry the real KVM plans' figures, but the three sliders move
         independently, so a mixed selection is not necessarily a machine we sell.
         Rather than quote it from an invented per-unit rate, the configurator sizes
         the box and hands the spec to checkout, which states the price (DESIGN.md 11). */
      title: "Size the machine. Take the spec to checkout.",
      summary:
        "The sliders describe the box, not the bill. We sell preset machines and will not publish a per-unit rate we cannot stand behind, so your selection is carried into checkout — where the price, term and renewal are stated before you pay.",
      axes: vpsConfiguratorAxes(),
      action: {
        label: "Take this configuration to checkout",
        href: `${whmcsCart}?a=add`,
        external: true,
      },
    },
    {
      component: "spec-plates",
      eyebrow: "Machine specification",
      title: "Hardware, stated plainly.",
      summary:
        "Three preset planes. Every number below is sold on a plan you can order today.",
      plates: [
        { label: "Virtualisation", value: "KVM · dedicated cores" },
        { label: "vCPU", value: "1 – 4 cores" },
        { label: "Memory", value: "1 – 4 GB RAM" },
        { label: "Storage", value: "10 – 40 GB SSD" },
        { label: "Transfer", value: "500 GB – 2 TB / mo" },
        { label: "Access", value: "Full root · your choice of Linux" },
      ],
    },
    shieldStack(
      "Root access means you own the box. It does not mean you face the internet alone.",
    ),
    {
      component: "pricing-grid",
      eyebrow: "Plan deck",
      title: "Three preset machines.",
      summary:
        "The capacity bars compare the planes against each other. The ledger line states the renewal on each.",
      plans: vpsPlans,
    },
    answersFor(title, "vps"),
    ctaBlock(
      "Tell us what it has to run.",
      "Give an engineer the stack, the traffic shape, and the storage. We will size the machine — and say so if a smaller one is enough.",
      "Talk to an engineer",
    ),
  ];
}

/* ------------------------------------------------------------------- 12.4 */

function dedicatedBlocks(title: string): PageBlock[] {
  return [
    {
      component: "hero",
      eyebrow: "Single-tenant hardware",
      title,
      summary:
        "One machine. One tenant. Specified with an engineer and quoted against real inventory rather than a marketing tier.",
      primaryAction: { label: "Request a specification", href: "#contact" },
      secondaryAction: {
        label: "Compare KVM VPS first",
        href: "/kvm-vps-hosting",
      },
      visual: "/legacy-assets/assets/img/025-cloud-server.svg",
      proof: [
        "Single tenant",
        "Specified before quoted",
        "Named engineer on the ticket",
      ],
    },
    {
      component: "feature-narrative",
      eyebrow: "How dedicated is sold here",
      title: "We quote hardware we can actually rack.",
      summary:
        "There is no dedicated plan deck on this page, and that is deliberate. Publishing a CPU model and a price for a machine we have not confirmed in inventory would be a guess dressed up as a spec sheet.",
      items: [
        {
          title: "You state the workload",
          body: "Cores, memory, storage shape, network profile, and what has to keep running while it moves.",
        },
        {
          title: "We confirm the inventory",
          body: "An engineer checks what is available in the region you need before any number is put in writing.",
        },
        {
          title: "You get a written spec",
          body: "Exact hardware, exact price, exact provisioning window. If we cannot meet it, we say so instead of stalling.",
        },
      ],
    },
    {
      component: "infrastructure",
      eyebrow: "Placement",
      title: "Where the machine sits matters more than its badge.",
      summary:
        "Region, network path, and neighbouring services are part of the specification conversation, not an afterthought.",
      visual: "/legacy-assets/assets/img/map.svg",
      locations: [
        {
          city: "Edge",
          region: "Global",
          detail: "Filtering and delivery ahead of your hardware",
        },
        {
          city: "Origin",
          region: "Your region",
          detail: "Single-tenant hardware, no noisy neighbours by definition",
        },
        {
          city: "Client area",
          region: "Global",
          detail: "Billing, tickets, and service state in one place",
        },
      ],
    },
    shieldStack(
      "Single-tenant hardware still sits behind the fleet's filtering. Isolation is the starting point, not the whole answer.",
    ),
    {
      component: "contact-form",
      eyebrow: "Specification request",
      title: "Describe the machine you need.",
      summary:
        "The more precisely you describe the workload, the less time the quote takes. An engineer replies on the ticket.",
      needs: [
        "New dedicated server",
        "Migration from another provider",
        "Scaling up from a VPS",
        "Compliance or isolation requirement",
        "Something else",
      ],
      action: {
        label: "Send the specification",
        href: ticketUrl,
        external: true,
      },
    },
    answersFor(title, "dedicated"),
    ctaBlock(
      "Not sure dedicated is the right answer?",
      "Say so. If a VPS plane does the job for a fraction of the cost, an engineer will tell you that before taking your money.",
      "Talk to an engineer",
    ),
  ];
}

/* ------------------------------------------------------------------- 12.6 */

function pricingBlocks(title: string): PageBlock[] {
  return [
    {
      component: "hero",
      eyebrow: "Pricing",
      title: "Every price, with its renewal.",
      summary:
        "The whole catalogue on one page, in USD, at the rates we actually charge. No introductory theatre, no countdown, no price that doubles in year two.",
      primaryAction: { label: "See shared plans", href: "#plans" },
      secondaryAction: supportAction,
      visual: "/legacy-assets/assets/images/cloudhost.png",
      proof: [
        "Renewal shown on every plane",
        "No setup fees published",
        "Cancel from the client area",
      ],
    },
    {
      component: "feature-narrative",
      eyebrow: "The honest ledger",
      title: "Why the renewal price is printed next to the price.",
      summary:
        "Most hosts advertise a first-term rate and bury the renewal in the checkout footer. We put both on the same line because the second number is the one you will pay for years.",
      items: [
        {
          title: "The term is named",
          body: "Monthly plans say monthly. You are never guessing what you committed to.",
        },
        {
          title: "The renewal is named",
          body: "It sits on the plan card, at the same size, before you click.",
        },
        {
          title: "INR is not guessed",
          body: "We show USD because USD is what we have audited. An unapproved local rate is worse than no rate.",
        },
      ],
    },
    {
      component: "pricing-grid",
      eyebrow: "Shared hosting",
      title: "Shared plans.",
      summary:
        "For sites that do not need server-level control. Bars compare the three planes.",
      plans: sharedPlans,
    },
    {
      component: "pricing-grid",
      eyebrow: "KVM VPS",
      title: "Cloud compute plans.",
      summary:
        "Dedicated cores and root access. Bars compare vCPU, memory, and storage across the deck.",
      plans: vpsPlans,
    },
    {
      component: "pricing-grid",
      eyebrow: "Managed WordPress",
      title: "Managed WordPress plans.",
      summary:
        "WordPress with the maintenance included. Bars compare storage and hosted sites.",
      plans: wordpressPlans,
    },
    answersFor(title, "shared"),
    ctaBlock(
      "Still comparing?",
      "Send support the site or the stack. We will point at one plan and explain why — including when it is the cheapest one on the page.",
    ),
  ];
}

/* ------------------------------------------------------------------- 12.7 */

function comparisonBlocks(title: string): PageBlock[] {
  return [
    {
      component: "hero",
      eyebrow: "VPS comparison",
      title: "Three machines, side by side.",
      summary:
        "This page compares Royal Clouds VPS planes against each other using our own audited specification. We do not publish a competitor's numbers we cannot date and source.",
      primaryAction: { label: "See the ledger", href: "#ledger" },
      secondaryAction: {
        label: "Configure a server",
        href: "/kvm-vps-hosting",
      },
      visual: "/legacy-assets/assets/images/vps-hosting.png",
    },
    {
      component: "ledger-table",
      eyebrow: "Specification ledger",
      title: "The whole VPS range on one table.",
      summary:
        "Every cell is the figure sold on that plan. The recommended plane is tinted.",
      source: "Royal Clouds plan specification, audited July 2026.",
      columns: ["Resource", "VPS I", "VPS II", "VPS III"],
      ownColumnIndex: 2,
      rows: [
        { label: "vCPU cores", cells: ["Dedicated KVM cores", "1", "2", "4"] },
        {
          label: "Memory",
          cells: ["Guaranteed, not burst", "1 GB", "2 GB", "4 GB"],
        },
        {
          label: "SSD storage",
          cells: ["Local SSD", "10 GB", "20 GB", "40 GB"],
        },
        { label: "Transfer", cells: ["Monthly", "500 GB", "1 TB", "2 TB"] },
        { label: "Root access", cells: ["Full", "Yes", "Yes", "Yes"] },
        { label: "Price", cells: ["USD, monthly", "$4/mo", "$8/mo", "$16/mo"] },
        {
          label: "Renewal",
          cells: ["What you pay next month", "$4/mo", "$8/mo", "$16/mo"],
        },
      ],
    },
    {
      component: "pricing-grid",
      eyebrow: "Plan deck",
      title: "The same three planes, orderable.",
      summary:
        "The capacity bars are the ledger above, drawn. Nothing new is claimed here.",
      plans: vpsPlans,
    },
    {
      component: "contact-form",
      eyebrow: "Migration",
      title: "Moving from another host?",
      summary:
        "Tell us what you are on now and what has to keep running. An engineer plans the move before anything is touched.",
      needs: [
        "Moving from shared hosting",
        "Moving from another VPS provider",
        "Scaling up an existing Royal Clouds VPS",
        "Not sure which plane I need",
      ],
      action: { label: "Plan the move", href: ticketUrl, external: true },
    },
    answersFor(title, "vps"),
    ctaBlock(
      "Move your sites. We do the lifting.",
      "Migration is planned with you, scheduled with you, and verified before DNS moves.",
      "Start the migration",
    ),
  ];
}

/* ------------------------------------------------------------------- 12.8 */

function networkBlocks(route: string, title: string): PageBlock[] {
  const hero: PageBlock = {
    component: "hero",
    eyebrow: "Network",
    title:
      route === "/speed"
        ? "Speed is an architecture, not a badge."
        : route === "/uptime"
          ? "Uptime is a promise you can audit."
          : title,
    summary:
      route === "/speed"
        ? "SSD storage, cached delivery at the edge, and a short path from request to origin. What we will not do is publish a benchmark you cannot reproduce."
        : route === "/uptime"
          ? "We do not print a percentage we cannot evidence. What we can show you is how the platform is watched, what happens when it breaks, and who answers."
          : "Where the machines are, what sits in front of them, and how a request reaches your origin.",
    primaryAction: { label: "See plans", href: "/kvm-vps-hosting" },
    secondaryAction: supportAction,
    visual: "/legacy-assets/assets/img/map.svg",
  };

  const middle: PageBlock =
    route === "/speed"
      ? {
          component: "spec-plates",
          eyebrow: "What makes it fast",
          title: "The parts of the path we control.",
          summary:
            "Each of these is a real component of the platform. None of them is a stopwatch claim.",
          plates: [
            { label: "Storage", value: "SSD on every plan" },
            { label: "Cache", value: "LiteSpeed on managed WordPress" },
            { label: "Edge", value: "Static delivery ahead of the origin" },
            {
              label: "Compute",
              value: "KVM · dedicated cores, no burst-borrowing",
            },
            { label: "Transfer", value: "500 GB – 2 TB on VPS planes" },
            {
              label: "Measurement",
              value: "Test from your own network — we will help you set it up",
            },
          ],
        }
      : route === "/uptime"
        ? {
            component: "feature-narrative",
            eyebrow: "How the platform is watched",
            title: "What we do instead of quoting a number.",
            summary:
              "An uptime figure is only worth the monitoring behind it. Here is the monitoring, and here is what happens when it fires.",
            items: [
              {
                title: "Monitoring",
                body: "Services are checked continuously. An alert reaches a human, not a dashboard nobody has open.",
              },
              {
                title: "Incidents",
                body: "When something breaks you get told what broke, not that we are 'experiencing issues'.",
              },
              {
                title: "No invented streak",
                body: "Until a public status history is live, this page shows no uptime percentage. A number we cannot evidence is worth less than an honest gap.",
              },
            ],
          }
        : shieldStack(
            "The datacenter edge is the first thing your traffic meets, and the first thing an attacker meets.",
          );

  return [
    hero,
    {
      component: "infrastructure",
      eyebrow: "The path",
      title: "Four hops, all of them named.",
      summary:
        "There is nothing between the visitor and your origin that we cannot point at on this diagram.",
      visual: "/legacy-assets/assets/img/map.svg",
      locations: [
        {
          city: "Client",
          region: "Global",
          detail: "DNS resolution and the visitor's browser",
        },
        {
          city: "Edge",
          region: "Global",
          detail: "Filtering, caching, and static delivery",
        },
        {
          city: "Origin",
          region: "Your plan",
          detail: "Shared, managed, virtual, or single-tenant compute",
        },
      ],
    },
    middle,
    answersFor(title, "core"),
    ctaBlock(
      "Want the specifics for your region?",
      "Support can tell you what is available where, and what it will and will not do for your traffic.",
      "Ask an engineer",
    ),
  ];
}

/* ------------------------------------------------------------------- 12.9 */

function aboutBlocks(): PageBlock[] {
  return [
    {
      component: "hero",
      eyebrow: "About",
      title: "An operations company that happens to have a website.",
      summary:
        "Royal Clouds exists because hosting got easy to buy and hard to trust. We sell the boring version: stated limits, stated prices, people who answer.",
      primaryAction: { label: "See what we run", href: "/kvm-vps-hosting" },
      secondaryAction: supportAction,
      visual: "/legacy-assets/assets/img/025-cloud-server.svg",
    },
    {
      component: "rich-text",
      title: "Why we print the renewal price",
      html: "<p>The hosting industry solved acquisition and abandoned honesty. The first-year rate is a headline; the renewal is a footnote. The uptime figure is a marketing asset with no audit behind it. The benchmark is run on hardware nobody sells you.</p><p>We took the other road, and it costs us conversions. Every plan on this site shows what it renews at. No plan shows a discount we cannot justify. No page shows a number we cannot evidence — which is why some sections of this site are shorter than our competitors'. That is the point.</p><p>What we do claim: SSD storage on every plan, KVM virtualisation with dedicated cores, root access where the plan says root access, and a support ticket that reaches a named engineer.</p>",
    },
    {
      component: "feature-narrative",
      eyebrow: "How we operate",
      title: "Three rules we do not bend.",
      summary:
        "They are unglamorous. They are also the reason customers stay after the introductory period ends.",
      items: [
        {
          title: "State the limit",
          body: "Storage, transfer, cores, memory, mailboxes. If a limit exists, it is printed next to the price.",
        },
        {
          title: "State the price",
          body: "Including the renewal. Especially the renewal.",
        },
        {
          title: "Answer the ticket",
          body: "A person, with a name, who read what you wrote. Escalation is a path, not a maze.",
        },
      ],
    },
    answersFor("Royal Clouds", "company"),
    ctaBlock(
      "Judge us on the ticket, not the homepage.",
      "Ask support something hard before you buy anything. That is the honest test of a host.",
      "Ask us something hard",
    ),
  ];
}

/* ------------------------------------------------------------------ 12.10 */

function supportBlocks(): PageBlock[] {
  return [
    {
      component: "hero",
      eyebrow: "Support",
      title: "One thread. One engineer. Until it is fixed.",
      summary:
        "Account questions, migrations, and outages all go through the client area, where the history of your service lives.",
      primaryAction: {
        label: "Open a ticket",
        href: ticketUrl,
        external: true,
      },
      secondaryAction: {
        label: "Open the client area",
        href: clientArea,
        external: true,
      },
      visual: "/legacy-assets/assets/img/025-cloud-server.svg",
    },
    {
      component: "feature-narrative",
      eyebrow: "Channels",
      title: "Pick the channel that matches the problem.",
      summary:
        "We do not publish a response-time figure we have not measured in public. What we can tell you is where each kind of problem should go.",
      items: [
        {
          title: "Ticket",
          body: "Anything touching your account, your data, or your bill. It is written down, it is attributable, and it survives a shift change.",
        },
        {
          title: "Client area",
          body: "Invoices, upgrades, domains, and service state. Self-serve, no queue.",
        },
        {
          title: "Live chat",
          body: "Pre-sales and quick questions where a ticket would be heavier than the problem.",
        },
      ],
    },
    {
      component: "answers",
      eyebrow: "Popular answers",
      title: "The questions support gets most.",
      answers: [
        {
          question: "How do I migrate a site to Royal Clouds?",
          answer:
            "Open a ticket with the current host, the platform, the data size, and the downtime window you can accept. An engineer plans the move before anything is copied.",
        },
        {
          question: "How do I upgrade a plan?",
          answer:
            "From the client area, against the running service. Support can do it with you if the upgrade needs a maintenance window.",
        },
        {
          question: "Where do I find my invoice?",
          answer:
            "In the client area under billing, alongside the next charge date and the exact amount.",
        },
        {
          question: "Something is down. What do I do?",
          answer:
            "Open a ticket and say what you are seeing — the URL, the error, and when it started. That is faster than any triage form.",
        },
        {
          question: "Can I get root access?",
          answer:
            "On KVM VPS and dedicated servers, yes. Shared and managed WordPress plans are managed by design and do not hand out root.",
        },
      ],
    },
    {
      component: "contact-form",
      eyebrow: "Get help",
      title: "Tell us what is happening.",
      summary:
        "The more specific the first message, the shorter the thread. Include the domain, the error, and when it started.",
      needs: [
        "Technical problem with a live service",
        "Billing or invoice question",
        "Migration from another host",
        "Pre-sales question",
        "Something else",
      ],
      action: {
        label: "Open a support ticket",
        href: ticketUrl,
        external: true,
      },
    },
    ctaBlock(
      "Account-specific? Use the client area.",
      "Your service state, invoices, and ticket history live in one system. Keep the private context where it belongs.",
      "Open the client area",
    ),
  ];
}

/* ------------------------------------------------------------------ 12.16 */

function companyBlocks(route: string, title: string): PageBlock[] {
  const isPartners = route === "/partners";
  const isAffiliate = route === "/affiliate";

  const hero: PageBlock = {
    component: "hero",
    eyebrow: "Royal Clouds",
    title: isPartners
      ? "The platforms we build on."
      : isAffiliate
        ? "Refer the work you would do anyway."
        : "We publish references, not testimonials.",
    summary: isPartners
      ? "The software underneath the service, named. If a vendor is in the path of your site, you should know who they are."
      : isAffiliate
        ? "If you already move client sites onto hosts you trust, the affiliate programme pays you for the ones you move here. Terms are handled in the client area."
        : "A wall of unverified quotes is decoration. If you want a reference, ask us and we will connect you to a real customer who agreed to be named.",
    primaryAction: isAffiliate
      ? { label: "Open the client area", href: clientArea, external: true }
      : { label: "Ask for a reference", href: "#contact" },
    secondaryAction: supportAction,
    visual: "/legacy-assets/assets/img/025-cloud-server.svg",
  };

  const body: PageBlock = isPartners
    ? {
        component: "partners",
        eyebrow: "Platform ecosystem",
        title: "Built on tools operators already trust.",
        partners: [
          {
            name: "LiteSpeed",
            logo: "/legacy-assets/assets/img/partners/LiteSpeed.svg",
          },
          {
            name: "Cloudflare",
            logo: "/legacy-assets/assets/img/partners/cloudflare-logo.png",
          },
          {
            name: "cPanel",
            logo: "/legacy-assets/assets/img/partners/cpanel-logo.png",
          },
          {
            name: "CloudLinux",
            logo: "/legacy-assets/assets/img/partners/cloudlinux-logo.png",
          },
        ],
      }
    : {
        component: "feature-narrative",
        eyebrow: isAffiliate ? "How it works" : "How references work here",
        title: isAffiliate
          ? "Three steps, no mystery."
          : "Why this page is short.",
        summary: isAffiliate
          ? "Commission terms, payout thresholds, and tracking are administered in the client area, where they can be stated exactly rather than approximately."
          : "Publishing a quote we cannot attribute to a named person at a real company would fail the only test that matters: could you check it?",
        items: isAffiliate
          ? [
              {
                title: "Join from the client area",
                body: "The programme lives with your account, so referrals and payouts are on the same ledger as everything else.",
              },
              {
                title: "Refer the workload",
                body: "Send the client, the migration, or the project. We will tell you honestly whether we are the right host for it.",
              },
              {
                title: "Get paid on the terms shown",
                body: "The rate you see in the client area is the rate that applies. No tiered surprise.",
              },
            ]
          : [
              {
                title: "Named or nothing",
                body: "Every reference we pass on comes with a person, a role, and a company you can verify.",
              },
              {
                title: "Ask, and we will connect you",
                body: "Tell support what you are evaluating and we will find a customer running something similar.",
              },
              {
                title: "Check the ticket instead",
                body: "The fastest way to judge a host is to ask its support something difficult before you buy.",
              },
            ],
      };

  return [
    hero,
    body,
    {
      component: "contact-form",
      eyebrow: isAffiliate
        ? "Programme enquiry"
        : isPartners
          ? "Vendor enquiry"
          : "Reference request",
      title: isAffiliate
        ? "Ask about the programme."
        : isPartners
          ? "Talk to us about integrating."
          : "Ask for a reference.",
      summary:
        "Tell us what you need and who you are. An engineer or account manager replies on the ticket.",
      needs: [
        "Affiliate or referral programme",
        "Technology or vendor partnership",
        "Customer reference request",
        "Pre-sales question",
        "Something else",
      ],
      action: { label: "Send the message", href: ticketUrl, external: true },
    },
    answersFor(title, "company"),
    ctaBlock(
      "Everything account-related lives in one place.",
      "Programme terms, referrals, invoices, and tickets are all administered in the Royal Clouds client area.",
      "Open the client area",
    ),
  ];
}

/* ------------------------------------------------------------------ 12.14 */

function legalBlocks(title: string): PageBlock[] {
  return [
    {
      component: "hero",
      eyebrow: "Legal",
      title,
      summary:
        "The current terms, in plain headings. Nothing clever, nothing hidden in a footnote.",
      primaryAction: {
        label: "Contact support",
        href: ticketUrl,
        external: true,
      },
    },
    {
      component: "legal",
      updatedAt,
      sections: [
        {
          id: "scope",
          title: "Scope and status",
          html: "<p>This page states the terms under which Royal Clouds provides hosting services. The audited legal text is held with the business and is published here once approved; where a clause is not yet published, support will provide it on request rather than have you infer it.</p>",
        },
        {
          id: "third-party-data",
          title: "Third-party data and services",
          html: "<p>Royal Clouds uses external providers for account management, billing, support, communications, and infrastructure. The approved policy names each provider and the purpose it serves. We do not sell customer data.</p>",
        },
        {
          id: "contact",
          title: "Questions about this page",
          html: "<p>Open a ticket in the client area and ask. A legal question gets a legal answer, not a link back to this page.</p>",
        },
      ],
    },
  ];
}

/* ------------------------------------------------------------------- pages */

function blocksFor(
  route: ContentRoute,
  template: Template,
  title: string,
): PageBlock[] {
  switch (template) {
    case "home":
      return homeBlocks();
    case "wordpress":
      return wordpressBlocks(title);
    case "vps":
      return vpsBlocks(title);
    case "dedicated":
      return dedicatedBlocks(title);
    case "pricing":
      return pricingBlocks(title);
    case "comparison":
      return comparisonBlocks(title);
    case "network":
      return networkBlocks(route, title);
    case "about":
      return aboutBlocks();
    case "support":
      return supportBlocks();
    case "company":
      return companyBlocks(route, title);
    case "legal":
      return legalBlocks(title);
    default:
      return sharedBlocks(title);
  }
}

/* Descriptions interpolate the route's own title, so every one of the 58 stays
   unique without a hand-written table. */
function descriptionFor(title: string, family: SitePage["family"]): string {
  const service = title.toLowerCase();
  const descriptions: Record<SitePage["family"], string> = {
    core: `${title} at Royal Clouds — the network path, the plan limits, and the renewal price, stated plainly.`,
    shared: `${title} on SSD storage with cPanel, readable limits, and a renewal rate printed next to the price.`,
    vps: `${title} on KVM with dedicated cores, guaranteed memory, root access, and pricing that renews at what you paid.`,
    wordpress: `${title} with automated core updates, LiteSpeed caching, backups, and support that knows WordPress.`,
    dedicated: `${title} — single-tenant hardware specified with an engineer and quoted against real inventory.`,
    company: `${service.charAt(0).toUpperCase()}${service.slice(1)} at Royal Clouds: how we operate, who answers, and what we will not claim.`,
    legal: `The current Royal Clouds ${service}, covering service scope, data handling, and account responsibilities.`,
  };
  return descriptions[family];
}

function ogImageFor(route: ContentRoute, family: SitePage["family"]): string {
  if (route === "/") return "/legacy-assets/assets/img/og/main.png";
  if (route === "/affiliate") return "/legacy-assets/assets/img/og/aff.png";
  if (route === "/support") return "/legacy-assets/assets/img/og/contact.png";
  if (route === "/speed" || route === "/uptime")
    return "/legacy-assets/assets/img/og/speed.png";
  if (family === "vps") return "/legacy-assets/assets/img/og/vps.png";
  if (family === "wordpress") return "/legacy-assets/assets/img/og/managed.jpg";
  if (family === "dedicated") return "/legacy-assets/assets/img/og/dedi.png";
  if (family === "shared") return "/legacy-assets/assets/img/og/ssdshared.png";
  return "/legacy-assets/assets/img/og/main.png";
}

function makePage(route: ContentRoute): SitePage {
  const title = route === "/" ? "Royal Clouds" : humanizeRoute(route);
  const family = classifyRoute(route);
  const template = templateFor(route, family);

  return {
    route,
    family,
    seo: {
      title:
        route === "/"
          ? "Royal Clouds | SSD Hosting, KVM VPS and Managed Cloud"
          : `${title} | Royal Clouds`,
      description: descriptionFor(title, family),
      canonicalPath: route,
      image: ogImageFor(route, family),
      updatedAt,
    },
    breadcrumbs:
      route === "/"
        ? []
        : [
            { label: "Home", href: "/" },
            { label: title, href: route },
          ],
    blocks: blocksFor(route, template, title),
    sourceUrl: `https://royalclouds.net${route}`,
    approvalState: route === "/" ? "approved" : "needs-review",
  };
}

export const localPages = new Map<string, SitePage>(
  CONTENT_ROUTES.map((route) => [route, makePage(route)]),
);

export function getLocalPage(route: string): SitePage | null {
  return localPages.get(route) ?? null;
}
