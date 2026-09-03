"use client";

import { useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

export interface ShowcaseTab {
  label: string;
  text?: string;
}

interface ShowcaseTabsProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tabs?: ShowcaseTab[];
}

const DEFAULT_TABS: ShowcaseTab[] = [
  {
    label: "File Manager",
    text: "Upload, edit and organize your site files right in the browser — no FTP client needed.",
  },
  {
    label: "Free SSL",
    text: "One click installs your Let's Encrypt certificate and renews it automatically, forever.",
  },
  {
    label: "Backups",
    text: "Automatic daily snapshots of your whole account. Restore a file, a database or everything in one click.",
  },
  {
    label: "Live Stats",
    text: "Visitors, bandwidth and resource usage at a glance, so you always know how your sites are doing.",
  },
];

export function ShowcaseTabs({
  eyebrow,
  title,
  subtitle,
  tabs = DEFAULT_TABS,
}: ShowcaseTabsProps) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  const select = (index: number, focus = false) => {
    setActive(index);
    if (focus) tabRefs.current[index]?.focus();
  };

  /* WAI-ARIA tabs pattern: arrows/Home/End move selection AND focus. */
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const count = tabs.length;
    let next = -1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown")
      next = (active + 1) % count;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      next = (active - 1 + count) % count;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = count - 1;
    if (next >= 0) {
      event.preventDefault();
      select(next, true);
    }
  };

  return (
    <section className="section section-dark showcase">
      <div className="site-shell">
        {(eyebrow || title || subtitle) && (
          <header className="section-header center" data-reveal>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h2>{title}</h2>}
            {subtitle && <p className="lede">{subtitle}</p>}
          </header>
        )}
        <div className="showcase-stage" data-reveal>
          <div
            className="showcase-tabs"
            role="tablist"
            aria-label={title ?? "Control panel features"}
            onKeyDown={onKeyDown}
          >
            {tabs.map((tab, i) => (
              <button
                key={tab.label}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${i}`}
                className="showcase-tab"
                aria-selected={i === active}
                aria-controls={`${baseId}-panel-${i}`}
                tabIndex={i === active ? 0 : -1}
                onClick={() => select(i)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {tabs.map((tab, i) => (
            <div
              key={tab.label}
              role="tabpanel"
              id={`${baseId}-panel-${i}`}
              aria-labelledby={`${baseId}-tab-${i}`}
              className="showcase-window"
              tabIndex={0}
              hidden={i !== active}
            >
              <div className="showcase-chrome" aria-hidden="true">
                <i />
                <i />
                <i />
                <span>my.royalclouds.net/panel</span>
              </div>
              <div className="showcase-panel">
                <h3>{tab.label}</h3>
                {tab.text && <p>{tab.text}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
