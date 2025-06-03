
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  Save,
  Download,
  Loader2,
  ListChecks,
  Utensils,
  Sparkles,
  Dumbbell,
  ChevronDown,
  Salad,
  User,
  ChefHat,
  Apple,
  Waves,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Sandwich,
  Info,
  Star,
  Zap,
  ArrowUpRight,
  Bot,
  GanttChart,
  Activity,
  ChevronUp,
  Eye,
  EyeOff,
  Package,
  Tag,
  X,
  ArrowLeft,
  Egg, 
  Leaf,
  FileText,
  ClockIcon
} from "lucide-react";
import {
  generateIndianDietChart,
  type GenerateIndianDietChartInput,
  type GenerateIndianDietChartOutput,
} from "@/ai/flows/generateIndianDietChartFlow";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUserProfile } from "@/hooks/use-user-profile";
import Link from "next/link";
import html2pdf from 'html2pdf.js';


// CSS for grid patterns
const gridPatternStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M0 0h1v1H0zM10 0h1v1h-1zM0 10h1v1H0zM10 10h1v1h-1z'/%3E%3C/g%3E%3C/svg%3E")`,
};

const gridWhiteStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M0 0h1v1H0zM10 0h1v1h-1zM0 10h1v1H0zM10 10h1v1h-1z'/%3E%3C/g%3E%3C/svg%3E")`,
};

// Activity level options
const activityLevels = [
  { value: "sedentary", label: "Sedentary (little or no exercise)" },
  {
    value: "lightly_active",
    label: "Lightly Active (light exercise/sports 1-3 days/week)",
  },
  {
    value: "moderately_active",
    label: "Moderately Active (moderate exercise/sports 3-5 days/week)",
  },
  {
    value: "very_active",
    label: "Very Active (hard exercise/sports 6-7 days a week)",
  },
  {
    value: "extra_active",
    label: "Extra Active (very hard exercise/sports & physical job)",
  },
];

// Fitness goal options
const fitnessGoals = [
  { value: "weight_loss", label: "Lose Weight" },
  { value: "maintain_weight", label: "Maintain Weight" },
  { value: "muscle_gain", label: "Gain Muscle" },
  { value: "general_health", label: "Improve General Health" },
];

// Dietary preferences - Kept for the form UI
const indianDietaryPreferences = [
  {
    id: "vegetarian",
    label: "Vegetarian",
    icon: <Salad className="h-3 w-3 mr-1" />,
  },
  {
    id: "non_vegetarian",
    label: "Non-Vegetarian",
    icon: <ChefHat className="h-3 w-3 mr-1" />,
  },
  { id: "eggetarian", label: "Eggetarian", icon: <Egg className="h-3 w-3 mr-1" /> },
  { id: "vegan", label: "Vegan", icon: <Leaf className="h-3 w-3 mr-1" /> },
  { id: "jain", label: "Jain", icon: <Salad className="h-3 w-3 mr-1" /> },
  {
    id: "gluten_free",
    label: "Gluten-Free",
    icon: <Sandwich className="h-3 w-3 mr-1" />,
  },
  {
    id: "dairy_free",
    label: "Dairy-Free",
    icon: <Package className="h-3 w-3 mr-1" />,
  },
  { id: "nut_free", label: "Nut-Free", icon: <Tag className="h-3 w-3 mr-1" /> },
  {
    id: "low_carb",
    label: "Low Carb",
    icon: <Salad className="h-3 w-3 mr-1" />,
  },
  { id: "keto", label: "Keto", icon: <Sandwich className="h-3 w-3 mr-1" /> },
  { id: "paleo", label: "Paleo", icon: <Salad className="h-3 w-3 mr-1" /> },
];

// Plan duration options
const planDurations = [
  {
    value: "daily",
    label: "Daily Plan",
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    value: "weekly",
    label: "Weekly Plan",
    icon: <Calendar className="h-4 w-4" />,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

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
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    scale: 0.98,
    transition: {
      duration: 0.3,
    },
  },
};

const pulseAnimation = {
  scale: [1, 1.05, 1],
  opacity: [0.8, 1, 0.8],
  transition: {
    repeat: Infinity,
    duration: 3,
  },
};

const BackgroundBlobs = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute top-0 -left-40 w-[30rem] h-[30rem] bg-primary/5 rounded-full mix-blend-multiply filter blur-[8rem] opacity-50 animate-blob" />
      <div className="absolute top-0 -right-40 w-[30rem] h-[30rem] bg-blue-300/10 rounded-full mix-blend-multiply filter blur-[8rem] opacity-50 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-40 left-20 w-[30rem] h-[30rem] bg-green-300/10 rounded-full mix-blend-multiply filter blur-[8rem] opacity-50 animate-blob animation-delay-4000" />
    </div>
  );
};

