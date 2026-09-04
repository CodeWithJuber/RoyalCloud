import type { CSSProperties } from "react";
import { CountUp } from "../CountUp";

export interface SecurityLayer {
  title: string;
  text: string;
}

export interface SecurityStat {
  value: string;
  label: string;
}

interface SecurityLayersProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  layers: SecurityLayer[];
  stats?: SecurityStat[];
}

export function SecurityLayers({
  id,
  eyebrow,
  title,
  subtitle,
  layers,
  stats,
}: SecurityLayersProps) {
  return (
    <section className="section section-dark security" id={id}>
      <div className="site-shell">
        {(eyebrow || title || subtitle) && (
          <header className="section-header center" data-reveal>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h2>{title}</h2>}
            {subtitle && <p className="lede">{subtitle}</p>}
          </header>
        )}
        <div className="grid grid-3 sec-grid">
          {layers.map((layer, i) => (
            <article
              key={layer.title}
              className="card sec-card"
              data-reveal
              style={{ "--reveal-i": i } as CSSProperties}
            >
              <span className="sec-num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{layer.title}</h3>
              <p>{layer.text}</p>
            </article>
          ))}
        </div>
        {stats && stats.length > 0 && (
          <dl className="sec-stats" data-reveal>
            {stats.map((stat) => (
              <div key={stat.label} className="sec-stat">
                <dt>{stat.label}</dt>
                <dd>
                  <CountUp value={stat.value} />
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
