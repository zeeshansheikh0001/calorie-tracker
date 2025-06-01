
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox"; // Keep for allergies if needed, or remove
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertCircle, Save, Download, Loader2, ListChecks, Utensils, Sparkles,
  Dumbbell, ChevronDown, Salad, User, ChefHat, Apple, Waves, Leaf,
  Calendar, ArrowRight, CheckCircle2, Sandwich, Info, Star, Zap, 
  ArrowUpRight, Bot, GanttChart, Activity, ChevronUp, Eye, EyeOff,
  Drumstick, Wheat, Droplets, Package, Tag, ListOrdered, Hash, InfoIcon
} from "lucide-react";
import { generateIndianDietChart, type GenerateIndianDietChartInput, type GenerateIndianDietChartOutput } from "@/ai/flows/generate-indian-diet-chart-flow";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";


const EggIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 4.32 3.23 8.85 6.36 11.58.23.2.53.31.84.31s.61-.11.84-.31C15.77 17.85 19 13.32 19 9c0-3.87-3.13-7-7-7zm0 11.5c-1.93 0-3.5-1.57-3.5-3.5S10.07 6.5 12 6.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
  </svg>
);

const activityLevels = [
  { value: "sedentary", label: "Sedentary (little exercise)" },
  { value: "lightly_active", label: "Lightly Active (1-3 days/week)" },
  { value: "moderately_active", label: "Moderately Active (3-5 days/week)" },
  { value: "very_active", label: "Very Active (6-7 days/week)" },
  { value: "extra_active", label: "Extra Active (very hard exercise/physical job)" },
];

const fitnessGoals = [
  { value: "weight_loss", label: "Weight Loss" },
  { value: "maintain_weight", label: "Maintain Weight" },
  { value: "muscle_gain", label: "Muscle Gain" },
  { value: "general_health", label: "General Health" },
];

const indianDietaryPreferences = [
  { id: "vegetarian", label: "Vegetarian", icon: <Leaf className="h-4 w-4" /> },
  { id: "non_vegetarian", label: "Non-Vegetarian", icon: <Drumstick className="h-4 w-4" /> },
  { id: "eggetarian", label: "Eggetarian", icon: <EggIcon className="h-4 w-4" /> },
  { id: "vegan", label: "Vegan (No dairy/animal products)", icon: <Leaf className="h-4 w-4" /> },
  { id: "jain", label: "Jain (No onion, garlic, root veg)", icon: <Leaf className="h-4 w-4" /> },
  { id: "gluten_free", label: "Gluten-Free", icon: <Wheat className="h-4 w-4 opacity-50" /> },
  { id: "dairy_free", label: "Dairy-Free", icon: <Droplets className="h-4 w-4 opacity-50"/> },
  { id: "nut_free", label: "Nut-Free", icon: <Apple className="h-4 w-4 opacity-50" /> },
  { id: "low_carb", label: "Low Carb", icon: <Salad className="h-4 w-4" /> },
  { id: "keto", label: "Keto", icon: <Salad className="h-4 w-4" /> },
  { id: "paleo", label: "Paleo", icon: <Salad className="h-4 w-4" /> },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

const pageVariants = {
  initial: { opacity: 0, x: 20, scale: 0.98 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: -20, scale: 0.98, transition: { duration: 0.3 } }
};

const MotionCard = ({ children, className = "", delay = 0, ...props }: { children: React.ReactNode; className?: string; delay?: number; [key: string]: any; }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 300, damping: 30, delay }}
    whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.1)" }}
    className={cn("backdrop-blur-md bg-card/70 border border-border/30", className)}
    {...props}
  >
    {children}
  </motion.div>
);

