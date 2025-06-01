"use client";

import { useState, useEffect, memo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Flame, 
  ArrowRight, 
  Check, 
  Sparkles, 
  BarChart3, 
  PieChart, 
  Target, 
  CalendarDays, 
  TrendingUp, 
  LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAdaptivePerformance } from "@/hooks/use-performance";

// Add this style tag to extract RGB values from the CSS variables
// which will be used for background gradients
const style = `
:root {
  --primary-rgb: 108, 99, 255; /* Default value that will be overridden by CSS variables */
}
`;

// Optimized background animation component
const OptimizedBackground = memo(() => {
  const { shouldUseComplexAnimations, particleCount } = useAdaptivePerformance();
  const [isClient, setIsClient] = useState(false);
  
  // Only initialize animations after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Static gradients instead of animated ones */}
      <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-tl from-primary/20 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-full blur-3xl" />
      
      {/* Reduced number of particles - only shown when client-side and enough performance */}
      {isClient && shouldUseComplexAnimations && (
        <div className="absolute w-full h-full">
          {[...Array(Math.min(5, particleCount))].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute rounded-full bg-primary/30 dark:bg-primary/20"
              style={{
                top: `${20 + (i * 15)}%`,
                left: `${10 + (i * 20)}%`,
                width: `${6 + i}px`,
                height: `${6 + i}px`,
                opacity: 0.3 + (i * 0.1),
              }}
              animate={{
                y: [0, 20 + (i * 5)],
                x: [0, 10 + (i * 3)],
              }}
              transition={{
                duration: 8 + i,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}
      
      {/* Just one ring instead of multiple */}
      {isClient && shouldUseComplexAnimations && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center overflow-hidden"
        >
          <motion.div
            className="absolute rounded-full border border-primary/10 dark:border-primary/5"
            style={{
              width: "50%",
              height: "50%",
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.05, 1],
            }}
            transition={{
              rotate: { 
                duration: 40, 
                repeat: Infinity, 
                ease: "linear",
              },
              scale: {
                duration: 20,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: "easeInOut",
              }
            }}
          />
        </motion.div>
      )}
    </div>
  );
});

OptimizedBackground.displayName = "OptimizedBackground";

export default function WelcomePage() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Load user profile
    const savedProfile = localStorage.getItem("userProfile");
    if (!savedProfile) {
      // Redirect to onboarding if no profile exists
      router.push("/onboarding");
      return;
    }

    try {
      const parsedProfile = JSON.parse(savedProfile);
      setProfile(parsedProfile);
      setIsLoading(false);
    } catch (error) {
      console.error("Error parsing profile:", error);
      toast({
        variant: "destructive",
        title: "Error loading profile",
        description: "There was an error loading your profile. Please try again.",
      });
      router.push("/onboarding");
    }
  }, [router, toast]);

  const handleContinue = () => {
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-primary/5 dark:from-background dark:via-background/95 dark:to-primary/10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center"
        >
          <motion.div
            animate={{ 
              rotate: 360
            }}
            transition={{
              rotate: { duration: 2, repeat: Infinity, ease: "linear" }
            }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-full bg-primary/30 blur-xl transform scale-125" />
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center relative shadow-lg shadow-primary/20">
              <Flame className="h-7 w-7" />
            </div>
          </motion.div>
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mt-4">
            Loading your dashboard...
          </h3>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen flex items-center justify-center relative bg-gradient-to-br from-background via-background/95 to-primary/5 dark:from-background dark:via-background/95 dark:to-primary/15 overflow-hidden px-4 py-8">
      {/* Optimized background animation */}
      <OptimizedBackground />
      
      <div className="relative z-10 max-w-6xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            {/* Logo & Brand - simplified animations */}
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                className="relative group"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-primary/60 blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center relative shadow-lg shadow-primary/20">
                  <Flame className="h-7 w-7" />
                </div>
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 dark:from-primary dark:to-primary/80 text-transparent bg-clip-text">
                  CalorieTracker
                </h1>
                <p className="text-muted-foreground text-sm font-medium mt-0.5">Your personal nutrition assistant</p>
              </div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4 mr-2" />
                Welcome, {profile?.name || "Friend"}!
              </div>
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-50 dark:to-slate-300 text-transparent bg-clip-text leading-tight">
                Your Fitness Journey <br />Starts Right Here
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
                We've created a personalized plan based on your {profile?.fitnessGoal?.replace('_', ' ') || "fitness"} goal. 
                Let's start tracking your progress and achieving results together.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="space-y-5"
            >
              <FeaturedItem 
                icon={<Flame className="h-4 w-4" />}
                title="Personalized Nutrition Plan"
                description={`Your daily target: ${profile?.calories} calories, ${profile?.protein}g protein, ${profile?.fat}g fat, ${profile?.carbs}g carbs`}
                delay={0.1}
              />
              
              <FeaturedItem 
                icon={<BarChart3 className="h-4 w-4" />}
                title="Progress Tracking"
                description="Monitor your daily intake and track your progress toward your goals"
                delay={0.15}
              />
              
              <FeaturedItem 
                icon={<PieChart className="h-4 w-4" />}
                title="Insights & Analysis"
                description="Get detailed insights about your nutrition habits and progress over time"
                delay={0.2}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="mt-8"
            >
              <Button 
                onClick={handleContinue}
                className="gap-4 h-12 px-8 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/20 relative overflow-hidden"
              >
                <span className="relative z-10">Go to Dashboard</span>
                <ArrowRight className="h-4 w-4 relative z-10" />
              </Button>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-3 text-center">
                You can always update your goals and preferences in your profile settings
              </p>
            </motion.div>
          </motion.div>
          
          {/* Right side dashboard preview - simplified animations */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative md:max-w-md lg:max-w-full mx-auto lg:mx-0 w-full"
          >
            <div className="absolute -inset-10 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-3xl blur-3xl opacity-70" />
            <div className="relative bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
              {/* Dashboard header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5 text-primary" />
                  <h3 className="font-medium text-slate-200">Dashboard</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                    <CalendarDays className="h-4 w-4 text-primary" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </div>
              
              {/* Daily progress */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Today's Progress</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 min-w-[95px]">
                      <div className="p-1.5 rounded-full bg-red-500/20 text-red-400">
                        <Flame className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-medium text-slate-300">Calories</span>
                    </div>
                    <div className="h-2 flex-grow bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: "65%" }} />
                    </div>
                    <div className="text-xs font-medium text-slate-400 min-w-[70px] text-right">
                      <span className="text-red-400">1577</span>/<span>2425</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 min-w-[95px]">
                      <div className="p-1.5 rounded-full bg-blue-500/20 text-blue-400">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 12C12 12 8 8.5 8 5.5C8 3 9.5 2 12 2C14.5 2 16 3 16 5.5C16 8.5 12 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 12C12 12 16 15.5 16 18.5C16 21 14.5 22 12 22C9.5 22 8 21 8 18.5C8 15.5 12 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-slate-300">Protein</span>
                    </div>
                    <div className="h-2 flex-grow bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: "75%" }} />
                    </div>
                    <div className="text-xs font-medium text-slate-400 min-w-[70px] text-right">
                      <span className="text-blue-400">137</span>/<span>182</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 min-w-[95px]">
                      <div className="p-1.5 rounded-full bg-amber-500/20 text-amber-400">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 3C14 2.44772 13.5523 2 13 2H11C10.4477 2 10 2.44772 10 3V5H14V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M6 12C6 10.3431 7.34315 9 9 9H15C16.6569 9 18 10.3431 18 12V21H6V12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 5H14L15 9H9L10 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-slate-300">Fat</span>
                    </div>
                    <div className="h-2 flex-grow bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: "55%" }} />
                    </div>
                    <div className="text-xs font-medium text-slate-400 min-w-[70px] text-right">
                      <span className="text-amber-400">37</span>/<span>67</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 min-w-[95px]">
                      <div className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C14.3869 2 16.5 4.5 16.5 8.5C16.5 10.5 15 13 12 17C9 13 7.5 10.5 7.5 8.5C7.5 4.5 9.61305 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M5 22V19C5 17.8954 5.89543 17 7 17H17C18.1046 17 19 17.8954 19 19V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-slate-300">Carbs</span>
                    </div>
                    <div className="h-2 flex-grow bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: "60%" }} />
                    </div>
                    <div className="text-xs font-medium text-slate-400 min-w-[70px] text-right">
                      <span className="text-emerald-400">164</span>/<span>273</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Fitness Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-slate-300">Fitness Progress</h4>
                  <div className="text-indigo-400 flex items-center gap-1 text-xs font-medium">
                    <Check className="h-3 w-3" />
                    Improving fitness
                  </div>
                </div>
                
                <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-indigo-500" style={{ width: "35%" }} />
                </div>
                
                <div className="flex justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs font-medium">
                      On Track
                    </span>
                  </div>
                  <div className="bg-indigo-500/20 text-indigo-400 text-xs font-medium px-2 py-0.5 rounded-full">
                    <Target className="h-3 w-3 inline-block mr-1" />
                    7 Day Streak
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Optimized FeaturedItem component with simplified animations
const FeaturedItem = memo(({ icon, title, description, delay }: FeaturedItemProps) => {
  return (
    <motion.div
      className="flex items-start gap-3 p-3 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm transition-colors hover:bg-white hover:dark:bg-slate-900/80"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <div className="p-2 rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-slate-900 dark:text-slate-200">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{description}</p>
      </div>
    </motion.div>
  );
});

FeaturedItem.displayName = "FeaturedItem";

// Optimized ProgressItem with static progress indicators
const ProgressItem = memo(({ title, value, current, color, icon, delay, animated = false }: ProgressItemProps) => {
  const percentage = Math.min(100, Math.round((current / value) * 100));
  
  const colorClasses = {
    red: {
      bg: "bg-red-500/10 dark:bg-red-500/20",
      text: "text-red-600 dark:text-red-500",
      ring: "ring-red-500/20",
      progress: "bg-red-500 dark:bg-red-400",
    },
    blue: {
      bg: "bg-blue-500/10 dark:bg-blue-500/20",
      text: "text-blue-600 dark:text-blue-500",
      ring: "ring-blue-500/20",
      progress: "bg-blue-500 dark:bg-blue-400",
    },
    amber: {
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
      text: "text-amber-600 dark:text-amber-500",
      ring: "ring-amber-500/20",
      progress: "bg-amber-500 dark:bg-amber-400",
    },
    green: {
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      text: "text-emerald-600 dark:text-emerald-500",
      ring: "ring-emerald-500/20",
      progress: "bg-emerald-500 dark:bg-emerald-400",
    },
  };
  
  return (
    <motion.div
      className="space-y-1.5"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <div className="flex justify-between">
        <div className={`flex items-center gap-1 text-xs font-medium ${colorClasses[color].text}`}>
          <div className={`p-1 rounded-md ${colorClasses[color].bg}`}>
            {icon}
          </div>
          {title}
        </div>
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
          {current}/{value}
        </span>
      </div>
      
      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClasses[color].progress}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </motion.div>
  );
});

ProgressItem.displayName = "ProgressItem";

interface ProgressItemProps {
  title: string;
  value: number;
  current: number;
  color: 'red' | 'blue' | 'amber' | 'green';
  icon: React.ReactNode;
  delay: number;
  animated?: boolean;
}

interface FeaturedItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

function getGoalTitle(fitnessGoal: string): string {
  switch(fitnessGoal) {
    case 'weight_loss': return 'Weight Loss Progress';
    case 'muscle_gain': return 'Muscle Gain Progress';
    case 'get_fit': return 'Fitness Progress';
    case 'stamina': return 'Stamina Progress';
    case 'overall_health': 
    default: return 'Health Progress';
  }
}

function getProgressLabel(fitnessGoal: string): string {
  switch(fitnessGoal) {
    case 'weight_loss': return 'On track to goal weight';
    case 'muscle_gain': return 'Building strength';
    case 'get_fit': return 'Improving fitness';
    case 'stamina': return 'Building endurance';
    case 'overall_health': 
    default: return 'Maintaining health';
  }
} 