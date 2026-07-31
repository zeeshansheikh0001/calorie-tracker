import { GA_MEASUREMENT_ID, isAnalyticsEnabled } from "@/lib/analytics/config";

type GtagArgs =
  | ["js", Date]
  | ["config", string, Record<string, unknown>?]
  | ["event", string, Record<string, unknown>?]
  | ["set", string | Record<string, unknown>, unknown?]
  | ["consent", "default" | "update", Record<string, unknown>];

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: GtagArgs | unknown[]) => void;
  }
}

function ensureDataLayer(): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    // Queue calls until the official gtag.js script loads.
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };
  }
}

function canTrack(): boolean {
  return isAnalyticsEnabled && typeof window !== "undefined";
}

/** Push through gtag (queues via dataLayer if script not ready yet). */
function gtag(...args: GtagArgs): void {
  if (!canTrack()) return;
  ensureDataLayer();
  window.gtag(...args);
}

let lastPageView: { url: string; at: number } | null = null;

/** SPA / App Router page view */
export function trackPageView(url: string): void {
  if (!canTrack()) return;

  // Dedupe React Strict Mode double-effects for the same path.
  const now = Date.now();
  if (
    lastPageView &&
    lastPageView.url === url &&
    now - lastPageView.at < 800
  ) {
    return;
  }
  lastPageView = { url, at: now };

  gtag("event", "page_view", {
    page_path: url,
    page_location: window.location.href,
    page_title: document.title,
    send_to: GA_MEASUREMENT_ID,
  });
}

/** Generic GA4 event */
export function trackEvent(
  name: string,
  params?: Record<string, unknown>
): void {
  if (!canTrack()) return;
  gtag("event", name, {
    send_to: GA_MEASUREMENT_ID,
    ...params,
  });
}

export type MealLogMethod = "describe" | "photo" | "barcode";
export type EstimateSource = "text" | "photo" | "barcode";
export type AiFeature = "schedule" | "summary";

/** Typed product analytics for Nourish */
export const analytics = {
  pageView: trackPageView,
  event: trackEvent,

  mealLogged: (method: MealLogMethod, extras?: { calories?: number }) =>
    trackEvent("meal_logged", {
      method,
      ...(typeof extras?.calories === "number"
        ? { value: Math.round(extras.calories), currency: "KCAL" }
        : {}),
    }),

  nutritionEstimated: (source: EstimateSource) =>
    trackEvent("nutrition_estimated", { source }),

  onboardingCompleted: (goal?: string) =>
    trackEvent("onboarding_completed", {
      fitness_goal: goal ?? "unknown",
    }),

  onboardingStepViewed: (step: number) =>
    trackEvent("onboarding_step", { step }),

  aiFeatureUsed: (feature: AiFeature) =>
    trackEvent("ai_feature_used", { feature }),

  voiceUsed: (status: "success" | "error") =>
    trackEvent("voice_input", { status }),

  goalsUpdated: () => trackEvent("goals_updated"),

  waterLogged: (ml: number) =>
    trackEvent("water_logged", { amount_ml: ml }),

  ctaClicked: (label: string, location?: string) =>
    trackEvent("cta_click", {
      cta_label: label,
      cta_location: location,
    }),
};
