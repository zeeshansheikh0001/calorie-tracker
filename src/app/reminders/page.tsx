"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { BellRing, Save, CheckCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ReminderSettings {
  logMeals: boolean;
  logMealsTime: string;
  drinkWater: boolean;
  drinkWaterFrequency: string; // e.g., "every_2_hours"
  weighIn: boolean;
  weighInDay: string; // e.g., "monday"
  weighInTime: string;
}

const initialSettings: ReminderSettings = {
  logMeals: true,
  logMealsTime: "19:00",
  drinkWater: false,
  drinkWaterFrequency: "every_2_hours",
  weighIn: false,
  weighInDay: "monday",
  weighInTime: "08:00",
};

export default function RemindersPage() {
  const [settings, setSettings] = useState<ReminderSettings>(initialSettings);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // In a real app, load settings from localStorage or backend
  // useEffect(() => { ... load settings ... }, []);

  const handleSwitchChange = (checked: boolean, name: keyof ReminderSettings) => {
    setSettings((prev) => ({ ...prev, [name]: checked }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleSelectChange = (value: string, name: keyof ReminderSettings) => {
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      // In a real app, save settings and schedule actual notifications
      console.log("Reminder settings saved:", settings);
      localStorage.setItem("reminderSettings", JSON.stringify(settings));
      toast({
        title: "Reminders Updated!",
        description: "Your reminder preferences have been saved.",
        variant: "default",
        action: <CheckCircle className="text-green-500" />,
      });
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <BellRing className="mr-2 h-6 w-6 text-primary" />
            Smart Reminders
          </CardTitle>
          <CardDescription>
            Customize your notifications to stay on track with your health goals.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8">
            {/* Log Meals Reminder */}
            <div className="space-y-3 p-4 border border-border rounded-lg bg-card">
              <div className="flex items-center justify-between">
                <Label htmlFor="logMealsSwitch" className="text-base font-medium">
                  Remind to Log Evening Meal
                </Label>
                <Switch
                  id="logMealsSwitch"
                  checked={settings.logMeals}
                  onCheckedChange={(checked) => handleSwitchChange(checked, "logMeals")}
                />
              </div>
              {settings.logMeals && (
                <div>
                  <Label htmlFor="logMealsTime">Reminder Time</Label>
                  <Input
                    id="logMealsTime"
                    name="logMealsTime"
                    type="time"
                    value={settings.logMealsTime}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
              )}
            </div>

            {/* Drink Water Reminder */}
            <div className="space-y-3 p-4 border border-border rounded-lg bg-card">
              <div className="flex items-center justify-between">
                <Label htmlFor="drinkWaterSwitch" className="text-base font-medium">
                  Remind to Drink Water
                </Label>
                <Switch
                  id="drinkWaterSwitch"
                  checked={settings.drinkWater}
                  onCheckedChange={(checked) => handleSwitchChange(checked, "drinkWater")}
                />
              </div>
              {settings.drinkWater && (
                <div>
                  <Label htmlFor="drinkWaterFrequency">Frequency</Label>
                  <Select name="drinkWaterFrequency" value={settings.drinkWaterFrequency} onValueChange={(value) => handleSelectChange(value, "drinkWaterFrequency")}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="every_hour">Every Hour</SelectItem>
                      <SelectItem value="every_2_hours">Every 2 Hours</SelectItem>
                      <SelectItem value="every_3_hours">Every 3 Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Weigh-In Reminder */}
            <div className="space-y-3 p-4 border border-border rounded-lg bg-card">
              <div className="flex items-center justify-between">
                <Label htmlFor="weighInSwitch" className="text-base font-medium">
                  Weekly Weigh-In Reminder
                </Label>
                <Switch
                  id="weighInSwitch"
                  checked={settings.weighIn}
                  onCheckedChange={(checked) => handleSwitchChange(checked, "weighIn")}
                />
              </div>
              {settings.weighIn && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weighInDay">Day of Week</Label>
                     <Select name="weighInDay" value={settings.weighInDay} onValueChange={(value) => handleSelectChange(value, "weighInDay")}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monday">Monday</SelectItem>
                        <SelectItem value="tuesday">Tuesday</SelectItem>
                        <SelectItem value="wednesday">Wednesday</SelectItem>
                        <SelectItem value="thursday">Thursday</SelectItem>
                        <SelectItem value="friday">Friday</SelectItem>
                        <SelectItem value="saturday">Saturday</SelectItem>
                        <SelectItem value="sunday">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="weighInTime">Time</Label>
                    <Input
                      id="weighInTime"
                      name="weighInTime"
                      type="time"
                      value={settings.weighInTime}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <Save className="mr-2 h-4 w-4 animate-pulse" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Reminder Settings
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
