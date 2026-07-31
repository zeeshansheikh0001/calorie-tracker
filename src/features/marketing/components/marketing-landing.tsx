import Link from "next/link";
import { ArrowRight, Camera, Sparkles, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_NAME, SITE_SHORT_NAME, SITE_TAGLINE } from "@/lib/seo/site";

const features = [
  {
    icon: Camera,
    title: "Scan or describe meals",
    body: "Photo, barcode, or voice — AI estimates calories and macros in seconds.",
  },
  {
    icon: Utensils,
    title: "Built for Indian plates",
    body: "Home cooking, thalis, and street food — logged without fighting your cuisine.",
  },
  {
    icon: Sparkles,
    title: "Calm daily coaching",
    body: "See progress, hydration, and gentle insights without noisy dashboards.",
  },
] as const;

export function MarketingLanding() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-10 sm:px-6">
      <header className="mb-12 text-center">
        <p className="font-display text-sm font-medium tracking-[0.08em] text-primary">
          {SITE_SHORT_NAME}
        </p>
        <h1 className="font-display mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
          {SITE_NAME}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground sm:text-lg">
          {SITE_TAGLINE}. An AI nutrition companion for calories, macros, and
          everyday Indian meals.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 rounded-2xl px-8">
            <Link href="/onboarding">
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 rounded-2xl px-8"
          >
            <Link href="/dashboard">Open app</Link>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Free to use · Works in your browser · No app store required
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Features">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="rounded-[1.5rem] border border-border/70 bg-card/80 p-5 shadow-[var(--shadow-sm)]"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-sm font-semibold tracking-tight">
                {feature.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {feature.body}
              </p>
            </div>
          );
        })}
      </section>

      <section className="mt-12 rounded-[1.75rem] border border-border/70 bg-card/80 p-6 text-center shadow-[var(--shadow-md)] sm:p-8">
        <h2 className="font-display text-2xl font-medium tracking-tight">
          Learn while you track
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Practical guides on calorie deficits, vegetarian macros, and Indian
          superfoods.
        </p>
        <Button asChild variant="outline" className="mt-5 rounded-2xl">
          <Link href="/blog">
            Read the blog
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>

      <footer className="mt-12 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
        <Link href="/about" className="hover:text-foreground">
          About
        </Link>
        <Link href="/privacy" className="hover:text-foreground">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-foreground">
          Terms
        </Link>
        <Link href="/diet-chart" className="hover:text-foreground">
          Diet chart
        </Link>
      </footer>
    </div>
  );
}
