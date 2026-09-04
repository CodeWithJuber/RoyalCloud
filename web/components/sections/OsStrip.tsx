import { DEPLOY_CATALOG, groupsIn } from "@/lib/deploy-catalog";
import { DeployTabs } from "./DeployTabs";
import { OsChip, type DeployItem } from "./OsChip";

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
    return { ...item, href: entry?.href, text: entry?.text };
  });
  const groups = groupsIn(items.map((item) => item.name));
  const tabbed = groups.length > 1;

  return (
    <section className="section-sm osstrip" id={id}>
      <div className="site-shell">
        {(eyebrow || title || subtitle || tabbed) && (
          <header className="section-header center" data-reveal>
            {(eyebrow || tabbed) && <p className="eyebrow">{eyebrow ?? "One-click deploy"}</p>}
            {title && <h2>{title}</h2>}
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
