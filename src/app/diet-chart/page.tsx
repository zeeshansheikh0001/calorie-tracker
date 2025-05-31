"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertCircle, Save, Download, Loader2, ListChecks, Utensils, Sparkles,
  Dumbbell, ChevronDown, Salad, User, ChefHat, Apple, Waves,
  Calendar, ArrowRight, CheckCircle2, Sandwich, Info, Star, Zap, 
  ArrowUpRight, Bot, GanttChart, Activity, ChevronUp, Eye, EyeOff
} from "lucide-react";
import { generateDietChart, type GenerateDietChartInput, type GenerateDietChartOutput } from "@/ai/flows/generate-diet-chart-flow";
import { motion, AnimatePresence, useScroll, useTransform, MotionValue } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Activity level options
const activityLevels = [
  { value: "sedentary", label: "Sedentary (little or no exercise)" },
  { value: "lightly_active", label: "Lightly Active (light exercise/sports 1-3 days/week)" },
  { value: "moderately_active", label: "Moderately Active (moderate exercise/sports 3-5 days/week)" },
  { value: "very_active", label: "Very Active (hard exercise/sports 6-7 days a week)" },
  { value: "extra_active", label: "Extra Active (very hard exercise/sports & physical job)" },
];

// Fitness goal options
const fitnessGoals = [
  { value: "weight_loss", label: "Lose Weight" },
  { value: "maintain_weight", label: "Maintain Weight" },
  { value: "muscle_gain", label: "Gain Muscle" },
  { value: "general_health", label: "Improve General Health" },
];

// Dietary preferences
const dietaryPreferences = [
  { id: "vegetarian", label: "Vegetarian", icon: <Salad className="h-3 w-3 mr-1" /> },
  { id: "vegan", label: "Vegan", icon: <Apple className="h-3 w-3 mr-1" /> },
  { id: "gluten_free", label: "Gluten-Free", icon: <Sandwich className="h-3 w-3 mr-1" /> },
  { id: "dairy_free", label: "Dairy-Free", icon: <Sandwich className="h-3 w-3 mr-1" /> },
  { id: "nut_free", label: "Nut-Free", icon: <Apple className="h-3 w-3 mr-1" /> },
  { id: "low_carb", label: "Low Carb", icon: <Sandwich className="h-3 w-3 mr-1" /> },
  { id: "keto", label: "Keto", icon: <Sandwich className="h-3 w-3 mr-1" /> },
  { id: "paleo", label: "Paleo", icon: <Salad className="h-3 w-3 mr-1" /> },
];

// Plan duration options
const planDurations = [
  { value: "daily", label: "Daily Plan", icon: <Calendar className="h-4 w-4" /> },
  { value: "weekly", label: "Weekly Plan", icon: <Calendar className="h-4 w-4" /> },
];

// Animation variants for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

// Define animation for page transitions
const pageVariants = {
  initial: { 
    opacity: 0,
    x: 20,
    scale: 0.98,
  },
  animate: { 
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { 
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] 
    }
  },
  exit: { 
    opacity: 0,
    x: -20,
    scale: 0.98,
    transition: { 
      duration: 0.3 
    }
  }
};

// Add CSS styles at the top of the file
const pulseAnimation = {
  scale: [1, 1.05, 1],
  opacity: [0.8, 1, 0.8],
  transition: {
    repeat: Infinity,
    duration: 3,
  }
};

// Motion card component with hover effects
const MotionCard = ({ 
  children, 
  className = "", 
  delay = 0,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  [key: string]: any;
}) => {
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
        boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.1)"
      }}
      className={cn("backdrop-blur-md bg-white/30 dark:bg-black/20 border border-white/30 dark:border-white/10", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Enhance background blobs with more subtle animation
const BackgroundBlobs = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute top-0 -left-40 w-[30rem] h-[30rem] bg-primary/5 rounded-full mix-blend-multiply filter blur-[8rem] opacity-50 animate-blob" />
      <div className="absolute top-0 -right-40 w-[30rem] h-[30rem] bg-blue-300/10 rounded-full mix-blend-multiply filter blur-[8rem] opacity-50 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-40 left-20 w-[30rem] h-[30rem] bg-green-300/10 rounded-full mix-blend-multiply filter blur-[8rem] opacity-50 animate-blob animation-delay-4000" />
    </div>
  );
};

// Add a utility function to calculate macronutrient percentages
const calculateMacroPercentages = (protein: number, carbs: number, fats: number) => {
  const total = protein + carbs + fats;
  return {
    protein: (protein * 100 / total).toFixed(1),
    carbs: (carbs * 100 / total).toFixed(1),
    fats: (fats * 100 / total).toFixed(1),
    // Also calculate calories from each macro
    proteinCalories: protein * 4,
    carbsCalories: carbs * 4,
    fatsCalories: fats * 9,
  };
};

