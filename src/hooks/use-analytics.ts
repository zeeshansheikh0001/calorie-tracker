"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function usePageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && window.gtag) {
      // Construct the full URL including search parameters
      let url = pathname;
      if (searchParams?.toString()) {
        url += `?${searchParams.toString()}`;
      }

      // Send page view to Google Analytics
      window.gtag("config", process.env.NEXT_PUBLIC_GA_ID || "", {
        page_path: url,
      });
    }
  }, [pathname, searchParams]);
}

// Extend the Window interface to include gtag function
declare global {
  interface Window {
    gtag: (
      command: string,
      target: string,
      params?: Record<string, any> | undefined
    ) => void;
    dataLayer: any[];
  }
}

// Function to track custom events
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
} 