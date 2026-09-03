"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Theme } from "@astryxdesign/core/theme";
import { LinkProvider } from "@astryxdesign/core/Link";
import { royalTheme } from "./royal";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Theme theme={royalTheme} mode="light">
      <LinkProvider component={Link}>{children}</LinkProvider>
    </Theme>
  );
}
