"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, User, Calendar, Flame, Drumstick, Droplets, Wheat } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useGoals } from "@/hooks/use-goals";

interface UserProfile {
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  height: number; // Height in cm
  weight: number; // Weight in kg
}

// Default recommended values based on gender (simplified)
const getDefaultValues = (gender: "male" | "female" | "other", age: number): Partial<UserProfile> => {
  if (gender === "male") {
    return {
      calories: 2500,
      protein: 180,
      fat: 80,
      carbs: 300,
      height: 175, // Average male height in cm
      weight: 75,  // Average male weight in kg
    };
  } else if (gender === "female") {
    return {
      calories: 2000,
      protein: 140,
      fat: 65,
      carbs: 250,
      height: 162, // Average female height in cm
      weight: 62,  // Average female weight in kg
    };
  } else {
    return {
      calories: 2200,
      protein: 160,
      fat: 70,
      carbs: 280,
      height: 168, // Average height in cm
      weight: 68,  // Average weight in kg
    };
  }
};

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    age: 30,
    gender: "male",
    calories: 2500,
    protein: 180,
    fat: 80,
    carbs: 300,
    height: 175, // Default height in cm
    weight: 75,  // Default weight in kg
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasUserProfile, setHasUserProfile] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();
  const { updateGoals } = useGoals();

  // Check if user already completed onboarding
  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      setHasUserProfile(true);
      // We'll let the app layout handle redirection to prevent loops
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: name === "age" ? parseInt(value) || 0 : value,
    }));
  };

  const handleGenderChange = (value: "male" | "female" | "other") => {
    const defaults = getDefaultValues(value, profile.age);
    setProfile((prev) => ({
      ...prev,
      gender: value,
      ...defaults,
    }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: parseInt(value) || 0,
    }));
  };

  const handleNextStep = () => {
    if (step === 1) {
      // Validate first step
      if (!profile.name) {
        toast({
          variant: "destructive",
          title: "Missing name",
          description: "Please enter your name to continue.",
        });
        return;
      }
      if (profile.age < 12 || profile.age > 100) {
        toast({
          variant: "destructive",
          title: "Invalid age",
          description: "Please enter a valid age between 12 and 100.",
        });
        return;
      }
      setStep(2);
    } else {
      // Submit the form
      handleSubmit();
    }
  };

  const handlePreviousStep = () => {
    setStep(1);
  };

  const handleSubmit = () => {
    setIsLoading(true);
    
    // Validate nutrition values
    if (profile.calories < 1000 || profile.protein < 10 || profile.fat < 10 || profile.carbs < 10) {
      toast({
        variant: "destructive",
        title: "Invalid nutrition values",
        description: "Please enter reasonable values for your nutrition goals.",
      });
      setIsLoading(false);
      return;
    }
    
    // Validate height and weight
    if (profile.height < 100 || profile.height > 250 || profile.weight < 30 || profile.weight > 300) {
      toast({
        variant: "destructive",
        title: "Invalid height or weight",
        description: "Please enter reasonable values for your height and weight.",
      });
      setIsLoading(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      // Save user profile to localStorage
      localStorage.setItem("userProfile", JSON.stringify({
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        height: profile.height,
        weight: profile.weight,
        // Include email with a default value
        email: `${profile.name.toLowerCase().replace(/\s+/g, '.')}@example.com`
      }));
      
      // Save nutrition goals to the same location used by the Goals page
      const nutritionGoals = {
        calories: profile.calories,
        protein: profile.protein,
        fat: profile.fat,
        carbs: profile.carbs
      };
      
      // Use the updateGoals function from the hook to ensure consistency
      updateGoals(nutritionGoals);
      
      // Show success message
      toast({
        title: "Profile Saved!",
        description: "Your profile and nutrition goals have been created successfully.",
      });
      
      // Redirect to dashboard
      router.push("/");
      setIsLoading(false);
    }, 1500);
  };

  if (hasUserProfile) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-lg mb-4">You already have a profile! Redirecting...</p>
            <Button 
              onClick={() => router.push("/")}
              className="mt-4"
            >
              Go to Dashboard
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-screen relative">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-5 pointer-events-none"
        style={{
          backgroundImage: "url('/images/running-man.png')",
          backgroundBlendMode: "overlay"
        }}
        aria-hidden="true"
      />
      
      <motion.div 
        className="max-w-lg w-full relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="relative w-48 h-1 bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="absolute left-0 top-0 bottom-0 bg-primary"
              initial={{ width: "50%" }}
              animate={{ width: step === 1 ? "50%" : "100%" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-border/40 shadow-xl bg-card/95 backdrop-blur-sm overflow-hidden">
                <CardHeader className="space-y-1 text-center pb-6">
                  <div className="flex justify-center mb-2">
                    <motion.div
                      className="relative"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 260, 
                        damping: 20,
                        delay: 0.1 
                      }}
                    >
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                      <div className="p-3 rounded-full bg-primary/10 relative">
                        <User className="h-8 w-8 text-primary" />
                      </div>
                    </motion.div>
                  </div>
                  
                  <CardTitle className="text-2xl font-bold flex justify-center items-center gap-2">
                    Welcome to CalorieTracker
                    <motion.div
                      initial={{ opacity: 0, rotate: -20 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    >
                      <Sparkles className="h-5 w-5 text-primary" />
                    </motion.div>
                  </CardTitle>
                  <CardDescription className="text-center max-w-sm mx-auto">
                    Let's set up your profile to personalize your experience.
                    This will help us provide accurate nutrition recommendations.
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6 px-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-1 text-muted-foreground">
                        <User className="h-3.5 w-3.5" /> Your Name
                      </Label>
                      <motion.div
                        whileTap={{ scale: 0.99 }}
                      >
                        <Input
                          id="name"
                          name="name"
                          value={profile.name}
                          onChange={handleInputChange}
                          className="bg-background/50"
                          placeholder="Enter your name"
                          autoComplete="off"
                        />
                      </motion.div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="age" className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" /> Your Age
                      </Label>
                      <motion.div
                        whileTap={{ scale: 0.99 }}
                      >
                        <Input
                          id="age"
                          name="age"
                          type="number"
                          value={profile.age === 0 ? "" : profile.age}
                          onChange={handleInputChange}
                          className="bg-background/50"
                          placeholder="Enter your age"
                          min={12}
                          max={100}
                        />
                      </motion.div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="height" className="flex items-center gap-1 text-muted-foreground">
                        <User className="h-3.5 w-3.5" /> Your Height (cm)
                      </Label>
                      <motion.div
                        whileTap={{ scale: 0.99 }}
                      >
                        <Input
                          id="height"
                          name="height"
                          type="number"
                          value={profile.height}
                          onChange={handleNumberInputChange}
                          className="bg-background/50"
                          placeholder="Enter your height in cm"
                          min={100}
                          max={250}
                        />
                      </motion.div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="weight" className="flex items-center gap-1 text-muted-foreground">
                        <Drumstick className="h-3.5 w-3.5" /> Your Weight (kg)
                      </Label>
                      <motion.div
                        whileTap={{ scale: 0.99 }}
                      >
                        <Input
                          id="weight"
                          name="weight"
                          type="number"
                          value={profile.weight}
                          onChange={handleNumberInputChange}
                          className="bg-background/50"
                          placeholder="Enter your weight in kg"
                          min={30}
                          max={300}
                        />
                      </motion.div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1 text-muted-foreground">
                        Gender
                      </Label>
                      <RadioGroup 
                        value={profile.gender} 
                        onValueChange={(value) => handleGenderChange(value as "male" | "female" | "other")}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="male" id="male" />
                          <Label htmlFor="male" className="cursor-pointer">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="female" id="female" />
                          <Label htmlFor="female" className="cursor-pointer">Female</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="other" id="other" />
                          <Label htmlFor="other" className="cursor-pointer">Other</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-end pt-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      onClick={handleNextStep} 
                      className="gap-1 group relative overflow-hidden"
                    >
                      Next
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      <motion.div
                        className="absolute inset-0 bg-primary/10"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '0%' }}
                        transition={{ duration: 0.3 }}
                      />
                    </Button>
                  </motion.div>
                </CardFooter>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-border/40 shadow-xl bg-card/95 backdrop-blur-sm overflow-hidden">
                <CardHeader className="space-y-1 text-center pb-6">
                  <div className="flex justify-center mb-2">
                    <motion.div
                      className="relative"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 260, 
                        damping: 20,
                        delay: 0.1 
                      }}
                    >
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                      <div className="p-3 rounded-full bg-primary/10 relative">
                        <Flame className="h-8 w-8 text-red-500" />
                      </div>
                    </motion.div>
                  </div>
                  
                  <CardTitle className="text-2xl font-bold">
                    Set Your Nutrition Goals
                  </CardTitle>
                  <CardDescription className="text-center max-w-sm mx-auto">
                    We've set some recommended values based on your profile. 
                    Feel free to adjust them to your specific needs.
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6 px-6">
                  <div className="space-y-4">
                    <NutritionInput 
                      label="Daily Calories" 
                      name="calories"
                      value={profile.calories}
                      onChange={handleNumberInputChange}
                      icon={<Flame className="h-5 w-5 text-red-500" />}
                      color="red"
                      unit="kcal"
                      min={1000}
                      max={5000}
                    />
                    
                    <NutritionInput 
                      label="Daily Protein" 
                      name="protein"
                      value={profile.protein}
                      onChange={handleNumberInputChange}
                      icon={<Drumstick className="h-5 w-5 text-blue-500" />}
                      color="blue"
                      unit="g"
                      min={10}
                      max={300}
                    />
                    
                    <NutritionInput 
                      label="Daily Fat" 
                      name="fat"
                      value={profile.fat}
                      onChange={handleNumberInputChange}
                      icon={<Droplets className="h-5 w-5 text-amber-500" />}
                      color="amber"
                      unit="g"
                      min={10}
                      max={200}
                    />
                    
                    <NutritionInput 
                      label="Daily Carbohydrates" 
                      name="carbs"
                      value={profile.carbs}
                      onChange={handleNumberInputChange}
                      icon={<Wheat className="h-5 w-5 text-emerald-500" />}
                      color="emerald"
                      unit="g"
                      min={10}
                      max={500}
                    />
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between pt-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      variant="outline" 
                      onClick={handlePreviousStep}
                      className="gap-1"
                    >
                      Back
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      onClick={handleNextStep} 
                      disabled={isLoading}
                      className="gap-1 relative overflow-hidden"
                    >
                      {isLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="mr-2"
                          >
                            <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </motion.div>
                          Processing...
                        </>
                      ) : (
                        <>
                          Complete Setup
                          <Sparkles className="h-4 w-4 ml-1" />
                        </>
                      )}
                      <motion.div
                        className="absolute inset-0 bg-primary/10"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '0%' }}
                        transition={{ duration: 0.3 }}
                      />
                    </Button>
                  </motion.div>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Step Indicators */}
        <div className="flex justify-center mt-6 gap-2">
          <motion.div 
            className={`h-2 w-2 rounded-full ${step === 1 ? 'bg-primary' : 'bg-muted'}`}
            animate={{ scale: step === 1 ? 1.2 : 1 }}
            transition={{ duration: 0.3 }}
          />
          <motion.div 
            className={`h-2 w-2 rounded-full ${step === 2 ? 'bg-primary' : 'bg-muted'}`}
            animate={{ scale: step === 2 ? 1.2 : 1 }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>
    </div>
  );
}

