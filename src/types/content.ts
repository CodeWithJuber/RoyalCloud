export type CurrencyCode = "INR" | "USD";
export type ApprovalState = "approved" | "needs-review";

export interface LinkField {
  label: string;
  href: string;
  external?: boolean;
}

export interface SeoFields {
  title: string;
  description: string;
  canonicalPath: string;
  image: string;
  noindex?: boolean;
  updatedAt: string;
}

export interface PriceValue {
  amount: number | null;
  currency: CurrencyCode;
  prefix?: string;
  suffix?: string;
}

/* A billing term the customer can actually buy (DESIGN.md 10.5).
   `monthly` is the effective per-month rate on this term, `renewal` the per-month
   rate once it lapses, `billedTotal` what is charged up front. The three are
   required together: a term that cannot state its renewal cannot be offered. */
export interface PlanTerm {
  months: number;
  monthly: PriceValue[];
  renewal: PriceValue[];
  billedTotal: PriceValue[];
}

/* One capacity bar inside a plan (DESIGN.md 8.4). `fill` is 0-1 relative to the
   largest plan in the same deck, so the bars compare plans rather than assert an
   absolute the data cannot support. */
export interface PlanTelemetry {
  label: string;
  value: string;
  fill: number;
}

export interface HostingPlan {
  id: string;
  name: string;
  audience: string;
  billingPeriod: "month" | "year";
  introductory: PriceValue[];
  renewal: PriceValue[];
  /* Optional by design. Terms come from billing or the CMS; a plan without them
     falls back to introductory/renewal and simply renders no Honest Ledger line.
     Per DESIGN.md 11 — if the number can't be real, the component doesn't ship —
     never synthesise a term or a renewal rate to populate this. */
  terms?: PlanTerm[];
  telemetry?: PlanTelemetry[];
  features: string[];
  checkoutUrl: string;
  /* Layout flag only: it selects the cobalt plane. It is not a claim about the
     plan, so nothing verbal may be derived from it. */
  featured?: boolean;
  /* Optional ribbon text, supplied by the content layer and never inferred. Any
     superlative here has to be evidenced by whoever writes it (DESIGN.md 11). */
  badge?: string;
  approvalState: ApprovalState;
}

export interface HeroBlock {
  component: "hero";
  eyebrow: string;
  title: string;
  summary: string;
  primaryAction: LinkField;
  secondaryAction?: LinkField;
  visual?: string;
  proof?: string[];
}

export interface TrustStripBlock {
  component: "trust-strip";
  items: Array<{
    label: string;
    detail: string;
    approvalState?: ApprovalState;
  }>;
}

export interface PricingGridBlock {
  component: "pricing-grid";
  eyebrow: string;
  title: string;
  summary: string;
  plans: HostingPlan[];
}

export interface FeatureNarrativeBlock {
  component: "feature-narrative";
  eyebrow: string;
  title: string;
  summary: string;
  visual?: string;
  items: Array<{ title: string; body: string; icon?: string }>;
}

export interface InfrastructureBlock {
  component: "infrastructure";
  eyebrow: string;
  title: string;
  summary: string;
  locations: Array<{ city: string; region: string; detail: string }>;
  visual: string;
}

export interface TestimonialBlock {
  component: "testimonials";
  eyebrow: string;
  title: string;
  testimonials: Array<{
    quote: string;
    name: string;
    context: string;
    approvalState: ApprovalState;
  }>;
}

export interface PartnerBlock {
  component: "partners";
  eyebrow: string;
  title: string;
  partners: Array<{ name: string; logo: string; href?: string }>;
}

export interface AnswerBlock {
  component: "answers";
  eyebrow: string;
  title: string;
  answers: Array<{ question: string; answer: string }>;
}

export interface CtaBlock {
  component: "cta";
  eyebrow: string;
  title: string;
  summary: string;
  action: LinkField;
}

export interface RichTextBlock {
  component: "rich-text";
  title?: string;
  html: string;
}

export interface LegalBlock {
  component: "legal";
  updatedAt: string;
  sections: Array<{ id: string; title: string; html: string }>;
}

/* DESIGN.md 10.7 — hard numbers as engraved plates. Every value is copy the CMS
   supplied; nothing here is computed or inferred. */
export interface SpecPlatesBlock {
  component: "spec-plates";
  eyebrow: string;
  title: string;
  summary?: string;
  plates: Array<{ label: string; value: string }>;
}

