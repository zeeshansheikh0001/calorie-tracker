import type { Metadata } from "next";
import { appScreenMetadata } from "@/lib/seo/no-index";

export const metadata: Metadata = appScreenMetadata("Goals");

export default function GoalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