interface NutritionInputProps {
  label: string;
  name: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  color: "red" | "blue" | "amber" | "emerald";
  unit: string;
  min: number;
  max: number;
}

function NutritionInput({ 
  label, 
  name, 
  value, 
  onChange, 
  icon, 
  color,
  unit,
  min,
  max
}: NutritionInputProps) {
  const colorClasses = {
    red: "bg-red-100 dark:bg-red-900/30 text-red-500 border-red-200 dark:border-red-800",
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-500 border-blue-200 dark:border-blue-800",
    amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-500 border-amber-200 dark:border-amber-800",
    emerald: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 border-emerald-200 dark:border-emerald-800",
  };
  
  return (
    <motion.div 
      className="space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center space-x-2">
        <div className={cn("p-2 rounded-md", colorClasses[color])}>
          {icon}
        </div>
        <Label htmlFor={name} className="font-medium">{label}</Label>
      </div>
      
      <div className="relative">
        <Input
          id={name}
          name={name}
          type="number"
          value={value}
          onChange={onChange}
          className={`pr-12 ${color === 'red' ? 'focus:ring-red-500/20' : color === 'blue' ? 'focus:ring-blue-500/20' : color === 'amber' ? 'focus:ring-amber-500/20' : 'focus:ring-emerald-500/20'}`}
          min={min}
          max={max}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">
          {unit}
        </div>
      </div>
      
      <div className="h-1 w-full bg-muted/50 rounded-full overflow-hidden">
        <motion.div 
          className={cn("h-full", 
            color === 'red' ? 'bg-red-500' : 
            color === 'blue' ? 'bg-blue-500' : 
            color === 'amber' ? 'bg-amber-500' : 
            'bg-emerald-500'
          )}
          initial={{ width: "0%" }}
          animate={{ width: `${Math.min(100, (value / max) * 100)}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </motion.div>
  );
} 