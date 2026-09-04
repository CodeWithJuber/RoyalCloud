/**
 * Content pipeline: markdown frontmatter pages under content/ are the source
 * of truth (edited by Decap CMS). Same section vocabulary as the legacy site —
 * src/content.config.ts's sectionSchema, ported 1:1 so old content stays valid.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { load as loadYaml } from "js-yaml";
import { z } from "zod";

const ctaSchema = z.object({
  text: z.string(),
  href: z.string(),
  external: z.boolean().optional(),
});

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
  href: z.string().optional(),
});

export const sectionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("hero"),
    ...base,
    variant: z.enum(["gradient", "product", "simple"]).optional(),
    offer: z.string().optional(),
    image: z.string().optional(),
    art: z.string().optional(),
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
    featured: z.array(z.string()).optional(),
  }),
  z.object({
    type: z.literal("features"),
    ...base,
    columns: z.number().optional(),
    variant: z.enum(["cards", "tiles"]).optional(),
    items: z.array(iconItemSchema),
  }),
  z.object({
    type: z.literal("products"),
    ...base,
    items: z.array(
      iconItemSchema.extend({
        price: z.string().optional(),
        href: z.string(),
      }),
    ),
  }),
  z.object({
    type: z.literal("content"),
    ...base,
    image: z.string().optional(),
    reverse: z.boolean().optional(),
    layout: z.enum(["chips", "list"]).optional(),
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
    type: z.literal("planfinder"),
    ...base,
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
  z.object({
    type: z.literal("osstrip"),
    ...base,
    items: z.array(
      z.object({
        name: z.string(),
        color: z.string().optional(),
        active: z.boolean().optional(),
      }),
    ),
  }),
  z.object({
    type: z.literal("storycards"),
    ...base,
    items: z.array(
      z.object({
        tag: z.string(),
        metric: z.string(),
        metricLabel: z.string(),
        quote: z.string(),
        name: z.string(),
        site: z.string().optional(),
      }),
    ),
  }),
  z.object({
    type: z.literal("benchmark"),
    ...base,
    note: z.string().optional(),
    scale: z.enum(["lower", "higher"]).optional(),
    items: z.array(
      z.object({
        label: z.string(),
        value: z.number(),
        display: z.string(),
        highlight: z.boolean().optional(),
      }),
    ),
  }),
  z.object({
    type: z.literal("race"),
    ...base,
    note: z.string().optional(),
    scale: z.enum(["lower", "higher"]).optional(),
    items: z.array(
      z.object({
        label: z.string(),
        value: z.number(),
        display: z.string(),
        highlight: z.boolean().optional(),
      }),
    ),
  }),
  z.object({
    type: z.literal("security"),
    ...base,
    layers: z.array(z.object({ title: z.string(), text: z.string() })),
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
  }),
  z.object({
    type: z.literal("mapband"),
    ...base,
    note: z.string().optional(),
    pins: z
      .array(
        z.object({
          label: z.string(),
          x: z.number(),
          y: z.number(),
          live: z.boolean().optional(),
        }),
      )
      .optional(),
  }),
  z.object({
    type: z.literal("showcase"),
    ...base,
    tabs: z
      .array(
        z.object({
          label: z.string(),
          panel: z.enum(["files", "ssl", "backups", "stats"]).optional(),
          text: z.string().optional(),
          /* When set, the tab renders the rich product panel for this plan
             deck (art + real starting price + features + checkout CTA). */
          plan: z.string().optional(),
        }),
      )
      .optional(),
  }),
]);

export type ContentSection = z.infer<typeof sectionSchema>;

const pageMetadataSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    ignoreTitleTemplate: z.boolean().optional(),
    canonical: z.string().optional(),
    noindex: z.boolean().optional(),
  })
  .optional();

export const pageSchema = z.object({
  title: z.string(),
  metadata: pageMetadataSchema,
  breadcrumb: z
    .array(z.object({ text: z.string(), href: z.string() }))
    .optional(),
  sections: z.array(sectionSchema).default([]),
});

export interface PageContent {
  slug: string;
  route: string;
  title: string;
  metadata: z.infer<typeof pageMetadataSchema>;
  breadcrumb: { text: string; href: string }[];
  sections: ContentSection[];
  /** Raw markdown body below the frontmatter (legal pages use it). */
  body: string;
}

function splitFrontmatter(raw: string): { frontmatter: string; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  return { frontmatter: match?.[1] ?? "", body: match?.[2] ?? "" };
}

export function loadPage(slug: string): PageContent | null {
  for (const dir of ["pages", "landing"]) {
    const file = join(process.cwd(), "content", dir, `${slug}.md`);
    try {
      const raw = readFileSync(file, "utf8");
      const { frontmatter, body } = splitFrontmatter(raw);
      const parsed = pageSchema.safeParse(loadYaml(frontmatter));
      if (!parsed.success) {
        throw new Error(
          `content/${dir}/${slug}.md: invalid frontmatter — ${parsed.error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; ")}`,
        );
      }
      return {
        slug,
        route: slug === "index" ? "/" : `/${slug}`,
        title: parsed.data.title,
        metadata: parsed.data.metadata,
        breadcrumb: parsed.data.breadcrumb ?? [],
        sections: parsed.data.sections,
        body: body.trim(),
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") continue;
      throw error;
    }
  }
  return null;
}
