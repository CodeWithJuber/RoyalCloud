import { getPlanFile } from "@/lib/plans";
import { Price } from "../Price";

interface ComparisonTableProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  plan?: string;
  note?: string;
}

/* "10 GB SSD Storage" → "SSD Storage" so tier cells stay comparable. */
const featureLabel = (text: string) =>
  text.replace(/^(unlimited|free|\d+[\w.]*)\s+(gb\s+|tb\s+)?/i, "") || text;

export function ComparisonTable({
  eyebrow,
  title,
  subtitle,
  plan = "shared",
  note,
}: ComparisonTableProps) {
  const planData = getPlanFile(plan);
  if (!planData) return null;

  const tiers = planData.tiers;
  const rowCount = Math.max(0, ...tiers.map((t) => t.features.length));
  const rows = Array.from({ length: rowCount }, (_, i) => ({
    label: featureLabel(tiers[0]?.features[i] ?? ""),
    cells: tiers.map((t) => t.features[i] ?? "—"),
  })).filter((row) => row.label.length > 0);

  const colClass = (popular?: boolean) =>
    popular ? "compare-popular" : undefined;

  return (
    <section className="section compare-section">
      <div className="site-shell">
        {(eyebrow || title || subtitle) && (
          <header className="section-header center" data-reveal>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h2>{title}</h2>}
            {subtitle && <p className="lede">{subtitle}</p>}
          </header>
        )}
        <div className="compare-scroll" data-reveal>
          <table className="compare-table">
            <caption>
              {title ?? planData.title}: price and feature comparison across{" "}
              {tiers.length} plans.
            </caption>
            <thead>
              <tr>
                <th scope="col">Feature</th>
                {tiers.map((tier) => (
                  <th key={tier.name} scope="col" className={colClass(tier.popular)}>
                    {tier.name}
                    {tier.popular && <span className="compare-flag">Popular</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Price</th>
                {tiers.map((tier) => (
                  <td key={tier.name} className={colClass(tier.popular)}>
                    <span className="compare-price">
                      <Price value={tier.price} />
                      <span className="compare-period">{tier.period ?? "/mo"}</span>
                    </span>
                  </td>
                ))}
              </tr>
              {rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {row.cells.map((cell, j) => (
                    <td
                      key={tiers[j]?.name ?? j}
                      className={colClass(tiers[j]?.popular)}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="compare-cta-row">
                <th scope="row">
                  <span className="visually-hidden">Choose a plan</span>
                </th>
                {tiers.map((tier) => (
                  <td key={tier.name} className={colClass(tier.popular)}>
                    <a
                      className={`btn ${tier.popular ? "btn-primary" : "btn-secondary"}`}
                      href={tier.ctaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {tier.cta ?? "Get Started"}
                      <span className="btn-arrow" aria-hidden="true">↗</span>
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        {note && <p className="compare-note">{note}</p>}
      </div>
    </section>
  );
}
