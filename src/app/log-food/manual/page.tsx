"use client";

import { useState, type FormEvent, type FC, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useDailyLog } from "@/hooks/use-daily-log";
import { PlusCircle, Save, Utensils, Flame, Drumstick, Droplets, Wheat, ChevronLeft, Sparkles, AlertCircle, Loader2, Heart, Info, Brain, UtensilsCrossed, Leaf, Activity, ShieldCheck } from "lucide-react";
import type { FoodEntry } from "@/types";
import { analyzeFoodText, type AnalyzeFoodTextInput, type AnalyzeFoodTextOutput } from "@/ai/flows/analyze-food-text-flow";
import { motion, AnimatePresence } from "framer-motion";

interface NutritionDisplayItemProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
  className?: string;
  delay?: number;
}

const NutritionDisplayItem: FC<NutritionDisplayItemProps> = ({ 
  icon: Icon, 
  label, 
  value, 
  unit, 
  color = "text-foreground", 
  className,
  delay = 0
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: delay }}
    className={`flex items-center space-x-2 p-3 rounded-lg bg-background/70 backdrop-blur-sm shadow-md hover:shadow-lg transition-all ${className}`}
  >
    <motion.div 
      whileHover={{ scale: 1.1, rotate: 5 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`p-2 rounded-md ${color} bg-opacity-10`}
    >
      <Icon className={`h-5 w-5 flex-shrink-0`} />
    </motion.div>
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <motion.p 
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: delay + 0.1 }}
        className={`font-semibold text-sm ${color}`}
      >
        {value}{unit && <span className="text-xs"> {unit}</span>}
      </motion.p>
    </div>
  </motion.div>
);

