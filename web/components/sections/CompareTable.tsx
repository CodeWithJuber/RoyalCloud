"use client";

import { useRef, useState } from "react";
import type { FocusEvent, MouseEvent } from "react";
import { SegmentedControl, SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";
import { Tooltip } from "@astryxdesign/core/Tooltip";
import { Icon } from "../Icon";
import { Price } from "../Price";
import type { PlanTier } from "./PlanCards";
import type { RowGroup } from "@/lib/feature-groups";
import { maxSavePct, priceFor, setBilling, termLabel, useBilling } from "@/lib/billing-store";
import { useOverflow } from "@/lib/use-overflow";
import { NewTabHint } from "../NewTabHint";

/**
 * Interactive half of the comparison table. Prices follow the shared billing
 * store (in lockstep with PlanCards), the hovered/focused column is
 * highlighted, and on phones only the lead rows show until "Compare all
 * features" expands the rest — without JS every row renders.
 * Astryx: SegmentedControl + Tooltip (layer-positioned, escapes the sticky
 * first column's stacking context).
 */
interface CompareTableProps {
  caption: string;
  tiers: PlanTier[];
  groups: RowGroup[];
  hasAnnual: boolean;
  tableId: string;
}

export function CompareTable({ caption, tiers, groups, hasAnnual, tableId }: CompareTableProps) {
  const stored = useBilling();
  const billing = hasAnnual ? stored : "monthly";
  const [activeCol, setActiveCol] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { overflowing } = useOverflow(scrollRef);

  const colOf = (target: EventTarget | null): number | null => {
    const cell = target instanceof Element ? target.closest("[data-col]") : null;
    const value = cell?.getAttribute("data-col");
    return value ? Number(value) : null;
  };
  const highlight = (event: MouseEvent | FocusEvent) => setActiveCol(colOf(event.target));
  const clear = () => setActiveCol(null);

  const cellProps = (col: number, popular?: boolean) => ({
    "data-col": col,
    "data-active": activeCol === col ? "true" : undefined,
    className: popular ? "compare-popular" : undefined,
  });

  return (
    <>
      {hasAnnual && (
        <div className="compare-toolbar">
          <SegmentedControl
            value={billing}
            onChange={(value) => setBilling(value === "annual" ? "annual" : "monthly")}
            label="Billing period"
            layout="hug"
          >
            <SegmentedControlItem value="monthly" label="Monthly" />
            <SegmentedControlItem
              value="annual"
              label={`Annual — save up to ${maxSavePct(tiers)}%`}
            />
          </SegmentedControl>
        </div>
      )}

      {/* A scroll container is only reachable by keyboard if something in it
          can take focus. The table's cells cannot, so the container itself is
          the tab stop — with a name, so it is announced as what it is rather
          than as an unlabelled group. */}
      <div
        className="compare-scroll"
        ref={scrollRef}
        role="region"
        aria-label={caption}
        tabIndex={overflowing ? 0 : undefined}
        data-reveal
      >
        <table
          className="compare-table"
          id={tableId}
          data-expanded={expanded ? "true" : "false"}
          onMouseOver={highlight}
          onMouseLeave={clear}
          onFocus={highlight}
          onBlur={clear}
        >
          <caption>{caption}</caption>
          <thead>
            <tr>
              <th scope="col">Feature</th>
              {tiers.map((tier, col) => (
                <th key={tier.name} scope="col" {...cellProps(col, tier.popular)}>
                  {tier.name}
                  {tier.popular && <span className="compare-flag">Most popular</span>}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="compare-lead">
            <tr className="compare-price-row">
              <th scope="row">Price</th>
              {tiers.map((tier, col) => (
                <td key={tier.name} {...cellProps(col, tier.popular)}>
                  <span className="compare-price">
                    <Price value={priceFor(tier, billing)} />
                    <span className="compare-period">{tier.period ?? "/mo"}</span>
                  </span>
                  <span className="compare-term">{termLabel(billing)}</span>
                </td>
              ))}
            </tr>
            {tiers.some((tier) => tier.summary) && (
              <tr className="compare-best">
                <th scope="row">Best for</th>
                {tiers.map((tier, col) => (
                  <td key={tier.name} {...cellProps(col, tier.popular)}>
                    {tier.summary ?? "—"}
                  </td>
                ))}
              </tr>
            )}
          </tbody>

          {groups.map((group, gi) => (
            <tbody key={group.group} className={gi > 0 ? "compare-extra" : undefined}>
              <tr className="compare-group">
                <th scope="colgroup" colSpan={tiers.length + 1}>
                  {group.group}
                </th>
              </tr>
              {group.rows.map((row, ri) => (
                <tr key={`${group.group}-${ri}`}>
                  <th scope="row">
                    {row.label}
                    {row.tooltip && (
                      <Tooltip content={row.tooltip} placement="above">
                        <button type="button" className="compare-info" aria-label={`About ${row.label}`}>
                          <Icon name="info" size={16} />
                        </button>
                      </Tooltip>
                    )}
                  </th>
                  {row.cells.map((cell, col) => (
                    <td key={tiers[col]?.name ?? col} {...cellProps(col, tiers[col]?.popular)}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}

          <tbody>
            <tr className="compare-cta-row">
              <th scope="row">
                <span className="visually-hidden">Choose a plan</span>
              </th>
              {tiers.map((tier, col) => (
                <td key={tier.name} {...cellProps(col, tier.popular)}>
                  <a
                    className={`btn ${tier.popular ? "btn-primary" : "btn-secondary"}`}
                    href={tier.ctaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {tier.cta ?? "Get Started"}
                    <span className="btn-arrow" aria-hidden="true">↗</span>
            <NewTabHint />
                  </a>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {groups.length > 1 && (
        <button
          type="button"
          className="compare-more"
          aria-expanded={expanded}
          aria-controls={tableId}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Show less" : "Compare all features"}
          <Icon name={expanded ? "arrowUp" : "arrowDown"} size={16} />
        </button>
      )}
    </>
  );
}