// Memoized Meal component for better performance
const Meal = React.memo(({ 
  meal, 
  mealIndex 
}: { 
  meal: any, 
  mealIndex: number 
}) => (
  <motion.div
    key={mealIndex}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: Math.min(mealIndex * 0.05, 0.3) }}
    className="border border-white/10 rounded-xl overflow-hidden bg-white/5 dark:bg-black/20 backdrop-blur-sm"
    whileHover={{ 
      y: -5,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
    }}
  >
    <div className="p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={cn(
            "p-1.5 sm:p-2 rounded-full",
            meal.type === "breakfast"
              ? "bg-orange-500/10 text-orange-500"
              : meal.type === "lunch"
              ? "bg-green-500/10 text-green-500"
              : meal.type === "dinner"
              ? "bg-blue-500/10 text-blue-500"
              : "bg-purple-500/10 text-purple-500"
          )}>
            {meal.type === "breakfast" ? (
              <Utensils className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            ) : meal.type === "lunch" ? (
              <ChefHat className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            ) : meal.type === "dinner" ? (
              <Utensils className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            ) : (
              <Apple className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
          </div>
          <div>
            <Badge
              className={cn(
                "capitalize px-1.5 sm:px-2 py-0 mb-1 text-xs",
                meal.type === "breakfast"
                  ? "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
                  : meal.type === "lunch"
                  ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                  : meal.type === "dinner"
                  ? "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                  : "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
              )}
              variant="outline"
            >
              {meal.type}
            </Badge>
            <h4 className="font-medium text-base sm:text-lg">{meal.name}</h4>
            {meal.recommendedTime && (
              <div className="text-xs text-muted-foreground mt-0.5 flex items-center">
                <ClockIcon className="h-3 w-3 mr-1 opacity-70" />
                {meal.recommendedTime}
              </div>
            )}
          </div>
        </div>
        <div className="text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 sm:py-1.5 bg-primary/10 rounded-full text-primary">
          {meal.calories} kcal
        </div>
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        <div>
          <div className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-muted-foreground">
            Food Items & Quantity
          </div>
          <div className="space-y-1.5">
            {meal.foodItems.map((item: {name: string, quantity: string}, i: number) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02, x: 2 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="flex justify-between items-center text-xs p-1.5 rounded bg-white/5 dark:bg-black/10"
              >
                <span>{item.name}</span>
                <Badge
                  variant="secondary"
                  className="text-xs font-normal bg-white/10 dark:bg-black/20 backdrop-blur-sm"
                >
                  {item.quantity}
                </Badge>
              </motion.div>
            ))}
             {meal.ingredients && meal.ingredients.length > 0 && !meal.foodItems && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {meal.ingredients.map((ingredient: string, i: number) => (
                  <motion.div
                    key={`ing-${i}`}
                    whileHover={{ scale: 1.05, y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Badge
                      variant="secondary"
                      className="text-xs font-normal bg-white/10 dark:bg-black/20 backdrop-blur-sm"
                    >
                      {ingredient}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm">
          <div className="col-span-1 p-1.5 sm:p-2 rounded-lg bg-blue-500/10">
            <span className="text-muted-foreground block mb-0.5 sm:mb-1 text-[10px] sm:text-xs">
              Protein
            </span>
            <span className="font-medium text-blue-500">
              {meal.nutrients.protein}g
            </span>
          </div>
          <div className="col-span-1 p-1.5 sm:p-2 rounded-lg bg-green-500/10">
            <span className="text-muted-foreground block mb-0.5 sm:mb-1 text-[10px] sm:text-xs">
              Carbs
            </span>
            <span className="font-medium text-green-500">
              {meal.nutrients.carbs}g
            </span>
          </div>
          <div className="col-span-1 p-1.5 sm:p-2 rounded-lg bg-yellow-500/10">
            <span className="text-muted-foreground block mb-0.5 sm:mb-1 text-[10px] sm:text-xs">
              Fats
            </span>
            <span className="font-medium text-yellow-500">
              {meal.nutrients.fats}g
            </span>
          </div>
          {meal.nutrients.fiber && (
            <div className="col-span-1 p-1.5 sm:p-2 rounded-lg bg-orange-500/10">
              <span className="text-muted-foreground block mb-0.5 sm:mb-1 text-[10px] sm:text-xs">
                Fiber
              </span>
              <span className="font-medium text-orange-500">
                {meal.nutrients.fiber}g
              </span>
            </div>
          )}
        </div>
        
        {meal.preparationSteps && meal.preparationSteps.length > 0 && (
          <div>
            <div className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-muted-foreground">
              Preparation
            </div>
            <ul className="text-xs sm:text-sm space-y-1 sm:space-y-1.5 list-disc list-inside text-muted-foreground">
              {meal.preparationSteps.map((step: string, i: number) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  </motion.div>
));
Meal.displayName = 'Meal';

// Memoized Day component
const DaySection = React.memo(({ 
  day, 
  dayIndex, 
  isOpen, 
  onToggle 
}: { 
  day: any, 
  dayIndex: number, 
  isOpen: boolean, 
  onToggle: () => void 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: Math.min(dayIndex * 0.05, 0.2) }}
  >
    <Collapsible
      open={isOpen}
      className="border-0 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-primary/5 to-blue-500/5"
    >
      <CollapsibleTrigger
        onClick={onToggle}
        className="flex items-center justify-between w-full p-3 sm:p-5 hover:bg-primary/5 transition-colors"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <motion.div 
            className="flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 text-primary"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
          </motion.div>
          <span className="font-semibold text-base sm:text-lg">
            {day.day || (dayIndex > 0 ? `Day ${dayIndex + 1}` : 'Today')}
          </span>
        </div>
        <motion.div
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {isOpen ? (
            <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          )}
        </motion.div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="p-3 sm:p-5 pt-1 sm:pt-2 space-y-3 sm:space-y-4">
          {day.meals.map((meal: any, mealIndex: number) => (
            <Meal key={mealIndex} meal={meal} mealIndex={mealIndex} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  </motion.div>
));
DaySection.displayName = 'DaySection';


const calculateMacroPercentages = (
  protein: number,
  carbs: number,
  fats: number
) => {
  const totalCalories = protein * 4 + carbs * 4 + fats * 9;
  if (totalCalories === 0)
    return {
      protein: "0.0",
      carbs: "0.0",
      fats: "0.0",
      proteinCalories: 0,
      carbsCalories: 0,
      fatsCalories: 0,
    };
  return {
    protein: ((protein * 4 * 100) / totalCalories).toFixed(1),
    carbs: ((carbs * 4 * 100) / totalCalories).toFixed(1),
    fats: ((fats * 9 * 100) / totalCalories).toFixed(1),
    proteinCalories: protein * 4,
    carbsCalories: carbs * 4,
    fatsCalories: fats * 9,
  };
};

export default function DietChartPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [dietChart, setDietChart] =
    useState<GenerateIndianDietChartOutput | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState("generate");
  const [collapsibleStates, setCollapsibleStates] = useState<
    Record<string, boolean>
  >({});
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [dietChartName, setDietChartName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { userProfile, saveDietChart } = useUserProfile();
  const [isViewingSaved, setIsViewingSaved] = useState(false);
  const [currentChartId, setCurrentChartId] = useState<string | null>(null);

  const isMountedRef = useRef(false);

  const [formData, setFormData] = useState<
    Partial<GenerateIndianDietChartInput>
  >({
    age: undefined,
    gender: "male",
    weight: undefined,
    height: undefined,
    activityLevel: "moderately_active",
    fitnessGoal: "general_health",
    dietaryPreference: "vegetarian",
    allergies: [],
    medicalConditions: [],
    duration: "daily",
  });

  useEffect(() => {
    const loadSavedChart = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const chartId = urlParams.get('id');
      
      if (chartId && userProfile.savedDietCharts) {
        const savedChart = userProfile.savedDietCharts.find(chart => chart.id === chartId);
        
        if (savedChart) {
          setDietChart(savedChart.dietChart);
          setCurrentChartId(chartId);
          setIsViewingSaved(true);
          setActiveTab("results");
          
          const initialCollapsibleStates: Record<string, boolean> = {};
          if (savedChart.dietChart.mealPlan && savedChart.dietChart.mealPlan.length > 0) {
            savedChart.dietChart.mealPlan.forEach((_, index) => {
              initialCollapsibleStates[`day-${index}`] = index === 0;
            });
          }
          setCollapsibleStates(initialCollapsibleStates);
          
          toast({
            title: "Diet Chart Loaded",
            description: `Loaded: ${savedChart.name}`,
          });
        } else {
          toast({
            title: "Chart Not Found",
            description: "The requested diet chart could not be found.",
            variant: "destructive",
          });
        }
      }
    };
    
    if (userProfile.savedDietCharts) {
      loadSavedChart();
    }
  }, [userProfile, toast]);

  const calculateProgress = () => (currentStep / 4) * 100;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (["age", "weight", "height"].includes(name)) {
      setFormData({ ...formData, [name]: value ? Number(value) : undefined });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSelectChange = (
    name: keyof GenerateIndianDietChartInput,
    value: string
  ) => {
    setFormData({ ...formData, [name]: value as any });
  };

  const handleRadioChange = (value: string) => {
    setFormData(prev => ({ ...prev, dietaryPreference: value as any }));
  };


  const handleListChange = (
    name: "allergies" | "medicalConditions",
    value: string
  ) => {
    const items = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    setFormData({ ...formData, [name]: items });
  };

  const handleNextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };
  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleGenerateDietChart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.age ||
      !formData.gender ||
      !formData.weight ||
      !formData.height ||
      !formData.activityLevel ||
      !formData.fitnessGoal ||
      !formData.dietaryPreference ||
      !formData.duration
    ) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      setDietChart(null);
      const input: GenerateIndianDietChartInput = {
        age: formData.age!,
        gender: formData.gender! as "male" | "female" | "other",
        weight: formData.weight!,
        height: formData.height!,
        activityLevel: formData.activityLevel! as any,
        fitnessGoal: formData.fitnessGoal! as any,
        dietaryPreference: formData.dietaryPreference! as any,
        allergies: formData.allergies || [],
        medicalConditions: formData.medicalConditions || [],
        duration: formData.duration! as "daily" | "weekly",
      };

      const result = await generateIndianDietChart(input);
      setDietChart(result);
      
      const initialCollapsibleStates: Record<string, boolean> = {};
      if (result.mealPlan && result.mealPlan.length > 0) {
        result.mealPlan.forEach((_, index) => {
          initialCollapsibleStates[`day-${index}`] = index === 0;
        });
      }
      setCollapsibleStates(initialCollapsibleStates);
      
      setActiveTab("results");

      toast({
        title: "Indian Diet Chart Generated",
        description: "Your personalized Indian diet chart is ready!",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Error generating Indian diet chart:", error);
      let description = "Failed to generate Indian diet chart. Please try again.";
      if (error.message && (error.message.includes("503") || error.message.toLowerCase().includes("service unavailable") || error.message.toLowerCase().includes("model is overloaded"))) {
        description = "The AI service is currently experiencing high demand. Please try again in a few minutes.";
      }
      toast({
        title: "Error",
        description: description,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!dietChart) return;

    const element = document.getElementById('dietChartPdfArea');
    if (!element) {
      toast({
        title: "Error",
        description: "Could not find chart content to download.",
        variant: "destructive"
      });
      return;
    }

    const opt = {
      margin:       [0.5, 0.5, 0.5, 0.5], // top, left, bottom, right in inches
      filename:     'indian-diet-chart.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: true, letterRendering: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' },
      pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().from(element).set(opt).save().then(() => {
      toast({
        title: "Downloaded",
        description: "Indian diet chart has been downloaded as PDF.",
      });
    }).catch(err => {
      console.error("PDF generation error:", err);
      toast({
        title: "PDF Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    });
  };

  const handleSave = () => {
    if (!dietChart) {
      toast({ 
        title: "No diet chart to save", 
        description: "Please generate a diet chart first.",
        variant: "destructive"
      });
      return;
    }
    
    setDietChartName(`Diet Chart - ${new Date().toLocaleDateString()}`);
    setShowSaveDialog(true);
  };

  const handleSaveConfirm = () => {
    if (!dietChart || !dietChartName.trim()) return;
    
    setIsSaving(true);
    
    try {
      saveDietChart(dietChartName, dietChart);
      
      toast({ 
        title: "Diet Chart Saved", 
        description: "Your diet chart has been saved to your profile."
      });
      
      setShowSaveDialog(false);
    } catch (error) {
      console.error("Error saving diet chart:", error);
      toast({ 
        title: "Error", 
        description: "Failed to save diet chart. Please try again.",
        variant: "destructive" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCollapsible = (key: string) => {
    setCollapsibleStates((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderDietChart = () => {
    if (!dietChart) return null;
    
    return (
      <motion.div
        id="dietChartPdfArea" // Added ID for PDF generation
        className="space-y-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Nutrition Summary Card */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div
            className="overflow-hidden border-0 rounded-3xl backdrop-blur-lg bg-gradient-to-br from-primary/10 via-primary/5 to-blue-500/10 shadow-2xl relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -5, boxShadow: "0 30px 60px rgba(0,0,0,0.12)" }}
          >
            <div className="absolute inset-0" style={gridPatternStyle} />
            
            <CardHeader className="pb-3 border-b border-white/10 dark:border-white/5">
              <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary z-10 relative" />
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
                  Nutrition Summary
                </span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-8 sm:space-y-10 pt-6 sm:pt-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-3 sm:gap-5">
                  <motion.div
                    className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary relative overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div className="absolute inset-0" style={gridWhiteStyle} />
                    <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 relative z-10" />
                  </motion.div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                      Daily Calories
                    </p>
                    <motion.div
                      className="flex items-baseline"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, type: "spring" }}
                    >
                      <span className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
                        {dietChart.dailyCalories}
                      </span>
                      <span className="text-base sm:text-lg font-medium ml-1 text-muted-foreground">
                        kcal
                      </span>
                    </motion.div>
                  </div>
                </div>
                {!isViewingSaved && (
                  <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                    <Badge
                      variant="outline"
                      className="bg-white/30 dark:bg-black/30 text-primary dark:text-primary-foreground border-white/20 dark:border-white/10 flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-sm text-xs sm:text-sm"
                    >
                      <Dumbbell className="h-3 w-3" />
                      {formData.fitnessGoal?.replace("_", " ")}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-white/30 dark:bg-black/30 text-primary dark:text-primary-foreground border-white/20 dark:border-white/10 flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-sm text-xs sm:text-sm"
                    >
                      <User className="h-3 w-3" />
                      {formData.activityLevel?.replace("_", " ")}
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="space-y-4 sm:space-y-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm sm:text-base font-medium text-white/80 dark:text-white/80">
                    Macronutrient Breakdown
                  </p>
                  <motion.div 
                    className="text-xs text-primary px-2 sm:px-3 py-1 sm:py-1.5 bg-primary/10 rounded-full border border-primary/20"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <span className="font-medium">Balanced Diet</span>
                  </motion.div>
                </div>
                
                <div className="bg-gradient-to-br from-black/60 to-black/70 dark:from-black/80 dark:to-black/90 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/10 shadow-xl">
                  <div className="space-y-5 sm:space-y-6">
                    <motion.div
                      className="w-full h-12 sm:h-16 relative rounded-xl overflow-hidden"
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
                              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center"
                              style={{
                                width: `${macros.protein}%`,
                              }}
                              initial={{ width: 0 }}
                              animate={{
                                width: `${macros.protein}%`,
                              }}
                              transition={{
                                duration: 1.5,
                                ease: "easeOut",
                              }}
                            >
                              <div className="text-center text-white px-1">
                                <div className="font-bold text-xs sm:text-base">
                                  {macros.protein}%
                                </div>
                                <div className="text-[10px] sm:text-sm">
                                  Protein
                                </div>
                              </div>
                            </motion.div>
                            <motion.div
                              className="h-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center"
                              style={{ width: `${macros.carbs}%` }}
                              initial={{ width: 0 }}
                              animate={{
                                width: `${macros.carbs}%`,
                              }}
                              transition={{
                                duration: 1.5,
                                delay: 0.2,
                                ease: "easeOut",
                              }}
                            >
                              <div className="text-center text-white px-1">
                                <div className="font-bold text-xs sm:text-base">
                                  {macros.carbs}%
                                </div>
                                <div className="text-[10px] sm:text-sm">
                                  Carbs
                                </div>
                              </div>
                            </motion.div>
                            <motion.div
                              className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center"
                              style={{ width: `${macros.fats}%` }}
                              initial={{ width: 0 }}
                              animate={{ width: `${macros.fats}%` }}
                              transition={{
                                duration: 1.5,
                                delay: 0.4,
                                ease: "easeOut",
                              }}
                            >
                              <div className="text-center text-white px-1">
                                <div className="font-bold text-xs sm:text-base">
                                  {macros.fats}%
                                </div>
                                <div className="text-[10px] sm:text-sm">
                                  Fats
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        );
                      })()}
                    </motion.div>
                    
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-2 sm:mt-3">
                      <motion.div 
                        className="rounded-xl p-3 sm:p-4 bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-700/20"
                        whileHover={{ scale: 1.03, y: -3 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <div className="flex items-center gap-1 sm:gap-2 mb-1">
                          <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-blue-500"></div>
                          <span className="text-blue-400 text-xs sm:text-sm font-medium">
                            Protein
                          </span>
                        </div>
                        <div className="flex items-center text-white text-[10px] sm:text-xs space-x-1">
                          <span className="font-semibold text-sm sm:text-base">
                            {dietChart.macroBreakdown.protein}g
                          </span>
                          <span className="text-white/60">•</span>
                          <span>
                            {
                              calculateMacroPercentages(
                                dietChart.macroBreakdown.protein,
                                dietChart.macroBreakdown.carbs,
                                dietChart.macroBreakdown.fats
                              ).proteinCalories
                            }{" "}
                            kcal
                          </span>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="rounded-xl p-3 sm:p-4 bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-700/20"
                        whileHover={{ scale: 1.03, y: -3 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <div className="flex items-center gap-1 sm:gap-2 mb-1">
                          <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-green-500"></div>
                          <span className="text-green-400 text-xs sm:text-sm font-medium">
                            Carbs
                          </span>
                        </div>
                        <div className="flex items-center text-white text-[10px] sm:text-xs space-x-1">
                          <span className="font-semibold text-sm sm:text-base">
                            {dietChart.macroBreakdown.carbs}g
                          </span>
                          <span className="text-white/60">•</span>
                          <span>
                            {
                              calculateMacroPercentages(
                                dietChart.macroBreakdown.protein,
                                dietChart.macroBreakdown.carbs,
                                dietChart.macroBreakdown.fats
                              ).carbsCalories
                            }{" "}
                            kcal
                          </span>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="rounded-xl p-3 sm:p-4 bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 border border-yellow-700/20"
                        whileHover={{ scale: 1.03, y: -3 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <div className="flex items-center gap-1 sm:gap-2 mb-1">
                          <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-yellow-500"></div>
                          <span className="text-yellow-400 text-xs sm:text-sm font-medium">
                            Fats
                          </span>
                        </div>
                        <div className="flex items-center text-white text-[10px] sm:text-xs space-x-1">
                          <span className="font-semibold text-sm sm:text-base">
                            {dietChart.macroBreakdown.fats}g
                          </span>
                          <span className="text-white/60">•</span>
                          <span>
                            {
                              calculateMacroPercentages(
                                dietChart.macroBreakdown.protein,
                                dietChart.macroBreakdown.carbs,
                                dietChart.macroBreakdown.fats
                              ).fatsCalories
                            }{" "}
                            kcal
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
              
              <motion.div
                className="relative overflow-hidden rounded-xl border-0 bg-gradient-to-r from-blue-500/10 to-blue-600/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="absolute inset-0" style={gridPatternStyle} />
                <div className="p-4 sm:p-5 relative">
                  <h4 className="font-medium flex items-center gap-2 mb-2 sm:mb-3 text-blue-500 dark:text-blue-400">
                    <Waves className="h-4 w-4 sm:h-5 sm:w-5" />
                    Hydration Recommendation
                  </h4>
                  <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300">
                    {dietChart.hydrationRecommendation}
                  </p>
                </div>
              </motion.div>
            </CardContent>
          </motion.div>
        </motion.div>
        
        {/* Meal Plan */}
        <div className="space-y-4 sm:space-y-6">
          <h3 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
            <motion.div
              className="p-1.5 sm:p-2 rounded-full bg-primary/10 text-primary"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Utensils className="h-5 w-5 sm:h-6 sm:w-6" />
            </motion.div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
              Meal Plan
            </span>
          </h3>
          
          <div className="space-y-3 sm:space-y-5">
            {dietChart.mealPlan.map((day, dayIndex) => (
              <DaySection 
                key={dayIndex}
                day={day}
                dayIndex={dayIndex}
                isOpen={collapsibleStates[`day-${dayIndex}`] ?? true}
                onToggle={() => toggleCollapsible(`day-${dayIndex}`)}
              />
            ))}
          </div>
        </div>
        
        {/* Nutrition Tips */}
        <div className="space-y-4 sm:space-y-5">
          <h3 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
            <motion.div
              className="p-1.5 sm:p-2 rounded-full bg-primary/10 text-primary"
              whileHover={{ scale: 1.1, rotate: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Info className="h-5 w-5 sm:h-6 sm:w-6" />
            </motion.div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
              Nutrition Tips
            </span>
          </h3>
          
          <motion.div 
            className="border-0 rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4 bg-gradient-to-br from-primary/5 to-blue-500/5 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {dietChart.nutritionTips.map((tip, index) => (
              <motion.div
                key={index}
                className="flex gap-3 sm:gap-4 items-start p-3 sm:p-4 rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ 
                  x: 5, 
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                }}
              >
                <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-primary">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <p className="text-sm sm:text-base flex-1">{tip}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
            1
          </div>
          <span>Basic Information</span>
        </h2>
        <p className="text-muted-foreground text-sm">Tell us about yourself</p>
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
          </Label>
          <Input
            id="age"
            name="age"
            type="number"
            placeholder="Enter age"
            value={formData.age || ""}
            onChange={handleInputChange}
          />
        </motion.div>
        <motion.div className="space-y-2" variants={itemVariants}>
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => handleSelectChange("gender", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>
        <motion.div className="space-y-2" variants={itemVariants}>
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            name="weight"
            type="number"
            placeholder="Enter weight"
            value={formData.weight || ""}
            onChange={handleInputChange}
          />
        </motion.div>
        <motion.div className="space-y-2" variants={itemVariants}>
          <Label htmlFor="height">Height (cm)</Label>
          <Input
            id="height"
            name="height"
            type="number"
            placeholder="Enter height"
            value={formData.height || ""}
            onChange={handleInputChange}
          />
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
          className="group"
          disabled={
            !formData.age ||
            !formData.gender ||
            !formData.weight ||
            !formData.height
          }
        >
          <span className="relative z-10 flex items-center">
            Next Step{" "}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Button>
      </motion.div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
            2
          </div>
          <span>Fitness & Activity</span>
        </h2>
        <p className="text-muted-foreground text-sm">
          Your activity level and goals
        </p>
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
                onClick={() => handleSelectChange("activityLevel", level.value)}
              >
                <div className="mr-3">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                      formData.activityLevel === level.value
                        ? "border-primary"
                        : "border-muted-foreground/30"
                    )}
                  >
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
                onClick={() => handleSelectChange("fitnessGoal", goal.value)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{goal.label}</span>
                  {formData.fitnessGoal === goal.value ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 15,
                      }}
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
        <Button variant="outline" onClick={handlePrevStep} className="group">
          Previous
        </Button>
        <Button
          onClick={handleNextStep}
          className="group"
          disabled={!formData.activityLevel || !formData.fitnessGoal}
        >
          <span className="relative z-10 flex items-center">
            Next Step{" "}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Button>
      </motion.div>
    </div>
  );

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
          Dietary Preferences
        </h2>
        <p className="text-muted-foreground text-sm">
          Select your primary dietary preference.
        </p>
      </div>
      <div className="space-y-4">
        <RadioGroup 
          value={formData.dietaryPreference || "vegetarian"} 
          onValueChange={handleRadioChange} 
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2"
        >
          {indianDietaryPreferences.map((preference, index) => (
             <motion.div
             key={preference.id}
             variants={itemVariants}
             custom={index}
             whileHover={{ scale: 1.05, y: -2 }}
             whileTap={{ scale: 0.95 }}
           >
             <Label
               htmlFor={`diet-${preference.id}`}
               className={cn(
                 "border rounded-lg p-3 cursor-pointer transition-all duration-200 hover:border-primary/50 flex items-center space-x-2",
                 formData.dietaryPreference === preference.id
                   ? "border-primary bg-primary/5 shadow-md"
                   : "border-white/30 dark:border-white/10 bg-white/30 dark:bg-black/30 backdrop-blur-sm"
               )}
             >
               <RadioGroupItem value={preference.id} id={`diet-${preference.id}`} />
               {preference.icon}{" "}
               <span className="text-sm">{preference.label}</span>
             </Label>
           </motion.div>
          ))}
        </RadioGroup>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            className="space-y-2"
            variants={itemVariants}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.3 }}
          >
            <Label htmlFor="allergies">Allergies (comma separated)</Label>
            <Textarea
              id="allergies"
              name="allergies"
              placeholder="e.g., peanuts, shellfish"
              value={(formData.allergies || []).join(", ")}
              onChange={(e) => handleListChange("allergies", e.target.value)}
            />
          </motion.div>
          <motion.div
            className="space-y-2"
            variants={itemVariants}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.4 }}
          >
            <Label htmlFor="medicalConditions">
              Medical Conditions (comma separated)
            </Label>
            <Textarea
              id="medicalConditions"
              name="medicalConditions"
              placeholder="e.g., diabetes, hypertension"
              value={(formData.medicalConditions || []).join(", ")}
              onChange={(e) =>
                handleListChange("medicalConditions", e.target.value)
              }
            />
          </motion.div>
        </div>
      </div>
      <motion.div
        className="pt-4 flex justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button variant="outline" onClick={handlePrevStep} className="group">
          Previous
        </Button>
        <Button onClick={handleNextStep} className="group">
          <span className="relative z-10 flex items-center">
            Next Step{" "}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Button>
      </motion.div>
    </motion.div>
  );

  const renderStep4 = () => {
    return (
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
          Plan Configuration
        </h2>
        <p className="text-muted-foreground text-sm">
          Customize your diet chart plan
        </p>
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
                onClick={() => handleSelectChange("duration", duration.value)}
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
                      rotate:
                        formData.duration === duration.value
                          ? [0, 5, 0, -5, 0]
                          : 0,
                    }}
                    transition={{
                      duration: 0.5,
                      repeat:
                        formData.duration === duration.value ? Infinity : 0,
                      repeatType: "mirror",
                      repeatDelay: 2,
                    }}
                  >
                    {duration.icon}
                  </motion.div>
                  <span className="font-medium">{duration.label}</span>
                  <p className="text-xs text-muted-foreground">
                    {duration.value === "daily"
                      ? "Detailed plan for a single day"
                      : "Varied plan for an entire week"}
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
              <span className="text-muted-foreground">Basic Info:</span>{" "}
              {formData.age} years, {formData.gender}, {formData.weight}kg,{" "}
              {formData.height}cm
            </motion.p>
            <motion.p variants={itemVariants}>
              <span className="text-muted-foreground">Fitness:</span>{" "}
              {formData.activityLevel?.replace("_", " ")}, Goal:{" "}
              {formData.fitnessGoal?.replace("_", " ")}
            </motion.p>
            {formData.dietaryPreference && (
              <motion.p variants={itemVariants}>
                <span className="text-muted-foreground">Preference:</span>{" "}
                {formData.dietaryPreference.charAt(0).toUpperCase() + formData.dietaryPreference.slice(1)}
              </motion.p>
            )}
            {(formData.allergies || []).length > 0 && (
              <motion.p variants={itemVariants}>
                <span className="text-muted-foreground">Allergies:</span>{" "}
                {formData.allergies?.join(", ")}
              </motion.p>
            )}
            {(formData.medicalConditions || []).length > 0 && (
              <motion.p variants={itemVariants}>
                <span className="text-muted-foreground">Conditions:</span>{" "}
                {formData.medicalConditions?.join(", ")}
              </motion.p>
            )}
            <motion.p variants={itemVariants}>
              <span className="text-muted-foreground">Plan Type:</span>{" "}
              {formData.duration === "daily" ? "Daily Plan" : "Weekly Plan"}
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
        <Button variant="outline" onClick={handlePrevStep} className="group">
          Previous
        </Button>
        <Button
          onClick={handleGenerateDietChart}
          disabled={isLoading}
          className="group"
        >
          <span className="relative z-10 flex items-center">
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
          </span>
        </Button>
      </motion.div>
    </motion.div>
  );
  };

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
            className="inline-flex rounded-full px-3 py-1 text-sm font-medium bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-sm text-primary mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ChefHat className="h-4 w-4 mr-1.5" />
            AI Indian Diet Planner
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
              Indian Diet Chart
            </span>
          </h1>
          <motion.p
            className="text-muted-foreground text-lg max-w-lg mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Create a personalized Indian diet plan based on your health data and
            preferences.
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
              Generate Plan
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="flex items-center gap-2 rounded-full transition-all duration-300 data-[state=active]:bg-white data-[state=active]:dark:bg-black/60 data-[state=active]:text-primary data-[state=active]:shadow-sm"
              disabled={!dietChart}
            >
              <Utensils className="h-4 w-4" />
              View Results
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
              <CardHeader className="pb-3 border-b border-white/10 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <GanttChart className="h-5 w-5 text-primary" />
                    Create Your Diet Chart
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className="bg-primary/5 border-primary/20 flex items-center gap-1 rounded-full px-3 py-1.5"
                  >
                    <Activity className="h-3 w-3" />
                    Step {currentStep} of 4
                  </Badge>
                </div>
                <div className="pt-4">
                  <div className="relative w-full h-2 bg-muted/40 rounded-full overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/80 to-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${calculateProgress()}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
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

          <TabsContent value="results">
            {isLoading ? (
              <div className="flex items-center justify-center py-32">
                <Card className="max-w-md w-full text-center p-8">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                        <Sparkles className="h-10 w-10 text-primary animate-pulse" />
                            </div>
                      <Loader2 className="h-16 w-16 animate-spin text-primary/20" />
                          </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold tracking-tight">
                        Generating Your Diet Chart
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        We're crafting a personalized nutrition plan just for you...
                      </p>
                            </div>
                          </div>
                </Card>
                                            </div>
            ) : dietChart ? (
                                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="py-4"
              >
                {isViewingSaved && (
                  <div className="mb-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/profile">
                        <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Back to Profile
                      </Link>
                    </Button>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">Your Diet Chart</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      A personalized nutrition plan for your needs
                            </p>
                          </div>
                  <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                    <Button
                        variant="outline"
                      onClick={handleDownload}
                      className="flex-1 sm:flex-auto flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 sm:py-2 h-auto"
                    >
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                      Download as PDF
                    </Button>
                    {!isViewingSaved && (
                      <Button
                        onClick={handleSave}
                        className="flex-1 sm:flex-auto flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 sm:py-2 h-auto"
                      >
                        <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                        Save
                      </Button>
                                    )}
                                  </div>
                                </div>

                {renderDietChart()}
                                            </motion.div>
            ) : (
              <div className="flex items-center justify-center py-32">
                <Card className="max-w-md w-full text-center p-8">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="bg-primary/5 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                      <Utensils className="h-8 w-8 text-primary" />
                                          </div>
                    <h3 className="text-xl font-semibold tracking-tight">
                      No Diet Chart Generated
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Fill out the form and click "Generate Diet Chart" to create your personalized nutrition plan.
                    </p>
                    <Button onClick={() => setActiveTab("generate")}>
                      Create Diet Chart
                    </Button>
                                          </div>
                </Card>
                                        </div>
            )}
          </TabsContent>
        </Tabs>
                                          </div>
      
      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md max-w-[90%] rounded-lg p-4 sm:p-6">
          <DialogHeader className="space-y-1 sm:space-y-2">
            <DialogTitle className="text-lg sm:text-xl">Save Diet Chart</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Give your diet chart a name to save it to your profile.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="dietChartName" className="text-xs sm:text-sm">Diet Chart Name</Label>
              <Input
                id="dietChartName"
                value={dietChartName}
                onChange={(e) => setDietChartName(e.target.value)}
                placeholder="Enter a name for your diet chart"
                className="text-xs sm:text-sm p-2 sm:p-3 h-8 sm:h-10"
              />
                                        </div>
                                            </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                    <Button
                      variant="outline"
              onClick={() => setShowSaveDialog(false)}
              className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-10"
                    >
              Cancel
                    </Button>
                    <Button
              onClick={handleSaveConfirm} 
              disabled={isSaving || !dietChartName.trim()}
              className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-10"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Save
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

