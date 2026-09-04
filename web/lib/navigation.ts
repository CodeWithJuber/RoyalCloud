import navData from "@/data/navigation.json";
import { CONTENT_ROUTES, REDIRECTS } from "@/lib/routes";

/**
 * Header navigation from data/navigation.json (CMS-editable): product
 * groups with icons and one-line descriptions, plain links, and the two
 * account actions. Links are filtered to real destinations — a content
 * route, a declared redirect, or an absolute URL — so the menu can never
 * point at a page that does not exist.
 */
export interface NavLink {
  text: string;
  href: string;
  icon?: string;
  description?: string;
}

export interface NavGroup {
  text: string;
  links: NavLink[];
}

export interface NavAction {
  text: string;
  href: string;
  variant?: string;
}

const BLOG_URL = "https://blog.royalclouds.net";

export const isExternal = (href: string): boolean => /^https?:\/\//.test(href);

export const isReachable = (href: string): boolean =>
  isExternal(href) ||
  (CONTENT_ROUTES as readonly string[]).includes(href) ||
  REDIRECTS.some((redirect) => redirect.source === href);

const normalise = (link: NavLink): NavLink =>
  link.href === "/blog" ? { ...link, href: BLOG_URL } : link;

export const HEADER_GROUPS: NavGroup[] = navData.header.groups.map((group) => ({
  text: group.text,
  links: group.links.map(normalise).filter((link) => isReachable(link.href)),
}));

export const HEADER_LINKS: NavLink[] = navData.header.links
  .map(normalise)
  .filter((link) => isReachable(link.href));

export const HEADER_ACTIONS: NavAction[] = navData.header.actions;

export const signInAction = (): NavAction =>
  HEADER_ACTIONS.find((action) => action.variant === "secondary") ?? HEADER_ACTIONS[0];

export const primaryAction = (): NavAction =>
  HEADER_ACTIONS.find((action) => action.variant !== "secondary") ?? HEADER_ACTIONS[HEADER_ACTIONS.length - 1];
