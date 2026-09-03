import type { Metadata } from "next";
import { PageView } from "@/components/PageView";
import { loadPage } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

function loadOrThrow(slug: string) {
  const page = loadPage(slug);
  if (!page) throw new Error("Home content (content/pages/index.md) is missing.");
  return page;
}

export const metadata: Metadata = pageMetadata(loadOrThrow("index"));

export default function HomePage() {
  const page = loadOrThrow("index");
  return <PageView page={page} />;
}
