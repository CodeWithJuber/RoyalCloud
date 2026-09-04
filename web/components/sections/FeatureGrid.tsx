import type { CSSProperties } from "react";
import { Icon } from "../Icon";

export interface FeatureItem {
  icon?: string;
  title: string;
  text: string;
  href?: string;
  /** Headline figure (e.g. "15x") — rendered only when authored. */
  metric?: string;
  metricLabel?: string;
}

interface FeatureGridProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  columns?: 2 | 3 | 4;
  /** "tiles" = icon beside copy without card chrome (dense landing grids). */
  variant?: "cards" | "tiles";
  items: FeatureItem[];
}

export function FeatureGrid({
  id,
  eyebrow,
  title,
  subtitle,
  columns = 3,
  variant = "cards",
  items,
}: FeatureGridProps) {
  return (
    <section className="section features" id={id} data-variant={variant}>
      <div className="site-shell">
        {(eyebrow || title || subtitle) && (
          <header className="section-header center" data-reveal>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h2>{title}</h2>}
            {subtitle && <p className="lede">{subtitle}</p>}
          </header>
        )}
        <div className={`grid grid-${columns}`}>
          {items.map((item, i) => {
            const stagger = { "--reveal-i": i } as CSSProperties;
            const body = (
              <>
                <span className="feature-icon">
                  <Icon name={item.icon ?? "bolt"} size={22} />
                </span>
                {item.metric && (
                  <p className="feature-metric">
                    <strong>{item.metric}</strong>
                    {item.metricLabel && <small>{item.metricLabel}</small>}
                  </p>
                )}
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                {item.href && (
                  <span className="feature-more">
                    Learn more <span aria-hidden="true">→</span>
                  </span>
                )}
              </>
            );
            return item.href ? (
              <a key={item.title} className="card feature-card" href={item.href} data-reveal style={stagger}>
                {body}
              </a>
            ) : (
              <article key={item.title} className="card feature-card" data-reveal style={stagger}>
                {body}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
