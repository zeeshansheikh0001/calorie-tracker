import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/about", "/blog", "/welcome", "/privacy", "/terms", "/diet-chart"],
      disallow: [
        "/api/",
        "/dashboard",
        "/progress",
        "/goals",
        "/profile",
        "/profile/",
        "/log-food/",
        "/onboarding",
        "/reminders",
        "/ai-features",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
