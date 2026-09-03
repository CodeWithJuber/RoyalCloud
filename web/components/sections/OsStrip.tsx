import type { CSSProperties } from "react";

export interface OsItem {
  name: string;
  color?: string;
  active?: boolean;
}

interface OsStripProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items: OsItem[];
}

export function OsStrip({ eyebrow, title, subtitle, items }: OsStripProps) {
  return (
    <section className="section-sm osstrip">
      <div className="site-shell">
        {(eyebrow || title || subtitle) && (
          <header className="section-header center" data-reveal>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h2>{title}</h2>}
            {subtitle && <p className="lede">{subtitle}</p>}
          </header>
        )}
        <ul className="os-row" data-reveal>
          {items.map((os) => (
            <li key={os.name} className={`os-chip${os.active ? " active" : ""}`}>
              <span
                className="os-mark"
                style={os.color ? ({ "--os-c": os.color } as CSSProperties) : undefined}
                aria-hidden="true"
              >
                {os.name.slice(0, 1)}
              </span>
              <b>{os.name}</b>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
