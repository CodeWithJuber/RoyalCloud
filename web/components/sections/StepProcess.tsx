import type { CSSProperties } from "react";
import { Icon } from "../Icon";

export interface StepItem {
  icon?: string;
  title: string;
  text: string;
}

interface StepProcessProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items: StepItem[];
}

export function StepProcess({ id, eyebrow, title, subtitle, items }: StepProcessProps) {
  return (
    <section className="section steps" id={id}>
      <div className="site-shell">
        {(eyebrow || title || subtitle) && (
          <header className="section-header center" data-reveal>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h2>{title}</h2>}
            {subtitle && <p className="lede">{subtitle}</p>}
          </header>
        )}
        <ol className="steps-grid" data-cols={Math.min(items.length, 4)}>
          {items.map((step, i) => (
            <li
              key={step.title}
              className="card step-card"
              data-reveal
              style={{ "--reveal-i": i } as CSSProperties}
            >
              <span className="step-num">
                {step.icon ? (
                  <Icon name={step.icon} size={18} />
                ) : (
                  String(i + 1).padStart(2, "0")
                )}
              </span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
