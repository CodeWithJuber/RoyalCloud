import type { SeoFields } from "@/types/content";

export function getNotFoundSeo(pathname: string): SeoFields {
  return {
    title: "Page not found | Royal Clouds",
    description: "The requested Royal Clouds page could not be found.",
    canonicalPath: pathname,
    image: "/legacy-assets/assets/img/og/main.png",
    noindex: true,
    updatedAt: "2026-07-12"
  };
}