export default function ManualLogPage() {
  const [foodName, setFoodName] = useState("");
  const [estimatedNutrition, setEstimatedNutrition] = useState<AnalyzeFoodTextOutput | null>(null);
  
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);
  const [isAiEstimating, setIsAiEstimating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const { addFoodEntry, currentSelectedDate } = useDailyLog();
  const { toast } = useToast();
  const router = useRouter();

  const handleAiEstimate = async () => {
    if (!foodName.trim()) {
      setAiError("Please enter a food description first.");
      setEstimatedNutrition(null);
      return;
    }
    setIsAiEstimating(true);
    setAiError(null);
    setEstimatedNutrition(null); 
    try {
      const input: AnalyzeFoodTextInput = { description: foodName };
      const result: AnalyzeFoodTextOutput = await analyzeFoodText(input);
      
      setEstimatedNutrition(result);

      toast({
        title: "AI Estimation Complete",
        description: "Nutritional details and benefits have been estimated. Review and log if correct.",
        action: <Sparkles className="text-yellow-500" />,
      });

    } catch (err) {
      console.error("AI estimation error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during AI estimation.";
      setAiError(errorMessage);
      setEstimatedNutrition(null);
      toast({
        title: "AI Estimation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAiEstimating(false);
    }
  };

  const handleFoodNameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent default form submission if it's part of a form
      if (!isAiEstimating && foodName.trim()) {
        handleAiEstimate();
      }
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!estimatedNutrition) {
      toast({
        title: "Cannot Log",
        description: "Please estimate nutritional information with AI first.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmittingLog(true);

    const foodEntryData: Omit<FoodEntry, "id" | "timestamp"> = {
      name: foodName || "Unnamed Food", // Use the foodName from input as the primary name
      calories: estimatedNutrition.calorieEstimate,
      protein: estimatedNutrition.proteinEstimate,
      fat: estimatedNutrition.fatEstimate,
      carbs: estimatedNutrition.carbEstimate,
    };

    addFoodEntry(foodEntryData);

    toast({
      title: "Meal Logged!",
      description: `${foodEntryData.name} (${foodEntryData.calories.toFixed(0)} kcal) has been added to your log.`,
      action: <PlusCircle className="text-green-500" />,
    });

    setEstimatedNutrition(null); 
    setFoodName(""); 
    setIsSubmittingLog(false);
  };

  const renderTextSection = (title: string, content: string | undefined, icon: React.ElementType, delay = 0) => {
    if (!content || (typeof content === 'string' && content.trim() === '')) return null;
    const IconComponent = icon;
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="mt-4"
      >
        <h3 className="text-lg font-semibold text-primary mb-2 flex items-center">
          <motion.div 
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 12, delay: delay + 0.1 }}
          >
            <IconComponent className="mr-2 h-5 w-5 text-primary/80" />
          </motion.div>
          {title}
        </h3>
        <motion.p 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.4, delay: delay + 0.2 }}
          className="text-sm text-muted-foreground bg-secondary/20 p-3 rounded-md shadow-sm whitespace-pre-line"
        >
          {content}
        </motion.p>
      </motion.div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.97 }}
        >
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="mb-4 group text-sm hover:bg-transparent"
          >
            <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </Button>
        </motion.div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden backdrop-blur-sm bg-white/60 dark:bg-slate-900/60">
          <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Utensils className="h-6 w-6 text-primary" />
                </motion.div>
                <motion.span layoutId="title">Food Logger</motion.span>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="ml-auto flex items-center gap-1 text-sm font-normal px-2 py-1 rounded-full bg-primary/10 text-primary"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>AI Powered</span>
                </motion.div>
              </CardTitle>
              <CardDescription className="mt-2">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-sm text-muted-foreground"
                >
                  Describe your meal to get instant nutrition estimates
                </motion.p>
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 pt-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Label htmlFor="foodName" className="text-sm font-medium flex items-center gap-2">
                    <UtensilsCrossed className="h-4 w-4 text-primary" />
                    Food Description
                  </Label>
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-muted/50"
                  >
                    {currentSelectedDate ? currentSelectedDate.toLocaleDateString() : 'Today'}
                  </motion.span>
                </div>
                
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  <Input
                    id="foodName"
                    value={foodName}
                    onChange={(e) => {
                      setFoodName(e.target.value);
                      if(estimatedNutrition) setEstimatedNutrition(null); 
                      setAiError(null); 
                    }}
                    onKeyDown={handleFoodNameKeyDown}
                    placeholder="e.g., 200g grilled salmon with asparagus"
                    className="w-full h-12 rounded-md border border-input bg-transparent focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    required
                  />
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2 text-xs text-muted-foreground pl-1"
                >
                  <Info className="h-3 w-3" />
                  <span>Include quantities for better accuracy</span>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Button 
                    type="button" 
                    onClick={handleAiEstimate} 
                    disabled={isAiEstimating || !foodName.trim()}
                    className="w-full h-11 mt-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary relative overflow-hidden group"
                  >
                    <motion.span 
                      className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                      animate={{ x: ["0%", "100%"] }}
                      transition={{ 
                        repeat: Infinity, 
                        repeatType: "loop", 
                        duration: 2,
                        ease: "linear",
                        repeatDelay: 0.5
                      }}
                    />
                    {isAiEstimating ? (
                      <motion.div 
                        className="flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Analyzing...</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        className="flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.div
                          animate={{ rotate: [0, 15, -15, 0] }}
                          transition={{ 
                            repeat: Infinity, 
                            repeatType: "loop", 
                            duration: 2,
                            repeatDelay: 1
                          }}
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                        </motion.div>
                        <span>Analyze with AI</span>
                      </motion.div>
                    )}
                  </Button>
                </motion.div>
              </motion.div>

              <AnimatePresence>
                {aiError && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{aiError}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {estimatedNutrition && !isAiEstimating && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="space-y-6 pt-4 border-t"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <motion.h3 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="text-lg font-medium flex items-center gap-2"
                        >
                          <Flame className="h-5 w-5 text-primary" />
                          Nutrition Facts
                        </motion.h3>
                        {estimatedNutrition.estimatedQuantityNote && (
                          <motion.span 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-full"
                          >
                            {estimatedNutrition.estimatedQuantityNote}
                          </motion.span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <NutritionBar 
                          label="Calories" 
                          value={estimatedNutrition.calorieEstimate.toFixed(0)} 
                          unit="kcal" 
                          color="bg-red-500" 
                          delay={0}
                          percent={100}
                        />
                        
                        <NutritionBar 
                          label="Protein" 
                          value={estimatedNutrition.proteinEstimate.toFixed(1)} 
                          unit="g" 
                          color="bg-blue-500" 
                          delay={0.1}
                          percent={90}
                        />
                        
                        <NutritionBar 
                          label="Carbs" 
                          value={estimatedNutrition.carbEstimate.toFixed(1)} 
                          unit="g" 
                          color="bg-green-500" 
                          delay={0.2}
                          percent={80}
                        />
                        
                        <NutritionBar 
                          label="Fat" 
                          value={estimatedNutrition.fatEstimate.toFixed(1)} 
                          unit="g" 
                          color="bg-amber-500" 
                          delay={0.3}
                          percent={70}
                        />
                      </div>
                      
                      { (estimatedNutrition.saturatedFatEstimate !== undefined && estimatedNutrition.saturatedFatEstimate > 0) ||
                        (estimatedNutrition.fiberEstimate !== undefined && estimatedNutrition.fiberEstimate > 0) ||
                        (estimatedNutrition.sugarEstimate !== undefined && estimatedNutrition.sugarEstimate > 0) ||
                        (estimatedNutrition.cholesterolEstimate !== undefined && estimatedNutrition.cholesterolEstimate > 0) ||
                        (estimatedNutrition.sodiumEstimate !== undefined && estimatedNutrition.sodiumEstimate > 0) ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 }}
                        >
                          <div className="grid grid-cols-3 gap-3 pt-3 border-t text-sm">
                            {estimatedNutrition.saturatedFatEstimate !== undefined && estimatedNutrition.saturatedFatEstimate >= 0 && (
                              <NutrientDetail 
                                label="Sat. Fat" 
                                value={`${estimatedNutrition.saturatedFatEstimate.toFixed(1)}g`} 
                                delay={0.4}
                              />
                            )}
                            {estimatedNutrition.fiberEstimate !== undefined && estimatedNutrition.fiberEstimate >= 0 && (
                              <NutrientDetail 
                                label="Fiber" 
                                value={`${estimatedNutrition.fiberEstimate.toFixed(1)}g`} 
                                delay={0.45}
                              />
                            )}
                            {estimatedNutrition.sugarEstimate !== undefined && estimatedNutrition.sugarEstimate >= 0 && (
                              <NutrientDetail 
                                label="Sugar" 
                                value={`${estimatedNutrition.sugarEstimate.toFixed(1)}g`} 
                                delay={0.5}
                              />
                            )}
                            {estimatedNutrition.cholesterolEstimate !== undefined && estimatedNutrition.cholesterolEstimate >= 0 && (
                              <NutrientDetail 
                                label="Cholesterol" 
                                value={`${estimatedNutrition.cholesterolEstimate.toFixed(0)}mg`} 
                                delay={0.55}
                              />
                            )}
                            {estimatedNutrition.sodiumEstimate !== undefined && estimatedNutrition.sodiumEstimate >= 0 && (
                              <NutrientDetail 
                                label="Sodium" 
                                value={`${estimatedNutrition.sodiumEstimate.toFixed(0)}mg`} 
                                delay={0.6}
                              />
                            )}
                          </div>
                        </motion.div>
                      ) : null}
                    </div>
                    
                    {estimatedNutrition.commonIngredientsInfluence && (
                      <InfoSection 
                        icon={<Brain className="h-4 w-4 text-primary" />}
                        title="Nutritional Insights"
                        content={estimatedNutrition.commonIngredientsInfluence}
                        delay={0.6}
                      />
                    )}
                    
                    {(() => {
                      const benefits = estimatedNutrition.healthBenefits;
                      // Ensure benefits is an array for mapping, treat non-empty string as a single benefit
                      let benefitsToRender: string[] = [];
                      
                      if (Array.isArray(benefits)) {
                        benefitsToRender = benefits.filter(b => typeof b === 'string' && b.trim() !== '');
                      } else if (typeof benefits === 'string') {
                        const benefitStr = benefits as string;
                        if (benefitStr.trim() !== '') {
                          benefitsToRender = [benefitStr];
                        }
                      }

                      if (benefitsToRender.length > 0) {
                        return (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.7 }}
                            className="space-y-2"
                          >
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="h-4 w-4 text-primary" />
                              <h4 className="text-sm font-medium">Health Benefits</h4>
                            </div>
                            <div className="space-y-2 text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg">
                              {benefitsToRender.map((benefit, index) => (
                                <motion.div 
                                  key={index} 
                                  className="flex items-start gap-2"
                                  initial={{ opacity: 0, x: -5 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.7 + (index * 0.1) }}
                                >
                                  <motion.div 
                                    className="rounded-full h-1.5 w-1.5 bg-primary mt-1.5"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 10, delay: 0.7 + (index * 0.1) }}
                                  />
                                  <div>{benefit}</div>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        );
                      }
                      return null;
                    })()}

                    {estimatedNutrition.healthierTips && (
                      <InfoSection 
                        icon={<Leaf className="h-4 w-4 text-primary" />}
                        title="Healthier Options"
                        content={estimatedNutrition.healthierTips}
                        delay={0.8}
                        bgClass="bg-green-50/30 dark:bg-green-900/10"
                      />
                    )}

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.9 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        type="submit" 
                        disabled={isSubmittingLog || isAiEstimating || !foodName.trim() || !estimatedNutrition} 
                        className="w-full h-11 bg-primary group relative overflow-hidden"
                      >
                        <motion.span 
                          className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                          animate={{ x: ["0%", "100%"] }}
                          transition={{ 
                            repeat: Infinity, 
                            repeatType: "loop", 
                            duration: 2,
                            ease: "linear",
                            repeatDelay: 0.5
                          }}
                        />
                        <motion.div className="flex items-center justify-center">
                          {isSubmittingLog ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ 
                                repeat: Infinity, 
                                repeatType: "loop", 
                                duration: 2,
                                repeatDelay: 2
                              }}
                            >
                              <PlusCircle className="mr-2 h-4 w-4" />
                            </motion.div>
                          )}
                          <span>Add to Food Log</span>
                        </motion.div>
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

