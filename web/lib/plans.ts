/**
 * Static plan-file lookup for content-driven sections (ComparisonTable and
 * SectionRenderer `pricing` blocks). A plain static-import map: plan ids are
 * content vocabulary, never runtime input, so no dynamic import is needed —
 * a variable specifier would silently break bundling anyway.
 */
import type { PlanTier } from "@/components/sections/PlanCards";

import shared from "@/data/plans/shared.json";
import cpanel from "@/data/plans/cpanel.json";
import cyberpanel from "@/data/plans/cyberpanel.json";
import wordpress from "@/data/plans/wordpress.json";
import vps from "@/data/plans/vps.json";
import cloud from "@/data/plans/cloud.json";
import dedicated from "@/data/plans/dedicated.json";
import reseller from "@/data/plans/reseller.json";

export interface PlanFile {
  id: string;
  name: string;
  slug: string;
  icon: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  currency?: string;
  billingNote?: string;
  tiers: PlanTier[];
  highlights?: { icon: string; title: string; text: string }[];
}

export const PLAN_FILES: Record<string, PlanFile> = {
  shared,
  cpanel,
  cyberpanel,
  wordpress,
  vps,
  cloud,
  dedicated,
  reseller,
};

export const getPlanFile = (id: string): PlanFile | undefined =>
  PLAN_FILES[id];
