import { BrandMark, hasBrandMark } from "../BrandMark";
import { sectionName, sectionTitleId } from "@/lib/section-name";

/**
 * "Logo shelf" of the platform stack: the real brand glyph (Simple Icons,
 * vendored) beside the name where one exists, a plain wordmark where it
 * doesn't (LiteSpeed, CloudLinux) — a wordmark is honest, a made-up logo is
 * not.
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
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}

export function TechLogos({
  id,
  eyebrow,
  title = "Built on trusted technology",
  subtitle,
}: TechLogosProps) {
  return (
    <section className="section-sm techlogos" id={id} {...sectionName(id, title)}>
      <div className="site-shell">
        <header className="section-header center" data-reveal>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 id={sectionTitleId(id)}>{title}</h2>
          {subtitle && <p className="lede">{subtitle}</p>}
        </header>
        <ul className="tech-shelf" data-reveal>
          {TECH_STACK.map((name) => (
            <li key={name} className="tech-logo" data-wordmark={hasBrandMark(name) ? undefined : "true"}>
              <BrandMark name={name} size={22} />
              <span>{name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
