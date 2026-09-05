import type { CSSProperties } from "react";
import { sectionName, sectionTitleId } from "@/lib/section-name";
import { ScrollRail } from "../ScrollRail";

export interface StoryItem {
  tag: string;
  metric: string;
  metricLabel: string;
  quote: string;
  name: string;
  site?: string;
}

interface StoryCardsProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items: StoryItem[];
}

export function StoryCards({ id, eyebrow, title, subtitle, items }: StoryCardsProps) {
  return (
    <section className="section section-tint stories" id={id} {...sectionName(id, title)}>
      <div className="site-shell">
        {(eyebrow || title || subtitle) && (
          <header className="section-header center" data-reveal>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h2 id={sectionTitleId(id)}>{title}</h2>}
            {subtitle && <p className="lede">{subtitle}</p>}
          </header>
        )}
        <ScrollRail className="grid grid-3" label={title ?? "Stories"}>
          {items.map((story, i) => (
            <article
              key={story.name}
              className="card story-card"
              data-reveal
              style={{ "--reveal-i": i } as CSSProperties}
            >
              <span className="chip chip-save story-tag">{story.tag}</span>
              <div className="story-metric">
                <strong>{story.metric}</strong>
                <small>{story.metricLabel}</small>
              </div>
              <blockquote>&ldquo;{story.quote}&rdquo;</blockquote>
              <footer className="story-footer">
                <span className="avatar-chip" aria-hidden="true">
                  {story.name.slice(0, 1)}
                </span>
                <span>
                  <b>{story.name}</b>
                  {story.site && <small>{story.site}</small>}
                </span>
              </footer>
            </article>
          ))}
        </ScrollRail>
      </div>
    </section>
  );
}
