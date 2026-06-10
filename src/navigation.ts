// All navigation content lives in src/data/navigation.json so it is editable
// through Decap CMS. This module only adapts it to the shapes the header and
// footer widgets consume.
import { getPermalink, getAsset } from './utils/permalinks';
import navigation from './data/navigation.json';

export interface NavLink {
  text: string;
  href: string;
  icon?: string;
  description?: string;
}

const isExternal = (href: string) => /^https?:\/\//.test(href);
const resolve = (href: string) => (isExternal(href) ? href : getPermalink(href));

const link = <T extends NavLink>(l: T) => ({ ...l, href: resolve(l.href) });

export const headerData = {
  links: [
    ...navigation.header.groups.map((group) => ({
      text: group.text,
      links: group.links.map(link),
    })),
    ...navigation.header.links.map(link),
  ],
  actions: navigation.header.actions.map((a) => ({ ...a, href: resolve(a.href) })),
};

export const footerData = {
  links: navigation.footer.columns.map((column) => ({
    title: column.title,
    links: column.links.map(link),
  })),
  secondaryLinks: navigation.footer.secondaryLinks.map(link),
  socialLinks: navigation.footer.socialLinks.map((s) => ({
    ...s,
    href: s.href === '/rss.xml' ? getAsset('/rss.xml') : resolve(s.href),
  })),
  footNote: navigation.footer.footNote,
};
