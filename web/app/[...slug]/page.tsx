import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageView } from "@/components/PageView";
import { loadPage } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { CONTENT_ROUTES, isContentRoute } from "@/lib/routes";

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

function slugToName(slug: string[] | undefined): string {
  return slug && slug.length > 0 ? slug.join("/") : "index";
}

export function generateStaticParams() {
  return CONTENT_ROUTES.filter((route) => route !== "/").map((route) => ({
    slug: route.slice(1).split("/"),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const name = slugToName(slug);
  const page = loadPage(name);
  if (!page) return { title: "Page not found | Royal Clouds" };
  return pageMetadata(page);
}

export default async function ContentPage({ params }: PageProps) {
  const { slug } = await params;
  const route = slug && slug.length > 0 ? `/${slug.join("/")}` : "/";
  if (!isContentRoute(route)) notFound();

  const page = loadPage(slugToName(slug));
  if (!page) notFound();

  return <PageView page={page} />;
}
