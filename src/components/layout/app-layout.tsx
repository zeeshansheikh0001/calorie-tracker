"use client";

import { useEffect, useState, type PropsWithChildren } from "react";
import BottomNavigationBar from "./bottom-navigation";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { needsOnboarding } from "@/lib/onboarding";

export function AppLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if we need to redirect to onboarding
    const shouldRedirect = needsOnboarding();
    
    // Don't redirect if we're already on the onboarding page
    if (shouldRedirect && pathname !== "/onboarding") {
      router.push("/onboarding");
    } else {
      setIsLoading(false);
    }
  }, [pathname, router]);

  // Don't show the bottom nav if on onboarding
  const showBottomNav = pathname !== "/onboarding";

  const pageVariants = {
    initial: {
      opacity: 0,
    },
    in: {
      opacity: 1,
    },
    out: {
      opacity: 0,
    },
  };

  const pageTransition = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.3,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <main className={`flex-1 bg-background ${showBottomNav ? 'pb-20' : ''} overflow-hidden`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname} 
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      {showBottomNav && <BottomNavigationBar />}
    </>
  );
}
