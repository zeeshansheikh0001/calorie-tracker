import type { Metadata } from "next";
import { DashboardScreen } from "@/features/dashboard/components/dashboard-screen";
import { noIndexRobots } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your daily calories, macros, and meals.",
  robots: noIndexRobots,
  alternates: {
    canonical: "https://calorietracker.in/dashboard",
  },
};

export default function DashboardPage() {
  return <DashboardScreen />;
}
