/**
 * "Logo shelf" of the platform stack. No image files — text wordmark chips
 * with a subtle border read cleaner than low-res partner PNGs.
 */
const TECH_STACK = [
  "cPanel",
  "CloudLinux",
  "LiteSpeed",
  "Cloudflare",
  "WordPress",
  "Let's Encrypt",
];

interface TechLogosProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}

export function TechLogos({
  eyebrow,
  title = "Built on trusted technology",
  subtitle,
}: TechLogosProps) {
  return (
    <section className="section-sm techlogos">
      <div className="site-shell">
        <header className="section-header center" data-reveal>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2>{title}</h2>
          {subtitle && <p className="lede">{subtitle}</p>}
        </header>
        <ul className="tech-shelf" data-reveal>
          {TECH_STACK.map((name) => (
            <li key={name} className="tech-logo">
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
