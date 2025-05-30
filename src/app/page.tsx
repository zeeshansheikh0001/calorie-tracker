"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Bell,
  Camera,
  UploadCloud,
  FilePenLine,
  CalendarDays,
  Flame,
  Wheat,
  Drumstick,
  Droplets,
  PlusCircle,
  Lightbulb,
  TrendingUp,
  Utensils,
  BarChart2,
  ChevronDown,
  Trash2,
  BookOpen,
  ArrowRight,
  Loader2,
  Sparkles,
  InfoIcon,
} from "lucide-react";
import { useState, type FC, useEffect, ReactNode, useMemo } from "react";
import type { FoodEntry as LoggedFoodEntry, BlogPost, DailyLogEntry } from "@/types";
import { useDailyLog } from "@/hooks/use-daily-log";
import { useGoals } from "@/hooks/use-goals";
import { useUserProfile } from "@/hooks/use-user-profile";
import { format, isToday, subDays } from "date-fns";
import Image from "next/image";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Label, type TooltipProps } from 'recharts';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import React from "react"; // Added React import for React.memo
import dynamic from "next/dynamic"; // Added dynamic import
import { resetOnboarding } from "@/lib/onboarding";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Dynamically import CalorieDonutChart
const CalorieDonutChart = dynamic(
  () => import('@/components/dashboard/calorie-donut-chart'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-36 h-36 md:w-32 md:h-32 flex justify-center items-center relative">
        <Skeleton className="w-full h-full rounded-full" />
        <Loader2 className="absolute h-8 w-8 animate-spin text-primary/50" />
      </div>
    )
  }
);

// Dynamically import SmartInsights
const SmartInsights = dynamic(
  () => import('@/components/dashboard/smart-insights'),
  { 
    ssr: false,
    loading: () => (
      <Card className="shadow-lg rounded-xl overflow-hidden">
        <CardContent className="p-5 space-y-4">
          <div className="h-6 w-40 bg-muted animate-pulse rounded" />
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    )
  }
);

interface MealCardProps {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  onDelete: (id: string) => void;
}

const MealCard: React.FC<MealCardProps> = React.memo(({ id, name, calories, protein, fat, carbs, onDelete }) => (
  <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden rounded-xl relative">
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive z-10"
      onClick={() => onDelete(id)}
      aria-label="Delete meal"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
    <CardContent className="p-4 space-y-3 mr-8">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-foreground flex-1 truncate title-poppins" title={name}>{name}</h3>
        <div className="flex items-center font-bold text-lg text-poppins" style={{color: 'hsl(var(--text-kcal-raw))'}}>
          <Flame className="h-5 w-5 mr-1.5" />
          {Math.round(calories)}
          <span className="text-xs font-normal ml-1 text-muted-foreground">kcal</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
        <div className="flex flex-col items-center p-2 bg-secondary/20 rounded-md">
          <span className="font-medium text-sm text-poppins" style={{color: 'hsl(var(--text-protein-raw))'}}>{Math.round(protein)}g</span>
          <span className="text-poppins">Protein</span>
        </div>
        <div className="flex flex-col items-center p-2 bg-secondary/20 rounded-md">
          <span className="font-medium text-sm text-poppins" style={{color: 'hsl(var(--text-fat-raw))'}}>{Math.round(fat)}g</span>
          <span className="text-poppins">Fat</span>
        </div>
        <div className="flex flex-col items-center p-2 bg-secondary/20 rounded-md">
          <span className="font-medium text-sm text-poppins" style={{color: 'hsl(var(--text-carbs-raw))'}}>{Math.round(carbs)}g</span>
          <span className="text-poppins">Carbs</span>
        </div>
      </div>
    </CardContent>
  </Card>
));
MealCard.displayName = 'MealCard';


interface SummaryCardProps {
  icon: React.ElementType;
  value: string;
  label: string;
  iconColorVariable: string;
}

const SummaryCard: React.FC<SummaryCardProps> = React.memo(({ icon: Icon, value, label, iconColorVariable }) => (
  <Card className="p-3 shadow-md hover:shadow-lg transition-shadow bg-card rounded-xl text-center">
      <div className="p-2 rounded-lg inline-block mx-auto" style={{ backgroundColor: `hsla(${iconColorVariable}, 0.1)` }}>
        <Icon className="h-6 w-6" style={{ color: `hsl(${iconColorVariable})` }} />
      </div>
      <p className="text-lg font-bold mt-1 title-poppins" style={{ color: `hsl(${iconColorVariable})` }}>{value}</p>
      <p className="text-xs text-muted-foreground text-poppins">{label}</p>
  </Card>
));
SummaryCard.displayName = 'SummaryCard';


export const mockBlogData: BlogPost[] = [
  {
    id: "1",
    title: "The Surprising Benefits of Morning Workouts",
    excerpt: "Discover how starting your day with exercise can boost your metabolism and mood.",
    imageUrl: "https://emi.parkview.com/media/Image/Dashboard_952_The-many-health-benefits-of-regular-exercise_11_20.jpg",
    imageHint: "morning workout",
    readMoreLink: "/blog/1",
  },
  {
    id: "2",
    title: "Understanding Macronutrients: Your Guide to Balanced Eating",
    excerpt: "Learn the roles of protein, carbs, and fats in your diet and how to balance them.",
    imageUrl: "https://www.cedars-sinai.org/content/dam/cedars-sinai/blog/2022/1/what-are-macronutrients-s.jpg",
    imageHint: "healthy food",
    readMoreLink: "/blog/2",
  },
  {
    id: "3",
    title: "Mindful Eating: How to Enjoy Your Food and Improve Digestion",
    excerpt: "Explore techniques for mindful eating to enhance your relationship with food.",
    imageUrl: "https://www.letslive.shop/cdn/shop/articles/What_is_mindful_eating_and_how_is_it_beneficial.png?v=1687949647",
    imageHint: "mindful eating",
    readMoreLink: "/blog/3",
  },
  {
    id: "4",
    title: "Hydration Secrets: Are You Drinking Enough Water?",
    excerpt: "Uncover the importance of hydration for overall health and performance.",
    imageUrl: "https://www.nutritionnews.abbott/content/dam/an/newsroom/us/en/images/articles/healthy-living/diet-wellness/What%20Happens%20When%20You%20Drink%20Too%20Much%20Water-930x405.jpg",
    imageHint: "water hydration",
    readMoreLink: "/blog/4",
  },
];


