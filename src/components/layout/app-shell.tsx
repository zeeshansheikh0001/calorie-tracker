"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { profileService } from "@/services/profile/profile.service";
import { AppBottomNav } from "@/components/layout/app-bottom-nav";

const PUBLIC_PATHS = new Set([
  "/onboarding",
  "/welcome",
  "/about",
  "/privacy",
  "/terms",
  "/blog",
]);

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [ready, setReady] = useState(false);

  const isPublic =
    PUBLIC_PATHS.has(pathname) || pathname.startsWith("/blog/");

  const showNav =
    ready &&
    !pathname.startsWith("/onboarding") &&
    !pathname.startsWith("/log-food");

  useEffect(() => {
    setReady(true);
    if (isPublic) return;
    if (!profileService.hasCompletedOnboarding()) {
      router.replace("/onboarding");
    }
  }, [isPublic, pathname, router]);

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-background text-foreground">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[image:var(--hero-glow)]" />
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[var(--mesh-a)] blur-3xl" />
        <div className="absolute -right-16 top-48 h-64 w-64 rounded-full bg-[var(--mesh-b)] blur-3xl" />
        <div className="absolute bottom-32 left-1/3 h-56 w-56 rounded-full bg-[var(--mesh-c)] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,hsl(var(--background))_72%)]" />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={pathname}
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className={showNav ? "pb-32" : undefined}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      {showNav ? <AppBottomNav /> : null}
    </div>
  );
}
