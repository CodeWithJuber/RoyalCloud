import { z } from "zod";

const linkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  external: z.boolean().optional(),
});

const approvalSchema = z.enum(["approved", "needs-review"]);
const priceSchema = z.object({
  amount: z.number().nonnegative().nullable(),
  currency: z.enum(["INR", "USD"]),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
});

/* A term must carry its renewal and its billed total, or it is not a term.
   This is the Honest Ledger (DESIGN.md 10.5) enforced at the trust boundary: the
   CMS cannot publish a price whose renewal is unstated. */
const planTermSchema = z.object({
  months: z.number().int().positive(),
  monthly: z.array(priceSchema).min(1),
  renewal: z.array(priceSchema).min(1),
  billedTotal: z.array(priceSchema).min(1),
});

const planTelemetrySchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  fill: z.number().min(0).max(1),
});

const planSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  audience: z.string().min(1),
  billingPeriod: z.enum(["month", "year"]),
  introductory: z.array(priceSchema).min(2),
  renewal: z.array(priceSchema).min(2),
  terms: z.array(planTermSchema).min(1).optional(),
  telemetry: z.array(planTelemetrySchema).optional(),
  features: z.array(z.string().min(1)).min(1),
  checkoutUrl: z.url(),
  featured: z.boolean().optional(),
  approvalState: approvalSchema,
});

const heroSchema = z.object({
  component: z.literal("hero"),
  eyebrow: z.string(),
  title: z.string().min(1),
  summary: z.string().min(1),
  primaryAction: linkSchema,
  secondaryAction: linkSchema.optional(),
  visual: z.string().optional(),
  proof: z.array(z.string()).optional(),
});

const trustStripSchema = z.object({
  component: z.literal("trust-strip"),
  items: z
    .array(
      z.object({
        label: z.string().min(1),
        detail: z.string().min(1),
        approvalState: approvalSchema.optional(),
      }),
    )
    .min(1),
});

const pricingGridSchema = z.object({
  component: z.literal("pricing-grid"),
  eyebrow: z.string(),
  title: z.string().min(1),
  summary: z.string(),
  plans: z.array(planSchema).min(1),
});

const featureNarrativeSchema = z.object({
  component: z.literal("feature-narrative"),
  eyebrow: z.string(),
  title: z.string().min(1),
  summary: z.string(),
  visual: z.string().optional(),
  items: z
    .array(
      z.object({
        title: z.string().min(1),
        body: z.string().min(1),
        icon: z.string().optional(),
      }),
    )
    .min(1),
});

const infrastructureSchema = z.object({
  component: z.literal("infrastructure"),
  eyebrow: z.string(),
  title: z.string().min(1),
  summary: z.string(),
  locations: z.array(
    z.object({
      city: z.string(),
      region: z.string(),
      detail: z.string(),
    }),
  ),
  visual: z.string().min(1),
});

const testimonialsSchema = z.object({
  component: z.literal("testimonials"),
  eyebrow: z.string(),
  title: z.string(),
  testimonials: z.array(
    z.object({
      quote: z.string(),
      name: z.string(),
      context: z.string(),
      approvalState: approvalSchema,
    }),
  ),
});

const partnersSchema = z.object({
  component: z.literal("partners"),
  eyebrow: z.string(),
  title: z.string(),
  partners: z.array(
    z.object({
      name: z.string(),
      logo: z.string(),
      href: z.string().optional(),
    }),
  ),
});

const answersSchema = z.object({
  component: z.literal("answers"),
  eyebrow: z.string(),
  title: z.string(),
  answers: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      }),
    )
    .min(1),
});

const ctaSchema = z.object({
  component: z.literal("cta"),
  eyebrow: z.string(),
  title: z.string(),
  summary: z.string(),
  action: linkSchema,
});

const richTextSchema = z.object({
  component: z.literal("rich-text"),
  title: z.string().optional(),
  html: z.string(),
});

const legalSchema = z.object({
  component: z.literal("legal"),
  updatedAt: z.iso.date(),
  sections: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      html: z.string(),
    }),
  ),
});

const specPlatesSchema = z.object({
  component: z.literal("spec-plates"),
  eyebrow: z.string(),
  title: z.string().min(1),
  summary: z.string().optional(),
  plates: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
      }),
    )
    .min(1),
});

const operatorStripSchema = z.object({
  component: z.literal("operator-strip"),
  eyebrow: z.string(),
  title: z.string().min(1),
  summary: z.string(),
  tabs: z
    .array(
      z.object({
        label: z.string().min(1),
        title: z.string().min(1),
        lines: z
          .array(
            z.object({
              kind: z.enum(["cmd", "out", "ok"]),
              text: z.string().min(1),
            }),
          )
          .min(1),
      }),
    )
    .min(1),
});

