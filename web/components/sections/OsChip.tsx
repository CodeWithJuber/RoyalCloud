import type { CSSProperties } from "react";
import Link from "next/link";

/* Shared chip for the OS strip and the deploy tabs (plain JSX — usable from
   server and client). Rich chips (with copy) become small cards; chips with
   a product page become links. */
export interface DeployItem {
  name: string;
  color?: string;
  active?: boolean;
  href?: string;
  text?: string;
}

export function OsChip({ item }: { item: DeployItem }) {
  const className = `os-chip${item.active ? " active" : ""}`;
  const body = (
    <>
      <span
        className="os-mark"
        style={item.color ? ({ "--os-c": item.color } as CSSProperties) : undefined}
        aria-hidden="true"
      >
        {item.name.slice(0, 1)}
      </span>
      <span className="os-copy">
        <b>{item.name}</b>
        {item.text && <span className="os-text">{item.text}</span>}
      </span>
    </>
  );
  return item.href ? (
    <Link className={className} href={item.href} data-rich={item.text ? "true" : undefined}>
      {body}
    </Link>
  ) : (
    <span className={className} data-rich={item.text ? "true" : undefined}>
      {body}
    </span>
  );
}
