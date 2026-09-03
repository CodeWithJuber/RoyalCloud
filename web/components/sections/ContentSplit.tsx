import { Icon } from "../Icon";
import { SectionArt, type SectionArtKind } from "../art/SectionArt";

export interface ChecklistItem {
  icon?: string;
  title: string;
  text: string;
}

interface ContentSplitProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  /** Illustration key (content `image` field) — renders branded scene right. */
  image?: string;
  reverse?: boolean;
  items?: ChecklistItem[];
}

const ART_KINDS: Record<string, SectionArtKind> = {
  speed: "speed",
  shield: "shield",
  support: "support",
  working: "support",
  datacenter: "datacenter",
  domains: "domains",
  migration: "migration",
};

export function ContentSplit({
  eyebrow,
  title,
  subtitle,
  body,
  image,
  reverse = false,
  items,
}: ContentSplitProps) {
  const hasItems = items !== undefined && items.length > 0;
  const artKind = image ? (ART_KINDS[image] ?? "generic") : undefined;
  const hasMedia = hasItems || artKind !== undefined;
  return (
    <section className="section content-split">
      <div
        className={`site-shell split${reverse ? " split-reverse" : ""}${hasMedia ? "" : " split-solo"}`}
      >
        <div className="split-copy" data-reveal>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          {title && <h2>{title}</h2>}
          {subtitle && <p className="lede">{subtitle}</p>}
          {body && <p className="split-body">{body}</p>}
        </div>
        {hasMedia && (
          <div className="split-media" data-reveal>
            {artKind && <SectionArt kind={artKind} />}
            {hasItems && (
              <ul className="split-list">
                {items.map((item) => (
                  <li key={item.title}>
                    <span className="split-icon">
                      <Icon name={item.icon ?? "bolt"} size={18} />
                    </span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
