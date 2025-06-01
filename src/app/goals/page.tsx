"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Target, Save, CheckCircle, Flame, Drumstick, 
  Droplets, Wheat, Info, ArrowUp, ArrowDown, 
  RefreshCw, Sparkles
} from "lucide-react";
import type { Goal } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Suspense } from "react";

const initialGoals: Goal = {
  calories: 2000,
  protein: 150,
  fat: 70,
  carbs: 250,
};

// Recommended ranges based on common nutritional guidelines
const recommendedRanges = {
  calories: { min: 1200, max: 3000, unit: 'kcal' },
  protein: { min: 50, max: 200, unit: 'g' },
  fat: { min: 30, max: 100, unit: 'g' },
  carbs: { min: 100, max: 350, unit: 'g' },
};

function GoalsPageContent() {
  const [goals, setGoals] = useState<Goal>(initialGoals);
  const [isLoading, setIsLoading] = useState(false);
  const [activeField, setActiveField] = useState<keyof Goal | null>(null);
  const [savedGoals, setSavedGoals] = useState<Goal | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedGoals = localStorage.getItem("userGoals");
    if (storedGoals) {
      const parsedGoals = JSON.parse(storedGoals);
      setGoals(parsedGoals);
      setSavedGoals(parsedGoals);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGoals((prevGoals) => ({
      ...prevGoals,
      [name]: value === "" ? 0 : parseInt(value, 10) || 0,
    }));
  };

  const handleSliderChange = (name: keyof Goal, value: number[]) => {
    setGoals((prevGoals) => ({
      ...prevGoals,
      [name]: value[0],
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem("userGoals", JSON.stringify(goals));
      setSavedGoals(goals);
      toast({
        title: "Goals Updated!",
        description: "Your nutritional goals have been saved successfully.",
        variant: "default",
        action: <CheckCircle className="text-green-500" />,
      });
      setIsLoading(false);
    }, 800);
  };

  const getGoalStatus = (goal: keyof Goal) => {
    if (!savedGoals) return null;
    
    if (goals[goal] > savedGoals[goal]) return "increase";
    if (goals[goal] < savedGoals[goal]) return "decrease";
    return "same";
  };

  const resetToDefaults = () => {
    setGoals(initialGoals);
  };

  // Calculate if goals are within recommended ranges
  const isWithinRange = (goal: keyof Goal) => {
    const value = goals[goal];
    const range = recommendedRanges[goal];
    return value >= range.min && value <= range.max;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <motion.div 
          className="mb-8 text-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-flex items-center justify-center mb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.7, delay: 0.5, type: "spring" }}
              className="relative"
            >
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
              <div className="bg-primary/10 p-3.5 rounded-full relative">
                <Target className="h-8 w-8 text-primary" />
              </div>
            </motion.div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Nutrition Goals</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Set your personalized nutrition targets to track progress and achieve your health objectives.
          </p>
        </motion.div>

        <Card className="border border-border/40 shadow-lg overflow-hidden bg-gradient-to-b from-background to-muted/10">
          <CardHeader className="border-b border-border/10 pb-4">
            <CardTitle className="text-xl font-semibold text-center relative">
              <motion.div
                className="absolute -top-4 right-0 text-primary/20"
                initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                <Sparkles className="h-8 w-8" />
              </motion.div>
              Interactive Goal Setting
            </CardTitle>
            <CardDescription className="text-center">
              Drag the sliders to adjust your nutritional goals
            </CardDescription>
          </CardHeader>
          
          <CardContent className="py-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {Object.entries(goals).map(([key, value]) => {
                const goalKey = key as keyof Goal;
                const range = recommendedRanges[goalKey];
                const withinRange = isWithinRange(goalKey);
                
                return (
                  <motion.div 
                    key={key}
                    className="space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * Object.keys(goals).indexOf(key) }}
                    whileHover={{ scale: 1.01 }}
                    onFocus={() => setActiveField(goalKey)}
                    onBlur={() => setActiveField(null)}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full mr-2 ${
                          key === 'calories' ? 'bg-red-100 dark:bg-red-900/30' :
                          key === 'protein' ? 'bg-blue-100 dark:bg-blue-900/30' :
                          key === 'fat' ? 'bg-amber-100 dark:bg-amber-900/30' :
                          'bg-emerald-100 dark:bg-emerald-900/30'
                        }`}>
                          {key === 'calories' ? <Flame className="h-4 w-4 text-red-500" /> :
                           key === 'protein' ? <Drumstick className="h-4 w-4 text-blue-500" /> :
                           key === 'fat' ? <Droplets className="h-4 w-4 text-amber-500" /> :
                           <Wheat className="h-4 w-4 text-emerald-500" />}
                        </div>
                        <Label htmlFor={key} className="font-medium">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </Label>
                      </div>
                      
                      <motion.div 
                        className="flex items-center"
                        animate={{ 
                          x: getGoalStatus(goalKey) !== 'same' ? [0, 3, 0] : 0 
                        }}
                        transition={{ repeat: getGoalStatus(goalKey) !== 'same' ? 2 : 0, duration: 0.2 }}
                      >
                        <div
                          className={`relative text-sm font-bold px-3 py-1 rounded-md ${
                            withinRange 
                              ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                              : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20' 
                          }`}
                        >
                          {value} {range.unit}
                          {getGoalStatus(goalKey) === 'increase' && (
                            <motion.div 
                              className="absolute -top-1 -right-1 text-green-500"
                              animate={{ y: [0, -3, 0] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                              <ArrowUp className="h-3 w-3" />
                            </motion.div>
                          )}
                          {getGoalStatus(goalKey) === 'decrease' && (
                            <motion.div 
                              className="absolute -bottom-1 -right-1 text-amber-500"
                              animate={{ y: [0, 3, 0] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                              <ArrowDown className="h-3 w-3" />
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    </div>
                    
                    <div className="relative pt-1 px-1">
                      <Slider
                        defaultValue={[value]}
                        value={[value]}
                        min={range.min / 2}
                        max={range.max * 1.5}
                        step={key === 'calories' ? 50 : 5}
                        onValueChange={(v) => handleSliderChange(goalKey, v)}
                        className={activeField === goalKey ? "z-10" : ""}
                      />
                      <motion.div 
                        className={`h-8 absolute inset-x-0 -top-1 -bottom-1 rounded-full -z-10 opacity-10 ${
                          key === 'calories' ? 'bg-red-500' :
                          key === 'protein' ? 'bg-blue-500' :
                          key === 'fat' ? 'bg-amber-500' :
                          'bg-emerald-500'
                        }`}
                        animate={{ 
                          opacity: activeField === goalKey ? 0.15 : 0.05,
                          scale: activeField === goalKey ? 1 : 0.98,
                        }}
                      />
                      
                      {/* Recommended range indicator */}
                      <div className="relative h-1 mt-2">
                        <div 
                          className="absolute h-1 bg-green-200 dark:bg-green-900/30 rounded-full"
                          style={{
                            left: `${(range.min / (range.max * 1.5)) * 100}%`,
                            right: `${100 - ((range.max / (range.max * 1.5)) * 100)}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{range.min}</span>
                        <span>{range.max}</span>
                      </div>
                    </div>
                    
                    {/* Recommendation badge */}
                    {!withinRange && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex items-center mt-1"
                      >
                        <Badge variant="outline" className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                          <Info className="h-3 w-3 mr-1" />
                          Recommended: {range.min}-{range.max} {range.unit}
                        </Badge>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
              
              <div className="flex justify-between pt-4 border-t border-border/30">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetToDefaults}
                  className="group"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5 group-hover:rotate-180 transition-transform duration-500" />
                  Reset
                </Button>
                
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="relative overflow-hidden group"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="mr-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <Save className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  )}
                  <span>{isLoading ? 'Saving...' : 'Save Goals'}</span>
                  
                  <motion.div
                    className="absolute inset-0 bg-primary/10"
                    initial={{ x: '-100%' }}
                    animate={{ 
                      x: isLoading ? '0%' : '-100%' 
                    }}
                    transition={{ duration: 0.8 }}
                  />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function GoalsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading nutrition goals...</div>}>
      <GoalsPageContent />
    </Suspense>
  );
}
