"use client";

import { useState, useEffect } from "react";
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

// Add this style tag to extract RGB values from the CSS variables
// which will be used for background gradients
const style = `
:root {
  --primary-rgb: 108, 99, 255; /* Default value that will be overridden by CSS variables */
}
`;

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
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
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
    <div className="container mx-auto min-h-screen flex items-center justify-center relative bg-gradient-to-br from-background via-background/95 to-primary/5 dark:from-background dark:via-background/95 dark:to-primary/15 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large circle gradient */}
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-tl from-primary/20 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-full blur-3xl" />
        
        {/* Moving gradient background */}
        <motion.div 
          className="absolute inset-0 opacity-30 dark:opacity-40"
          style={{
            background: 'radial-gradient(circle at center, rgba(var(--primary-rgb), 0.15) 0%, transparent 70%)',
            backgroundSize: '150% 150%',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut',
          }}
        />
        
        {/* Floating particles */}
        <div className="absolute w-full h-full">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute rounded-full bg-primary/30 dark:bg-primary/20"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 8 + 2}px`,
                height: `${Math.random() * 8 + 2}px`,
                opacity: Math.random() * 0.5 + 0.2,
              }}
              animate={{
                y: [0, Math.random() * 100 - 50],
                x: [0, Math.random() * 50 - 25],
                opacity: [Math.random() * 0.5 + 0.2, 0.8, Math.random() * 0.5 + 0.2],
                scale: [1, Math.random() * 0.5 + 1, 1],
              }}
              transition={{
                duration: Math.random() * 20 + 20,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
        
        {/* Animated rings */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`ring-${i}`}
              className="absolute rounded-full border border-primary/10 dark:border-primary/5"
              style={{
                width: `${(i + 1) * 30}%`,
                height: `${(i + 1) * 30}%`,
              }}
              animate={{
                rotate: [0, 360],
                scale: [1, 1.05, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                rotate: { 
                  duration: 40 + (i * 10), 
                  repeat: Infinity, 
                  ease: "linear",
                },
                scale: {
                  duration: 15 + (i * 5),
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: "easeInOut",
                },
                opacity: {
                  duration: 8 + (i * 3),
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: "easeInOut",
                }
              }}
            />
          ))}
        </div>
        
        {/* Dynamic gradients */}
        <div className="absolute w-full h-full">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`blob-${i}`}
              className="absolute rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 500 + 300}px`,
                height: `${Math.random() * 500 + 300}px`,
                background: `radial-gradient(circle, rgba(var(--primary-rgb), 0.05) 0%, rgba(var(--primary-rgb), 0.01) 50%, rgba(var(--primary-rgb), 0) 70%)`,
                filter: 'blur(70px)',
              }}
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                scale: [1, 1.1, 0.9, 1],
              }}
              transition={{
                duration: Math.random() * 30 + 20,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="relative z-10 max-w-6xl w-full px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col"
          >
            {/* Logo & Brand */}
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                className="relative group"
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-primary/60 blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-700" />
                <motion.div 
                  className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center relative shadow-lg shadow-primary/20"
                  animate={{ boxShadow: ['0 10px 25px rgba(var(--primary-rgb), 0.2)', '0 15px 35px rgba(var(--primary-rgb), 0.4)', '0 10px 25px rgba(var(--primary-rgb), 0.2)'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Flame className="h-7 w-7" />
                  </motion.div>
                </motion.div>
              </motion.div>
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <motion.h1 
                  className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 dark:from-primary dark:to-primary/80 text-transparent bg-clip-text"
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
                  }}
                  transition={{ 
                    duration: 8, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  style={{ backgroundSize: '200% 200%' }}
                >
                  CalorieTracker
                </motion.h1>
                <p className="text-muted-foreground text-sm font-medium mt-0.5">Your personal nutrition assistant</p>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <motion.div 
                className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(var(--primary-rgb), 0.15)' }}
              >
                <motion.div 
                  animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                  className="mr-2"
                >
                  <Sparkles className="h-4 w-4" />
                </motion.div>
                Welcome, {profile?.name || "Friend"}!
              </motion.div>
              <motion.h2 
                className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-50 dark:to-slate-300 text-transparent bg-clip-text leading-tight"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.7 }}
              >
                Your Fitness Journey <br />Starts Right Here
              </motion.h2>
              <motion.p 
                className="text-slate-600 dark:text-slate-400 mb-8 text-lg"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.7 }}
              >
                We've created a personalized plan based on your {profile?.fitnessGoal?.replace('_', ' ') || "fitness"} goal. 
                Let's start tracking your progress and achieving results together.
              </motion.p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="space-y-5"
            >
              <FeaturedItem 
                icon={<Flame className="h-4 w-4" />}
                title="Personalized Nutrition Plan"
                description={`Your daily target: ${profile?.calories} calories, ${profile?.protein}g protein, ${profile?.fat}g fat, ${profile?.carbs}g carbs`}
                delay={0.7}
              />
              
              <FeaturedItem 
                icon={<BarChart3 className="h-4 w-4" />}
                title="Progress Tracking"
                description="Monitor your daily intake and track your progress toward your goals"
                delay={0.8}
              />
              
              <FeaturedItem 
                icon={<PieChart className="h-4 w-4" />}
                title="Insights & Analysis"
                description="Get detailed insights about your nutrition habits and progress over time"
                delay={0.9}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-8"
            >
              <motion.div
                whileHover={{ scale: 1.03, translateY: -4 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button 
                  onClick={handleContinue}
                  className="gap-2 h-12 px-8 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/20 relative overflow-hidden"
                >
                  <span className="relative z-10">Go to Dashboard</span>
                  <motion.div
                    className="absolute z-10 right-7"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity, 
                      repeatType: "loop",
                      ease: "easeInOut",
                      repeatDelay: 1,
                    }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/10 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity, 
                      repeatDelay: 1
                    }}
                  />
                </Button>
              </motion.div>
              <motion.p 
                className="text-xs text-slate-500 dark:text-slate-500 mt-3 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                You can always update your goals and preferences in your profile settings
              </motion.p>
            </motion.div>
          </motion.div>
          
          {/* Right side animated dashboard preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className="relative"
          >
            <motion.div
              className="absolute -inset-10 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-3xl blur-3xl opacity-70"
              animate={{ 
                opacity: [0.5, 0.7, 0.5],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div 
              className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 100, delay: 0.4 }}
              whileHover={{ 
                boxShadow: "0 20px 40px rgba(var(--primary-rgb), 0.15)",
                y: -5,
              }}
            >
              {/* Animated background glow */}
              <motion.div 
                className="absolute inset-0 opacity-30"
                style={{
                  background: 'radial-gradient(circle at 50% 50%, rgba(var(--primary-rgb), 0.1) 0%, transparent 70%)',
                  backgroundSize: '150% 150%',
                }}
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  repeatType: 'loop',
                  ease: 'easeInOut',
                }}
              />
            
              {/* Dashboard header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <LayoutDashboard className="h-5 w-5 text-primary" />
                  </motion.div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-200">Dashboard</h3>
                </div>
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(var(--primary-rgb), 0.2)" }}
                  >
                    <CalendarDays className="h-4 w-4 text-primary" />
                  </motion.div>
                  <motion.div
                    className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(var(--primary-rgb), 0.2)" }}
                  >
                    <BarChart3 className="h-4 w-4 text-primary" />
                  </motion.div>
                </div>
              </div>
              
              {/* Daily progress */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Today's Progress</h4>
                <div className="grid grid-cols-4 gap-3">
                  <ProgressItem 
                    title="Calories" 
                    value={profile?.calories || 2000} 
                    current={Math.round((profile?.calories || 2000) * 0.65)} 
                    color="red" 
                    icon={<Flame className="h-4 w-4" />}
                    delay={0.5}
                    animated={true}
                  />
                  <ProgressItem 
                    title="Protein" 
                    value={profile?.protein || 140} 
                    current={Math.round((profile?.protein || 140) * 0.75)} 
                    color="blue" 
                    icon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 12C12 12 8 8.5 8 5.5C8 3 9.5 2 12 2C14.5 2 16 3 16 5.5C16 8.5 12 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 12C12 12 16 15.5 16 18.5C16 21 14.5 22 12 22C9.5 22 8 21 8 18.5C8 15.5 12 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>}
                    delay={0.6}
                    animated={true}
                  />
                  <ProgressItem 
                    title="Fat" 
                    value={profile?.fat || 65} 
                    current={Math.round((profile?.fat || 65) * 0.55)} 
                    color="amber" 
                    icon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 3C14 2.44772 13.5523 2 13 2H11C10.4477 2 10 2.44772 10 3V5H14V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 12C6 10.3431 7.34315 9 9 9H15C16.6569 9 18 10.3431 18 12V21H6V12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 5H14L15 9H9L10 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>}
                    delay={0.7}
                    animated={true}
                  />
                  <ProgressItem 
                    title="Carbs" 
                    value={profile?.carbs || 250} 
                    current={Math.round((profile?.carbs || 250) * 0.70)} 
                    color="green" 
                    icon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>}
                    delay={0.8}
                    animated={true}
                  />
                </div>
              </div>
              
              {/* Weekly Stats */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Weekly Overview</h4>
                  <motion.div 
                    className="flex items-center gap-1 text-xs text-primary font-medium"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                  >
                    <TrendingUp className="h-3 w-3" />
                    <span>+5%</span>
                  </motion.div>
                </div>
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.7, delay: 0.9 }}
                  style={{ transformOrigin: 'bottom' }}
                  className="h-28 flex items-end gap-2"
                >
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                    const heights = [70, 85, 60, 90, 75, 50, 65];
                    const isToday = idx === 3; // Thursday for example
                    
                    return (
                      <div key={day} className="flex-1 flex flex-col items-center gap-1">
                        <motion.div 
                          className={`w-full rounded-t-sm ${isToday ? 'bg-primary' : 'bg-primary/30'}`}
                          initial={{ height: 0 }}
                          animate={{ height: `${heights[idx]}%` }}
                          transition={{ duration: 0.4, delay: 0.9 + (idx * 0.1) }}
                          whileHover={{ 
                            height: `${heights[idx] + 10}%`, 
                            backgroundColor: isToday ? 'rgb(var(--primary-rgb))' : 'rgba(var(--primary-rgb), 0.5)' 
                          }}
                        />
                        <span className="text-xs text-slate-500 dark:text-slate-400">{day}</span>
                      </div>
                    );
                  })}
                </motion.div>
              </div>
              
              {/* Goal section */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 5 }}
                    >
                      <Target className="h-4 w-4 text-primary" />
                    </motion.div>
                    <span>{getGoalTitle(profile?.fitnessGoal)}</span>
                  </h4>
                  <motion.div 
                    className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 py-1 px-2 rounded-full"
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(var(--primary-rgb), 0.1)' }}
                  >
                    {getProgressLabel(profile?.fitnessGoal)}
                  </motion.div>
                </div>
                
                <motion.div 
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                >
                  <motion.div 
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: "38%" }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                  />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

