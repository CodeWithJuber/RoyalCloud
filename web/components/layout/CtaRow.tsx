import type { ReactNode } from "react";
import { HStack } from "@astryxdesign/core/Stack";

/**
 * CtaRow — the one call-to-action row policy. Buttons sit side by side on
 * tablets and desktops (wrapping when they must) and become one full-width
 * column on phones through a single `.cta-row` rule in site.css. Button
 * height and label centring come from the theme, never from the context.
 */
export interface CtaRowProps {
  children: ReactNode;
  align?: "start" | "center";
  className?: string;
  [dataAttribute: `data-${string}`]: string | undefined;
}

export function CtaRow({ children, align = "start", className, ...rest }: CtaRowProps) {
  const classes = ["cta-row", className].filter(Boolean).join(" ");
  return (
    <HStack wrap="wrap" gap={3} align="center" justify={align} className={classes} {...rest}>
      {children}
    </HStack>
  );
}
