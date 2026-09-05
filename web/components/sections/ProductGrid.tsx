import type { CSSProperties } from "react";
import { Icon } from "../Icon";
import { Price } from "../Price";
import { sectionName, sectionTitleId } from "@/lib/section-name";
import { ScrollRail } from "../ScrollRail";

export interface ProductItem {
  icon?: string;
  title: string;
  text: string;
  /** USD monthly amount ("1.99" or "$1.99"); non-numeric strings render as-is. */
  price?: string;
  href: string;
}

interface ProductGridProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items: ProductItem[];
}

/** Extracts a USD amount and renders the dual-currency price. */
function StartingPrice({ value }: { value: string }) {
  const match = value.match(/\d+(?:\.\d+)?/);
  if (!match) return <>{value}</>;
  return <Price value={match[0]} />;
}

export function ProductGrid({ id, eyebrow, title, subtitle, items }: ProductGridProps) {
  return (
    <section className="section products" id={id} {...sectionName(id, title)}>
      <div className="site-shell">
        {(eyebrow || title || subtitle) && (
          <header className="section-header center" data-reveal>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h2 id={sectionTitleId(id)}>{title}</h2>}
            {subtitle && <p className="lede">{subtitle}</p>}
          </header>
        )}
        <ScrollRail className="product-grid" label={title ?? "Products"}>
          {items.map((item, i) => (
            <a
              key={item.title}
              className="card product-card"
              href={item.href}
              data-reveal
              style={{ "--reveal-i": i } as CSSProperties}
            >
              <span className="feature-icon">
                <Icon name={item.icon ?? "server"} size={22} />
              </span>
              <h3>{item.title}</h3>
              <p className="product-text">{item.text}</p>
              {item.price && (
                <p className="product-price">
                  Starting at <StartingPrice value={item.price} />
                  /mo
                </p>
              )}
              <span className="product-link">
                View plans <span aria-hidden="true">→</span>
              </span>
            </a>
          ))}
        </ScrollRail>
      </div>
    </section>
  );
}
