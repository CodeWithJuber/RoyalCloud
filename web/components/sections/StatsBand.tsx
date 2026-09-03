export interface StatItem {
  value: string;
  label: string;
}

interface StatsBandProps {
  items: StatItem[];
}

export function StatsBand({ items }: StatsBandProps) {
  return (
    <section className="section-royal stats-band" aria-label="Key numbers">
      <div className="site-shell stats-row">
        {items.map((stat) => (
          <div key={stat.label} className="stat" data-reveal>
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
