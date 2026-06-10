import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const metadataDefinition = () =>
  z
    .object({
      title: z.string().optional(),
      ignoreTitleTemplate: z.boolean().optional(),

      canonical: z.string().url().optional(),

      robots: z
        .object({
          index: z.boolean().optional(),
          follow: z.boolean().optional(),
        })
        .optional(),

      description: z.string().optional(),

      openGraph: z
        .object({
          url: z.string().optional(),
          siteName: z.string().optional(),
          images: z
            .array(
              z.object({
                url: z.string(),
                width: z.number().optional(),
                height: z.number().optional(),
              }),
            )
            .optional(),
          locale: z.string().optional(),
          type: z.string().optional(),
        })
        .optional(),

      twitter: z
        .object({
          handle: z.string().optional(),
          site: z.string().optional(),
          cardType: z.string().optional(),
        })
        .optional(),
    })
    .optional();

const postCollection = defineCollection({
  loader: glob({ pattern: ["*.md", "*.mdx"], base: "src/data/post" }),
  schema: z.object({
    publishDate: z.date().optional(),
    updateDate: z.date().optional(),
    draft: z.boolean().optional(),

    title: z.string(),
    excerpt: z.string().optional(),
    image: z.string().optional(),

    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),

    metadata: metadataDefinition(),
  }),
});

/* ------------------------------------------------------------------ */
/* Page-builder collections (pages + landing)                          */
/* ------------------------------------------------------------------ */

const ctaSchema = z.object({
  text: z.string(),
  href: z.string(),
  external: z.boolean().optional(),
});

// Shared header fields every section may carry.
const base = {
  id: z.string().optional(),
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
};

const iconItemSchema = z.object({
  icon: z.string().optional(),
  title: z.string().optional(),
  text: z.string().optional(),
});

export const sectionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("hero"),
    ...base,
    variant: z.enum(["gradient", "product", "simple"]).optional(),
    offer: z.string().optional(),
    image: z.string().optional(),
    primaryCta: ctaSchema.optional(),
    secondaryCta: ctaSchema.optional(),
    badges: z.array(z.string()).optional(),
  }),
  z.object({
    type: z.literal("trustbar"),
    items: z.array(z.object({ icon: z.string().optional(), text: z.string() })),
  }),
  z.object({
    type: z.literal("pricing"),
    ...base,
    plan: z.string(),
    showToggle: z.boolean().optional(),
    note: z.string().optional(),
  }),
  z.object({
    type: z.literal("features"),
    ...base,
    columns: z.number().optional(),
    items: z.array(iconItemSchema),
  }),
  z.object({
    type: z.literal("content"),
    ...base,
    image: z.string().optional(),
    reverse: z.boolean().optional(),
    body: z.string().optional(),
    items: z.array(iconItemSchema).optional(),
  }),
  z.object({
    type: z.literal("steps"),
    ...base,
    items: z.array(iconItemSchema),
  }),
  z.object({
    type: z.literal("stats"),
    ...base,
    items: z.array(z.object({ value: z.string(), label: z.string() })),
  }),
  z.object({
    type: z.literal("comparison"),
    ...base,
    plan: z.string().optional(),
    note: z.string().optional(),
  }),
  z.object({
    type: z.literal("testimonials"),
    ...base,
    source: z.enum(["global", "inline"]).optional(),
    limit: z.number().optional(),
    items: z
      .array(
        z.object({
          name: z.string(),
          site: z.string().optional(),
          rating: z.number().optional(),
          quote: z.string(),
        }),
      )
      .optional(),
  }),
  z.object({
    type: z.literal("faq"),
    ...base,
    source: z.enum(["global", "inline"]).optional(),
    jsonld: z.boolean().optional(),
    items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  }),
  z.object({
    type: z.literal("domainsearch"),
    ...base,
  }),
  z.object({
    type: z.literal("techlogos"),
    ...base,
    logos: z.array(z.string()).optional(),
  }),
  z.object({
    type: z.literal("cta"),
    ...base,
    primaryCta: ctaSchema.optional(),
    secondaryCta: ctaSchema.optional(),
  }),
]);

// Page metadata is looser than the blog one: canonical may be a relative
// path (resolved against site.url at render time) or empty from the CMS.
const pageMetadataSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    ignoreTitleTemplate: z.boolean().optional(),
    canonical: z.string().optional(),
    noindex: z.boolean().optional(),
  })
  .optional();

const pageSchema = z.object({
  title: z.string(),
  metadata: pageMetadataSchema,
  breadcrumb: z
    .array(z.object({ text: z.string(), href: z.string() }))
    .optional(),
  transparentHeader: z.boolean().optional(),
  redirect: z.string().optional(),
  sections: z.array(sectionSchema).default([]),
});

const pagesCollection = defineCollection({
  loader: glob({ pattern: "*.md", base: "src/data/pages" }),
  schema: pageSchema,
});

const landingCollection = defineCollection({
  loader: glob({ pattern: "*.md", base: "src/data/landing" }),
  schema: pageSchema,
});

const plansCollection = defineCollection({
  // generateId: ignore the legacy `slug` field inside the JSON — plan ids are
  // the filenames (shared, vps, wordpress, ...) referenced by pricing sections.
  loader: glob({
    pattern: "*.json",
    base: "src/data/plans",
    generateId: ({ entry }) => entry.replace(/\.json$/, ""),
  }),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string().optional(),
    icon: z.string().optional(),
    eyebrow: z.string().optional(),
    title: z.string(),
    subtitle: z.string().optional(),
    currency: z.string().optional(),
    billingNote: z.string().optional(),
    tiers: z.array(
      z.object({
        name: z.string(),
        price: z.string(),
        priceAnnual: z.string().optional(),
        period: z.string().optional(),
        popular: z.boolean().optional(),
        summary: z.string().optional(),
        cta: z.string(),
        ctaUrl: z.string(),
        features: z.array(z.string()),
      }),
    ),
    highlights: z.array(
      z.object({ icon: z.string(), title: z.string(), text: z.string() }),
    ),
  }),
});

export const collections = {
  post: postCollection,
  pages: pagesCollection,
  landing: landingCollection,
  plans: plansCollection,
};
