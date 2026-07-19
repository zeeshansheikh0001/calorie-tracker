import type { Metadata } from "next";
import { DashboardScreen } from "@/features/dashboard/components/dashboard-screen";

export const metadata: Metadata = {
  title: "Dashboard | Calorie Tracker",
  description:
    "Track today's calories, macros, and meals with AI-assisted logging.",
  alternates: {
    canonical: "https://calorietracker.in/",
  },
};

export default function HomePage() {
  return <DashboardScreen />;
}
