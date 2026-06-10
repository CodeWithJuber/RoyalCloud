import { getCollection } from 'astro:content';

/**
 * Slugs that have a native page-builder content file (src/data/pages or
 * src/data/landing). The clone catch-all route excludes these so a captured
 * HTML page is served only until its native replacement exists.
 */
export async function migratedSlugs(): Promise<Set<string>> {
  const [pages, landing] = await Promise.all([getCollection('pages'), getCollection('landing')]);
  return new Set([...pages, ...landing].map((entry) => entry.id));
}
