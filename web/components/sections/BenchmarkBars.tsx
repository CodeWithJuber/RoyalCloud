import type { CSSProperties } from "react";

export interface BenchItem {
  label: string;
  value: number;
  display: string;
  highlight?: boolean;
}

interface BenchmarkBarsProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  note?: string;
  /** Axis hint — which direction wins ("Lower is better" for load times). */
  scale?: "lower" | "higher";
  items: BenchItem[];
}

export function BenchmarkBars({
  id,
  eyebrow,
  title,
  subtitle,
  note,
  scale,
  items,
}: BenchmarkBarsProps) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <section className="section section-dark benchmark" id={id}>
      <div className="site-shell">
        {(eyebrow || title || subtitle) && (
          <header className="section-header center" data-reveal>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h2>{title}</h2>}
            {subtitle && <p className="lede">{subtitle}</p>}
          </header>
        )}
        {scale && (
          <p className="bench-scale" data-reveal>
            {scale === "lower" ? "Lower is better" : "Higher is better"}
          </p>
        )}
        <div className="bench-panel" data-reveal>
          {items.map((row, i) => (
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
                      "--i": i,
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
