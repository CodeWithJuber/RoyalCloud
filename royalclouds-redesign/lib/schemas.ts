import { z } from "zod";

export const featureSchema = z.object({
  title: z.string().min(1),
  text: z.string().min(1),
  icon: z.string().min(1)
});

export const planSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/),
  period: z.string().min(1),
  summary: z.string().min(1),
  popular: z.boolean(),
  ctaUrl: z.string().url(),
  features: z.array(z.string().min(1)).min(3),
  accent: z.enum(["blue", "mint", "violet", "sun"])
});

export const testimonialSchema = z.object({
  name: z.string().min(1),
  company: z.string().min(1),
  quote: z.string().min(1)
});

export const siteContentSchema = z.object({
  portalBase: z.string().url(),
  contactEmail: z.string().email(),
  trustBadges: z.array(z.string().min(1)).min(1),
  plans: z.array(planSchema).min(3),
  features: z.array(featureSchema).min(3),
  testimonials: z.array(testimonialSchema).min(1)
});

export const domainSearchSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter at least two characters")
    .max(63, "Domain labels are limited to 63 characters")
    .regex(/^[a-zA-Z0-9-]+$/, "Use letters, numbers, or hyphens only")
    .refine((value) => !value.startsWith("-") && !value.endsWith("-"), "Hyphens cannot be first or last"),
  tld: z.enum([".com", ".net", ".org", ".info"])
});

export type HostingPlan = z.infer<typeof planSchema>;
export type SiteContent = z.infer<typeof siteContentSchema>;
export type DomainSearch = z.infer<typeof domainSearchSchema>;
