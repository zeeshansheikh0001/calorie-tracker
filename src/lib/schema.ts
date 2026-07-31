/**
 * Schema.org JSON-LD for SEO.
 */

import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_SHORT_NAME,
  SITE_URL,
  absoluteUrl,
} from "@/lib/seo/site";

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  alternateName: [SITE_SHORT_NAME, "Calorie Tracker", "CalorieTracker.in"],
  url: SITE_URL,
  logo: absoluteUrl("/logo.png"),
  sameAs: [
    "https://facebook.com/calorietrackerindia",
    "https://twitter.com/calorietrackin",
    "https://instagram.com/calorietracker.in",
  ],
  address: {
    "@type": "PostalAddress",
    addressCountry: "IN",
    addressLocality: "Bangalore",
  },
  description: SITE_DESCRIPTION,
};

export const applicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  alternateName: SITE_SHORT_NAME,
  applicationCategory: "HealthApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
  },
  description: SITE_DESCRIPTION,
  inLanguage: "en-IN",
};

export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: `Does ${SITE_NAME} support Indian foods and recipes?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `Yes. ${SITE_NAME} is built for Indian foods — homemade recipes, restaurant meals, and street foods — with practical nutrition estimates.`,
      },
    },
    {
      "@type": "Question",
      name: "How accurate is calorie counting for Indian dishes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our AI estimates account for common Indian cooking methods and ingredients, then lets you adjust portions before logging.",
      },
    },
    {
      "@type": "Question",
      name: "Can I track festival foods and special occasion meals?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Describe or photograph festive meals and log them alongside everyday food so you can stay aware without rigid restriction.",
      },
    },
    {
      "@type": "Question",
      name: "Is there support for vegetarian and vegan Indian diets?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Log dals, paneer, millets, soy, and plant-forward plates, then track protein and macros against your goals.",
      },
    },
    {
      "@type": "Question",
      name: "Does the app work offline?",
      acceptedAnswer: {
        "@type": "Answer",
        text: `${SITE_NAME} keeps your daily log on-device so you can review and add meals even when connectivity is limited.`,
      },
    },
  ],
};

export function getArticleSchema(post: {
  title: string;
  excerpt: string;
  slug: string;
  imageUrl: string;
  publishDate?: string;
  authorName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: [post.imageUrl],
    datePublished: post.publishDate,
    dateModified: post.publishDate,
    author: {
      "@type": "Person",
      name: post.authorName || SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/logo.png"),
      },
    },
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
  };
}

export function getBreadcrumbSchema(
  items: { name: string; path: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