interface CaloriesCenterLabelProps {
  viewBox?: { cx?: number; cy?: number };
  value: number;
}

const CaloriesCenterLabel: FC<CaloriesCenterLabelProps> = ({ viewBox, value }) => {
  if (!viewBox || typeof viewBox.cx !== 'number' || typeof viewBox.cy !== 'number') {
    return null;
  }
  const { cx, cy } = viewBox;
  return (
    <text x={cx} y={cy} fill="hsl(var(--foreground))" textAnchor="middle" dominantBaseline="central">
      <tspan x={cx} y={cy - 8} fontSize="1.75rem" fontWeight="bold">{`${Math.round(value)}`}</tspan>
      <tspan x={cx} y={cy + 12} fontSize="0.75rem" fill="hsl(var(--muted-foreground))">Calories</tspan>
    </text>
  );
};

interface CustomDonutTooltipProps extends TooltipProps<number, string> {
  goalCalories: number;
}

const CustomDonutTooltip: FC<CustomDonutTooltipProps> = ({ active, payload, goalCalories }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = payload[0].value || 0; 
    const name = data.name;

    let displayName = name;
    if (name === 'ConsumedNoGoal') {
      displayName = 'Consumed';
    } else if (name === 'Empty') {
      displayName = goalCalories > 0 ? 'Goal Not Reached' : 'Goal Not Set';
    } else if (name === 'Remaining' && goalCalories > 0) {
      displayName = 'Remaining in Goal';
    }

    const displayValue = (name === 'Empty' && value === 1 && goalCalories === 0 && data.value === 1)
      ? '0 kcal'
      : `${Math.round(value)} kcal`;

    return (
      <div className="rounded-lg border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md" style={{backgroundColor: "hsl(var(--popover))", borderColor: "hsl(var(--border))"}}>
        <p className="font-semibold">{displayName}</p>
        <p className="text-muted-foreground">{displayValue}</p>
      </div>
    );
  }
  return null;
};

// Custom Component for Insights
interface InsightCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color: "emerald" | "blue" | "amber" | "rose";
}