const NutritionBar: FC<{
  label: string;
  value: string;
  unit: string;
  color: string;
  delay: number;
  percent: number;
}> = ({ label, value, unit, color, delay, percent }) => (
  <motion.div 
    className="space-y-1"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 300, damping: 20, delay }}
  >
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <motion.span 
        className="font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.1 }}
      >
        {value} {unit}
      </motion.span>
    </div>
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.8, delay: delay + 0.2, ease: "easeOut" }}
        className={`h-full ${color}`}
      />
    </div>
  </motion.div>
);

const NutrientDetail: FC<{
  label: string;
  value: string;
  delay: number;
}> = ({ label, value, delay }) => (
  <motion.div 
    className="py-2"
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 300, damping: 20, delay }}
  >
    <motion.div 
      className="text-muted-foreground"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay + 0.1 }}
    >
      {label}
    </motion.div>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay + 0.2 }}
    >
      {value}
    </motion.div>
  </motion.div>
);

const InfoSection: FC<{
  icon: React.ReactNode;
  title: string;
  content: string;
  delay: number;
  bgClass?: string;
}> = ({ icon, title, content, delay, bgClass = "bg-muted/50" }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 300, damping: 20, delay }}
    className="space-y-2"
  >
    <motion.div 
      className="flex items-center gap-2"
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay + 0.1 }}
    >
      {icon}
      <h4 className="text-sm font-medium">{title}</h4>
    </motion.div>
    <motion.p 
      className={`text-xs text-muted-foreground ${bgClass} p-3 rounded-lg`}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ delay: delay + 0.2 }}
    >
      {content}
    </motion.p>
  </motion.div>
);


    