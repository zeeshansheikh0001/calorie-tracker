
"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, AlertCircle, ListChecks, Utensils, Dumbbell, Droplets, BedDouble, Brain, Info } from "lucide-react";
import { generateHealthSchedule, type GenerateHealthScheduleInput, type GenerateHealthScheduleOutput } from "@/ai/flows/generate-health-schedule-flow";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<GenerateHealthScheduleOutput | null>(null);
  const { toast } = useToast();

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSchedule(null);

    try {
      // Basic validation example
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
      setError(errorMessage);
      toast({
        title: "Error Generating Schedule",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const ScheduleSection: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode; className?: string }> = ({ title, icon: Icon, children, className }) => (
    <Card className={`shadow-md hover:shadow-lg transition-shadow duration-300 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center text-primary">
          <Icon className="mr-2 h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        {children}
      </CardContent>
    </Card>
  );


  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto shadow-xl animate-in fade-in-0 slide-in-from-bottom-5 duration-500">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl font-bold">Personalized AI Health Planner</CardTitle>
          </div>
          <CardDescription>
            Fill in your details, and our AI will generate a tailored daily health schedule for you. 
            The more accurate your input, the better the plan!
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <Accordion type="multiple" collapsible className="w-full space-y-3">
              <AccordionItem value="goals-macros">
                <AccordionTrigger className="text-lg font-medium hover:no-underline px-3 py-3 bg-muted/50 rounded-md">Nutritional Goals & Macros</AccordionTrigger>
                <AccordionContent className="pt-4 px-1 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="calorieGoal">Daily Calorie Goal (kcal)</Label>
                      <Input type="number" name="calorieGoal" id="calorieGoal" value={formState.calorieGoal} onChange={handleInputChange} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="proteinGoal">Daily Protein Goal (g)</Label>
                      <Input type="number" name="proteinGoal" id="proteinGoal" value={formState.proteinGoal} onChange={handleInputChange} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="fatGoal">Daily Fat Goal (g)</Label>
                      <Input type="number" name="fatGoal" id="fatGoal" value={formState.fatGoal} onChange={handleInputChange} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="carbGoal">Daily Carb Goal (g)</Label>
                      <Input type="number" name="carbGoal" id="carbGoal" value={formState.carbGoal} onChange={handleInputChange} className="mt-1" />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="lifestyle">
                <AccordionTrigger className="text-lg font-medium hover:no-underline px-3 py-3 bg-muted/50 rounded-md">Lifestyle & Preferences</AccordionTrigger>
                <AccordionContent className="pt-4 px-1 space-y-4">
                  <div>
                    <Label htmlFor="weightGoalType">Primary Weight/Health Goal</Label>
                    <Select name="weightGoalType" value={formState.weightGoalType} onValueChange={(value) => handleSelectChange("weightGoalType", value)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select goal" /></SelectTrigger>
                      <SelectContent>
                        {weightGoalTypes.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="activityLevel">Activity Level</Label>
                    <Select name="activityLevel" value={formState.activityLevel} onValueChange={(value) => handleSelectChange("activityLevel", value)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select activity level" /></SelectTrigger>
                      <SelectContent>
                        {activityLevels.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="primaryFocus">Primary Fitness/Health Focus (Optional)</Label>
                     <Select name="primaryFocus" value={formState.primaryFocus} onValueChange={(value) => handleSelectChange("primaryFocus", value)}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select primary focus (optional)" /></SelectTrigger>
                        <SelectContent>
                            {primaryFocusOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                  </div>
                   <div>
                      <Label htmlFor="sleepHoursGoal">Target Sleep Hours (Optional)</Label>
                      <Input type="number" name="sleepHoursGoal" id="sleepHoursGoal" value={formState.sleepHoursGoal || ''} onChange={handleInputChange} placeholder="e.g., 8" className="mt-1" min="0" max="16" />
                    </div>
                  <div>
                    <Label>Dietary Preferences/Restrictions (Optional)</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {allDietaryPreferences.map(pref => (
                        <div key={pref.id} className="flex items-center space-x-2 p-2 border rounded-md bg-background">
                          <Checkbox
                            id={`diet-${pref.id}`}
                            checked={formState.dietaryPreferences?.includes(pref.id)}
                            onCheckedChange={(checked) => handleDietaryPreferenceChange(pref.id, checked)}
                          />
                          <Label htmlFor={`diet-${pref.id}`} className="text-sm font-normal cursor-pointer">{pref.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate My Health Schedule
            </Button>
          </CardFooter>
        </form>
      </Card>

      {error && (
        <Alert variant="destructive" className="mt-6 max-w-3xl mx-auto animate-in fade-in-0 slide-in-from-bottom-3 duration-500">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {schedule && !isLoading && (
        <Card className="mt-8 max-w-3xl mx-auto shadow-xl animate-in fade-in-0 zoom-in-95 duration-700">
          <CardHeader className="bg-primary/10 rounded-t-lg">
            <CardTitle className="text-xl font-bold text-primary flex items-center">
              <ListChecks className="mr-2 h-6 w-6" />
              {schedule.dailyScheduleTitle}
            </CardTitle>
            {schedule.introduction && <CardDescription className="pt-1 text-sm">{schedule.introduction}</CardDescription>}
          </CardHeader>
          <CardContent className="p-4 md:p-6 space-y-6">
            <ScheduleSection title="Meal Plan & Timings" icon={Utensils}>
              <ul className="space-y-3">
                {schedule.mealTimingsAndPortions.map((meal, index) => (
                  <li key={index} className="p-3 border rounded-md bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <p className="font-semibold text-primary/90">{meal.mealType} <span className="text-xs text-muted-foreground">({meal.time})</span></p>
                    <p className="text-foreground/80">{meal.suggestion}</p>
                  </li>
                ))}
              </ul>
            </ScheduleSection>

            <ScheduleSection title="Workout Suggestion" icon={Dumbbell}>
              <p className="font-semibold text-primary/90">{schedule.workoutSuggestion.workoutType} {schedule.workoutSuggestion.time && <span className="text-xs text-muted-foreground">({schedule.workoutSuggestion.time})</span>}</p>
              <p className="text-foreground/80 whitespace-pre-line">{schedule.workoutSuggestion.description}</p>
              {schedule.workoutSuggestion.notes && <p className="mt-2 text-xs text-muted-foreground italic">Note: {schedule.workoutSuggestion.notes}</p>}
            </ScheduleSection>

            <div className="grid md:grid-cols-2 gap-6">
                 <ScheduleSection title="Hydration Reminder" icon={Droplets}>
                    <p className="font-semibold text-primary/90">Target: {schedule.hydrationReminder.target}</p>
                    <ul className="list-disc pl-5 mt-1 space-y-0.5">
                        {schedule.hydrationReminder.tips.map((tip, i) => <li key={i} className="text-foreground/80">{tip}</li>)}
                    </ul>
                </ScheduleSection>

                <ScheduleSection title="Sleep Suggestion" icon={BedDouble}>
                    <p className="font-semibold text-primary/90">Target: {schedule.sleepSuggestion.target}</p>
                    {schedule.sleepSuggestion.bedtimeRoutineTip && <p className="mt-1 text-foreground/80">{schedule.sleepSuggestion.bedtimeRoutineTip}</p>}
                </ScheduleSection>
            </div>


            <ScheduleSection title="Nutrient Balance Tip" icon={Brain}>
              <p className="text-foreground/80">{schedule.nutrientBalanceTip}</p>
            </ScheduleSection>

            {schedule.generalNotes && (
                 <ScheduleSection title="General Notes" icon={Info} className="bg-muted/30">
                    <p className="text-foreground/80 italic">{schedule.generalNotes}</p>
                </ScheduleSection>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
