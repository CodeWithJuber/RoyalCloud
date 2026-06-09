import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"blog">;

/** All non-draft posts, newest first. Drafts are hidden in production builds. */
export async function getPublishedPosts(): Promise<Post[]> {
  const isProd = import.meta.env.PROD;
  const posts = await getCollection("blog", ({ data }) => !(isProd && data.draft));
  return posts.sort(
    (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf(),
  );
}

/** Unique, sorted tag list across all published posts. */
export async function getAllTags(): Promise<string[]> {
  const posts = await getPublishedPosts();
  const tags = new Set<string>();
  posts.forEach((p) => p.data.tags.forEach((t) => tags.add(t)));
  return [...tags].sort((a, b) => a.localeCompare(b));
}

export function tagSlug(tag: string): string {
  return tag.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function readingTime(body: string | undefined): number {
  if (!body) return 1;
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
