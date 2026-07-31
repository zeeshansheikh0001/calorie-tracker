import type { Metadata } from "next";
import { appScreenMetadata } from "@/lib/seo/no-index";

export const metadata: Metadata = appScreenMetadata("AI coach");

export default function AiFeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
