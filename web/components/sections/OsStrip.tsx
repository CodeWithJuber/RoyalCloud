import { DEPLOY_CATALOG, groupsIn } from "@/lib/deploy-catalog";
import { BrandMark, hasBrandMark } from "../BrandMark";
import { DeployTabs } from "./DeployTabs";
import { OsChip, type DeployItem } from "./OsChip";
import { sectionName, sectionTitleId } from "@/lib/section-name";

export interface OsItem {
  name: string;
  color?: string;
  active?: boolean;
}

interface OsStripProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items: OsItem[];
}

/* Server shell: enriches authored names from the deploy catalogue. Pages that
   list only distros keep the flat chip row (no JS); pages whose items span
   more than one group get the tabbed "one-click deploy" grid. */
export function OsStrip({ id, eyebrow, title, subtitle, items }: OsStripProps) {
  const enriched: DeployItem[] = items.map((item) => {
    const entry = DEPLOY_CATALOG[item.name];
    /* Real distro / panel glyphs render here on the server; the client tabs
       only ever receive the finished node. */
    const mark = hasBrandMark(item.name) ? <BrandMark name={item.name} size={18} /> : undefined;
    return { ...item, href: entry?.href, text: entry?.text, mark };
  });
  const groups = groupsIn(items.map((item) => item.name));
  const tabbed = groups.length > 1;

  return (
    <section className="section-sm osstrip" id={id} {...sectionName(id, title)}>
      <div className="site-shell">
        {(eyebrow || title || subtitle || tabbed) && (
          <header className="section-header center" data-reveal>
            {(eyebrow || tabbed) && <p className="eyebrow">{eyebrow ?? "One-click deploy"}</p>}
            {title && <h2 id={sectionTitleId(id)}>{title}</h2>}
            {subtitle && <p className="lede">{subtitle}</p>}
          </header>
        )}
        {tabbed ? (
          <DeployTabs
            items={enriched}
            groups={groups}
            label={title ?? "One-click deploy options"}
            baseId={`${id ?? "deploy"}-panel`}
          />
        ) : (
          <ul className="os-row" data-reveal>
            {enriched.map((item) => (
              <li key={item.name}>
                <OsChip item={item} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
