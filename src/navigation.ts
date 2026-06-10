import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';

const PORTAL = 'https://my.royalclouds.net';

export const headerData = {
  links: [
    {
      text: 'Hosting',
      links: [
        { text: 'SSD Shared Hosting', href: getPermalink('/shared-hosting') },
        { text: 'cPanel Hosting', href: getPermalink('/cpanel-hosting') },
        { text: 'Managed WordPress', href: getPermalink('/managed-wordpress-hosting') },
        { text: 'KVM VPS Hosting', href: getPermalink('/kvm-vps-hosting') },
        { text: 'CyberPanel VPS', href: getPermalink('/cyberpanel-vps-hosting') },
        { text: 'Dedicated Servers', href: getPermalink('/dedicated-servers') },
      ],
    },
    {
      text: 'Technology',
      links: [
        { text: 'Top Speed Solutions', href: getPermalink('/speed') },
        { text: 'Amazing Uptime', href: getPermalink('/uptime') },
        { text: 'Datacenter', href: getPermalink('/datacenter') },
      ],
    },
    { text: 'Domains', href: `${PORTAL}/cart.php?a=add&domain=register` },
    { text: 'Blog', href: getBlogPermalink() },
    { text: 'About', href: getPermalink('/about') },
    { text: 'Contact', href: getPermalink('/contact') },
  ],
  actions: [
    { text: 'Sign in', href: `${PORTAL}/clientarea.php`, variant: 'secondary' },
    { text: 'Get Started', href: `${PORTAL}/cart.php` },
  ],
};

export const footerData = {
  links: [
    {
      title: 'Hosting',
      links: [
        { text: 'SSD Shared Hosting', href: getPermalink('/shared-hosting') },
        { text: 'cPanel Hosting', href: getPermalink('/cpanel-hosting') },
        { text: 'Managed WordPress', href: getPermalink('/managed-wordpress-hosting') },
        { text: 'KVM VPS Hosting', href: getPermalink('/kvm-vps-hosting') },
        { text: 'CyberPanel VPS', href: getPermalink('/cyberpanel-vps-hosting') },
        { text: 'Dedicated Servers', href: getPermalink('/dedicated-servers') },
      ],
    },
    {
      title: 'Technology',
      links: [
        { text: 'Top Speed Solutions', href: getPermalink('/speed') },
        { text: 'Amazing Uptime', href: getPermalink('/uptime') },
        { text: 'Datacenter', href: getPermalink('/datacenter') },
        { text: 'Domain Names', href: `${PORTAL}/cart.php?a=add&domain=register` },
      ],
    },
    {
      title: 'Company',
      links: [
        { text: 'About Us', href: getPermalink('/about') },
        { text: 'Testimonials', href: getPermalink('/testimonials') },
        { text: 'Blog', href: getBlogPermalink() },
        { text: 'Contact', href: getPermalink('/contact') },
      ],
    },
    {
      title: 'Support',
      links: [
        { text: 'Client Area', href: `${PORTAL}/clientarea.php` },
        { text: 'Submit a Ticket', href: `${PORTAL}/submitticket.php` },
        { text: 'Knowledge Base', href: `${PORTAL}/knowledgebase.php` },
        { text: 'Affiliates', href: `${PORTAL}/affiliates.php` },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Terms', href: getPermalink('/terms') },
    { text: 'Privacy Policy', href: getPermalink('/privacy') },
  ],
  socialLinks: [
    { ariaLabel: 'X', icon: 'tabler:brand-x', href: '#' },
    { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: '#' },
    { ariaLabel: 'Facebook', icon: 'tabler:brand-facebook', href: '#' },
    { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
  ],
  footNote: `
    <span class="font-semibold">Royal Clouds</span> · Premium SSD hosting · All rights reserved.
  `,
};
