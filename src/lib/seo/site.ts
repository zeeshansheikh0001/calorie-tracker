/** Canonical site + brand constants for SEO/marketing. */
export const SITE_URL = "https://calorietracker.in";

/** Primary product brand (UI + metadata). */
export const SITE_NAME = "Calorie Tracker AI";

/** Short label for compact UI eyebrows / PWA short_name. */
export const SITE_SHORT_NAME = "Calorie AI";

export const SITE_TAGLINE = "Intelligent nutrition tracking";

export const SITE_DESCRIPTION =
  "Calorie Tracker AI is an AI-first nutrition companion for India. Track calories, macros, hydration, and meals — including Indian foods — with a calm, premium coaching experience.";

/**
 * Google Search Console HTML-tag verification content value.
 * Search Console → Settings → Ownership verification → HTML tag
 * Paste only the `content="..."` value (not the full meta tag).
 */
export const GOOGLE_SITE_VERIFICATION = "";

export const noIndexRobots = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
} as const;

export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
