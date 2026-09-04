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
        {/* The grid becomes a snap rail on phones, so it needs to be focusable
            and named — a mouse can drag it, a keyboard cannot reach it. */}
        <ol
          className="steps-grid"
          data-cols={Math.min(items.length, 4)}
          tabIndex={0}
          aria-label={title ? `${title} — scroll sideways` : "Steps — scroll sideways"}
        >
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