/* DESIGN.md 10.10 — tabbed real terminal transcripts. */
export interface OperatorStripBlock {
  component: "operator-strip";
  eyebrow: string;
  title: string;
  summary: string;
  tabs: Array<{
    label: string;
    title: string;
    lines: Array<{ kind: "cmd" | "out" | "ok"; text: string }>;
  }>;
}

/* DESIGN.md 10.8 — a real support transcript. responseTime/resolution are only
   present when the ticket data actually carries them. */
export interface LiveAnswerBlock {
  component: "live-answer";
  eyebrow: string;
  title: string;
  summary?: string;
  transcript: Array<{
    role: "customer" | "agent";
    name?: string;
    text: string;
  }>;
  responseTime?: string;
  resolution?: string;
}

/* DESIGN.md 10.6 — comparison ledger. `source` names where the competitor
   figures came from; without a source the table is an unsupported claim. */
export interface LedgerTableBlock {
  component: "ledger-table";
  eyebrow: string;
  title: string;
  summary?: string;
  source: string;
  columns: string[];
  ownColumnIndex: number;
  rows: Array<{ label: string; cells: string[] }>;
}

/* DESIGN.md 10.9 */
export interface LaunchSequenceBlock {
  component: "launch-sequence";
  eyebrow: string;
  title: string;
  summary: string;
  steps: Array<{ title: string; body: string }>;
  action: LinkField;
}

/* DESIGN.md 10.11 — status history. Days come from the status provider; a block
   with no days renders nothing rather than an invented green streak. */
export interface UptimeStripBlock {
  component: "uptime-strip";
  title: string;
  summary: string;
  href: string;
  days: Array<{ date: string; state: "ok" | "warn" | "down" }>;
}

/* DESIGN.md 8.6 */
export interface ConsoleShowcaseBlock {
  component: "console-showcase";
  eyebrow: string;
  title: string;
  summary: string;
  screens: Array<{ label: string; caption: string }>;
  action?: LinkField;
}

/* DESIGN.md 11.1 — spec configurator. The axes carry only real, orderable steps
   and the selection is handed to checkout, which states the price. No price is
   derived here: with only preset machines on sale, a quote for a mixed selection
   would require a per-unit rate that does not exist (DESIGN.md 11). */
export interface ConfiguratorBlock {
  component: "configurator";
  eyebrow: string;
  title: string;
  summary: string;
  axes: Array<{
    id: string;
    label: string;
    unit: string;
    steps: number[];
    default: number;
  }>;
  action: LinkField;
}

/* DESIGN.md 12.16 */
export interface ContactFormBlock {
  component: "contact-form";
  eyebrow: string;
  title: string;
  summary: string;
  needs: string[];
  action: LinkField;
  responseTime?: string;
}

export type PageBlock =
  | HeroBlock
  | TrustStripBlock
  | PricingGridBlock
  | FeatureNarrativeBlock
  | InfrastructureBlock
  | TestimonialBlock
  | PartnerBlock
  | AnswerBlock
  | CtaBlock
  | RichTextBlock
  | LegalBlock
  | SpecPlatesBlock
  | OperatorStripBlock
  | LiveAnswerBlock
  | LedgerTableBlock
  | LaunchSequenceBlock
  | UptimeStripBlock
  | ConsoleShowcaseBlock
  | ConfiguratorBlock
  | ContactFormBlock;

export interface SitePage {
  route: string;
  family:
    "core" | "shared" | "vps" | "wordpress" | "dedicated" | "company" | "legal";
  seo: SeoFields;
  breadcrumbs: Array<{ label: string; href: string }>;
  blocks: PageBlock[];
  sourceUrl: string;
  approvalState: ApprovalState;
}

export interface NavigationGroup {
  label: string;
  items: LinkField[];
}

export interface SiteSettings {
  organizationName: string;
  siteUrl: string;
  whmcsUrl: string;
  logoDark: string;
  logoLight: string;
  announcement: { message: string; action?: LinkField } | null;
  marquee?: string[];
  navigation: NavigationGroup[];
  footerGroups: NavigationGroup[];
  support: LinkField[];
  socials: LinkField[];
  defaultSeo: Omit<SeoFields, "canonicalPath" | "updatedAt">;
  crawlerPolicy: {
    allowOaiSearchBot: boolean;
    allowGptBot: boolean;
  };
}
