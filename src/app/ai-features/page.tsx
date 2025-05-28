"use client";

import React, { useState, type FormEvent, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Bell,
  Camera,
  UploadCloud,
  FilePenLine,
  Wheat,
  Drumstick,
 
} from "lucide-react";
import { 
  Sparkles, Loader2, AlertCircle, ListChecks, Utensils, Dumbbell, Droplets, 
  BedDouble, Brain, Info, BarChart3, Edit3, CalendarDays, ChevronDown,

  Zap, ArrowRight, Heart, Award, Lightbulb, Clock, Salad, Flame, User, Check, Printer
} from "lucide-react";
import { generateHealthSchedule, type GenerateHealthScheduleInput, type GenerateHealthScheduleOutput } from "@/ai/flows/generate-health-schedule-flow";
import { summarizeDailyLog, type SummarizeDailyLogInput, type SummarizeDailyLogOutput } from "@/ai/flows/summarize-daily-log-flow";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useDailyLog } from "@/hooks/use-daily-log";
import { useGoals } from "@/hooks/use-goals";
import type { FoodEntryShort } from "@/types";
import { format, isToday } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Animated card component with hover effects
const AnimatedCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = "", delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay 
      }}
      whileHover={{ 
        y: -5,
        boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.1)"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Floating badge component
const FloatingBadge: React.FC<{
  children: React.ReactNode;
  color?: string;
  icon?: React.ReactElement;
}> = ({ children, color = "primary", icon }) => {
  return (
    <div className="relative">
      <div className={`absolute -top-2 -right-2 p-1 rounded-full bg-${color} text-white shadow-lg`}>
        {icon || <Check className="h-3 w-3" />}
      </div>
      {children}
    </div>
  );
};

// Pulse animation for highlighting elements
const PulseEffect: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="relative">
      <motion.div 
        className="absolute inset-0 rounded-full bg-primary"
        animate={{ 
          opacity: [0.2, 0.5, 0.2],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{ 
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut"
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

const activityLevels = [
  { value: "sedentary", label: "Sedentary (little or no exercise)" },
  { value: "lightly_active", label: "Lightly Active (light exercise/sports 1-3 days/week)" },
  { value: "moderately_active", label: "Moderately Active (moderate exercise/sports 3-5 days/week)" },
  { value: "very_active", label: "Very Active (hard exercise/sports 6-7 days a week)" },
  { value: "extra_active", label: "Extra Active (very hard exercise/sports & physical job)" },
];

const weightGoalTypes = [
  { value: "lose_weight", label: "Lose Weight" },
  { value: "maintain_weight", label: "Maintain Weight" },
  { value: "gain_muscle", label: "Gain Muscle" },
  { value: "general_health", label: "Improve General Health" },
];

const allDietaryPreferences = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten_free", label: "Gluten-Free" },
  { id: "dairy_free", label: "Dairy-Free" },
  { id: "nut_free", label: "Nut-Free" },
  { id: "low_carb", label: "Low Carb" },
  { id: "keto", label: "Keto" },
  { id: "paleo", label: "Paleo" },
];

const primaryFocusOptions = [
    { value: "general_health", label: "General Health & Wellness" },
    { value: "strength_training", label: "Strength Training" },
    { value: "muscle_gain", label: "Muscle Gain" },
    { value: "weight_loss", label: "Weight Loss" },
    { value: "endurance_training", label: "Endurance Training (e.g., running, cycling)" },
    { value: "stress_reduction", label: "Stress Reduction & Mental Wellbeing" },
    { value: "improved_sleep", label: "Improved Sleep Quality" },
    { value: "flexibility_mobility", label: "Flexibility & Mobility" },
];

const ScheduleSection: React.FC<{ 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode; 
  className?: string;
  color?: string;
  expandable?: boolean;
}> = React.memo(({ 
  title, 
  icon: Icon, 
  children, 
  className = "",
  color = "primary",
  expandable = false
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Generate a lighter background color based on the theme color
  const bgColorClass = color === "primary" ? "bg-primary/5" : 
                      color === "red" ? "bg-red-50 dark:bg-red-950/20" :
                      color === "blue" ? "bg-blue-50 dark:bg-blue-950/20" :
                      color === "green" ? "bg-green-50 dark:bg-green-950/20" :
                      color === "yellow" ? "bg-yellow-50 dark:bg-yellow-950/20" :
                      color === "purple" ? "bg-purple-50 dark:bg-purple-950/20" :
                      "bg-primary/5";
                      
  const textColorClass = color === "primary" ? "text-primary" : 
                       color === "red" ? "text-red-600 dark:text-red-400" :
                       color === "blue" ? "text-blue-600 dark:text-blue-400" :
                       color === "green" ? "text-green-600 dark:text-green-400" :
                       color === "yellow" ? "text-yellow-600 dark:text-yellow-400" :
                       color === "purple" ? "text-purple-600 dark:text-purple-400" :
                       "text-primary";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`rounded-xl border shadow-sm overflow-hidden backdrop-blur-sm ${className}`}
    >
      <div 
        className={`p-4 flex items-center justify-between ${bgColorClass} border-b`}
        onClick={() => expandable && setIsExpanded(!isExpanded)}
        style={{ cursor: expandable ? 'pointer' : 'default' }}
      >
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm ${textColorClass}`}>
            <Icon className="h-5 w-5" />
          </div>
          <h3 className={`text-lg font-semibold ${textColorClass}`}>{title}</h3>
        </div>
        
        {expandable && (
          <motion.div
            animate={{ rotate: isExpanded ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          </motion.div>
        )}
      </div>
      
      <AnimatePresence initial={false}>
        {(!expandable || isExpanded) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4 text-sm">
        {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
ScheduleSection.displayName = 'ScheduleSection';


export default function AiFeaturesPage() {
  const [formState, setFormState] = useState<GenerateHealthScheduleInput>({
    calorieGoal: 2000,
    proteinGoal: 150,
    fatGoal: 70,
    carbGoal: 200,
    weightGoalType: "maintain_weight",
    activityLevel: "moderately_active",
    dietaryPreferences: [],
    primaryFocus: "general_health",
    sleepHoursGoal: 8,
  });
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<GenerateHealthScheduleOutput | null>(null);
  
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummarizeDailyLogOutput | null>(null);
  const [summaryDate, setSummaryDate] = useState<Date | undefined>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("planner");

  const { toast } = useToast();
  const { getLogDataForDate, isLoading: isLoadingDailyLog } = useDailyLog(); 
  const { goals, isLoading: isLoadingGoals } = useGoals();

  useEffect(() => {
    // Initialize summaryDate to today on client side
    setSummaryDate(new Date());
  }, []);

  // Pre-fill form with goals from hook when goals are loaded
   useEffect(() => {
    if (goals && !isLoadingGoals) {
      setFormState(prev => ({
        ...prev,
        calorieGoal: goals.calories,
        proteinGoal: goals.protein,
        fatGoal: goals.fat,
        carbGoal: goals.carbs,
      }));
    }
  }, [goals, isLoadingGoals]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value,
    }));
  };

  const handleSelectChange = (name: keyof GenerateHealthScheduleInput, value: string) => {
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleDietaryPreferenceChange = (preferenceId: string, checked: boolean | "indeterminate") => {
    if (typeof checked === 'boolean') {
        setFormState(prev => {
        const currentPrefs = prev.dietaryPreferences || [];
        if (checked) {
            return { ...prev, dietaryPreferences: [...currentPrefs, preferenceId] };
        } else {
            return { ...prev, dietaryPreferences: currentPrefs.filter(p => p !== preferenceId) };
        }
        });
    }
  };

  const handleGenerateScheduleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoadingSchedule(true);
    setScheduleError(null);
    setSchedule(null);

    try {
      if (formState.calorieGoal <= 0) {
        throw new Error("Calorie goal must be greater than 0.");
      }
      const result = await generateHealthSchedule(formState);
      setSchedule(result);
      toast({
        title: "Health Schedule Generated!",
        description: "Your personalized plan is ready below.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setScheduleError(errorMessage);
      toast({
        title: "Error Generating Schedule",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingSchedule(false);
    }
  };

  const handleGenerateSummary = async () => {
    setIsLoadingSummary(true);
    setSummaryError(null);
    setSummary(null);

    if (!summaryDate) {
      setSummaryError("No date selected for summary. Please select a date.");
      toast({
        title: "Date Not Selected",
        description: "Please select a date to generate the summary.",
        variant: "destructive",
      });
      setIsLoadingSummary(false);
      return;
    }
    
    // Fetch log data for the specific summaryDate using the updated synchronous hook
    const { entries: foodEntriesForSummary } = getLogDataForDate(summaryDate);


    if (foodEntriesForSummary.length === 0) {
       toast({
        title: "No Food Logged",
        description: `No food items have been logged for ${format(summaryDate, "MMM d, yyyy")}. Summary cannot be generated.`,
        variant: "default" // Changed to default as it's informational
      });
      setIsLoadingSummary(false);
      return;
    }

    const shortFoodEntries: FoodEntryShort[] = foodEntriesForSummary.map(entry => ({
      name: entry.name,
      calories: entry.calories,
      protein: entry.protein,
      fat: entry.fat,
      carbs: entry.carbs,
    }));

    const input: SummarizeDailyLogInput = {
      foodEntries: shortFoodEntries,
      userGoals: {
        calories: goals.calories,
        protein: goals.protein,
        fat: goals.fat,
        carb: goals.carbs, // Corrected from carbGoal
      },
      date: format(summaryDate, "MMM d, yyyy"),
    };

    try {
      const result = await summarizeDailyLog(input);
      setSummary(result);
      toast({
        title: "Daily Summary Generated!",
        description: `AI analysis for ${result.date} is ready.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setSummaryError(errorMessage);
      toast({
        title: "Error Generating Summary",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingSummary(false);
    }
  };

   if (isLoadingGoals || isLoadingDailyLog) { // Check if initial goals or daily log data is loading
    return (
      <div className="container mx-auto py-8 px-4 space-y-10">
        <Card className="w-full mx-auto shadow-xl">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-48" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-10">
      {/* Header with tabs */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl -z-10" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                AI Health Assistant
              </span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Personalized health planning and nutrition analysis powered by AI
            </p>
          </div>
          
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full md:w-auto"
          >
            <TabsList className="grid w-full md:w-auto grid-cols-2">
              <TabsTrigger value="planner" className="flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                <span className="hidden sm:inline">Health Planner</span>
                <span className="sm:hidden">Planner</span>
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Food Summary</span>
                <span className="sm:hidden">Summary</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent value="planner" className="mt-0 space-y-8">
      {/* AI Health Planner Section */}
          <AnimatedCard>
            <Card className="w-full mx-auto shadow-xl overflow-hidden border-t-4 border-t-primary">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/20 rounded-full">
                    <Edit3 className="h-6 w-6 text-primary" />
          </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">Personalized AI Health Planner</CardTitle>
                    <CardDescription className="mt-1">
                      Create your tailored daily health schedule with AI assistance
          </CardDescription>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-lg flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    Fill in your details below, and our AI will generate a comprehensive health plan tailored to your specific needs and goals.
                  </p>
                </div>
        </CardHeader>
              
        <form onSubmit={handleGenerateScheduleSubmit}>
                <CardContent className="space-y-6 p-6">
                  <Accordion type="multiple" className="w-full space-y-4" defaultValue={["goals-macros"]}>
                    <AccordionItem value="goals-macros" className="border rounded-lg overflow-hidden shadow-sm">
                      <AccordionTrigger className="text-lg font-medium hover:no-underline px-4 py-3 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300">
                        <div className="flex items-center gap-2">
                          <Flame className="h-5 w-5" />
                          <span>Nutritional Goals & Macros</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 px-4 pb-4 bg-blue-50/30 dark:bg-blue-950/10 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                            <Label htmlFor="calorieGoal" className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                              <Flame className="h-4 w-4" />
                              Daily Calorie Goal (kcal)
                            </Label>
                            <Input 
                              type="number" 
                              name="calorieGoal" 
                              id="calorieGoal" 
                              value={formState.calorieGoal} 
                              onChange={handleInputChange} 
                              className="mt-1 border-blue-200 dark:border-blue-800/50 focus-visible:ring-blue-500" 
                            />
                    </div>
                    <div>
                            <Label htmlFor="proteinGoal" className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                              <Drumstick className="h-4 w-4" />
                              Daily Protein Goal (g)
                            </Label>
                            <Input 
                              type="number" 
                              name="proteinGoal" 
                              id="proteinGoal" 
                              value={formState.proteinGoal} 
                              onChange={handleInputChange} 
                              className="mt-1 border-blue-200 dark:border-blue-800/50 focus-visible:ring-blue-500" 
                            />
                    </div>
                    <div>
                            <Label htmlFor="fatGoal" className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                              <Droplets className="h-4 w-4" />
                              Daily Fat Goal (g)
                            </Label>
                            <Input 
                              type="number" 
                              name="fatGoal" 
                              id="fatGoal" 
                              value={formState.fatGoal} 
                              onChange={handleInputChange} 
                              className="mt-1 border-blue-200 dark:border-blue-800/50 focus-visible:ring-blue-500" 
                            />
                    </div>
                    <div>
                            <Label htmlFor="carbGoal" className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                              <Wheat className="h-4 w-4" />
                              Daily Carb Goal (g)
                            </Label>
                            <Input 
                              type="number" 
                              name="carbGoal" 
                              id="carbGoal" 
                              value={formState.carbGoal} 
                              onChange={handleInputChange} 
                              className="mt-1 border-blue-200 dark:border-blue-800/50 focus-visible:ring-blue-500" 
                            />
                          </div>
                        </div>
                </AccordionContent>
              </AccordionItem>

                    <AccordionItem value="lifestyle" className="border rounded-lg overflow-hidden shadow-sm">
                      <AccordionTrigger className="text-lg font-medium hover:no-underline px-4 py-3 bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          <span>Lifestyle & Preferences</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 px-4 pb-4 bg-purple-50/30 dark:bg-purple-950/10 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                            <Label htmlFor="weightGoalType" className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                              <Award className="h-4 w-4" />
                              Primary Weight/Health Goal
                            </Label>
                            <Select 
                              name="weightGoalType" 
                              value={formState.weightGoalType} 
                              onValueChange={(value) => handleSelectChange("weightGoalType", value)}
                            >
                              <SelectTrigger className="mt-1 border-purple-200 dark:border-purple-800/50 focus:ring-purple-500">
                                <SelectValue placeholder="Select goal" />
                              </SelectTrigger>
                      <SelectContent>
                        {weightGoalTypes.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                          
                  <div>
                            <Label htmlFor="activityLevel" className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                              <Dumbbell className="h-4 w-4" />
                              Activity Level
                            </Label>
                            <Select 
                              name="activityLevel" 
                              value={formState.activityLevel} 
                              onValueChange={(value) => handleSelectChange("activityLevel", value)}
                            >
                              <SelectTrigger className="mt-1 border-purple-200 dark:border-purple-800/50 focus:ring-purple-500">
                                <SelectValue placeholder="Select activity level" />
                              </SelectTrigger>
                      <SelectContent>
                        {activityLevels.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                          
                  <div>
                            <Label htmlFor="primaryFocus" className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                              <Heart className="h-4 w-4" />
                              Primary Fitness/Health Focus
                            </Label>
                            <Select 
                              name="primaryFocus" 
                              value={formState.primaryFocus} 
                              onValueChange={(value) => handleSelectChange("primaryFocus", value)}
                            >
                              <SelectTrigger className="mt-1 border-purple-200 dark:border-purple-800/50 focus:ring-purple-500">
                                <SelectValue placeholder="Select primary focus" />
                              </SelectTrigger>
                        <SelectContent>
                            {primaryFocusOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                  </div>
                          
                   <div>
                            <Label htmlFor="sleepHoursGoal" className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                              <BedDouble className="h-4 w-4" />
                              Target Sleep Hours
                            </Label>
                            <Input 
                              type="number" 
                              name="sleepHoursGoal" 
                              id="sleepHoursGoal" 
                              value={formState.sleepHoursGoal || ''} 
                              onChange={handleInputChange} 
                              placeholder="e.g., 8" 
                              className="mt-1 border-purple-200 dark:border-purple-800/50 focus-visible:ring-purple-500" 
                              min="0" 
                              max="16" 
                            />
                    </div>
                        </div>
                        
                        <div className="pt-2">
                          <Label className="flex items-center gap-2 text-purple-700 dark:text-purple-300 mb-2">
                            <Salad className="h-4 w-4" />
                            Dietary Preferences/Restrictions
                          </Label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                      {allDietaryPreferences.map(pref => (
                              <div 
                                key={pref.id} 
                                className={`flex items-center space-x-2 p-3 border rounded-md transition-colors ${
                                  formState.dietaryPreferences?.includes(pref.id) 
                                    ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700' 
                                    : 'bg-background border-border hover:bg-purple-50 dark:hover:bg-purple-950/10'
                                }`}
                              >
                          <Checkbox
                            id={`diet-${pref.id}`}
                            checked={formState.dietaryPreferences?.includes(pref.id)}
                            onCheckedChange={(checked) => handleDietaryPreferenceChange(pref.id, checked)}
                                  className="text-purple-600 border-purple-400 data-[state=checked]:bg-purple-600"
                                />
                                <Label 
                                  htmlFor={`diet-${pref.id}`} 
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {pref.label}
                                </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
                
                <CardFooter className="border-t pt-6 pb-6 bg-muted/30">
                  <div className="w-full flex flex-col sm:flex-row justify-between gap-4 items-center">
                    <p className="text-sm text-muted-foreground">
                      <Clock className="inline-block h-4 w-4 mr-1" />
                      Generation takes about 10-15 seconds
                    </p>
                    
                    <Button 
                      type="submit" 
                      disabled={isLoadingSchedule || isLoadingGoals}
                      className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
                    >
                      {isLoadingSchedule ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
              Generate My Health Schedule
                        </>
                      )}
            </Button>
                  </div>
          </CardFooter>
        </form>
      </Card>
          </AnimatedCard>

      {scheduleError && (
        <Alert variant="destructive" className="mt-6 w-full mx-auto animate-in fade-in-0 slide-in-from-bottom-3 duration-500">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{scheduleError}</AlertDescription>
        </Alert>
      )}

      {schedule && !isLoadingSchedule && (
            <AnimatedCard delay={0.2}>
              <Card className="w-full mx-auto shadow-xl border-t-4 border-t-green-500 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20 dark:to-transparent border-b">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <ListChecks className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-green-700 dark:text-green-400">
              {schedule.dailyScheduleTitle}
            </CardTitle>
                      {schedule.introduction && (
                        <CardDescription className="pt-1 text-sm">
                          {schedule.introduction}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 rounded-lg">
                    <div className="flex items-center justify-between text-sm text-green-800 dark:text-green-300 mb-2">
                      <span className="font-medium">Plan Overview</span>
                      <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                        {formState.weightGoalType.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-green-700 dark:text-green-400">
                        <Flame className="h-3.5 w-3.5" />
                        <span>{formState.calorieGoal} kcal</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-green-700 dark:text-green-400">
                        <Drumstick className="h-3.5 w-3.5" />
                        <span>{formState.proteinGoal}g protein</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-green-700 dark:text-green-400">
                        <Droplets className="h-3.5 w-3.5" />
                        <span>{formState.fatGoal}g fat</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-green-700 dark:text-green-400">
                        <Wheat className="h-3.5 w-3.5" />
                        <span>{formState.carbGoal}g carbs</span>
                      </div>
                    </div>
                  </div>
          </CardHeader>
                
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x">
                    <div className="p-5 space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-green-700 dark:text-green-400">
                        <Utensils className="h-5 w-5" />
                        Meal Plan & Timings
                      </h3>
                      
                      <div className="space-y-3">
                {schedule.mealTimingsAndPortions.map((meal, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index, duration: 0.3 }}
                            className="p-3 border border-green-200 dark:border-green-900/30 rounded-md bg-green-50/50 dark:bg-green-950/10 hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors"
                          >
                            <div className="flex justify-between items-center mb-1">
                              <h4 className="font-semibold text-green-700 dark:text-green-400">{meal.mealType}</h4>
                              <Badge variant="outline" className="text-xs bg-green-100/50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30 text-green-700 dark:text-green-400">
                                {meal.time}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{meal.suggestion}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-5 space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-green-700 dark:text-green-400">
                        <Dumbbell className="h-5 w-5" />
                        Workout Plan
                      </h3>
                      
                      <div className="p-4 border border-green-200 dark:border-green-900/30 rounded-md bg-green-50/50 dark:bg-green-950/10">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-green-700 dark:text-green-400">
                            {schedule.workoutSuggestion.workoutType}
                          </h4>
                          {schedule.workoutSuggestion.time && (
                            <Badge variant="outline" className="text-xs bg-green-100/50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30 text-green-700 dark:text-green-400">
                              {schedule.workoutSuggestion.time}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {schedule.workoutSuggestion.description}
                          </p>
                          
                          {schedule.workoutSuggestion.notes && (
                            <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-900/30 text-xs text-muted-foreground italic flex items-start gap-2">
                              <Info className="h-3.5 w-3.5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                              <span>{schedule.workoutSuggestion.notes}</span>
                            </div>
                          )}
                        </div>
            </div>

                      <h3 className="text-lg font-semibold flex items-center gap-2 text-green-700 dark:text-green-400 mt-6 pt-2">
                        <Brain className="h-5 w-5" />
                        Nutrient Balance Tip
                      </h3>
                      
                      <div className="p-4 border border-green-200 dark:border-green-900/30 rounded-md bg-green-50/50 dark:bg-green-950/10">
                        <p className="text-sm text-muted-foreground">{schedule.nutrientBalanceTip}</p>
                      </div>
                    </div>
                    
                    <div className="p-5 space-y-4">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold flex items-center gap-2 text-green-700 dark:text-green-400">
                            <Droplets className="h-5 w-5" />
                            Hydration Reminder
                          </h3>
                          
                          <div className="mt-2 p-4 border border-blue-200 dark:border-blue-900/30 rounded-md bg-blue-50/50 dark:bg-blue-950/10">
                            <p className="font-medium text-blue-700 dark:text-blue-400 mb-2">Target: {schedule.hydrationReminder.target}</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                              {schedule.hydrationReminder.tips.map((tip, i) => (
                                <motion.li 
                                  key={i}
                                  initial={{ opacity: 0, x: -5 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.1 * i, duration: 0.3 }}
                                >
                                  {tip}
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold flex items-center gap-2 text-green-700 dark:text-green-400">
                            <BedDouble className="h-5 w-5" />
                            Sleep Suggestion
                          </h3>
                          
                          <div className="mt-2 p-4 border border-purple-200 dark:border-purple-900/30 rounded-md bg-purple-50/50 dark:bg-purple-950/10">
                            <p className="font-medium text-purple-700 dark:text-purple-400 mb-2">Target: {schedule.sleepSuggestion.target}</p>
                            {schedule.sleepSuggestion.bedtimeRoutineTip && (
                              <p className="text-sm text-muted-foreground">{schedule.sleepSuggestion.bedtimeRoutineTip}</p>
                            )}
                          </div>
                        </div>

            {schedule.generalNotes && (
                          <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2 text-green-700 dark:text-green-400">
                              <Info className="h-5 w-5" />
                              General Notes
                            </h3>
                            
                            <div className="mt-2 p-4 border border-amber-200 dark:border-amber-900/30 rounded-md bg-amber-50/50 dark:bg-amber-950/10">
                              <p className="text-sm text-muted-foreground italic">{schedule.generalNotes}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
          </CardContent>
                
                <CardFooter className="bg-muted/30 p-4 border-t flex justify-center">
                  <Button 
                    variant="outline" 
                    className="text-green-700 dark:text-green-400 border-green-300 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/20"
                    onClick={() => {
                      window.print();
                    }}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print or Save This Plan
                  </Button>
                </CardFooter>
        </Card>
            </AnimatedCard>
      )}
        </TabsContent>

        <TabsContent value="summary" className="mt-0 space-y-8">
      {/* AI Daily Food Log Summary Section */}
          <AnimatedCard>
            <Card className="w-full mx-auto shadow-xl overflow-hidden border-t-4 border-t-blue-500">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">AI Daily Food Log Summary</CardTitle>
                    <CardDescription className="mt-1">
                      Get AI-powered analysis of your daily nutrition
          </CardDescription>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 rounded-lg flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Select a date below to analyze your food log entries. Our AI will provide personalized insights and suggestions based on your nutritional goals.
                  </p>
                </div>
        </CardHeader>
              
              <CardContent className="space-y-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="summaryDate" className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <CalendarDays className="h-4 w-4" />
                      Date for Summary
                    </Label>
                    
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal border-blue-200 dark:border-blue-800/50 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                  disabled={isLoadingDailyLog}
                >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-blue-500" />
                              {summaryDate ? (
                                <span className={isToday(summaryDate) ? "font-medium text-blue-600 dark:text-blue-400" : ""}>
                                  {format(summaryDate, "PPP")}
                                  {isToday(summaryDate) && (
                                    <Badge variant="outline" className="ml-2 text-[10px] py-0 h-4 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                                      Today
                                    </Badge>
                                  )}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">Pick a date</span>
                              )}
                            </div>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={summaryDate}
                  onSelect={(date) => {
                    setSummaryDate(date);
                    setIsCalendarOpen(false);
                  }}
                  initialFocus
                  disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
                          className="border border-blue-200 dark:border-blue-800/50 rounded-md"
                />
              </PopoverContent>
            </Popover>
                    
                    {!summaryDate && (
                      <p className="text-sm text-muted-foreground">
                        Please select a date for the summary.
                      </p>
                    )}
          </div>
                  
                  <div className="flex flex-col justify-end space-y-3">
                    <div className="text-sm text-muted-foreground">
                      <p className="flex items-center gap-2 mb-1">
                        <Sparkles className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-foreground">AI-Powered Analysis</span>
                      </p>
                      <p>Get personalized insights about your nutrition based on your food log entries.</p>
                    </div>
                    
                    <Button 
                      onClick={handleGenerateSummary} 
                      disabled={isLoadingSummary || !summaryDate || isLoadingGoals || isLoadingDailyLog}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                    >
                      {isLoadingSummary ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
            Generate Summary for {summaryDate ? format(summaryDate, "MMM d") : "Selected Date"}
                        </>
                      )}
          </Button>
                  </div>
                </div>
        </CardContent>
        
        {summaryError && (
                <CardFooter className="border-t pt-4 bg-red-50/50 dark:bg-red-950/10">
            <Alert variant="destructive" className="w-full">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Summary Error</AlertTitle>
              <AlertDescription>{summaryError}</AlertDescription>
            </Alert>
          </CardFooter>
        )}
            </Card>
          </AnimatedCard>

        {summary && !isLoadingSummary && (
            <AnimatedCard delay={0.2}>
              <Card className="w-full mx-auto shadow-xl border-t-4 border-t-blue-500 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent border-b">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                        <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <CardTitle className="text-xl font-bold text-blue-700 dark:text-blue-400">
                        Summary for {summary.date}
                      </CardTitle>
                    </div>
                    
                    <Badge variant="outline" className="bg-blue-100/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                      AI Analysis
                    </Badge>
            </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <div className="divide-y">
                    <div className="p-5">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-3">
                        <Info className="h-5 w-5" />
                        Overall Assessment
                      </h3>
                      
                      <div className="p-4 border border-blue-200 dark:border-blue-900/30 rounded-md bg-blue-50/50 dark:bg-blue-950/10">
                        <p className="text-muted-foreground">{summary.overallAssessment}</p>
                      </div>
            </div>
            
                    <div className="p-5">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-3">
                        <Utensils className="h-5 w-5" />
                        Consumed Items
                      </h3>
                      
                      <div className="p-4 border border-blue-200 dark:border-blue-900/30 rounded-md bg-blue-50/50 dark:bg-blue-950/10">
                        <p className="text-muted-foreground whitespace-pre-line">{summary.consumedItemsSummary}</p>
                      </div>
            </div>

                    <div className="p-5">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-3">
                        <ListChecks className="h-5 w-5" />
                        Nutritional Analysis
                      </h3>
                      
                      <div className="p-4 border border-blue-200 dark:border-blue-900/30 rounded-md bg-blue-50/50 dark:bg-blue-950/10">
                        <p className="text-muted-foreground whitespace-pre-line">{summary.nutritionalAnalysis}</p>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-3">
                        <Brain className="h-5 w-5" />
                        Actionable Suggestions
                      </h3>
                      
                      <div className="space-y-2">
                {summary.actionableSuggestions.map((suggestion, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index, duration: 0.3 }}
                            className="p-3 border border-blue-200 dark:border-blue-900/30 rounded-md bg-blue-50/50 dark:bg-blue-950/10 flex items-start gap-3"
                          >
                            <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full mt-0.5">
                              <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-sm text-muted-foreground">{suggestion}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="bg-muted/30 p-4 border-t">
                  <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                      <Info className="inline-block h-4 w-4 mr-1" />
                      Analysis based on your food log entries and nutritional goals
                    </p>
                    
                    <Button 
                      variant="outline" 
                      className="text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                      onClick={() => {
                        window.print();
                      }}
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Print or Save This Summary
                    </Button>
            </div>
          </CardFooter>
      </Card>
            </AnimatedCard>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
