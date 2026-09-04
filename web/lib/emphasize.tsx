import type { ReactNode } from "react";

/**
 * Content titles are plain text with optional `<em>` accents (the only tag
 * the content vocabulary allows). emphasize() turns that string into React
 * nodes so headings render through Astryx Heading without injecting HTML.
 * Any other tag is dropped, and the few entities editors type are decoded.
 */
const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&nbsp;": " ",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&lt;": "<",
  "&gt;": ">",
};

const decode = (text: string): string =>
  text.replace(/&(?:amp|nbsp|quot|#39|apos|lt|gt);/g, (entity) => ENTITIES[entity] ?? entity);

const stripTags = (text: string): string => text.replace(/<\/?[a-z][^>]*>/gi, "");

export function emphasize(title: string): ReactNode[] {
  const parts = title.split(/<em>([\s\S]*?)<\/em>/g);
  const nodes: ReactNode[] = [];
  parts.forEach((part, index) => {
    const text = decode(stripTags(part));
    if (text.length === 0) return;
    /* split() alternates plain, emphasised, plain, … */
    nodes.push(index % 2 === 1 ? <em key={index}>{text}</em> : text);
  });
  return nodes;
}

/** Plain-text form (for aria labels, metadata, tests). */
export const plainTitle = (title: string): string => decode(stripTags(title));
