import type { Metadata } from "next";
import { noIndexRobots } from "@/lib/seo/site";

/** Shared metadata for private app screens. */
export const appScreenMetadata = (title: string): Metadata => ({
  title,
  robots: noIndexRobots,
});
