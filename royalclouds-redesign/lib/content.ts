import { siteContentSchema, type SiteContent } from "./schemas";

// Data sources: https://royalclouds.net and existing repository files under src/data/*.json.
const rawContent = {
  portalBase: process.env.NEXT_PUBLIC_PORTAL_BASE ?? "https://my.royalclouds.net",
  contactEmail: "support@royalclouds.net",
  trustBadges: ["99.99% Uptime SLA", "Free SSL Certificate", "30-Day Money-Back Guarantee", "Instant Setup"],
  plans: [
    {
      name: "SSD Shared Hosting",
      slug: "shared-hosting",
      price: "1.99",
      period: "/mo",
      summary: "Fast SSD hosting with cPanel, LiteSpeed, SSL, migration, and daily backups for first sites and growing businesses.",
      popular: true,
      ctaUrl: "https://my.royalclouds.net/cart.php?a=add&pid=1",
      features: ["1 Domain", "10 GB SSD Storage", "100 GB Bandwidth", "3 Databases", "5 Email Accounts", "Free cPanel & SSL"],
      accent: "blue"
    },
    {
      name: "KVM VPS / Cloud",
      slug: "kvm-vps-hosting",
      price: "8",
      period: "/mo",
      summary: "Isolated KVM cloud power for apps that need predictable CPU, SSD storage, IPv4, and room to scale.",
      popular: false,
      ctaUrl: "https://my.royalclouds.net/cart.php?a=add&pid=21",
      features: ["1 GB RAM", "10 GB SSD Disk", "500 GB Bandwidth", "1 IPv4", "1 CPU Core", "Free Setup"],
      accent: "mint"
    },
    {
      name: "Managed WordPress",
      slug: "managed-wordpress-hosting",
      price: "1.99",
      period: "/mo",
      summary: "WordPress-ready hosting tuned for quick launch, automatic app installs, caching, SSL, and friendly support.",
      popular: false,
      ctaUrl: "https://my.royalclouds.net/cart.php?a=add&pid=11",
      features: ["WordPress Optimized", "LiteSpeed Cache", "Free SSL", "Daily Backups", "Free Migration", "24/7 Support"],
      accent: "violet"
    },
    {
      name: "Dedicated Servers",
      slug: "dedicated-servers",
      price: "130",
      period: "/mo",
      summary: "Bare-metal performance for high traffic projects, agencies, ecommerce, and managed infrastructure needs.",
      popular: false,
      ctaUrl: "https://my.royalclouds.net/cart.php?a=add&pid=41",
      features: ["24 GB DDR3 RAM", "250 GB SSD", "8 CPU Cores", "2.26 GHz", "10 TB Bandwidth", "5 IPv4"],
      accent: "sun"
    }
  ],
  features: [
    { title: "1-Click Installer", text: "Install WordPress, Joomla, Drupal, and 150+ apps quickly, then keep apps updated without manual server work.", icon: "MousePointerClick" },
    { title: "Super Fast Performance", text: "SSD RAID-10 storage, LiteSpeed, caching, Cloudflare, and modern PHP keep websites responsive under pressure.", icon: "Zap" },
    { title: "Friendly 24/7 Support", text: "Hosting specialists are available through live chat, email, and support tickets when help is needed.", icon: "Headphones" },
    { title: "Managed Security", text: "Malware scanning, hardening, configured firewalls, log reviews, and DDoS protection reduce operational risk.", icon: "ShieldCheck" }
  ],
  testimonials: [
    { name: "Shailendra Gayakwad", company: "BollywoodPapa.com", quote: "I got the best services here and that too at very affordable prices." },
    { name: "Satyam Shastri", company: "Noonecares.net", quote: "Using Royal Clouds from long time and must say they are super awesome at support with superfast and reliable servers." },
    { name: "Aditya Saini", company: "Sarcsam.co", quote: "I had some wonderful experience using the dedicated hosting of RoyalClouds as it is super easy to use even for beginners." }
  ]
} satisfies SiteContent;

export const siteContent = siteContentSchema.parse(rawContent);