interface ProgressItemProps {
  title: string;
  value: number;
  current: number;
  color: 'red' | 'blue' | 'amber' | 'green';
  icon: React.ReactNode;
  delay: number;
  animated?: boolean;
}

const ProgressItem = ({ title, value, current, color, icon, delay, animated = false }: ProgressItemProps) => {
  const percentage = Math.round((current / value) * 100);
  const colorClasses = {
    red: "text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/30",
    blue: "text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30",
    amber: "text-amber-500 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30",
    green: "text-emerald-500 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30",
  };
  
  const barColors = {
    red: "bg-red-500 dark:bg-red-400",
    blue: "bg-blue-500 dark:bg-blue-400",
    amber: "bg-amber-500 dark:bg-amber-400",
    green: "bg-emerald-500 dark:bg-emerald-400",
  };
  
  return (
    <motion.div
      className="flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={animated ? { y: -3, transition: { duration: 0.2 } } : {}}
    >
      <div className="flex justify-between items-center mb-1">
        <motion.div 
          className={`p-1 rounded-md ${colorClasses[color]}`}
          whileHover={animated ? { scale: 1.1, rotate: 5 } : {}}
        >
          {animated ? (
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              {icon}
            </motion.div>
          ) : (
            icon
          )}
        </motion.div>
        <motion.div 
          className="text-xs font-medium text-slate-600 dark:text-slate-400"
          animate={animated ? { scale: [1, 1.05, 1] } : {}}
          transition={animated ? { duration: 2, repeat: Infinity, repeatDelay: 4 } : {}}
        >
          {current}/{value}
        </motion.div>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{title}</p>
      <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div 
          className={`h-full ${barColors[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, delay: delay + 0.1 }}
          whileHover={animated ? { 
            width: `${Math.min(100, percentage + 5)}%`,
            transition: { duration: 0.2 }
          } : {}}
        />
      </div>
    </motion.div>
  );
};

interface FeaturedItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const FeaturedItem = ({ icon, title, description, delay }: FeaturedItemProps) => {
  return (
    <motion.div 
      className="flex items-start gap-3 p-3 rounded-xl transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ 
        backgroundColor: "rgba(var(--primary-rgb), 0.05)",
        y: -3,
        transition: { duration: 0.2 }
      }}
    >
      <motion.div 
        className="mt-0.5"
        whileHover={{ scale: 1.1, rotate: 10 }}
      >
        <motion.div 
          className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center"
          animate={{ 
            boxShadow: [
              "0 0 0 rgba(var(--primary-rgb), 0)",
              "0 0 10px rgba(var(--primary-rgb), 0.3)",
              "0 0 0 rgba(var(--primary-rgb), 0)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            {icon}
          </motion.div>
        </motion.div>
      </motion.div>
      <div>
        <motion.h3 
          className="font-medium text-slate-900 dark:text-slate-200"
          whileHover={{ color: "hsl(var(--primary))" }}
        >
          {title}
        </motion.h3>
        <motion.p 
          className="text-sm text-slate-600 dark:text-slate-400 mt-0.5"
          initial={{ opacity: 0.8 }}
          whileHover={{ opacity: 1 }}
        >
          {description}
        </motion.p>
      </div>
    </motion.div>
  );
};

function getGoalTitle(fitnessGoal: string): string {
  switch (fitnessGoal) {
    case 'muscle_gain':
      return 'Build Muscle Mass';
    case 'weight_loss':
      return 'Weight Loss Goal';
    case 'get_fit':
      return 'Improve Fitness';
    case 'overall_health':
      return 'Health Improvement';
    case 'stamina':
      return 'Endurance Training';
    default:
      return 'Fitness Goal';
  }
}

function getProgressLabel(fitnessGoal: string): string {
  switch (fitnessGoal) {
    case 'muscle_gain':
      return '+2.5 lbs muscle';
    case 'weight_loss':
      return '-4.2 lbs';
    case 'get_fit':
      return 'Week 3 of 12';
    case 'overall_health':
      return 'Great progress';
    case 'stamina':
      return '+15% endurance';
    default:
      return 'On track';
  }
} 