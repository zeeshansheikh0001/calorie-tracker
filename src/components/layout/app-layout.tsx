"use client";

import { useEffect, useState, type PropsWithChildren } from "react";
import BottomNavigationBar from "./bottom-navigation";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { needsOnboarding } from "@/lib/onboarding";
import Image from "next/image";
// Import icons for health and calories
import { 
  Apple, 
  Salad, 
  Weight, 
  Dumbbell, 
  Carrot, 
  Heart, 
  Banana,
  Egg,
  Fish,
  Wheat,
  Droplets
} from "lucide-react";

// Health and calorie icons component
const HealthIcon = ({ icon: Icon, x, y, delay, size = 16 }: { 
  icon: any; 
  x: number; 
  y: number; 
  delay: number;
  size?: number;
}) => {
  return (
    <motion.div
      className="absolute text-red-500/80"
      style={{ x, y }}
      animate={{
        x: [x, x + 15, x - 10, x],
        y: [y, y - 10, y + 5, y],
        opacity: [0.4, 0.9, 0.4],
        scale: [0.9, 1.1, 0.9],
        rotate: [0, 10, -10, 0]
      }}
      transition={{
        duration: 5,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <Icon size={size} className="drop-shadow-md" />
    </motion.div>
  );
};

export function AppLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if we need to redirect to onboarding
    const shouldRedirect = needsOnboarding();
    
    // Set a timeout to ensure loading animation shows for exactly 10 seconds
    const loadingTimer = setTimeout(() => {
      // Don't redirect if we're already on the onboarding page
      if (shouldRedirect && pathname !== "/onboarding") {
        router.push("/onboarding");
      } else {
        setIsLoading(false);
      }
    }, 3000); // 3 seconds
    
    // Clean up the timer if component unmounts
    return () => clearTimeout(loadingTimer);
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-background/95">
        <div className="relative w-56 h-56 flex items-center justify-center">
          {/* Modern backdrop - removing blur effect */}
          <motion.div 
            className="absolute inset-0 rounded-full bg-red-500/3"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Outer ring - stylized as a plate with glass effect - removing blur and reducing opacity */}
          <motion.div 
            className="absolute w-full h-full rounded-full border-2 border-red-500/20"
            style={{ 
              background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(239,68,68,0.03) 100%)",
              boxShadow: "0 8px 32px 0 rgba(239, 68, 68, 0.05)"
            }}
            animate={{ rotate: 360, scale: [1, 1.03, 1] }}
            transition={{ 
              rotate: { duration: 15, repeat: Infinity, ease: "linear" },
              scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
          />
          
          {/* Health and calorie related icons floating around */}
          <HealthIcon icon={Apple} x={-90} y={-20} delay={0} size={18} />
          <HealthIcon icon={Salad} x={85} y={-30} delay={0.5} size={20} />
          <HealthIcon icon={Weight} x={-75} y={60} delay={1} size={18} />
          <HealthIcon icon={Dumbbell} x={80} y={50} delay={1.5} size={20} />
          <HealthIcon icon={Carrot} x={0} y={-85} delay={2} size={18} />
          <HealthIcon icon={Heart} x={0} y={85} delay={2.5} size={20} />
          <HealthIcon icon={Banana} x={-50} y={-70} delay={3} size={16} />
          <HealthIcon icon={Egg} x={60} y={-65} delay={3.5} size={16} />
          <HealthIcon icon={Fish} x={-60} y={20} delay={4} size={18} />
          <HealthIcon icon={Wheat} x={50} y={70} delay={4.5} size={16} />
          <HealthIcon icon={Droplets} x={-20} y={-50} delay={5} size={18} />
          
          {/* Middle calorie ring with modern gradient - removing blur and reducing opacity */}
          <motion.div 
            className="absolute w-[85%] h-[85%] rounded-full"
            style={{
              background: "linear-gradient(90deg, rgba(239,68,68,0.03) 0%, rgba(249,115,22,0.02) 100%)",
              border: "1px dashed rgba(249,115,22,0.2)"
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Inner nutrition ring - removing glass morphism */}
          <motion.div 
            className="absolute w-[70%] h-[70%] rounded-full"
            style={{
              background: "linear-gradient(45deg, rgba(239,68,68,0.02) 0%, rgba(249,115,22,0.01) 100%)",
              border: "1px solid rgba(255,255,255,0.05)",
              boxShadow: "inset 0 0 15px rgba(239,68,68,0.05)"
            }}
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ 
              rotate: { duration: 8, repeat: Infinity, ease: "linear" },
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
          />
          
          {/* Small decorative dots - reducing glow */}
          {[...Array(12)].map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const radius = 45; // Slightly closer to center
            
            return (
              <motion.div
                key={`dot-${i}`}
                className="absolute w-1.5 h-1.5 rounded-full bg-gradient-to-r from-red-500/70 to-orange-400/70"
                style={{
                  x: radius * Math.cos(angle),
                  y: radius * Math.sin(angle),
                  boxShadow: "0 0 3px rgba(239,68,68,0.3)"
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.7, 0.3],
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
          
          {/* Animated orbit particles - reducing glow */}
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
                  background: i % 3 === 0 
                    ? 'linear-gradient(45deg, rgb(239, 68, 68, 0.7), rgb(249, 115, 22, 0.7))' // red to orange
                    : i % 3 === 1 
                      ? 'linear-gradient(45deg, rgb(249, 115, 22, 0.7), rgb(250, 204, 21, 0.7))' // orange to yellow
                      : 'linear-gradient(45deg, rgb(250, 204, 21, 0.7), rgb(239, 68, 68, 0.7))' // yellow to red
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
                  opacity: [0.3, 0.6, 0.3],
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
          
          {/* Logo container - removing glow effect */}
          <div className="relative flex items-center justify-center">
            <motion.div
              className="absolute -inset-10 rounded-full opacity-30"
              style={{
                background: "radial-gradient(circle, rgba(239,68,68,0.04) 0%, rgba(0,0,0,0) 70%)",
              }}
              animate={{ 
                boxShadow: [
                  "0 0 15px 5px rgba(239, 68, 68, 0.05)",
                  "0 0 25px 10px rgba(239, 68, 68, 0.08)",
                  "0 0 15px 5px rgba(239, 68, 68, 0.05)"
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
              className="relative w-32 h-32 flex items-center justify-center"
            >
              {/* Modern glass effect behind the logo - removing blur */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500/10 to-orange-500/5"></div>
              
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
          className="mt-10 text-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.p 
            className="text-xl font-semibold bg-gradient-to-r from-red-500 via-orange-400 to-red-500 bg-clip-text text-transparent"
            animate={{ 
              opacity: [0.8, 1, 0.8],
              scale: [1, 1.03, 1],
              backgroundPosition: ['0% center', '100% center', '0% center']
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut",
              backgroundPosition: { duration: 3, repeat: Infinity }
            }}
            style={{
              backgroundSize: '200% auto'
            }}
          >
            Preparing your nutrition journey...
          </motion.p>
          <motion.div 
            className="flex justify-center mt-3 space-x-2"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-gradient-to-br from-red-500 to-orange-400"
                style={{
                  boxShadow: '0 0 5px rgba(239,68,68,0.5)'
                }}
                animate={{ 
                  y: [-1, -6, -1],
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15
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
