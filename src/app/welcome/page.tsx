import { redirect } from "next/navigation";

/** Legacy entry — marketing home now lives at `/`. */
export default function WelcomePage() {
  redirect("/");
}
