import type { SiteSettings } from "@/types/content";

export const siteSettings: SiteSettings = {
  organizationName: "Royal Clouds",
  siteUrl: "https://royalclouds.net",
  whmcsUrl: "https://my.royalclouds.net",
  logoDark: "/assets/brand/royalclouds-blues.png",
  logoLight: "/assets/brand/royalclouds_w_logo.png",
  announcement: {
    message: "Built for fast launches, deliberate scaling, and human support.",
    action: { label: "Explore hosting", href: "/shared-hosting" },
  },
  marquee: [
    "Free SSL",
    "15x Faster SSD",
    "24/7/365 Support",
    "Money-Back Guarantee",
  ],
  navigation: [
    {
      label: "Hosting",
      items: [
        { label: "Shared hosting", href: "/shared-hosting" },
        { label: "Managed WordPress", href: "/managed-wordpress-hosting" },
        { label: "Dedicated servers", href: "/dedicated-servers" },
      ],
    },
    {
      label: "VPS",
      items: [
        { label: "KVM VPS", href: "/kvm-vps-hosting" },
        { label: "Managed VPS", href: "/managed-vps-hosting" },
        { label: "CyberPanel VPS", href: "/cyberpanel-vps-hosting" },
      ],
    },
    {
      label: "Why Royal Clouds",
      items: [
        { label: "Speed", href: "/speed" },
        { label: "Datacenters", href: "/datacenter" },
        { label: "About", href: "/about" },
      ],
    },
  ],
  footerGroups: [
    {
      label: "Hosting",
      items: [
        { label: "Shared hosting", href: "/shared-hosting" },
        { label: "KVM VPS", href: "/kvm-vps-hosting" },
        { label: "WordPress hosting", href: "/managed-wordpress-hosting" },
        { label: "Dedicated servers", href: "/dedicated-servers" },
      ],
    },
    {
      label: "Company",
      items: [
        { label: "About", href: "/about" },
        { label: "Partners", href: "/partners" },
        { label: "Affiliate", href: "/affiliate" },
        { label: "Testimonials", href: "/testimonials" },
      ],
    },
    {
      label: "Legal",
      items: [
        { label: "Terms", href: "/terms-of-service" },
        { label: "Privacy", href: "/privacy-policy" },
        { label: "Cookies", href: "/cookie-policy" },
      ],
    },
  ],
  support: [
    {
      label: "Knowledge base",
      href: "https://my.royalclouds.net/knowledgebase",
      external: true,
    },
    {
      label: "Open a ticket",
      href: "https://my.royalclouds.net/submitticket.php",
      external: true,
    },
    {
      label: "Client login",
      href: "https://my.royalclouds.net/login",
      external: true,
    },
    { label: "Blog", href: "https://blog.royalclouds.net", external: true },
  ],
  socials: [],
  defaultSeo: {
    title: "Royal Clouds | SSD Hosting, KVM VPS and Managed Cloud",
    description:
      "Choose SSD web hosting, KVM VPS, managed WordPress, and dedicated infrastructure with clear plans and human support.",
    image: "/legacy-assets/assets/img/og/main.png",
  },
  crawlerPolicy: {
    allowOaiSearchBot: true,
    allowGptBot: false,
  },
};
