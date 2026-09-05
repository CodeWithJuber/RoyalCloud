import { getPlanFile } from "@/lib/plans";
import { groupRows } from "@/lib/feature-groups";
import { hasAnnualSaving } from "@/lib/billing";
import { CompareTable } from "./CompareTable";
import { sectionName, sectionTitleId } from "@/lib/section-name";

interface ComparisonTableProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  plan?: string;
  note?: string;
}

/* Server shell: resolves the deck, groups the rows (lib/feature-groups) and
   hands serialisable props to the client CompareTable. */
export function ComparisonTable({
  id,
  eyebrow,
  title,
  subtitle,
  plan = "shared",
  note,
}: ComparisonTableProps) {
  const planData = getPlanFile(plan);
  if (!planData) return null;

  const tiers = planData.tiers;
  const groups = groupRows(tiers, planData.highlights);
  const tableId = `${id ?? "compare"}-table`;

  return (
    <section className="section compare-section" id={id} {...sectionName(id, title)}>
      <div className="site-shell">
        {(eyebrow || title || subtitle) && (
          <header className="section-header center" data-reveal>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h2 id={sectionTitleId(id)}>{title}</h2>}
            {subtitle && <p className="lede">{subtitle}</p>}
          </header>
        )}
        <CompareTable
          caption={`${title ?? planData.title}: price and feature comparison across ${tiers.length} plans.`}
          tiers={tiers}
          groups={groups}
          hasAnnual={hasAnnualSaving(tiers)}
          tableId={tableId}
        />
        {note && <p className="compare-note">{note}</p>}
      </div>
    </section>
  );
}
