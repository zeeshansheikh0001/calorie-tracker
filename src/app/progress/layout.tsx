import type { Metadata } from "next";
import { appScreenMetadata } from "@/lib/seo/no-index";

export const metadata: Metadata = appScreenMetadata("Progress");

export default function ProgressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
