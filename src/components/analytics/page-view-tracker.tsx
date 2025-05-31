"use client";

import { usePageView } from "@/hooks/use-analytics";

export function PageViewTracker() {
  // This hook will track page views
  usePageView();
  
  // This component doesn't render anything
  return null;
} 