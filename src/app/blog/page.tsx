import type { Metadata } from "next";
import { BlogIndex } from "@/features/blog/components/blog-index";
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: `Nutrition & Fitness Blog | ${SITE_NAME}`,
  description:
    "Expert India-focused nutrition guides — calorie deficits, vegetarian macros, regional superfoods, and practical fitness tips from Calorie Tracker AI.",
  alternates: {
    canonical: absoluteUrl("/blog"),
  },
  openGraph: {
    title: `Nutrition & Fitness Blog | ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
    url: absoluteUrl("/blog"),
    siteName: SITE_NAME,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Nutrition & Fitness Blog | ${SITE_NAME}`,
    images: ["/twitter-image.jpg"],
  },
};

export default function BlogPage() {
  return <BlogIndex />;
}
