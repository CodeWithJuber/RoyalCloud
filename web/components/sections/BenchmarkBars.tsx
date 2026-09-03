import type { CSSProperties } from "react";

export interface BenchItem {
  label: string;
  value: number;
  display: string;
  highlight?: boolean;
}

interface BenchmarkBarsProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  note?: string;
  items: BenchItem[];
}

export function BenchmarkBars({
  eyebrow,
  title,
  subtitle,
  note,
  items,
}: BenchmarkBarsProps) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <section className="section section-dark benchmark">
      <div className="site-shell">
        {(eyebrow || title || subtitle) && (
          <header className="section-header center" data-reveal>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h2>{title}</h2>}
            {subtitle && <p className="lede">{subtitle}</p>}
          </header>
        )}
        <div className="bench-panel" data-reveal>
          {items.map((row) => (
            <div
              key={row.label}
              className="bench-row"
              data-highlight={row.highlight ? "true" : undefined}
            >
              <span className="bench-label">{row.label}</span>
              <span className="bench-track" aria-hidden="true">
                <span
                  className="bench-fill"
                  style={
                    {
                      "--w": `${Math.max((row.value / max) * 100, 4)}%`,
                    } as CSSProperties
                  }
                />
              </span>
              <span className="bench-value">{row.display}</span>
            </div>
          ))}
        </div>
        {note && <p className="bench-note">{note}</p>}
      </div>
    </section>
  );
}