const InsightCard: React.FC<InsightCardProps> = ({ icon: Icon, title, description, color }) => {
  const colors = {
    emerald: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-500",
      icon: "text-emerald-500"
    },
    blue: {
      bg: "bg-blue-500/10",
      text: "text-blue-500",
      icon: "text-blue-500"
    },
    amber: {
      bg: "bg-amber-500/10",
      text: "text-amber-500",
      icon: "text-amber-500"
    },
    rose: {
      bg: "bg-rose-500/10",
      text: "text-rose-500",
      icon: "text-rose-500"
    }
  };
  
  return (
    <motion.div 
      className="p-4 rounded-xl border border-border/50 hover:border-border"
      whileHover={{ x: 5 }}
    >
      <div className="flex gap-3">
        <div className={`p-2 rounded-lg ${colors[color].bg} flex-shrink-0`}>
          <Icon className={`h-5 w-5 ${colors[color].icon}`} />
        </div>
        <div className="space-y-1">
          <h4 className={`text-sm font-semibold ${colors[color].text}`}>{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

// InfoTooltip component
const InfoTooltip = ({ title, description, color }: { title: string; description: string; color: string }) => {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <button 
        className="h-6 w-6 rounded-full bg-white/30 flex items-center justify-center hover:bg-white/50 transition-colors"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <InfoIcon className="h-4 w-4 text-white" />
      </button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={`bg-gradient-to-b ${color} text-white border-none`}>
          <DialogHeader>
            <DialogTitle className="text-white">{title}</DialogTitle>
            <DialogDescription className="text-white/90">
              {description}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default function DashboardPage() {
  const { dailyLog, foodEntries, isLoading: isLoadingLog, deleteFoodEntry, currentSelectedDate, selectDateForLog, getLogDataForDate } = useDailyLog();
  const { goals, isLoading: isLoadingGoals } = useGoals();
  const { userProfile, isLoading: isLoadingProfile } = useUserProfile();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showAllMeals, setShowAllMeals] = useState(false);
  const [showFAB, setShowFAB] = useState(false);

  // Fetch previous logs for Smart Insights (last 14 days)
  const [previousLogs, setPreviousLogs] = useState<DailyLogEntry[]>([]);
  const [isPreviousLogsLoading, setIsPreviousLogsLoading] = useState(true);

  useEffect(() => {
    if (currentSelectedDate) {
      setIsPreviousLogsLoading(true);
      const logs: DailyLogEntry[] = [];
      
      // Get logs from the last 14 days
      for (let i = 1; i <= 14; i++) {
        const date = subDays(new Date(), i);
        const { summary } = getLogDataForDate(date);
        if (summary) {
          logs.push(summary);
        }
      }
      
      setPreviousLogs(logs);
      setIsPreviousLogsLoading(false);
    }
  }, [currentSelectedDate, getLogDataForDate]);

  // Show/hide FAB based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setShowFAB(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const consumedCalories = dailyLog?.calories ?? 0;
  const goalCalories = goals?.calories ?? 0;

  let percentAchieved = 0;
  if (goalCalories > 0) {
    percentAchieved = Math.round((consumedCalories / goalCalories) * 100);
  }

  const chartData = [];
  const COLORS = {
    Consumed: 'rgba(255, 149, 0, 0.7)', 
    Remaining: 'hsla(var(--primary-hsl), 0.7)', 
    Empty: 'hsla(var(--muted-foreground), 0.1)', 
    ConsumedNoGoal: 'hsl(var(--accent))', 
  };

  if (goalCalories > 0) {
    if (consumedCalories > 0) {
      chartData.push({ name: 'Consumed', value: consumedCalories, fill: COLORS.Consumed });
      if (consumedCalories < goalCalories) {
        chartData.push({ name: 'Remaining', value: Math.max(0, goalCalories - consumedCalories), fill: COLORS.Remaining });
      }
    } else { 
      chartData.push({ name: 'Remaining', value: goalCalories, fill: COLORS.Remaining });
    }
  } else { 
    if (consumedCalories > 0) {
      chartData.push({ name: 'ConsumedNoGoal', value: consumedCalories, fill: COLORS.ConsumedNoGoal });
    } else { 
      chartData.push({ name: 'Empty', value: 1, fill: COLORS.Empty });
    }
  }

  if (chartData.length === 0) { 
    chartData.push({ name: 'Empty', value: 1, fill: COLORS.Empty });
  }


  const todayCalories = dailyLog?.calories ?? 0;
  const todayCarbs = dailyLog?.carbs ?? 0;
  const todayProtein = dailyLog?.protein ?? 0;
  const todayFat = dailyLog?.fat ?? 0;

  const isDataLoading = isLoadingLog || isLoadingGoals || isLoadingProfile;

  const displayedFoodEntries = showAllMeals ? foodEntries : foodEntries.slice(0, 3);

  // Development tools
  const [showDevTools, setShowDevTools] = useState(false);

  const { toast } = useToast();

  const handleResetOnboarding = () => {
    resetOnboarding();
    toast({
      title: "Onboarding Reset",
      description: "Refresh the page to start onboarding",
    });
  };

  return (
    <div className="flex flex-col gap-5 p-6 max-w-3xl mx-auto bg-background">
      {/* Header - Completely redesigned */}
      <motion.div 
        className="relative overflow-hidden rounded-2xl shadow-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
      >
        {/* Modern gradient background - softer pastels */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-300/90 via-purple-300/90 to-pink-300/90 dark:from-indigo-700/80 dark:via-purple-700/80 dark:to-pink-700/80"></div>
        
        {/* Abstract geometric shapes in background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/15 rounded-full -translate-y-1/2 translate-x-1/4 blur-xl"></div>
        <div className="absolute bottom-0 left-20 w-48 h-48 bg-indigo-200/20 dark:bg-indigo-300/10 rounded-full translate-y-1/3 blur-xl"></div>
        <div className="absolute top-1/3 left-1/4 w-24 h-24 bg-pink-200/20 dark:bg-pink-300/10 rounded-full blur-lg"></div>
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5 mix-blend-overlay" 
             style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.5\" fill-rule=\"evenodd\"%3E%3Ccircle cx=\"3\" cy=\"3\" r=\"1\"%2F%3E%3Ccircle cx=\"13\" cy=\"13\" r=\"1\"%2F%3E%3C%2Fg%3E%3C/svg%3E')"}}></div>
        
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute h-2 w-2 rounded-full bg-white/40"
              style={{
                top: `${20 + (i * 15)}%`,
                left: `${10 + (i * 20)}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: i * 0.5,
              }}
            />
          ))}
        </div>
        
        <div className="relative p-6 flex justify-between items-center z-10">
          <div className="flex items-center gap-4">
          {isLoadingProfile ? (
            <>
                <Skeleton className="h-12 w-12 rounded-full bg-white/20" />
                <Skeleton className="h-7 w-32 bg-white/20" />
            </>
          ) : (
            <>
              <Link href="/profile">
                  <motion.div 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                  >
                    <motion.div 
                      className="absolute -inset-1.5 rounded-full bg-white/30 blur-sm opacity-70"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.7, 0.5]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    />
                    <Avatar className="h-12 w-12 cursor-pointer ring-2 ring-white/40 hover:ring-white/70 transition-all relative z-10 border-2 border-white/80">
                  <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name || ""} data-ai-hint="user avatar" />
                      <AvatarFallback className="bg-primary-foreground text-primary">{userProfile.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                  </motion.div>
              </Link>
                <div className="flex flex-col">
                  <motion.h1 
                    className="text-2xl font-bold text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Hi, {userProfile.name}
                    <motion.span 
                      className="inline-block ml-1"
                      initial={{ rotate: -15 }}
                      animate={{ rotate: 15 }}
                      transition={{ 
                        repeat: Infinity, 
                        repeatType: "reverse", 
                        duration: 0.5,
                        repeatDelay: 2
                      }}
                    >
                      👋
                    </motion.span>
                  </motion.h1>
                  <span className="text-white/80 text-sm">Track your nutrition journey</span>
                </div>
            </>
          )}
        </div>
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <div className="rounded-full border-white/20 bg-white/15 hover:bg-white/25 text-white">
                <ThemeToggle />
              </div>
            </motion.div>
           <Link href="/reminders" legacyBehavior>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="outline" size="icon" className="rounded-full border-white/20 bg-white/15 hover:bg-white/25 text-white">
                  <Bell className="h-5 w-5" />
                </Button>
              </motion.div>
          </Link>
        </div>
      </div>
      </motion.div>

      {/* Your Progress Card - Completely redesigned */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, type: "spring" }}
      >
        <Card className="relative overflow-hidden rounded-2xl border-none shadow-xl">
          {/* Elegant gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/90 via-teal-200/80 to-emerald-100/70 dark:from-emerald-800/50 dark:via-teal-800/40 dark:to-emerald-700/30"></div>
          
          {/* Abstract shape elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/4 blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-100/30 dark:bg-teal-400/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-xl"></div>
          
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10 mix-blend-overlay" 
               style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.5\" fill-rule=\"evenodd\"%3E%3Ccircle cx=\"3\" cy=\"3\" r=\"1\"%2F%3E%3Ccircle cx=\"13\" cy=\"13\" r=\"1\"%2F%3E%3C%2Fg%3E%3C/svg%3E')"}}></div>

  {/* Foreground Content */}
          <CardContent className="relative p-6 z-10">
    {isDataLoading ? (
      <div className="flex flex-row items-start gap-3">
        <div className="flex-1 space-y-2 text-left">
                  <Skeleton className="h-5 w-24 bg-white/30" />
                  <Skeleton className="h-10 sm:h-12 w-20 sm:w-24 bg-white/30" />
                  <Skeleton className="h-4 w-20 bg-white/30" />
        </div>
        <div className="w-[120px] h-[120px] flex-shrink-0 flex justify-center items-center relative">
                  <Skeleton className="w-full h-full rounded-full bg-white/30" />
                  <Loader2 className="absolute h-8 w-8 animate-spin text-white/60" />
        </div>
      </div>
    ) : (
              <div className="flex flex-col items-stretch gap-5 sm:flex-row sm:items-center"> 
                <div className="flex-1 space-y-3">
                  <motion.div 
                    className="flex items-center gap-2 text-emerald-800/90 dark:text-emerald-200/90"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <motion.div 
                      className="p-1.5 rounded-full bg-white/30 flex items-center justify-center"
                      animate={{ 
                        boxShadow: [
                          "0 0 0 0 rgba(255, 255, 255, 0)",
                          "0 0 0 4px rgba(255, 255, 255, 0.2)",
                          "0 0 0 0 rgba(255, 255, 255, 0)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles className="h-4 w-4 text-emerald-800 dark:text-emerald-200" />
                    </motion.div>
                    <span className="text-base font-medium">Today's Progress</span>
                  </motion.div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <motion.div 
                        className="text-5xl font-bold text-emerald-800 dark:text-emerald-100 tracking-tight"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.3, type: "spring" }}
                      >
            {goalCalories > 0 ? `${percentAchieved}%` : "-"}
                      </motion.div>
                      
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button variant="outline" className="flex items-center gap-1 text-sm text-emerald-800 dark:text-emerald-100 border-emerald-300/50 dark:border-emerald-600/50 bg-white/25 hover:bg-white/40">
                <CalendarDays className="h-4 w-4" />
                <span>{currentSelectedDate ? (isToday(currentSelectedDate) ? "Today" : format(currentSelectedDate, "MMM d, yyyy")) : "Select Date"}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
                          </motion.div>
            </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 shadow-xl border border-border/30 bg-background/95 backdrop-blur-lg" align="start">
              <Calendar
                mode="single"
                selected={currentSelectedDate || undefined}
                onSelect={(newDate) => {
                  if (newDate) {
                    selectDateForLog(newDate);
                    setShowAllMeals(false); // Reset view more on date change
                    setIsCalendarOpen(false);
                  }
                }}
                initialFocus
                disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
              />
            </PopoverContent>
          </Popover>
        </div>

                    {goalCalories > 0 && (
                      <div className="mt-4 bg-white/30 h-2.5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-white rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(percentAchieved, 100)}%` }}
                          transition={{ duration: 1, delay: 0.5, type: "spring" }}
                          style={{
                            backgroundImage: percentAchieved > 100 
                              ? 'linear-gradient(to right, rgba(255,255,255,0.9), rgba(249,168,212,0.9))' 
                              : 'linear-gradient(to right, rgba(255,255,255,0.9), rgba(167,243,208,0.9))'
                          }}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3 mt-2 text-emerald-800 dark:text-emerald-100">
                    <div className="flex items-center gap-1 text-sm">
                      <Flame className="h-4 w-4 opacity-90" />
                      <span className="font-medium">{Math.round(consumedCalories)} kcal</span>
                    </div>
                    {goalCalories > 0 && (
                      <div className="flex items-center gap-1 text-sm opacity-80">
                        <span>of</span>
                        <span className="font-medium">{goalCalories} kcal goal</span>
                      </div>
                    )}
                  </div>
                </div>

                <motion.div 
                  className="w-[120px] h-[120px] mx-auto sm:mx-0 flex-shrink-0 flex justify-center items-center relative"
                  initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
                >
                  <motion.div 
                    className="absolute inset-0 rounded-full"
                    animate={{ 
                      boxShadow: [
                        "0 0 0 0 rgba(255, 255, 255, 0)",
                        "0 0 20px 0px rgba(255, 255, 255, 0.3)",
                        "0 0 0 0 rgba(255, 255, 255, 0)"
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
          <CalorieDonutChart 
            chartData={chartData} 
            consumedCalories={consumedCalories} 
            goalCalories={goalCalories} 
          />
                </motion.div>
      </div>
    )}
          </CardContent>
</Card>
      </motion.div>

      {/* Action Buttons - Completely redesigned */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
        className="mt-6"
      >
        {isDataLoading ? (
          <div className="flex flex-row gap-2 w-full">
            {[1,2,3].map(i => (
              <Card key={`skel-action-${i}`} className="shadow-lg bg-muted/30 flex-1">
                <CardContent className="p-4 flex flex-col items-center gap-2">
                  <Skeleton className="h-10 w-10 rounded-full bg-background/40" />
                  <Skeleton className="h-4 w-16 bg-background/40" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-row gap-2 w-full">
            {/* Snap Photo Card */}
            <div className="flex-1">
              <Card className="relative overflow-hidden shadow-lg cursor-pointer h-full border-none">
                {/* Info button with Dialog */}
                <div className="absolute top-2 right-2 z-20">
                  <InfoTooltip 
                    title="AI Food Detection"
                    description="Take a picture of your food and our AI will detect what you're eating and calculate the nutritional information"
                    color="from-purple-800/95 to-fuchsia-700/95"
                  />
                </div>
                
                {/* Elegant gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-200/90 via-purple-200/90 to-pink-200/90 dark:from-fuchsia-800/50 dark:via-purple-800/50 dark:to-pink-800/50"></div>
                
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 rounded-full translate-y-1/2 -translate-x-1/3 blur-xl"></div>
                
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-5 mix-blend-overlay" 
                     style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.5\" fill-rule=\"evenodd\"%3E%3Ccircle cx=\"3\" cy=\"3\" r=\"1\"%2F%3E%3Ccircle cx=\"13\" cy=\"13\" r=\"1\"%2F%3E%3C%2Fg%3E%3C/svg%3E')"}}></div>
                
                <Link href="/log-food/photo" passHref>
                  <CardContent className="relative flex flex-col items-center text-center gap-2 p-4 z-10">
                    <div className="p-3 rounded-full bg-white/30 flex items-center justify-center shadow-sm">
                      <Image src="/images/camera.png" alt="Camera" width={30} height={30} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-purple-800 dark:text-purple-100">Snap</h3>
                      {/* <p className="text-purple-700/80 dark:text-purple-200/80 text-xs">Take a photo</p> */}
                    </div>
                  </CardContent>
                </Link>
              </Card>
            </div>
            
            {/* Upload Image Card */}
            <div className="flex-1">
              <Card className="relative overflow-hidden shadow-lg cursor-pointer h-full border-none">
                {/* Info button with Dialog */}
                <div className="absolute top-2 right-2 z-20">
                  <InfoTooltip 
                    title="Image Analysis"
                    description="Upload photos of your meals and our system will analyze them to extract nutritional information automatically"
                    color="from-blue-800/95 to-sky-700/95"
                  />
                </div>
                
                {/* Elegant gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-200/90 via-sky-200/90 to-cyan-200/90 dark:from-blue-800/50 dark:via-sky-800/50 dark:to-cyan-800/50"></div>
                
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 rounded-full translate-y-1/2 -translate-x-1/3 blur-xl"></div>
                
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-5 mix-blend-overlay" 
                     style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.5\" fill-rule=\"evenodd\"%3E%3Ccircle cx=\"3\" cy=\"3\" r=\"1\"%2F%3E%3Ccircle cx=\"13\" cy=\"13\" r=\"1\"%2F%3E%3C%2Fg%3E%3C/svg%3E')"}}></div>
                
                <Link href="/log-food/photo" passHref>
                  <CardContent className="relative flex flex-col items-center text-center gap-2 p-4 z-10">
                    <div className="p-3 rounded-full bg-white/30 flex items-center justify-center shadow-sm">
                      <Image src="/images/upload.png" alt="Upload" width={30} height={30} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-blue-800 dark:text-blue-100">Upload</h3>
                      {/* <p className="text-blue-700/80 dark:text-blue-200/80 text-xs">Upload picture</p> */}
                    </div>
                  </CardContent>
                </Link>
              </Card>
            </div>
             
            {/* Manual Entry Card */}
            <div className="flex-1">
              <Card className="relative overflow-hidden shadow-lg cursor-pointer h-full border-none">
                {/* Info button with Dialog */}
                <div className="absolute top-2 right-2 z-20">
                  <InfoTooltip 
                    title="Custom Food Entry"
                    description="Manually log food items with precise measurements and access our extensive database of nutritional information"
                    color="from-emerald-800/95 to-green-700/95"
                  />
                </div>
                
                {/* Elegant gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-200/90 via-green-200/90 to-teal-200/90 dark:from-emerald-800/50 dark:via-green-800/50 dark:to-teal-800/50"></div>
                
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 rounded-full translate-y-1/2 -translate-x-1/3 blur-xl"></div>
                
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-5 mix-blend-overlay" 
                     style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.5\" fill-rule=\"evenodd\"%3E%3Ccircle cx=\"3\" cy=\"3\" r=\"1\"%2F%3E%3Ccircle cx=\"13\" cy=\"13\" r=\"1\"%2F%3E%3C%2Fg%3E%3C/svg%3E')"}}></div>
                
                <Link href="/log-food/manual" passHref>
                  <CardContent className="relative flex flex-col items-center text-center gap-2 p-4 z-10">
                    <div className="p-3 rounded-full bg-white/30 flex items-center justify-center shadow-sm">
                      <Image src="/images/manual.png" alt="Manual" width={30} height={30} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-emerald-800 dark:text-emerald-100">Manual</h3>
                      {/* <p className="text-emerald-700/80 dark:text-emerald-200/80 text-xs">Log details</p> */}
                    </div>
                  </CardContent>
                </Link>
              </Card>
            </div>
          </div>
        )}
      </motion.div>

      {/* Today's Summary - Completely redesigned */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
        className="mt-8"
      >
        <div className="flex items-center gap-3 mb-5">
          <motion.div
            className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-300 to-indigo-400 dark:from-blue-500 dark:to-indigo-600 flex items-center justify-center shadow-md"
            animate={{ 
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <BarChart2 className="h-5 w-5 text-white" />
          </motion.div>
          <h2 className="text-xl font-bold">Nutrition Overview</h2>
        </div>
        
         {isDataLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
              <Skeleton key={`skel-summary-${i}`} className="h-32 rounded-xl bg-muted/30" />
            ))}
          </div>
        ) : (
          <Card className="p-6 shadow-lg border-none rounded-2xl overflow-hidden relative">
            {/* Elegant gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/10"></div>
            
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-10 mix-blend-overlay" 
                 style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23667eea\" fill-opacity=\"0.3\" fill-rule=\"evenodd\"%3E%3Ccircle cx=\"3\" cy=\"3\" r=\"1\"%2F%3E%3Ccircle cx=\"13\" cy=\"13\" r=\"1\"%2F%3E%3C%2Fg%3E%3C/svg%3E')"}}></div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.45 }}
                className="flex flex-col justify-between"
              >
                <div className="mb-3">
                  <span className="text-sm font-medium text-muted-foreground">Calories</span>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 dark:from-amber-300 dark:to-orange-300 bg-clip-text text-transparent">
                    {Math.round(todayCalories)}
                  </h3>
                  <span className="text-xs text-muted-foreground">kcal</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20">
                    <Flame className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                  </div>
                  <div className="h-1.5 flex-1 rounded-full overflow-hidden bg-muted/60">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: goalCalories > 0 ? `${Math.min((todayCalories / goalCalories) * 100, 100)}%` : '10%' }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 dark:from-amber-400 dark:to-orange-400 ${todayCalories === 0 ? 'opacity-30' : ''}`}
                    />
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="flex flex-col justify-between"
              >
                <div className="mb-3">
                  <span className="text-sm font-medium text-muted-foreground">Carbs</span>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-sky-400 dark:from-blue-300 dark:to-sky-300 bg-clip-text text-transparent">
                    {Math.round(todayCarbs)}
                  </h3>
                  <span className="text-xs text-muted-foreground">grams</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-gradient-to-r from-blue-100 to-sky-100 dark:from-blue-900/20 dark:to-sky-900/20">
                    <Wheat className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                  </div>
                  <div className="h-1.5 flex-1 rounded-full overflow-hidden bg-muted/60">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: todayCarbs > 0 ? '60%' : '10%' }}
                      transition={{ duration: 1, delay: 0.6 }}
                      className={`h-full rounded-full bg-gradient-to-r from-blue-400 to-sky-400 dark:from-blue-400 dark:to-sky-400 ${todayCarbs === 0 ? 'opacity-30' : ''}`}
                    />
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.55 }}
                className="flex flex-col justify-between"
              >
                <div className="mb-3">
                  <span className="text-sm font-medium text-muted-foreground">Protein</span>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 dark:from-violet-300 dark:to-purple-300 bg-clip-text text-transparent">
                    {Math.round(todayProtein)}
                  </h3>
                  <span className="text-xs text-muted-foreground">grams</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20">
                    <Drumstick className="h-5 w-5 text-violet-500 dark:text-violet-400" />
                  </div>
                  <div className="h-1.5 flex-1 rounded-full overflow-hidden bg-muted/60">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: todayProtein > 0 ? '75%' : '10%' }}
                      transition={{ duration: 1, delay: 0.7 }}
                      className={`h-full rounded-full bg-gradient-to-r from-violet-400 to-purple-400 dark:from-violet-400 dark:to-purple-400 ${todayProtein === 0 ? 'opacity-30' : ''}`}
                    />
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                className="flex flex-col justify-between"
              >
                <div className="mb-3">
                  <span className="text-sm font-medium text-muted-foreground">Fat</span>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 dark:from-pink-300 dark:to-rose-300 bg-clip-text text-transparent">
                    {Math.round(todayFat)}
                  </h3>
                  <span className="text-xs text-muted-foreground">grams</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20">
                    <Droplets className="h-5 w-5 text-pink-500 dark:text-pink-400" />
                  </div>
                  <div className="h-1.5 flex-1 rounded-full overflow-hidden bg-muted/60">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: todayFat > 0 ? '40%' : '10%' }}
                      transition={{ duration: 1, delay: 0.8 }}
                      className={`h-full rounded-full bg-gradient-to-r from-pink-400 to-rose-400 dark:from-pink-400 dark:to-rose-400 ${todayFat === 0 ? 'opacity-30' : ''}`}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </Card>
        )}
      </motion.div>

      {/* Meal Log - Completely redesigned */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
        className="mt-8"
      >
        <div className="flex justify-between items-center mb-5">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.div
              className="h-9 w-9 rounded-full bg-gradient-to-r from-rose-300 to-pink-300 dark:from-rose-500 dark:to-pink-500 flex items-center justify-center shadow-md"
              animate={{ 
                rotate: [0, 5, 0, -5, 0],
                scale: [1, 1.05, 1, 1.05, 1]
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            >
              <Utensils className="h-5 w-5 text-white" />
            </motion.div>
            <motion.h2 
              className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-pink-500 dark:from-rose-400 dark:to-pink-400 relative overflow-hidden"
              initial={{ opacity: 1 }}
            >
              Food Journal
              <motion.span 
                className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ 
                  x: ['-100%', '200%']
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 5,
                  ease: "easeInOut"
                }}
                style={{ mixBlendMode: 'overlay' }}
              />
            </motion.h2>
          </motion.div>
          
          <Link href="/log-food/photo" passHref>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: [0.8, 1.05, 1],
                y: [10, -5, 0]
              }}
              transition={{ 
                duration: 0.5,
                delay: 0.8,
                type: "spring"
              }}
            >
              <Button 
                variant="default" 
                size="sm" 
                className="text-sm bg-gradient-to-r from-rose-300 to-pink-300 hover:from-rose-400 hover:to-pink-400 dark:from-rose-500 dark:to-pink-500 text-rose-950 dark:text-white border-none shadow-md hover:shadow-lg hover:opacity-90 px-4 rounded-full"
              >
                <motion.span 
                  className="flex items-center gap-1.5"
                  initial={{ opacity: 1 }}
                  whileHover={{ 
                    x: [0, 2, 0],
                    transition: { repeat: Infinity, duration: 1 }
                  }}
                >
                  <motion.div
                    animate={{
                      rotate: [0, 0, 180, 180, 0],
                      scale: [1, 1, 1.2, 1, 1]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 5
                    }}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </motion.div>
                  Add Meal
                </motion.span>
              </Button>
            </motion.div>
          </Link>
        </div>
        
        {isLoadingLog ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <motion.div 
                key={`skel-meal-${i}`}
                initial={{ opacity: 0.5, y: 10 }}
                animate={{ 
                  opacity: [0.5, 0.8, 0.5],
                  y: 0
                }}
                transition={{ 
                  opacity: { repeat: Infinity, duration: 1.5 },
                  y: { duration: 0.3 }
                }}
              >
                <Skeleton className="h-24 w-full rounded-xl bg-muted/30" />
              </motion.div>
            ))}
          </div>
        ) : foodEntries.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {displayedFoodEntries.map((entry: LoggedFoodEntry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: 0.5 + (index * 0.1),
                    type: "spring",
                    stiffness: 100
                  }}
                  layout
                  whileHover={{ 
                    scale: 1.02, 
                    y: -2,
                    transition: { duration: 0.2 }
                  }}
                >
                  <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden rounded-xl relative">
                    {/* Gradient border on the left */}
                    <motion.div 
                      className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-rose-300 to-pink-300 dark:from-rose-500 dark:to-pink-500"
                      initial={{ height: 0 }}
                      animate={{ height: '100%' }}
                      transition={{ duration: 0.5, delay: 0.6 + (index * 0.1) }}
                    />
                    
                    {/* Light background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-50/80 to-pink-50/80 dark:from-rose-950/5 dark:to-pink-950/5 opacity-60"></div>
                    
                    <CardContent className="p-4 sm:p-5 relative">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <motion.h3 
                            className="text-lg font-bold truncate title-poppins" 
                            title={entry.name}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.7 + (index * 0.1) }}
                          >
                            {entry.name}
                          </motion.h3>
                          
                          <div className="mt-3 flex flex-wrap gap-2 sm:gap-4">
                            <motion.div 
                              className="flex items-center gap-1.5"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: 0.8 + (index * 0.1) }}
                              whileHover={{ scale: 1.05, y: -2 }}
                            >
                              <motion.div 
                                className="p-1.5 rounded-full bg-rose-100/80 dark:bg-rose-900/20"
                                whileHover={{ rotate: [-5, 5, 0], transition: { duration: 0.5 } }}
                              >
                                <Flame className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                              </motion.div>
                              <div>
                                <div className="text-sm font-medium text-rose-600 dark:text-rose-400">
                                  {Math.round(entry.calories)}
                                </div>
                                <div className="text-xs text-muted-foreground">kcal</div>
                              </div>
                            </motion.div>
                            
                            <motion.div 
                              className="flex items-center gap-1.5"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: 0.85 + (index * 0.1) }}
                              whileHover={{ scale: 1.05, y: -2 }}
                            >
                              <motion.div 
                                className="p-1.5 rounded-full bg-violet-100/80 dark:bg-violet-900/20"
                                whileHover={{ rotate: [-5, 5, 0], transition: { duration: 0.5 } }}
                              >
                                <Drumstick className="h-4 w-4 text-violet-500 dark:text-violet-400" />
                              </motion.div>
                              <div>
                                <div className="text-sm font-medium text-violet-600 dark:text-violet-400">
                                  {Math.round(entry.protein)}g
                                </div>
                                <div className="text-xs text-muted-foreground">protein</div>
                              </div>
                            </motion.div>
                            
                            <motion.div 
                              className="flex items-center gap-1.5"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: 0.9 + (index * 0.1) }}
                              whileHover={{ scale: 1.05, y: -2 }}
                            >
                              <motion.div 
                                className="p-1.5 rounded-full bg-pink-100/80 dark:bg-pink-900/20"
                                whileHover={{ rotate: [-5, 5, 0], transition: { duration: 0.5 } }}
                              >
                                <Droplets className="h-4 w-4 text-pink-500 dark:text-pink-400" />
                              </motion.div>
                              <div>
                                <div className="text-sm font-medium text-pink-600 dark:text-pink-400">
                                  {Math.round(entry.fat)}g
                                </div>
                                <div className="text-xs text-muted-foreground">fat</div>
                              </div>
                            </motion.div>
                            
                            <motion.div 
                              className="flex items-center gap-1.5"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: 0.95 + (index * 0.1) }}
                              whileHover={{ scale: 1.05, y: -2 }}
                            >
                              <motion.div 
                                className="p-1.5 rounded-full bg-blue-100/80 dark:bg-blue-900/20"
                                whileHover={{ rotate: [-5, 5, 0], transition: { duration: 0.5 } }}
                              >
                                <Wheat className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                              </motion.div>
                              <div>
                                <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                  {Math.round(entry.carbs)}g
                                </div>
                                <div className="text-xs text-muted-foreground">carbs</div>
                              </div>
                            </motion.div>
                          </div>
                        </div>
                        
                        <motion.div
                          whileHover={{ rotate: 15, scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-full"
                            onClick={() => deleteFoodEntry(entry.id)}
                            aria-label="Delete meal"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {foodEntries.length > 3 && (
              <motion.div 
                className="text-center mt-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 1 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                <Button 
                  variant="outline" 
                  onClick={() => setShowAllMeals(!showAllMeals)}
                  className="px-6 rounded-full border-rose-200 dark:border-rose-800/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 shadow-sm"
                >
                  <motion.span
                    animate={{
                      x: showAllMeals ? [-2, 0, -2] : [2, 0, 2]
                    }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    {showAllMeals ? "View Less" : "View More"}
                  </motion.span>
                </Button>
                </motion.div>
              </motion.div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5, type: "spring" }}
          >
            <Card className="border-none shadow-lg rounded-xl overflow-hidden text-center py-10 px-6 relative">
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-rose-50/80 to-pink-50/80 dark:from-rose-950/5 dark:to-pink-950/5"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.6, 0.8, 0.6] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              <motion.div
                className="relative z-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <motion.div
                  className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-rose-300 to-pink-300 dark:from-rose-500 dark:to-pink-500 rounded-full flex items-center justify-center shadow-lg"
                  animate={{ 
                    scale: [1, 1.05, 1],
                    y: [0, -5, 0]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  <Camera className="h-10 w-10 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-pink-500 dark:from-rose-400 dark:to-pink-400">No meals logged yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Track what you eat to get insights about your nutrition for{" "}
                  <motion.span
                    className="font-medium"
                    animate={{ 
                      color: ['hsl(var(--foreground))', 'hsl(var(--primary))', 'hsl(var(--foreground))'] 
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {currentSelectedDate
                      ? isToday(currentSelectedDate)
                        ? "today"
                        : format(currentSelectedDate, "MMM d, yyyy")
                      : "the selected date"}
                  </motion.span>
                </p>
                <motion.div
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="bg-gradient-to-r from-rose-300 to-pink-300 hover:from-rose-400 hover:to-pink-400 dark:from-rose-500 dark:to-pink-500 text-rose-950 dark:text-white border-none hover:opacity-90 rounded-full px-6 shadow-md"
                    asChild
                  >
                    <Link href="/log-food/photo">
                      <motion.span
                        className="flex items-center gap-2"
                        animate={{ x: [0, 3, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        Add Your First Meal
                        <ArrowRight className="h-4 w-4" />
                      </motion.span>
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
          </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Health Blogs Section - Completely redesigned */}
      <motion.div 
        className="mt-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5, type: "spring" }}
      >
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <motion.div
              className="h-9 w-9 rounded-full bg-gradient-to-r from-cyan-300 to-sky-300 dark:from-cyan-500 dark:to-sky-500 flex items-center justify-center shadow-md"
              initial={{ rotate: -5 }}
              animate={{ rotate: 5 }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
            >
              <BookOpen className="h-5 w-5 text-white" />
            </motion.div>
            <h2 className="text-xl font-bold">Health & Wellness</h2>
      </div>

          <Link href="/blog" passHref>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm font-medium text-sky-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/20"
              >
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </motion.div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {mockBlogData.slice(0, 2).map((blog, index) => (
              <motion.div
              key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: 0.6 + (index * 0.1),
                  type: "spring"
                }}
                whileHover={{ y: -5 }}
              >
                <Link href={blog.readMoreLink} passHref>
                  <Card className="overflow-hidden shadow-lg border-none h-full group">
                    <div className="relative h-44 w-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
                      <Image
                        src={blog.imageUrl}
                        alt={blog.title}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-700 group-hover:scale-110"
                        data-ai-hint={blog.imageHint || "health fitness"}
                      />
                      
                      {/* Category label */}
                      <div className="absolute top-4 left-4 z-20">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-white/90 text-sky-600">
                          {index % 2 === 0 ? "Nutrition" : "Fitness"}
                        </span>
        </div>
      </div>

                    <CardContent className="relative p-5 bg-gradient-to-br from-sky-50/90 to-cyan-50/90 dark:from-sky-950/10 dark:to-cyan-950/5">
                      {/* Visual indicator */}
                      <motion.div 
                        className="h-1 w-16 bg-gradient-to-r from-cyan-300 to-sky-300 dark:from-cyan-500 dark:to-sky-500 rounded-full mb-3"
                        initial={{ width: 0 }}
                        animate={{ width: "4rem" }}
                        transition={{ duration: 0.5, delay: 0.8 + (index * 0.1) }}
                      />
                      
                      <h3 className="text-lg font-bold line-clamp-2 group-hover:text-sky-600 transition-colors duration-200">
                        {blog.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
                        {blog.excerpt}
                      </p>
                      
                      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8 border-2 border-white">
                            <AvatarImage src={`https://placehold.co/200x200.png`} alt="Author" />
                            <AvatarFallback className="bg-sky-100 text-sky-600">{index % 2 === 0 ? "EW" : "MC"}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {index % 2 === 0 ? "Dr. Emma Wilson" : "Coach Mike Chen"}
                          </span>
        </div>
                        
                        <motion.div 
                          className="h-8 w-8 rounded-full flex items-center justify-center bg-white group-hover:bg-sky-100 shadow-sm"
                          whileHover={{ scale: 1.1 }}
                        >
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-sky-500" />
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {/* Related reading list */}
        <div className="mt-6">
          <Card className="border-none shadow-lg overflow-hidden">
            <CardHeader className="p-5 pb-3 bg-gradient-to-r from-sky-50/90 to-cyan-50/90 dark:from-sky-950/10 dark:to-cyan-950/5 border-b border-sky-100/80 dark:border-sky-900/10">
              <CardTitle className="text-md flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400"></span>
                More Reading
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-gradient-to-br from-sky-50/60 to-cyan-50/60 dark:from-sky-950/5 dark:to-cyan-950/5">
              <div className="divide-y divide-sky-100/80 dark:divide-sky-900/10">
                {mockBlogData.slice(2).map((blog, index) => (
                  <Link href={blog.readMoreLink} key={blog.id}>
                    <motion.div 
                      className="flex items-center gap-4 p-4 hover:bg-sky-50/80 dark:hover:bg-sky-950/10 transition-colors duration-200"
                      whileHover={{ x: 5 }}
                    >
                      <div className="h-12 w-12 rounded-md overflow-hidden relative flex-shrink-0 shadow-sm">
                        <Image
                          src={blog.imageUrl}
                          alt={blog.title}
                          layout="fill"
                          objectFit="cover"
                          data-ai-hint={blog.imageHint}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate text-foreground">{blog.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{blog.excerpt}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-sky-400 flex-shrink-0" />
                    </motion.div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Smart Insights - Completely redesigned */}
      <motion.div 
        className="mt-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6, type: "spring" }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ 
                boxShadow: [
                  "0 0 0 0 rgba(250, 204, 21, 0)",
                  "0 0 0 8px rgba(250, 204, 21, 0.12)",
                  "0 0 0 0 rgba(250, 204, 21, 0)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="h-9 w-9 rounded-full bg-gradient-to-r from-amber-200 to-yellow-300 dark:from-amber-400 dark:to-yellow-500 flex items-center justify-center shadow-md relative z-10"
              animate={{ 
                rotate: [0, 5, 0, -5, 0]
              }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              <Lightbulb className="h-5 w-5 text-amber-800 dark:text-white" />
            </motion.div>
          </div>
          <h2 className="text-xl font-bold">AI Nutrition Insights</h2>
        </div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          whileHover={{ y: -5 }}
          className="pb-1 px-0.5"
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-100/60 via-yellow-200/60 to-amber-100/60 dark:from-amber-400/20 dark:via-yellow-400/20 dark:to-amber-400/20 rounded-xl blur-md opacity-60" />
            <div className="relative z-10">
        <SmartInsights 
          goals={goals}
          dailyLog={dailyLog}
          currentSelectedDate={currentSelectedDate}
          previousLogs={previousLogs}
          loading={isDataLoading || isPreviousLogsLoading}
        />
      </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating Action Button for quick add */}
      <AnimatePresence>
        {showFAB && (
          <motion.div 
            className="fixed bottom-6 right-6 z-50"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Link href="/log-food/photo">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-300/80 to-pink-300/80 dark:from-purple-600/80 dark:to-pink-600/80 rounded-full opacity-75 group-hover:opacity-100 blur group-hover:blur-md transition-all duration-300"></div>
                <Button 
                  className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600 shadow-lg hover:shadow-xl hover:shadow-purple-300/20 dark:hover:shadow-purple-500/20 border-none text-indigo-950 dark:text-white relative"
                  size="icon"
                >
                  <PlusCircle className="h-6 w-6" />
                  <span className="sr-only">Add food</span>
                </Button>
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
