import type { Metadata } from "next";
import { appScreenMetadata } from "@/lib/seo/no-index";

export const metadata: Metadata = appScreenMetadata("Reminders");

export default function RemindersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
