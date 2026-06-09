import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Blog collection. Frontmatter fields mirror the on-page SEO controls Yoast
// exposes in WordPress (focus title, meta description, canonical, OG image,
// noindex, publish/update dates), all validated at build time.
const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      publishDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      author: z.string().default("Royal Clouds Team"),
      category: z.string().default("Hosting"),
      tags: z.array(z.string()).default([]),
      image: image().optional(),
      imageAlt: z.string().optional(),
      canonical: z.string().url().optional(),
      noindex: z.boolean().default(false),
      draft: z.boolean().default(false),
      featured: z.boolean().default(false),
    }),
});

export const collections = { blog };