const liveAnswerSchema = z.object({
  component: z.literal("live-answer"),
  eyebrow: z.string(),
  title: z.string().min(1),
  summary: z.string().optional(),
  transcript: z
    .array(
      z.object({
        role: z.enum(["customer", "agent"]),
        name: z.string().min(1).optional(),
        text: z.string().min(1),
      }),
    )
    .min(1),
  responseTime: z.string().min(1).optional(),
  resolution: z.string().min(1).optional(),
});

/* Every row must fill every column and ownColumnIndex must address a real
   column — a ragged ledger would silently misattribute a competitor's number. */
const ledgerTableSchema = z
  .object({
    component: z.literal("ledger-table"),
    eyebrow: z.string(),
    title: z.string().min(1),
    summary: z.string().optional(),
    source: z.string().min(1),
    columns: z.array(z.string().min(1)).min(2),
    ownColumnIndex: z.number().int().nonnegative(),
    rows: z
      .array(
        z.object({
          label: z.string().min(1),
          cells: z.array(z.string().min(1)).min(1),
        }),
      )
      .min(1),
  })
  .refine((block) => block.ownColumnIndex < block.columns.length, {
    message: "ownColumnIndex must point at an existing column",
    path: ["ownColumnIndex"],
  })
  .refine(
    (block) =>
      block.rows.every((row) => row.cells.length === block.columns.length),
    { message: "every row must have one cell per column", path: ["rows"] },
  );

const launchSequenceSchema = z.object({
  component: z.literal("launch-sequence"),
  eyebrow: z.string(),
  title: z.string().min(1),
  summary: z.string(),
  steps: z
    .array(
      z.object({
        title: z.string().min(1),
        body: z.string().min(1),
      }),
    )
    .min(1),
  action: linkSchema,
});

const uptimeStripSchema = z.object({
  component: z.literal("uptime-strip"),
  title: z.string().min(1),
  summary: z.string(),
  href: z.string().min(1),
  days: z
    .array(
      z.object({
        date: z.iso.date(),
        state: z.enum(["ok", "warn", "down"]),
      }),
    )
    .min(1),
});

const consoleShowcaseSchema = z.object({
  component: z.literal("console-showcase"),
  eyebrow: z.string(),
  title: z.string().min(1),
  summary: z.string(),
  screens: z
    .array(
      z.object({
        label: z.string().min(1),
        caption: z.string().min(1),
      }),
    )
    .min(1),
  action: linkSchema.optional(),
});

/* An axis needs at least two steps or it is not a choice, and its default must
   be one of them — otherwise the configurator would quote an unorderable spec. */
const configuratorAxisSchema = z
  .object({
    id: z.string().min(1),
    label: z.string().min(1),
    unit: z.string(),
    steps: z.array(z.number().nonnegative()).min(2),
    default: z.number().nonnegative(),
  })
  .refine((axis) => axis.steps.includes(axis.default), {
    message: "default must be one of the axis steps",
    path: ["default"],
  });

const configuratorSchema = z.object({
  component: z.literal("configurator"),
  eyebrow: z.string(),
  title: z.string().min(1),
  summary: z.string(),
  axes: z.array(configuratorAxisSchema).min(1),
  /* No basePrice: the configurator states no money. See ConfiguratorBlock. */
  action: linkSchema,
});

const contactFormSchema = z.object({
  component: z.literal("contact-form"),
  eyebrow: z.string(),
  title: z.string().min(1),
  summary: z.string(),
  needs: z.array(z.string().min(1)).min(1),
  action: linkSchema,
  responseTime: z.string().min(1).optional(),
});

export const pageBlockSchema = z.discriminatedUnion("component", [
  heroSchema,
  trustStripSchema,
  pricingGridSchema,
  featureNarrativeSchema,
  infrastructureSchema,
  testimonialsSchema,
  partnersSchema,
  answersSchema,
  ctaSchema,
  richTextSchema,
  legalSchema,
  specPlatesSchema,
  operatorStripSchema,
  liveAnswerSchema,
  ledgerTableSchema,
  launchSequenceSchema,
  uptimeStripSchema,
  consoleShowcaseSchema,
  configuratorSchema,
  contactFormSchema,
]);

export const sitePageSchema = z.object({
  route: z.string().startsWith("/"),
  family: z.enum([
    "core",
    "shared",
    "vps",
    "wordpress",
    "dedicated",
    "company",
    "legal",
  ]),
  seo: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    canonicalPath: z.string().startsWith("/"),
    image: z.string().min(1),
    noindex: z.boolean().optional(),
    updatedAt: z.iso.date(),
  }),
  breadcrumbs: z.array(z.object({ label: z.string(), href: z.string() })),
  blocks: z.array(pageBlockSchema).min(1),
  sourceUrl: z.url(),
  approvalState: approvalSchema,
});
