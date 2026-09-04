"use client";

import { useState } from "react";
import { TabList, Tab } from "@astryxdesign/core/TabList";
import { GROUP_LABEL, groupOf, type DeployGroup } from "@/lib/deploy-catalog";
import { OsChip, type DeployItem } from "./OsChip";

/* "One-click deploy" tabs (Astryx TabList): All + one tab per group that the
   page's items actually contain. Panels toggle `hidden`, so every chip is in
   the HTML for search and no-JS visitors. */
export function DeployTabs({
  items,
  groups,
  label,
  baseId,
}: {
  items: DeployItem[];
  groups: DeployGroup[];
  label: string;
  baseId: string;
}) {
  const tabs: { value: string; label: string; filter: (item: DeployItem) => boolean }[] = [
    { value: "all", label: "All", filter: () => true },
    ...groups.map((group) => ({
      value: group,
      label: GROUP_LABEL[group],
      filter: (item: DeployItem) => groupOf(item.name) === group,
    })),
  ];
  const [active, setActive] = useState("all");

  return (
    <div className="deploy-tabs" data-reveal>
      <TabList value={active} onChange={setActive} role="tablist" layout="hug" aria-label={label}>
        {tabs.map((tab) => (
          <Tab key={tab.value} value={tab.value} label={tab.label} panelId={`${baseId}-${tab.value}`} />
        ))}
      </TabList>
      {tabs.map((tab) => (
        <ul
          key={tab.value}
          id={`${baseId}-${tab.value}`}
          role="tabpanel"
          tabIndex={0}
          hidden={tab.value !== active}
          className="os-row os-grid"
        >
          {items.filter(tab.filter).map((item) => (
            <li key={item.name}>
              <OsChip item={item} />
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}
