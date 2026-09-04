import type { CSSProperties } from "react";
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

/**
 * Copy beside the illustration, then the checklist as a full-width night
 * strip: one tile per item across the shell on desktop, two-up on tablets,
 * stacked on phones. The copy column never floats mid-height beside a tall
 * list, and the strip uses the whole width instead of half of it.
 */
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
  return (
    <section className="section content-split" data-strip={hasItems ? "true" : undefined}>
      <div className="site-shell">
        <div
          className={`split${reverse ? " split-reverse" : ""}${artKind ? "" : " split-solo"}`}
        >
          <div className="split-copy" data-reveal>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h2>{title}</h2>}
            {subtitle && <p className="lede">{subtitle}</p>}
            {body && <p className="split-body">{body}</p>}
          </div>
          {artKind && (
            <div className="split-media" data-reveal>
              <SectionArt kind={artKind} />
            </div>
          )}
        </div>
        {hasItems && (
          <ul className="split-list" data-count={items.length}>
            {items.map((item, i) => (
              <li key={item.title} data-reveal style={{ "--reveal-i": i } as CSSProperties}>
                <span className="split-icon">
                  <Icon name={item.icon ?? "bolt"} size={20} />
                </span>
                <div className="split-item-copy">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