export default function IndianDietChartPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [dietChart, setDietChart] = useState<GenerateIndianDietChartOutput | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState("generate");
  const [formData, setFormData] = useState<Partial<GenerateIndianDietChartInput>>({
    activityLevel: "moderately_active",
    fitnessGoal: "general_health",
    dietaryPreference: "vegetarian",
    allergies: [],
    medicalConditions: [],
    duration: "daily", // Default to daily, though prompt logic might override for full-day list
  });

  const calculateProgress = () => ((currentStep / 3) * 100);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (["age", "weight", "height"].includes(name)) {
      setFormData({ ...formData, [name]: value ? Number(value) : undefined });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSelectChange = (name: keyof GenerateIndianDietChartInput, value: string) => {
    setFormData({ ...formData, [name]: value as any });
  };
  
  const handleDietaryPreferenceChange = (value: string) => {
     // @ts-ignore
    setFormData({ ...formData, dietaryPreference: value });
  };

  const handleListChange = (name: 'allergies' | 'medicalConditions', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(Boolean);
    setFormData({ ...formData, [name]: items });
  };

  const handleNextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleGenerateDietChart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dietaryPreference) {
      toast({ title: "Missing information", description: "Please select a dietary preference.", variant: "destructive" });
      return;
    }
    try {
      setIsLoading(true);
      setDietChart(null);
      const input: GenerateIndianDietChartInput = {
        age: formData.age,
        gender: formData.gender as "male" | "female" | "other" | undefined,
        weight: formData.weight,
        height: formData.height,
        activityLevel: formData.activityLevel,
        fitnessGoal: formData.fitnessGoal,
        dietaryPreference: formData.dietaryPreference as any, // Cast as it's now an enum
        allergies: formData.allergies || [],
        medicalConditions: formData.medicalConditions || [],
        duration: "daily", // Force daily as per new requirement
      };
      const result = await generateIndianDietChart(input);
      setDietChart(result);
      setActiveTab("results");
      toast({ title: "Indian Diet Plan Generated", description: "Your personalized diet plan is ready!", variant: "default" });
    } catch (error) {
      console.error("Error generating diet chart:", error);
      toast({ title: "Error", description: "Failed to generate diet plan. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="show">
      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="age">Age (Optional)</Label>
        <Input id="age" name="age" type="number" placeholder="e.g., 30" value={formData.age || ''} onChange={handleInputChange} />
      </motion.div>
      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="gender">Gender (Optional)</Label>
        <Select value={formData.gender} onValueChange={(value) => handleSelectChange('gender', value)}>
          <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg, Optional)</Label>
          <Input id="weight" name="weight" type="number" placeholder="e.g., 70" value={formData.weight || ''} onChange={handleInputChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="height">Height (cm, Optional)</Label>
          <Input id="height" name="height" type="number" placeholder="e.g., 170" value={formData.height || ''} onChange={handleInputChange} />
        </div>
      </motion.div>
      <motion.div variants={itemVariants} className="pt-6 flex justify-end">
        <Button onClick={handleNextStep} className="group"><span className="group-hover:mr-1 transition-all">Next Step</span> <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Button>
      </motion.div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="show">
      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="activityLevel">Activity Level</Label>
        <Select value={formData.activityLevel} onValueChange={(value) => handleSelectChange('activityLevel', value)}>
          <SelectTrigger><SelectValue placeholder="Select activity level" /></SelectTrigger>
          <SelectContent>{activityLevels.map(level => <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>)}</SelectContent>
        </Select>
      </motion.div>
      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="fitnessGoal">Fitness Goal</Label>
        <Select value={formData.fitnessGoal} onValueChange={(value) => handleSelectChange('fitnessGoal', value)}>
          <SelectTrigger><SelectValue placeholder="Select fitness goal" /></SelectTrigger>
          <SelectContent>{fitnessGoals.map(goal => <SelectItem key={goal.value} value={goal.value}>{goal.label}</SelectItem>)}</SelectContent>
        </Select>
      </motion.div>
      <motion.div variants={itemVariants} className="pt-6 flex justify-between">
        <Button variant="outline" onClick={handlePrevStep}>Previous</Button>
        <Button onClick={handleNextStep} className="group"><span className="group-hover:mr-1 transition-all">Next Step</span> <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Button>
      </motion.div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="show">
      <motion.div variants={itemVariants} className="space-y-2">
        <Label>Primary Dietary Preference</Label>
        <RadioGroup value={formData.dietaryPreference} onValueChange={handleDietaryPreferenceChange} className="space-y-2">
          {indianDietaryPreferences.map(pref => (
            <motion.label
              key={pref.id}
              variants={itemVariants}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-200",
                formData.dietaryPreference === pref.id ? "border-primary bg-primary/5 shadow-md" : "border-border hover:bg-muted/50"
              )}
            >
              <RadioGroupItem value={pref.id} id={`diet-${pref.id}`} />
              {pref.icon && <span className={formData.dietaryPreference === pref.id ? "text-primary" : "text-muted-foreground"}>{pref.icon}</span>}
              <span className="font-medium text-sm">{pref.label}</span>
            </motion.label>
          ))}
        </RadioGroup>
      </motion.div>
      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="allergies">Allergies (Optional, comma-separated)</Label>
        <Textarea id="allergies" name="allergies" placeholder="e.g., peanuts, shellfish" value={(formData.allergies || []).join(', ')} onChange={(e) => handleListChange('allergies', e.target.value)} />
      </motion.div>
      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="medicalConditions">Medical Conditions (Optional, comma-separated)</Label>
        <Textarea id="medicalConditions" name="medicalConditions" placeholder="e.g., diabetes, hypertension" value={(formData.medicalConditions || []).join(', ')} onChange={(e) => handleListChange('medicalConditions', e.target.value)} />
      </motion.div>
      <motion.div variants={itemVariants} className="pt-4 flex justify-between">
        <Button variant="outline" onClick={handlePrevStep}>Previous</Button>
        <Button onClick={handleGenerateDietChart} disabled={isLoading || !formData.dietaryPreference} className="group">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4 group-hover:animate-pulse" />}
          <span className="group-hover:mr-1 transition-all">Generate Diet Plan</span>
          {!isLoading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
        </Button>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 space-y-10 max-w-4xl">
      <motion.div className="text-center space-y-3" initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}>
        <motion.div className="inline-flex rounded-full px-3 py-1 text-sm font-medium bg-primary/10 text-primary mb-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <ChefHat className="h-4 w-4 mr-1.5" /> AI Indian Diet Planner
        </motion.div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight"><span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">Personalized Indian Diet Plan</span></h1>
        <motion.p className="text-muted-foreground text-lg max-w-xl mx-auto" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          Get a full-day diet plan with budget-friendly, commonly available Indian ingredients, tailored to your needs.
        </motion.p>
      </motion.div>

      <Tabs defaultValue="generate" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full mb-6 mx-auto max-w-md">
          <TabsTrigger value="generate" className="flex items-center gap-2"><Sparkles className="h-4 w-4" />Generate Plan</TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2" disabled={!dietChart}><Utensils className="h-4 w-4" />View Results</TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <MotionCard>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl"><GanttChart className="h-5 w-5 text-primary" />Create Your Diet Plan</CardTitle>
                <Badge variant="outline" className="bg-primary/5 border-primary/20">Step {currentStep} of 3</Badge>
              </div>
              <div className="pt-4">
                <div className="relative w-full h-2 bg-muted/40 rounded-full overflow-hidden">
                  <motion.div className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/80 to-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${calculateProgress()}%` }} transition={{ duration: 0.6, ease: "easeOut" }} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <AnimatePresence mode="wait">
                {currentStep === 1 && <motion.div key="step1" variants={pageVariants} initial="initial" animate="animate" exit="exit">{renderStep1()}</motion.div>}
                {currentStep === 2 && <motion.div key="step2" variants={pageVariants} initial="initial" animate="animate" exit="exit">{renderStep2()}</motion.div>}
                {currentStep === 3 && <motion.div key="step3" variants={pageVariants} initial="initial" animate="animate" exit="exit">{renderStep3()}</motion.div>}
              </AnimatePresence>
            </CardContent>
          </MotionCard>
        </TabsContent>

        <TabsContent value="results">
          <AnimatePresence>
            {isLoading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center space-y-3 p-10 border rounded-lg bg-card">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-muted-foreground">Generating your personalized Indian diet plan...</p>
              </motion.div>
            )}
            {dietChart && !isLoading && (
              <motion.div key="chart-results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
                <MotionCard>
                  <CardHeader className="border-b">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <ChefHat className="h-5 w-5 text-primary" /> {dietChart.dietTitle}
                    </CardTitle>
                    <CardDescription>Your personalized full-day Indian diet plan.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center"><ListOrdered className="h-5 w-5 mr-2 text-primary/80" />Daily Food Items & Quantities</h3>
                      <div className="space-y-3">
                        {dietChart.dailyFoodItems.map((item, index) => (
                          <motion.div 
                            key={index}
                            variants={itemVariants}
                            initial="hidden"
                            animate="show"
                            custom={index}
                            className="p-3 border rounded-lg bg-background/50 hover:shadow-sm transition-shadow"
                          >
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">{item.name}</h4>
                              <Badge variant="secondary" className="text-sm">{item.quantity}</Badge>
                            </div>
                            {item.notes && <p className="text-xs text-muted-foreground mt-1 pl-1 border-l-2 border-primary/20 ml-0.5">{item.notes}</p>}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center"><BarChart2 className="h-5 w-5 mr-2 text-primary/80" />Estimated Daily Nutrition</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <motion.div variants={itemVariants} className="p-3 border rounded-lg bg-red-50 dark:bg-red-950/30">
                          <Flame className="h-6 w-6 text-red-500 mx-auto mb-1" />
                          <p className="text-xl font-bold text-red-600 dark:text-red-400">{dietChart.estimatedDailyCalories}</p>
                          <p className="text-xs text-muted-foreground">Calories (kcal)</p>
                        </motion.div>
                        <motion.div variants={itemVariants} className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/30">
                          <Drumstick className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{dietChart.estimatedDailyProtein}</p>
                          <p className="text-xs text-muted-foreground">Protein (g)</p>
                        </motion.div>
                        <motion.div variants={itemVariants} className="p-3 border rounded-lg bg-amber-50 dark:bg-amber-950/30">
                          <Droplets className="h-6 w-6 text-amber-500 mx-auto mb-1" />
                          <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{dietChart.estimatedDailyFat}</p>
                          <p className="text-xs text-muted-foreground">Fat (g)</p>
                        </motion.div>
                        <motion.div variants={itemVariants} className="p-3 border rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                          <Wheat className="h-6 w-6 text-emerald-500 mx-auto mb-1" />
                          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{dietChart.estimatedDailyCarbs}</p>
                          <p className="text-xs text-muted-foreground">Carbs (g)</p>
                        </motion.div>
                      </div>
                    </div>

                    {dietChart.generalTips && dietChart.generalTips.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center"><InfoIcon className="h-5 w-5 mr-2 text-primary/80" />General Tips</h3>
                          <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground">
                            {dietChart.generalTips.map((tip, index) => (
                              <motion.li key={index} variants={itemVariants}>{tip}</motion.li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                    
                    {dietChart.hydrationRecommendation && (
                       <>
                        <Separator />
                        <div>
                          <h3 className="text-lg font-semibold mb-2 flex items-center"><Waves className="h-5 w-5 mr-2 text-primary/80" />Hydration</h3>
                          <p className="text-sm text-muted-foreground">{dietChart.hydrationRecommendation}</p>
                        </div>
                       </>
                    )}

                    <Separator />
                    
                    <div>
                      <p className="text-xs text-muted-foreground italic">{dietChart.disclaimer}</p>
                    </div>

                  </CardContent>
                  <CardFooter className="border-t pt-6 flex flex-col sm:flex-row gap-3 justify-end">
                    <Button variant="outline" onClick={() => {
                       if (dietChart) {
                        let content = `Diet Plan: ${dietChart.dietTitle}\n\nEstimated Nutrition:\nCalories: ${dietChart.estimatedDailyCalories} kcal\nProtein: ${dietChart.estimatedDailyProtein}g\nFat: ${dietChart.estimatedDailyFat}g\nCarbs: ${dietChart.estimatedDailyCarbs}g\n\nDaily Food Items:\n`;
                        dietChart.dailyFoodItems.forEach(item => {
                          content += `- ${item.name}: ${item.quantity}${item.notes ? ` (${item.notes})` : ''}\n`;
                        });
                        if(dietChart.generalTips && dietChart.generalTips.length > 0) {
                          content += "\nGeneral Tips:\n" + dietChart.generalTips.join("\n") + "\n";
                        }
                        if(dietChart.hydrationRecommendation) {
                          content += `\nHydration: ${dietChart.hydrationRecommendation}\n`;
                        }
                        content += `\nDisclaimer: ${dietChart.disclaimer}`;
                        
                        const blob = new Blob([content], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'indian-diet-plan.txt';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        toast({ title: "Downloaded", description: "Diet plan downloaded as text file." });
                       }
                    }}>
                      <Download className="mr-2 h-4 w-4" /> Download Plan
                    </Button>
                  </CardFooter>
                </MotionCard>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    