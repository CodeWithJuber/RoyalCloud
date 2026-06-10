// Registry of bundled photos/illustrations that CMS editors can reference by
// keyword in a section's `image` field. Anything else is treated as a path
// under /public (e.g. an /assets/uploads/... file from the CMS media library).
import type { ImageMetadata } from 'astro';
import hero from '~/assets/images/photos/hero.jpg';
import datacenter from '~/assets/images/photos/datacenter.jpg';
import support from '~/assets/images/photos/support.jpg';
import working from '~/assets/images/photos/working.jpg';
import mascot from '~/assets/images/brand/mascot.png';

const REGISTRY: Record<string, ImageMetadata> = { hero, datacenter, support, working, mascot };

export function resolveSectionImage(ref?: string): ImageMetadata | string | undefined {
  if (!ref) return undefined;
  return REGISTRY[ref] ?? ref;
}
