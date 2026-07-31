import type { Metadata } from "next";
import { appScreenMetadata } from "@/lib/seo/no-index";

export const metadata: Metadata = appScreenMetadata("Onboarding");

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
