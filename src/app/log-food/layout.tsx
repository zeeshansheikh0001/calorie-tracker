import type { Metadata } from "next";
import { appScreenMetadata } from "@/lib/seo/no-index";

export const metadata: Metadata = appScreenMetadata("Log food");

export default function LogFoodLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
