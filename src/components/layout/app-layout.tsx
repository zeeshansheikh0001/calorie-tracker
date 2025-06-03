"use client";

import { useEffect, useState, type PropsWithChildren } from "react";
import BottomNavigationBar from "./bottom-navigation";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { needsOnboarding } from "@/lib/onboarding";
import Image from "next/image";

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Outer ring - stylized as a plate */}
          <motion.div 
            className="absolute w-full h-full rounded-full border-4 border-red-500/20"
            style={{ 
              background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(239,68,68,0.05) 100%)"
            }}
            animate={{ rotate: 360, scale: [1, 1.03, 1] }}
            transition={{ 
              rotate: { duration: 15, repeat: Infinity, ease: "linear" },
              scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
          />
          
          {/* Middle calorie ring */}
          <motion.div 
            className="absolute w-[85%] h-[85%] rounded-full border-2 border-dashed border-orange-400/30"
            animate={{ rotate: -360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Inner nutrition ring */}
          <motion.div 
            className="absolute w-[70%] h-[70%] rounded-full border border-red-500/30"
            style={{
              background: "radial-gradient(circle, rgba(239,68,68,0.05) 0%, rgba(0,0,0,0) 70%)"
            }}
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ 
              rotate: { duration: 8, repeat: Infinity, ease: "linear" },
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
          />
          
          {/* Small decorative dots around the main logo */}
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const radius = 45; // Slightly closer to center
            
            return (
              <motion.div
                key={`dot-${i}`}
                className="absolute w-1.5 h-1.5 rounded-full bg-red-500/70"
                style={{
                  x: radius * Math.cos(angle),
                  y: radius * Math.sin(angle),
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.25,
                  ease: "easeInOut"
                }}
              />
            );
          })}
          
          {/* Animated orbit particles */}
          {[...Array(12)].map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const radius = 70; // Further out for the particles
            const size = 3 + Math.random() * 5;
            const duration = 1.5 + Math.random() * 1.5;
            
            return (
              <motion.div
                key={`particle-${i}`}
                className="absolute rounded-full"
                style={{
                  width: size,
                  height: size,
                  x: radius * Math.cos(angle),
                  y: radius * Math.sin(angle),
                  backgroundColor: i % 3 === 0 
                    ? 'rgb(239, 68, 68)' // red-500
                    : i % 3 === 1 
                      ? 'rgb(249, 115, 22)' // orange-500
                      : 'rgb(250, 204, 21)' // yellow-400
                }}
                animate={{
                  x: [
                    radius * Math.cos(angle),
                    radius * Math.cos(angle + Math.PI),
                    radius * Math.cos(angle + Math.PI * 2),
                  ],
                  y: [
                    radius * Math.sin(angle),
                    radius * Math.sin(angle + Math.PI),
                    radius * Math.sin(angle + Math.PI * 2),
                  ],
                  opacity: [0.4, 1, 0.4],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.1
                }}
              />
            );
          })}
          
          {/* Glowing background and logo */}
          <div className="relative">
            <motion.div
              className="absolute -inset-8 rounded-full opacity-50"
              animate={{ 
                boxShadow: [
                  "0 0 15px 5px rgba(239, 68, 68, 0.2)",
                  "0 0 25px 10px rgba(239, 68, 68, 0.3)",
                  "0 0 15px 5px rgba(239, 68, 68, 0.2)"
                ] 
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 3, 0, -3, 0]
              }}
              transition={{ 
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" }
              }}
              className="relative w-32 h-32"
            >
              {/* Radial gradient background for the image */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500/10 to-orange-500/5 animate-pulse"></div>
              
              <Image 
                src="/images/calorie-logo.png" 
                alt="Loading" 
                width={128} 
                height={128}
                className="object-contain relative z-10"
              />
            </motion.div>
          </div>
        </div>
        
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.p 
            className="text-sm font-medium text-foreground"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading your nutrition data
          </motion.p>
          <motion.div 
            className="flex justify-center mt-2 space-x-1.5"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-red-500"
                animate={{ 
                  y: [-1, -5, -1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{ 
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </motion.div>
        </motion.div>
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