export default function DietChartPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [dietChart, setDietChart] = useState<GenerateDietChartOutput | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState("generate");
  const [collapsibleStates, setCollapsibleStates] = useState<Record<string, boolean>>({});
  
  // Form state
  const [formData, setFormData] = useState<Partial<GenerateDietChartInput>>({
    age: undefined,
    gender: undefined,
    weight: undefined,
    height: undefined,
    activityLevel: undefined,
    fitnessGoal: undefined,
    dietaryPreferences: [],
    allergies: [],
    medicalConditions: [],
    duration: "daily",
  });

  // Progress calculation for multi-step form
  const calculateProgress = () => {
    let progress = 0;
    const totalSteps = 4;
    progress = (currentStep / totalSteps) * 100;
    return progress;
  };
  
  // Handler for input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Convert numeric values
    if (["age", "weight", "height"].includes(name)) {
      setFormData({
        ...formData,
        [name]: value ? Number(value) : undefined,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  
  // Handler for select changes
  const handleSelectChange = (name: keyof GenerateDietChartInput, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  // Handler for dietary preference changes
  const handleDietaryPreferenceChange = (preferenceId: string, checked: boolean | "indeterminate") => {
    if (checked) {
      setFormData({
        ...formData,
        dietaryPreferences: [...(formData.dietaryPreferences || []), preferenceId],
      });
    } else {
      setFormData({
        ...formData,
        dietaryPreferences: (formData.dietaryPreferences || []).filter(id => id !== preferenceId),
      });
    }
  };
  
  // Handle comma-separated lists for allergies and medical conditions
  const handleListChange = (name: 'allergies' | 'medicalConditions', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(Boolean);
    setFormData({
      ...formData,
      [name]: items,
    });
  };

  // Navigate to next form step
  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Navigate to previous form step
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Generate diet chart
  const handleGenerateDietChart = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.age || !formData.gender || !formData.weight || !formData.height || 
        !formData.activityLevel || !formData.fitnessGoal || !formData.duration) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Cast formData to the required input type
      const input: GenerateDietChartInput = {
        age: formData.age!,
        gender: formData.gender! as "male" | "female" | "other",
        weight: formData.weight!,
        height: formData.height!,
        activityLevel: formData.activityLevel! as any,
        fitnessGoal: formData.fitnessGoal! as any,
        dietaryPreferences: formData.dietaryPreferences || [],
        allergies: formData.allergies || [],
        medicalConditions: formData.medicalConditions || [],
        duration: formData.duration! as "daily" | "weekly",
      };
      
      const result = await generateDietChart(input);
      setDietChart(result);
      setActiveTab("results");
      
      toast({
        title: "Diet chart generated",
        description: "Your personalized diet chart is ready!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error generating diet chart:", error);
      toast({
        title: "Error",
        description: "Failed to generate diet chart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Download diet chart as PDF or text
  const handleDownload = () => {
    if (!dietChart) return;
    
    // Create a text version of the diet chart
    let content = `PERSONALIZED DIET CHART\n\n`;
    content += `Daily Calories: ${dietChart.dailyCalories} kcal\n\n`;
    content += `MACRONUTRIENT BREAKDOWN:\n`;
    content += `Protein: ${dietChart.macroBreakdown.protein}g\n`;
    content += `Carbs: ${dietChart.macroBreakdown.carbs}g\n`;
    content += `Fats: ${dietChart.macroBreakdown.fats}g\n\n`;
    
    content += `MEAL PLAN:\n\n`;
    dietChart.mealPlan.forEach(day => {
      if (day.day) {
        content += `=== ${day.day.toUpperCase()} ===\n\n`;
      }
      
      day.meals.forEach(meal => {
        content += `${meal.type.toUpperCase()}: ${meal.name}\n`;
        content += `Ingredients: ${meal.ingredients.join(', ')}\n`;
        content += `Calories: ${meal.calories} kcal\n`;
        content += `Nutrients: Protein ${meal.nutrients.protein}g, Carbs ${meal.nutrients.carbs}g, Fats ${meal.nutrients.fats}g`;
        if (meal.nutrients.fiber) {
          content += `, Fiber ${meal.nutrients.fiber}g`;
        }
        content += `\n\n`;
        
        if (meal.preparationSteps && meal.preparationSteps.length > 0) {
          content += `Preparation:\n${meal.preparationSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n\n`;
        }
      });
    });
    
    content += `NUTRITION TIPS:\n`;
    dietChart.nutritionTips.forEach((tip, i) => {
      content += `${i + 1}. ${tip}\n`;
    });
    content += `\nHYDRATION: ${dietChart.hydrationRecommendation}\n`;
    
    // Create a download link
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diet-chart.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "Diet chart has been downloaded as a text file.",
    });
  };
  
  // Save diet chart to user's account
  const handleSave = () => {
    toast({
      title: "Saved",
      description: "Diet chart has been saved to your account.",
    });
  };

  // Function to toggle collapsible state
  const toggleCollapsible = (key: string) => {
    setCollapsibleStates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Step 1 - Basic Information
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
            1
          </div>
          <span>Basic Information</span>
        </h2>
        <p className="text-muted-foreground text-sm">Tell us about yourself so we can create a personalized plan</p>
      </div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div className="space-y-2" variants={itemVariants}>
          <Label htmlFor="age" className="flex items-center">
            Age
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 ml-1 inline-block text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-[200px] text-xs">Your age helps calculate your basal metabolic rate (BMR).</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <motion.div
            whileTap={{ scale: 0.98 }}
            whileFocus={{ scale: 1.01 }}
            className="relative"
          >
            <Input 
              id="age" 
              name="age" 
              type="number" 
              placeholder="Enter your age" 
              value={formData.age || ''} 
              onChange={handleInputChange}
              className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:scale-[1.01] rounded-xl bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/10 shadow-sm pl-10"
            />
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </motion.div>
        </motion.div>
        
        <motion.div className="space-y-2" variants={itemVariants}>
          <Label htmlFor="gender">Gender</Label>
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="relative"
          >
            <Select 
              value={formData.gender} 
              onValueChange={(value) => handleSelectChange('gender', value)}
            >
              <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:scale-[1.01] rounded-xl bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/10 shadow-sm pl-10">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent className="bg-white/80 dark:bg-black/80 backdrop-blur-md border border-white/30 dark:border-white/10 rounded-xl shadow-lg">
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </motion.div>
        </motion.div>
        
        <motion.div className="space-y-2" variants={itemVariants}>
          <Label htmlFor="weight" className="flex items-center">
            Weight (kg)
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 ml-1 inline-block text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-[200px] text-xs">Your weight is essential for calculating your caloric needs.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <motion.div
            whileTap={{ scale: 0.98 }}
            whileFocus={{ scale: 1.01 }}
            className="relative"
          >
            <Input 
              id="weight" 
              name="weight" 
              type="number" 
              placeholder="Enter your weight in kg" 
              value={formData.weight || ''} 
              onChange={handleInputChange}
              className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:scale-[1.01] rounded-xl bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/10 shadow-sm pl-10"
            />
            <Activity className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </motion.div>
        </motion.div>
        
        <motion.div className="space-y-2" variants={itemVariants}>
          <Label htmlFor="height" className="flex items-center">
            Height (cm)
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 ml-1 inline-block text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-[200px] text-xs">Your height helps calculate your Body Mass Index (BMI).</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <motion.div
            whileTap={{ scale: 0.98 }}
            whileFocus={{ scale: 1.01 }}
            className="relative"
          >
            <Input 
              id="height" 
              name="height" 
              type="number" 
              placeholder="Enter your height in cm" 
              value={formData.height || ''} 
              onChange={handleInputChange}
              className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:scale-[1.01] rounded-xl bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/10 shadow-sm pl-10"
            />
            <Activity className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </motion.div>
        </motion.div>
      </motion.div>
      
      <motion.div 
        className="pt-6 flex justify-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button 
          onClick={handleNextStep} 
          className="group relative overflow-hidden rounded-full bg-primary hover:bg-primary/90 transition-colors px-6"
          disabled={!formData.age || !formData.gender || !formData.weight || !formData.height}
        >
          <span className="relative z-10 flex items-center">
            Next Step
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
          <motion.span 
            className="absolute inset-0 translate-y-[105%] bg-primary-foreground/10 group-hover:translate-y-0 transition-transform duration-300"
            animate={{ y: ['-105%', '0%', '-105%'] }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
          />
        </Button>
      </motion.div>
    </div>
  );

  // Step 2 - Fitness & Activity
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
            2
          </div>
          <span>Fitness & Activity</span>
        </h2>
        <p className="text-muted-foreground text-sm">Help us understand your activity level and goals</p>
      </div>
      
      <motion.div 
        className="grid grid-cols-1 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div className="space-y-3" variants={itemVariants}>
          <Label htmlFor="activityLevel">Activity Level</Label>
          <div className="grid grid-cols-1 gap-2 pt-1">
            {activityLevels.map((level, index) => (
              <motion.div
                key={level.value}
                variants={itemVariants}
                custom={index}
                whileHover={{ scale: 1.01, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-primary/5",
                  formData.activityLevel === level.value 
                    ? "border-2 border-primary bg-primary/5 shadow-md" 
                    : "border border-white/30 dark:border-white/10 bg-white/30 dark:bg-black/30 backdrop-blur-sm"
                )}
                onClick={() => handleSelectChange('activityLevel', level.value)}
              >
                <div className="mr-3">
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                    formData.activityLevel === level.value 
                      ? "border-primary" 
                      : "border-muted-foreground/30"
                  )}>
                    {formData.activityLevel === level.value && (
                      <motion.div 
                        className="w-2 h-2 rounded-full bg-primary"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-medium">{level.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        <motion.div className="space-y-3 pt-2" variants={itemVariants}>
          <Label htmlFor="fitnessGoal">Fitness Goal</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {fitnessGoals.map((goal, index) => (
              <motion.div 
                key={goal.value}
                variants={itemVariants}
                custom={index}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md",
                  formData.fitnessGoal === goal.value 
                    ? "border-primary bg-primary/5 shadow-md" 
                    : "border-white/30 dark:border-white/10 bg-white/30 dark:bg-black/30 backdrop-blur-sm"
                )}
                onClick={() => handleSelectChange('fitnessGoal', goal.value)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{goal.label}</span>
                  {formData.fitnessGoal === goal.value ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </motion.div>
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-muted" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
      
      <motion.div 
        className="pt-6 flex justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button 
          variant="outline" 
          onClick={handlePrevStep}
          className="group relative overflow-hidden rounded-full"
        >
          <span className="relative z-10">Previous</span>
          <motion.span 
            className="absolute inset-0 translate-y-[105%] bg-muted group-hover:translate-y-0 transition-transform duration-300"
            animate={{ y: ['-105%', '0%', '-105%'] }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
          />
        </Button>
        <Button 
          onClick={handleNextStep}
          className="group relative overflow-hidden rounded-full"
          disabled={!formData.activityLevel || !formData.fitnessGoal}
        >
          <span className="relative z-10 flex items-center">
            Next Step
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
          <motion.span 
            className="absolute inset-0 translate-y-[105%] bg-primary-foreground/10 group-hover:translate-y-0 transition-transform duration-300"
            animate={{ y: ['-105%', '0%', '-105%'] }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
          />
        </Button>
      </motion.div>
    </div>
  );
  
  // Step 3 - Dietary Preferences with enhanced animations
  const renderStep3 = () => (
    <motion.div
      key="step3"
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
            3
          </div>
          <span>Dietary Preferences</span>
        </h2>
        <p className="text-muted-foreground text-sm">Tell us about your dietary preferences and restrictions</p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Select your dietary preferences</Label>
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {dietaryPreferences.map((preference, index) => (
              <motion.div 
                key={preference.id}
                variants={itemVariants}
                custom={index}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "border rounded-lg p-3 cursor-pointer transition-all duration-200 hover:border-primary/50",
                  (formData.dietaryPreferences || []).includes(preference.id)
                    ? "border-primary bg-primary/5 shadow-md" 
                    : "border-white/30 dark:border-white/10 bg-white/30 dark:bg-black/30 backdrop-blur-sm"
                )}
                onClick={() => handleDietaryPreferenceChange(
                  preference.id, 
                  !(formData.dietaryPreferences || []).includes(preference.id)
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <motion.div
                      animate={{ rotate: (formData.dietaryPreferences || []).includes(preference.id) ? [0, 5, 0, -5, 0] : 0 }}
                      transition={{ 
                        duration: 0.5, 
                        repeat: (formData.dietaryPreferences || []).includes(preference.id) ? Infinity : 0,
                        repeatType: "mirror"
                      }}
                    >
                      {preference.icon}
                    </motion.div>
                    <span className="text-sm ml-1">{preference.label}</span>
                  </div>
                  {(formData.dietaryPreferences || []).includes(preference.id) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div 
            className="space-y-2"
            variants={itemVariants}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.3 }}
          >
            <Label htmlFor="allergies">Allergies (comma separated)</Label>
            <div className="relative">
              <Textarea 
                id="allergies" 
                name="allergies" 
                placeholder="e.g., peanuts, shellfish, lactose" 
                value={(formData.allergies || []).join(', ')} 
                onChange={(e) => handleListChange('allergies', e.target.value)}
                className="resize-none h-24 transition-all duration-200 focus:ring-2 focus:ring-primary/20 rounded-xl bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/10 shadow-sm pl-10 pt-8"
              />
              <AlertCircle className="absolute left-3 top-3 h-4 w-4 text-red-500/70" />
              <div className="absolute right-3 top-3 text-xs text-muted-foreground bg-white/50 dark:bg-black/30 px-2 py-0.5 rounded-full">
                Optional
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="space-y-2"
            variants={itemVariants}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.4 }}
          >
            <Label htmlFor="medicalConditions">Medical Conditions (comma separated)</Label>
            <div className="relative">
              <Textarea 
                id="medicalConditions" 
                name="medicalConditions" 
                placeholder="e.g., diabetes, hypertension" 
                value={(formData.medicalConditions || []).join(', ')} 
                onChange={(e) => handleListChange('medicalConditions', e.target.value)}
                className="resize-none h-24 transition-all duration-200 focus:ring-2 focus:ring-primary/20 rounded-xl bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/10 shadow-sm pl-10 pt-8"
              />
              <AlertCircle className="absolute left-3 top-3 h-4 w-4 text-red-500/70" />
              <div className="absolute right-3 top-3 text-xs text-muted-foreground bg-white/50 dark:bg-black/30 px-2 py-0.5 rounded-full">
                Optional
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <motion.div 
        className="pt-4 flex justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button 
          variant="outline" 
          onClick={handlePrevStep}
          className="group relative overflow-hidden rounded-full"
        >
          <span className="relative z-10">Previous</span>
          <motion.span 
            className="absolute inset-0 translate-y-[105%] bg-muted group-hover:translate-y-0 transition-transform duration-300"
            animate={{ y: ['-105%', '0%', '-105%'] }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
          />
        </Button>
        <Button 
          onClick={handleNextStep}
          className="group relative overflow-hidden rounded-full"
        >
          <span className="relative z-10 flex items-center">
            Next Step
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
          <motion.span 
            className="absolute inset-0 translate-y-[105%] bg-primary-foreground/10 group-hover:translate-y-0 transition-transform duration-300"
            animate={{ y: ['-105%', '0%', '-105%'] }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
          />
        </Button>
      </motion.div>
    </motion.div>
  );
  
  // Step 4 - Plan Configuration with enhanced animations
  const renderStep4 = () => (
    <motion.div
      key="step4"
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
            4
          </div>
          <span>Plan Configuration</span>
        </h2>
        <p className="text-muted-foreground text-sm">Customize your diet chart plan</p>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="duration">Plan Duration</Label>
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {planDurations.map((duration, index) => (
              <motion.div 
                key={duration.value}
                variants={itemVariants}
                custom={index}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:border-primary/50",
                  formData.duration === duration.value 
                    ? "border-primary bg-primary/5 shadow-lg" 
                    : "border-white/30 dark:border-white/10 bg-white/30 dark:bg-black/30 backdrop-blur-sm"
                )}
                onClick={() => handleSelectChange('duration', duration.value)}
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  <motion.div 
                    className={cn(
                      "p-3 rounded-full",
                      formData.duration === duration.value 
                        ? "bg-primary/10 text-primary" 
                        : "bg-muted/50 text-muted-foreground"
                    )}
                    animate={{ 
                      rotate: formData.duration === duration.value ? [0, 5, 0, -5, 0] : 0
                    }}
                    transition={{ 
                      duration: 0.5, 
                      repeat: formData.duration === duration.value ? Infinity : 0,
                      repeatType: "mirror",
                      repeatDelay: 2
                    }}
                  >
                    {duration.icon}
                  </motion.div>
                  <span className="font-medium">{duration.label}</span>
                  <p className="text-xs text-muted-foreground">
                    {duration.value === 'daily' 
                      ? 'Get a detailed plan for a single day' 
                      : 'Get a varied plan for an entire week'}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        
        <motion.div 
          className="bg-white/40 dark:bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/30 dark:border-white/10 shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-medium mb-3 flex items-center">
            <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
              Summary of Your Selections
            </span>
          </h3>
          <motion.div 
            className="space-y-2 text-sm"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <motion.p variants={itemVariants}>
              <span className="text-muted-foreground">Basic Info:</span> {formData.age} years, {formData.gender}, {formData.weight}kg, {formData.height}cm
            </motion.p>
            <motion.p variants={itemVariants}>
              <span className="text-muted-foreground">Fitness:</span> {formData.activityLevel && formData.activityLevel.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}, Goal: {formData.fitnessGoal && formData.fitnessGoal.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </motion.p>
            {(formData.dietaryPreferences || []).length > 0 && (
              <motion.p variants={itemVariants}>
                <span className="text-muted-foreground">Dietary Preferences:</span> {formData.dietaryPreferences?.join(', ')}
              </motion.p>
            )}
            {(formData.allergies || []).length > 0 && (
              <motion.p variants={itemVariants}>
                <span className="text-muted-foreground">Allergies:</span> {formData.allergies?.join(', ')}
              </motion.p>
            )}
            {(formData.medicalConditions || []).length > 0 && (
              <motion.p variants={itemVariants}>
                <span className="text-muted-foreground">Medical Conditions:</span> {formData.medicalConditions?.join(', ')}
              </motion.p>
            )}
            <motion.p variants={itemVariants}>
              <span className="text-muted-foreground">Plan Type:</span> {formData.duration === 'daily' ? 'Daily Plan' : 'Weekly Plan'}
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
      
      <motion.div 
        className="pt-4 flex justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button 
          variant="outline" 
          onClick={handlePrevStep}
          className="group relative overflow-hidden rounded-full"
        >
          <span className="relative z-10">Previous</span>
          <motion.span 
            className="absolute inset-0 translate-y-[105%] bg-muted group-hover:translate-y-0 transition-transform duration-300"
            animate={{ y: ['-105%', '0%', '-105%'] }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
          />
        </Button>
        <Button 
          onClick={handleGenerateDietChart}
          disabled={isLoading}
          className="relative group overflow-hidden rounded-full bg-primary hover:bg-primary/90 transition-colors px-6"
        >
          <motion.span 
            className="relative z-10 flex items-center"
            animate={isLoading ? { scale: [1, 0.95, 1] } : {}}
            transition={{ 
              duration: 1.5, 
              repeat: isLoading ? Infinity : 0,
              repeatType: "mirror" 
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                Generate Diet Chart
              </>
            )}
          </motion.span>
          <motion.span 
            className="absolute inset-0 translate-y-[105%] bg-primary-foreground/10 group-hover:translate-y-0 transition-transform duration-300"
            animate={{ y: ['-105%', '0%', '-105%'] }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
          />
        </Button>
      </motion.div>
    </motion.div>
  );
  
  return (
    <>
      <BackgroundBlobs />
      <div className="container mx-auto py-6 px-4 sm:px-6 space-y-10 max-w-4xl">
        <motion.div 
          className="text-center space-y-3 relative"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
        >
          <motion.div 
            className="absolute inset-0 -z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex rounded-full px-3 py-1 text-sm font-medium bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-sm text-primary mb-2"
          >
            <span className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Diet Plans
            </span>
          </motion.div>
          
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
              Diet Chart Planner
            </span>
          </h1>
          
          <motion.p 
            className="text-muted-foreground text-lg max-w-lg mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Create a personalized diet plan based on your health data, goals, and preferences
          </motion.p>
        </motion.div>
        
        <Tabs 
          defaultValue="generate" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 w-full mb-6 mx-auto max-w-md rounded-full p-1 bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-sm">
            <TabsTrigger 
              value="generate" 
              className="flex items-center gap-2 rounded-full transition-all duration-300 data-[state=active]:bg-white data-[state=active]:dark:bg-black/60 data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate Plan</span>
            </TabsTrigger>
            <TabsTrigger 
              value="results" 
              className="flex items-center gap-2 rounded-full transition-all duration-300 data-[state=active]:bg-white data-[state=active]:dark:bg-black/60 data-[state=active]:text-primary data-[state=active]:shadow-sm" 
              disabled={!dietChart}
            >
              <Utensils className="h-4 w-4" />
              <span>View Results</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate" className="space-y-4">
            <motion.div 
              className="overflow-hidden border border-white/20 dark:border-white/10 rounded-2xl backdrop-blur-md bg-white/40 dark:bg-black/40 shadow-xl relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -5 }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-black/60 dark:via-black/40 dark:to-black/20 -z-10" />
              
              <CardHeader className="pb-3 border-b border-white/10 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <GanttChart className="h-5 w-5 text-primary" />
                      Create Your Diet Chart
                    </CardTitle>
                    <CardDescription className="mt-1 text-muted-foreground/80">
                      Fill in your details to generate a personalized diet chart
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Badge 
                      variant="outline" 
                      className="bg-primary/5 border-primary/20 flex items-center gap-1 rounded-full px-3 py-1.5"
                    >
                      <Activity className="h-3 w-3" />
                      Step {currentStep} of 4
                    </Badge>
                  </div>
                </div>
                
                <div className="pt-4">
                  <div className="relative w-full h-2 bg-muted/40 rounded-full overflow-hidden">
                    <motion.div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/80 to-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${calculateProgress()}%`,
                      }}
                      transition={{ 
                        duration: 0.6,
                        ease: "easeOut"
                      }}
                    />
                    <motion.div 
                      className="absolute inset-0 opacity-40 bg-gradient-to-r from-transparent via-white to-transparent"
                      animate={{ 
                        x: ["0%", "100%"],
                      }}
                      transition={{ 
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: 1.5,
                        ease: "linear",
                      }}
                    />
                  </div>
                  <div className="flex justify-end mt-2 text-xs text-muted-foreground/70">
                    <span>{calculateProgress()}% Complete</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6">
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      {renderStep1()}
                    </motion.div>
                  )}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      {renderStep2()}
                    </motion.div>
                  )}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      {renderStep3()}
                    </motion.div>
                  )}
                  {currentStep === 4 && (
                    <motion.div
                      key="step4"
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      {renderStep4()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-8">
            {dietChart && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-10"
                >
                  {/* Summary Card */}
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                  >
                    <motion.div 
                      className="overflow-hidden border border-white/20 dark:border-white/10 rounded-2xl backdrop-blur-md bg-white/40 dark:bg-black/40 shadow-xl relative"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      whileHover={{ y: -5 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-black/60 dark:via-black/40 dark:to-black/20 -z-10" />
                      
                      <CardHeader className="pb-3 border-b border-white/10 dark:border-white/5">
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <div className="relative">
                            <Sparkles className="h-5 w-5 text-primary z-10" />
                            <motion.div
                              className="absolute inset-0 rounded-full bg-primary/20"
                              animate={pulseAnimation}
                            />
                          </div>
                          <span>Nutrition Summary</span>
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent className="space-y-8 pt-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex items-center gap-4">
                            <motion.div 
                              className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary relative"
                              whileHover={{ scale: 1.1 }}
                            >
                              <Sparkles className="h-8 w-8" />
                              <motion.div
                                className="absolute inset-0 rounded-full bg-primary/10"
                                animate={pulseAnimation}
                              />
                            </motion.div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Daily Calories</p>
                              <motion.p 
                                className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, type: "spring" }}
                              >
                                {dietChart.dailyCalories} 
                                <span className="text-lg font-medium ml-1 text-muted-foreground">kcal</span>
                              </motion.p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="bg-white/30 dark:bg-black/30 text-primary dark:text-primary-foreground border-white/20 dark:border-white/10 flex items-center gap-1 px-3 py-1.5 rounded-full backdrop-blur-sm">
                              <Dumbbell className="h-3 w-3" />
                              {formData.fitnessGoal?.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </Badge>
                            <Badge variant="outline" className="bg-white/30 dark:bg-black/30 text-primary dark:text-primary-foreground border-white/20 dark:border-white/10 flex items-center gap-1 px-3 py-1.5 rounded-full backdrop-blur-sm">
                              <User className="h-3 w-3" />
                              {formData.activityLevel?.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <p className="text-base font-medium text-white/80 dark:text-white/80">Macronutrient Breakdown</p>
                            <div className="text-xs text-primary px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                              <span className="font-medium">Balanced Diet</span>
                            </div>
                          </div>
                          
                          {dietChart && (
                            <>
                              <div className="bg-black/60 dark:bg-black/80 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-xl">
                                {/* Main macro bar */}
                                <div className="space-y-3">
                                  <motion.div 
                                    className="w-full h-14 relative rounded-xl overflow-hidden"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                  >
                                    {(() => {
                                      const macros = calculateMacroPercentages(
                                        dietChart.macroBreakdown.protein,
                                        dietChart.macroBreakdown.carbs,
                                        dietChart.macroBreakdown.fats
                                      );
                                      
                                      return (
                                        <div className="absolute inset-0 flex h-full">
                                          <motion.div 
                                            className="h-full bg-blue-500 flex items-center justify-center"
                                            style={{ width: `${macros.protein}%` }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${macros.protein}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                          >
                                            <div className="text-center text-white px-1">
                                              <div className="font-bold text-sm sm:text-base">{macros.protein}%</div>
                                              <div className="text-xs sm:text-sm">Protein</div>
                                            </div>
                                          </motion.div>
                                          
                                          <motion.div 
                                            className="h-full bg-green-500 flex items-center justify-center"
                                            style={{ width: `${macros.carbs}%` }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${macros.carbs}%` }}
                                            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                                          >
                                            <div className="text-center text-white px-1">
                                              <div className="font-bold text-sm sm:text-base">{macros.carbs}%</div>
                                              <div className="text-xs sm:text-sm">Carbs</div>
                                            </div>
                                          </motion.div>
                                          
                                          <motion.div 
                                            className="h-full bg-yellow-500 flex items-center justify-center"
                                            style={{ width: `${macros.fats}%` }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${macros.fats}%` }}
                                            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                                          >
                                            <div className="text-center text-white px-1">
                                              <div className="font-bold text-sm sm:text-base">{macros.fats}%</div>
                                              <div className="text-xs sm:text-sm">Fats</div>
                                            </div>
                                          </motion.div>
                                        </div>
                                      );
                                    })()}
                                  </motion.div>
                                  
                                  {/* Legend and Details */}
                                  <div className="grid grid-cols-3 gap-3 mt-3">
                                    <div className="rounded-xl p-3 bg-black/40 border border-white/5">
                                      <div className="flex items-center gap-2 mb-1">
                                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                        <span className="text-blue-400 text-sm font-medium">Protein</span>
                                      </div>
                                      <div className="flex items-center text-white text-xs space-x-1">
                                        <span className="font-semibold">{dietChart.macroBreakdown.protein}g</span>
                                        <span className="text-white/60">•</span>
                                        <span>{calculateMacroPercentages(
                                          dietChart.macroBreakdown.protein,
                                          dietChart.macroBreakdown.carbs,
                                          dietChart.macroBreakdown.fats
                                        ).proteinCalories} kcal</span>
                                      </div>
                                    </div>
                                    
                                    <div className="rounded-xl p-3 bg-black/40 border border-white/5">
                                      <div className="flex items-center gap-2 mb-1">
                                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                        <span className="text-green-400 text-sm font-medium">Carbs</span>
                                      </div>
                                      <div className="flex items-center text-white text-xs space-x-1">
                                        <span className="font-semibold">{dietChart.macroBreakdown.carbs}g</span>
                                        <span className="text-white/60">•</span>
                                        <span>{calculateMacroPercentages(
                                          dietChart.macroBreakdown.protein,
                                          dietChart.macroBreakdown.carbs,
                                          dietChart.macroBreakdown.fats
                                        ).carbsCalories} kcal</span>
                                      </div>
                                    </div>
                                    
                                    <div className="rounded-xl p-3 bg-black/40 border border-white/5">
                                      <div className="flex items-center gap-2 mb-1">
                                        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                                        <span className="text-yellow-400 text-sm font-medium">Fats</span>
                                      </div>
                                      <div className="flex items-center text-white text-xs space-x-1">
                                        <span className="font-semibold">{dietChart.macroBreakdown.fats}g</span>
                                        <span className="text-white/60">•</span>
                                        <span>{calculateMacroPercentages(
                                          dietChart.macroBreakdown.protein,
                                          dietChart.macroBreakdown.carbs,
                                          dietChart.macroBreakdown.fats
                                        ).fatsCalories} kcal</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                        
                        <motion.div 
                          className="relative overflow-hidden rounded-xl border border-blue-100 dark:border-blue-900/30"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.6 }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-blue-50/40 dark:from-blue-950/40 dark:to-blue-950/10 -z-10" />
                          <div className="p-4">
                            <h4 className="font-medium flex items-center gap-2 mb-3 text-blue-700 dark:text-blue-400">
                              <div className="relative">
                                <Waves className="h-4 w-4" />
                                <motion.div
                                  className="absolute inset-0 rounded-full bg-blue-400/20"
                                  animate={pulseAnimation}
                                />
                              </div>
                              <span>Hydration Recommendation</span>
                            </h4>
                            <p className="text-sm text-blue-800 dark:text-blue-300">{dietChart.hydrationRecommendation}</p>
                          </div>
                        </motion.div>
                      </CardContent>
                    </motion.div>
                  </motion.div>
                  
                  {/* Meal Plan - Enhanced with collapsible sections */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Utensils className="h-5 w-5 text-primary" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">Meal Plan</span>
                      </h3>
                      
                      <Badge 
                        variant="outline" 
                        className="bg-primary/5 border-primary/20 text-primary flex items-center gap-1 rounded-full px-3 py-1"
                      >
                        {dietChart?.mealPlan.length || 0} Day Plan
                      </Badge>
                    </div>
                    
                    {dietChart?.mealPlan.map((day, dayIndex) => (
                      <Collapsible
                        key={dayIndex}
                        className="w-full"
                        defaultOpen={dayIndex === 0} // Only open the first day by default
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 * dayIndex }}
                          viewport={{ once: true, margin: "-100px" }}
                        >
                          <motion.div 
                            className="overflow-hidden border border-white/20 dark:border-white/10 rounded-2xl backdrop-blur-md bg-white/40 dark:bg-black/40 shadow-xl relative"
                            whileHover={{ y: -2 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-black/60 dark:via-black/40 dark:to-black/20 -z-10" />
                            
                            {day.day && (
                              <CollapsibleTrigger 
                                className="w-full text-left"
                                onClick={() => toggleCollapsible(`day-${dayIndex}`)}
                              >
                                <div className="bg-gradient-to-r from-primary/20 to-blue-500/20 p-4 border-b border-white/10 dark:border-white/5 flex justify-between items-center cursor-pointer hover:from-primary/30 hover:to-blue-500/30 transition-colors">
                                  <h4 className="font-semibold text-primary flex items-center">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    {day.day}
                                    <Badge className="ml-2 bg-primary/20 text-primary hover:bg-primary/30 border-none">
                                      {day.meals.length} Meals
                                    </Badge>
                                  </h4>
                                  
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="hidden sm:inline">
                                      {collapsibleStates[`day-${dayIndex}`] ? 'Hide Details' : 'View Details'}
                                    </span>
                                    {collapsibleStates[`day-${dayIndex}`] ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </div>
                                </div>
                              </CollapsibleTrigger>
                            )}
                            
                            <CollapsibleContent>
                              <div className="p-0">
                                {day.meals.map((meal, mealIndex) => (
                                  <Collapsible
                                    key={mealIndex}
                                    className="w-full"
                                    defaultOpen={mealIndex === 0} // Only open the first meal by default
                                  >
                                    <CollapsibleTrigger 
                                      className="w-full text-left"
                                      onClick={() => toggleCollapsible(`meal-${dayIndex}-${mealIndex}`)}
                                    >
                                      <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3, delay: 0.1 * mealIndex }}
                                        className={cn(
                                          "p-4 border-b last:border-b-0 border-white/10 dark:border-white/5 hover:bg-white/50 dark:hover:bg-black/50 transition-colors cursor-pointer",
                                          meal.type === "breakfast" ? "bg-gradient-to-r from-orange-50/30 to-orange-100/10 dark:from-orange-950/20 dark:to-orange-900/5" :
                                          meal.type === "lunch" ? "bg-gradient-to-r from-green-50/30 to-green-100/10 dark:from-green-950/20 dark:to-green-900/5" :
                                          meal.type === "dinner" ? "bg-gradient-to-r from-blue-50/30 to-blue-100/10 dark:from-blue-950/20 dark:to-blue-900/5" :
                                          "bg-gradient-to-r from-purple-50/30 to-purple-100/10 dark:from-purple-950/20 dark:to-purple-900/5"
                                        )}
                                      >
                                        <div className="flex flex-wrap justify-between items-start gap-2">
                                          <div className="flex items-center gap-2">
                                            <motion.div 
                                              className={cn(
                                                "p-2 rounded-full",
                                                meal.type === "breakfast" ? "bg-gradient-to-br from-orange-200 to-orange-100 text-orange-700 dark:from-orange-800/40 dark:to-orange-700/30 dark:text-orange-400" :
                                                meal.type === "lunch" ? "bg-gradient-to-br from-green-200 to-green-100 text-green-700 dark:from-green-800/40 dark:to-green-700/30 dark:text-green-400" :
                                                meal.type === "dinner" ? "bg-gradient-to-br from-blue-200 to-blue-100 text-blue-700 dark:from-blue-800/40 dark:to-blue-700/30 dark:text-blue-400" :
                                                "bg-gradient-to-br from-purple-200 to-purple-100 text-purple-700 dark:from-purple-800/40 dark:to-purple-700/30 dark:text-purple-400"
                                              )}
                                              whileHover={{ scale: 1.1 }}
                                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                            >
                                              {meal.type === "breakfast" ? <Utensils className="h-4 w-4" /> :
                                              meal.type === "lunch" ? <ChefHat className="h-4 w-4" /> :
                                              meal.type === "dinner" ? <Utensils className="h-4 w-4" /> :
                                              <Apple className="h-4 w-4" />}
                                            </motion.div>
                                            <div>
                                              <h5 className="font-medium capitalize">{meal.type}</h5>
                                              <motion.h4 
                                                className="text-lg font-medium"
                                                whileHover={{ x: 5 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                              >
                                                {meal.name}
                                              </motion.h4>
                                            </div>
                                          </div>
                                          
                                          <div className="flex items-center gap-2">
                                            <Badge 
                                              variant="outline" 
                                              className="bg-white/50 dark:bg-black/50 backdrop-blur-sm border-white/20 dark:border-white/10 rounded-full px-3"
                                            >
                                              {meal.calories} kcal
                                            </Badge>
                                            
                                            {collapsibleStates[`meal-${dayIndex}-${mealIndex}`] ? (
                                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                              <Eye className="h-4 w-4 text-muted-foreground" />
                                            )}
                                          </div>
                                        </div>
                                      </motion.div>
                                    </CollapsibleTrigger>
                                    
                                    <CollapsibleContent>
                                      <div className="px-4 pb-4 pt-2">
                                        <div className="mb-3">
                                          <p className="text-sm font-medium text-muted-foreground mb-2">Ingredients:</p>
                                          <div className="flex flex-wrap gap-2">
                                            {meal.ingredients.map((ingredient, i) => (
                                              <motion.div
                                                key={i}
                                                whileHover={{ y: -2, scale: 1.05 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                              >
                                                <Badge 
                                                  variant="outline" 
                                                  className="bg-white/40 dark:bg-black/40 backdrop-blur-sm border-white/20 dark:border-white/10 rounded-full px-3 py-1"
                                                >
                                                  {ingredient}
                                                </Badge>
                                              </motion.div>
                                            ))}
                                          </div>
                                        </div>
                                        
                                        <div className="mb-3">
                                          <p className="text-sm font-medium text-muted-foreground mb-2">Nutrients:</p>
                                          <div className="flex flex-wrap gap-3 text-sm">
                                            <motion.div 
                                              className="bg-blue-50/70 dark:bg-blue-950/30 px-3 py-1 rounded-full text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/30"
                                              whileHover={{ scale: 1.05 }}
                                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                            >
                                              Protein: {meal.nutrients.protein}g
                                            </motion.div>
                                            <motion.div 
                                              className="bg-green-50/70 dark:bg-green-950/30 px-3 py-1 rounded-full text-green-700 dark:text-green-400 border border-green-200/50 dark:border-green-800/30"
                                              whileHover={{ scale: 1.05 }}
                                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                            >
                                              Carbs: {meal.nutrients.carbs}g
                                            </motion.div>
                                            <motion.div 
                                              className="bg-yellow-50/70 dark:bg-yellow-950/30 px-3 py-1 rounded-full text-yellow-700 dark:text-yellow-400 border border-yellow-200/50 dark:border-yellow-800/30"
                                              whileHover={{ scale: 1.05 }}
                                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                            >
                                              Fats: {meal.nutrients.fats}g
                                            </motion.div>
                                            {meal.nutrients.fiber && (
                                              <motion.div 
                                                className="bg-orange-50/70 dark:bg-orange-950/30 px-3 py-1 rounded-full text-orange-700 dark:text-orange-400 border border-orange-200/50 dark:border-orange-800/30"
                                                whileHover={{ scale: 1.05 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                              >
                                                Fiber: {meal.nutrients.fiber}g
                                              </motion.div>
                                            )}
                                          </div>
                                        </div>
                                        
                                        {meal.preparationSteps && meal.preparationSteps.length > 0 && (
                                          <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-2">Preparation:</p>
                                            <ol className="list-decimal list-inside text-sm space-y-1.5 text-muted-foreground">
                                              {meal.preparationSteps.map((step, i) => (
                                                <li key={i} className="pl-2">{step}</li>
                                              ))}
                                            </ol>
                                          </div>
                                        )}
                                      </div>
                                    </CollapsibleContent>
                                  </Collapsible>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </motion.div>
                        </motion.div>
                      </Collapsible>
                    ))}
                  </motion.div>
                  
                  {/* Nutrition Tips */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <motion.div 
                      className="overflow-hidden border border-white/20 dark:border-white/10 rounded-2xl backdrop-blur-md bg-white/40 dark:bg-black/40 shadow-xl relative"
                      whileHover={{ y: -5 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-black/60 dark:via-black/40 dark:to-black/20 -z-10" />
                      
                      <div className="p-6">
                        <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                          <ListChecks className="h-5 w-5 text-primary" />
                          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">Nutrition Tips</span>
                        </h3>
                        
                        <motion.ul 
                          className="space-y-3"
                          variants={containerVariants}
                          initial="hidden"
                          animate="show"
                        >
                          {dietChart.nutritionTips.map((tip, i) => (
                            <motion.li 
                              key={i} 
                              className="flex gap-3 items-start p-3 rounded-xl hover:bg-white/50 dark:hover:bg-black/50 transition-colors"
                              variants={itemVariants}
                              whileHover={{ x: 5 }}
                            >
                              <div className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary rounded-full h-6 w-6 flex items-center justify-center shrink-0 mt-0.5">
                                {i + 1}
                              </div>
                              <p>{tip}</p>
                            </motion.li>
                          ))}
                        </motion.ul>
                      </div>
                    </motion.div>
                  </motion.div>
                  
                  {/* Action Buttons - Improved for mobile */}
                  <motion.div 
                    className="flex flex-col sm:flex-row gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    <Button 
                      onClick={handleDownload} 
                      className="flex-1 group relative overflow-hidden rounded-full backdrop-blur-sm bg-white/50 dark:bg-black/50 border border-white/20 dark:border-white/10 text-primary hover:bg-white/70 dark:hover:bg-black/70 transition-colors h-12 sm:h-auto"
                      variant="outline"
                    >
                      <span className="relative z-10 flex items-center">
                        <Download className="mr-2 h-4 w-4 group-hover:translate-y-1 transition-transform" />
                        <span className="sm:inline">Download Diet Chart</span>
                      </span>
                    </Button>
                    <Button 
                      onClick={handleSave} 
                      className="flex-1 group relative overflow-hidden rounded-full h-12 sm:h-auto"
                    >
                      <span className="relative z-10 flex items-center">
                        <Save className="mr-2 h-4 w-4 relative z-10 group-hover:scale-110 transition-transform" />
                        <span className="sm:inline">Save to Account</span>
                      </span>
                      <span className="absolute inset-0 translate-y-[105%] bg-gradient-to-r from-primary/20 to-blue-500/20 group-hover:translate-y-0 transition-transform duration-300" />
                    </Button>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Fixed mobile bottom indicator - appears when scrolling */}
      <motion.div 
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <motion.div 
          className="glass-card rounded-full px-4 py-2 flex items-center gap-2 shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ y: [0, -5, 0] }}
          transition={{
            y: {
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut"
            }
          }}
        >
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-medium">Scroll for more</span>
        </motion.div>
      </motion.div>
    </>
  );
} 