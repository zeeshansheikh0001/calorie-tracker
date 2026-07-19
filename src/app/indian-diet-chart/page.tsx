import { redirect } from "next/navigation";

/** Legacy route — keep for bookmarks/SEO. */
export default function IndianDietChartRedirectPage() {
  redirect("/diet-chart");
}
