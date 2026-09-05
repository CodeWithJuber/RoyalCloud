import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { Icon } from "../Icon";

/* Shared chip for the OS strip and the deploy tabs (plain JSX — usable from
   server and client). Rich chips (with copy) become small cards; chips with
   a product page become links. `mark` is a server-rendered brand glyph
   (BrandMark) when the name has one; otherwise the authored colour + first
   letter stands in, so no logo is ever invented. */
export interface DeployItem {
  name: string;
  color?: string;
  active?: boolean;
  href?: string;
  text?: string;
  mark?: ReactNode;
}

export function OsChip({ item }: { item: DeployItem }) {
  const className = `os-chip${item.active ? " active" : ""}`;
  const body = (
    <>
      {item.mark ? (
        <span className="os-mark os-mark-brand" aria-hidden="true">
          {item.mark}
        </span>
      ) : (
        <span
          className="os-mark"
          style={item.color ? ({ "--os-c": item.color } as CSSProperties) : undefined}
          aria-hidden="true"
        >
          {item.name.slice(0, 1)}
        </span>
      )}
      <span className="os-copy">
        <b>{item.name}</b>
        {item.text && <span className="os-text">{item.text}</span>}
      </span>
      {/* "This is the one this page is about" was a violet border and a 4%
          tint — colour alone, and nothing at all for a screen reader.
          aria-current carries it to assistive tech, the tick carries it to
          anyone who cannot pick that border out. */}
      {item.active && <Icon name="check" size={14} className="os-chip-current" aria-hidden="true" />}
    </>
  );
  return item.href ? (
    <Link
      className={className}
      href={item.href}
      aria-current={item.active ? "page" : undefined}
      data-rich={item.text ? "true" : undefined}
    >
      {body}
    </Link>
  ) : (
    <span
      className={className}
      aria-current={item.active ? "true" : undefined}
      data-rich={item.text ? "true" : undefined}
    >
      {body}
    </span>
  );
}
