import type { Metadata } from "next";
import { DietChartScreen } from "@/features/diet/components/diet-chart-screen";
import { SITE_NAME, absoluteUrl } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: `Indian Diet Chart | ${SITE_NAME}`,
  description:
    "Browse practical Indian diet chart ideas and meal structure tips inside Calorie Tracker AI.",
  alternates: {
    canonical: absoluteUrl("/diet-chart"),
  },
};

export default function DietChartPage() {
  return <DietChartScreen />;
}
