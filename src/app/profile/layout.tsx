import type { Metadata } from "next";
import { appScreenMetadata } from "@/lib/seo/no-index";

export const metadata: Metadata = appScreenMetadata("Profile");

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
