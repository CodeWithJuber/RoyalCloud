export const CONTENT_ROUTES = [
  "/",
  "/shared-hosting",
  "/kvm-vps-hosting",
  "/managed-wordpress-hosting",
  "/dedicated-servers",
  "/speed",
  "/uptime",
  "/datacenter",
  "/support",
  "/about",
  "/testimonials",
  "/cpanel-hosting",
  "/best-vps",
  "/wordpress-hosting",
  "/centos-vps",
  "/cheap-centos-vps",
  "/cheap-cpanel-vps",
  "/cheap-dedicated-servers",
  "/cheap-hosting-plans",
  "/cheap-kvm-vps",
  "/cheap-linux-vps",
  "/cheap-managed-vps-hosting",
  "/cheap-managed-wordpress-hosting",
  "/cheap-shared-hosting",
  "/cheap-ssd-hosting",
  "/cheap-ssd-vps",
  "/cheap-ssd-web-hosting",
  "/cheap-ubuntu-vps",
  "/cheap-vps-hosting",
  "/cheap-web-hosting",
  "/cheap-wordpress-hosting",
  "/cloud-ssd-hosting",
  "/cpanel-ssd-hosting",
  "/cpanel-vps-hosting",
  "/debian-vps",
  "/dedicated-vps",
  "/fast-vps",
  "/fedora-vps",
  "/kvm-ssd-vps",
  "/low-price-hosting",
  "/managed-vps-hosting",
  "/managed-vps-with-cpanel",
  "/opensuse-vps",
  "/scientific-vps",
  "/ssd-hosting",
  "/ssd-shared-hosting",
  "/ssd-web-hosting",
  "/ssd-wordpress-hosting",
  "/ubuntu-vps",
  "/unlimited-ssd-hosting",
  "/terms-of-service",
  "/privacy-policy",
  "/affiliate",
  "/partners",
  "/compare-royalclouds-vps-plans",
  "/cookie-policy",
  "/cyberpanel-vps-hosting",
  "/managed-digitalocean-cloud-hosting"
] as const;

export type ContentRoute = (typeof CONTENT_ROUTES)[number];

export const REDIRECTS = new Map<string, { destination: string; status: 301 | 302 }>([
  ["/shared-hosting.php", { destination: "/shared-hosting", status: 301 }],
  ["/testimonials.php", { destination: "/testimonials", status: 301 }],
  ["/compare-royalclouds-vps-plans.php", { destination: "/compare-royalclouds-vps-plans", status: 301 }],
  ["/domains", { destination: "https://my.royalclouds.net/cart.php?a=add&domain=register", status: 302 }],
  ["/login", { destination: "https://my.royalclouds.net/login", status: 302 }],
  ["/privacy", { destination: "/privacy-policy", status: 301 }],
  ["/third-party-data", { destination: "/privacy-policy#third-party-data", status: 301 }]
]);

export const INDEXABLE_ROUTES = CONTENT_ROUTES;

export function routeToSlug(route: string): string {
  return route === "/" ? "home" : route.slice(1);
}

export function slugToRoute(slug: string | undefined): string {
  return slug ? `/${slug.replace(/^\/+|\/+$/g, "")}` : "/";
}

export function isContentRoute(route: string): route is ContentRoute {
  return CONTENT_ROUTES.includes(route as ContentRoute);
}

export function humanizeRoute(route: string): string {
  if (route === "/") return "Home";
  return route
    .slice(1)
    .split("-")
    .map((word) => {
      if (["vps", "ssd", "kvm"].includes(word)) return word.toUpperCase();
      if (word === "cpanel") return "cPanel";
      return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
    })
    .join(" ");
}
