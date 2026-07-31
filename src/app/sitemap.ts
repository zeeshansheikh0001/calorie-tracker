import type { MetadataRoute } from "next";
import { blogData } from "@/data/blog-content";
import { SITE_URL } from "@/lib/seo/site";

/** Indexable marketing routes only — app/private screens stay out. */
const marketingRoutes: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/welcome", changeFrequency: "monthly", priority: 0.6 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.9 },
  { path: "/diet-chart", changeFrequency: "monthly", priority: 0.7 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = marketingRoutes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: new Date("2026-08-01"),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const posts = blogData.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.publishDate
      ? new Date(post.publishDate)
      : new Date("2026-08-01"),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...routes, ...posts];
}
