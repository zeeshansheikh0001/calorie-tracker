"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNotificationService } from "@/lib/notification-service";
import { useLocalReminders, type ReminderSettings } from "@/hooks/use-local-reminders";

// Utility function to convert VAPID public key to Uint8Array
const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

// VAPID public key from environment variables
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
import { 
  BellRing, Save, CheckCircle, Clock, Droplets, Scale, 
  CalendarCheck, RefreshCw, BellDot, Bell, BellOff, 
  Sparkles, AlarmCheck, Calendar, Smartphone, Globe, TestTube
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n/provider";

// ReminderSettings interface is now imported from the hook

// For rendering time in a more human-readable format
const formatTime = (time: string, locale: string) => {
  const [hours, minutes] = time.split(':');
  const date = new Date();
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  return new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(date);
};

export default function RemindersPage() {
  const { t, locale } = useLanguage();
  const { reminders, saveReminders, isLoading } = useLocalReminders();
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { isSupported, permission, requestPermission, sendTestNotification } = useNotificationService();

  // Reminder settings are now managed by the useLocalReminders hook

  const handleSwitchChange = (checked: boolean, name: keyof ReminderSettings) => {
    const updatedReminders = { ...reminders, [name]: checked };
    saveReminders(updatedReminders);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedReminders = { ...reminders, [e.target.name]: e.target.value };
    saveReminders(updatedReminders);
  };
  
  const handleSelectChange = (value: string, name: keyof ReminderSettings) => {
    const updatedReminders = { ...reminders, [name]: value };
    saveReminders(updatedReminders);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Simulate API call delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: t("reminders.updatedTitle"),
        description: t("reminders.updatedDesc"),
        variant: "default",
        action: <CheckCircle className="text-green-500" />,
      });
      
      // Send confirmation notification if permissions are granted
      if (permission === 'granted') {
        try {
          await sendTestNotification();
        } catch (error) {
          console.error('Error sending confirmation notification:', error);
        }
      }
    } catch (error) {
      console.error('Error saving reminder settings:', error);
      toast({
        title: t("error.title"),
        description: t("reminders.saveFailed"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnableNotifications = async () => {
    try {
      const granted = await requestPermission();
      if (granted) {
        toast({
          title: t("reminders.notificationsEnabledTitle"),
          description: t("reminders.notificationsEnabledDesc"),
          variant: "default",
          action: <CheckCircle className="text-green-500" />,
        });
      } else {
        toast({
          title: t("reminders.permissionDeniedTitle"),
          description: t("reminders.permissionDeniedDesc"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast({
        title: t("reminders.notificationSetupFailedTitle"),
        description: error instanceof Error ? error.message : t("reminders.notificationSetupFailedDesc"),
        variant: "destructive",
      });
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      toast({
        title: t("reminders.testSentTitle"),
        description: t("reminders.testSentDesc"),
        variant: "default",
      });
    } catch (error) {
      toast({
        title: t("reminders.testFailedTitle"),
        description: t("reminders.testFailedDesc"),
        variant: "destructive",
      });
    }
  };

  const resetToDefaults = () => {
    const defaultReminders: ReminderSettings = {
      logMeals: true,
      logMealsTime: "19:00",
      drinkWater: false,
      drinkWaterFrequency: "every_2_hours",
      weighIn: false,
      weighInDay: "monday",
      weighInTime: "08:00",
    };
    saveReminders(defaultReminders);
    toast({
      title: t("reminders.resetTitle"),
      description: t("reminders.resetDesc"),
      variant: "default",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{t("reminders.loading")}</p>
        </div>
      </div>
    );
  }

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
                <BellRing className="h-8 w-8 text-primary" />
              </div>
            </motion.div>
          </div>
          <h1 className="text-3xl font-bold mb-2">{t("reminders.title")}</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {t("reminders.subtitle")}
          </p>
          <div className="flex justify-center mt-6 space-x-4">
            <Button
              onClick={handleEnableNotifications}
              variant="default"
              disabled={!isSupported || permission === 'granted'}
            >
              {permission === 'granted' ? t("reminders.notificationsEnabled") : t("reminders.enableNotifications")}
            </Button>
          </div>
        </motion.div>

        <Card className="overflow-hidden border border-border/40 shadow-lg bg-gradient-to-b from-background to-muted/10">
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
              {t("reminders.settingsTitle")}
          </CardTitle>
            <CardDescription className="text-center">
              {t("reminders.settingsSubtext")}
          </CardDescription>
        </CardHeader>
          
          <CardContent className="py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Evening Meal Reminder */}
              <motion.div 
                className={`p-5 rounded-xl border ${reminders.logMeals ? 'border-primary/30 bg-primary/5' : 'border-border/50 bg-background/80'} relative overflow-hidden transition-colors duration-300`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-lg ${reminders.logMeals ? 'bg-primary/20 text-primary' : 'bg-muted/80'}`}>
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-medium">{t("reminders.eveningMealTitle")}</h3>
                      <p className="text-sm text-muted-foreground">{t("reminders.eveningMealDesc")}</p>
                    </div>
                  </div>
                  
                <Switch
                  checked={reminders.logMeals}
                  onCheckedChange={(checked) => handleSwitchChange(checked, "logMeals")}
                    className="data-[state=checked]:bg-primary"
                />
              </div>
                
                <AnimatePresence>
              {reminders.logMeals && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 border-t border-border/30">
                        <Label htmlFor="logMealsTime" className="text-sm font-medium mb-2 flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1.5 text-primary/70" /> {t("reminders.reminderTime")}
                        </Label>
                        <div className="mt-1 relative">
                  <Input
                    id="logMealsTime"
                    name="logMealsTime"
                    type="time"
                    value={reminders.logMealsTime}
                    onChange={handleInputChange}
                    className="bg-background/50"
                  />
                </div>
              </div>
            </motion.div>
              )}
            </AnimatePresence>
              </motion.div>
              
              {/* Drink Water Reminder */}
              <motion.div 
                className={`p-5 rounded-xl border ${reminders.drinkWater ? 'border-blue-500/30 bg-blue-500/5' : 'border-border/50 bg-background/80'} relative overflow-hidden transition-colors duration-300`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-lg ${reminders.drinkWater ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' : 'bg-muted/80'}`}>
                      <Droplets className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-medium">{t("reminders.hydrationTitle")}</h3>
                      <p className="text-sm text-muted-foreground">{t("reminders.hydrationDesc")}</p>
                    </div>
            </div>

                <Switch
                  checked={reminders.drinkWater}
                  onCheckedChange={(checked) => handleSwitchChange(checked, "drinkWater")}
                    className="data-[state=checked]:bg-blue-500"
                />
              </div>
                
                <AnimatePresence>
              {reminders.drinkWater && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 border-t border-border/30">
                        <Label htmlFor="drinkWaterFrequency" className="text-sm font-medium mb-2 flex items-center">
                          <Bell className="h-3.5 w-3.5 mr-1.5 text-blue-500/70" /> {t("reminders.frequency")}
                        </Label>
                        <div className="mt-1 relative">
                          <Select 
                            name="drinkWaterFrequency" 
                            value={reminders.drinkWaterFrequency} 
                            onValueChange={(value) => handleSelectChange(value, "drinkWaterFrequency")}
                          >
                            <SelectTrigger>
                      <SelectValue placeholder={t("reminders.selectFrequency")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="every_hour">{t("reminders.everyHour")}</SelectItem>
                      <SelectItem value="every_2_hours">{t("reminders.every2Hours")}</SelectItem>
                      <SelectItem value="every_3_hours">{t("reminders.every3Hours")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                        
                        <div className="flex items-center mt-3 text-xs text-muted-foreground">
                          <Droplets className="h-3 w-3 mr-1.5" />
                          <span>{t("reminders.hydrationHint")}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              
              {/* Weekly Weigh-In Reminder */}
              <motion.div 
                className={`p-5 rounded-xl border ${reminders.weighIn ? 'border-green-500/30 bg-green-500/5' : 'border-border/50 bg-background/80'} relative overflow-hidden transition-colors duration-300`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-lg ${reminders.weighIn ? 'bg-green-100 dark:bg-green-900/30 text-green-500' : 'bg-muted/80'}`}>
                      <Scale className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-medium">{t("reminders.weighInTitle")}</h3>
                      <p className="text-sm text-muted-foreground">{t("reminders.weighInDesc")}</p>
                    </div>
            </div>

                <Switch
                  checked={reminders.weighIn}
                  onCheckedChange={(checked) => handleSwitchChange(checked, "weighIn")}
                    className="data-[state=checked]:bg-green-500"
                />
              </div>
                
                <AnimatePresence>
              {reminders.weighIn && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 border-t border-border/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                            <Label htmlFor="weighInDay" className="text-sm font-medium mb-2 flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1.5 text-green-500/70" /> {t("reminders.dayOfWeek")}
                            </Label>
                            <div className="mt-1 relative">
                              <Select 
                                name="weighInDay" 
                                value={reminders.weighInDay} 
                                onValueChange={(value) => handleSelectChange(value, "weighInDay")}
                              >
                                <SelectTrigger>
                        <SelectValue placeholder={t("reminders.selectDay")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monday">{t("day.monday")}</SelectItem>
                        <SelectItem value="tuesday">{t("day.tuesday")}</SelectItem>
                        <SelectItem value="wednesday">{t("day.wednesday")}</SelectItem>
                        <SelectItem value="thursday">{t("day.thursday")}</SelectItem>
                        <SelectItem value="friday">{t("day.friday")}</SelectItem>
                        <SelectItem value="saturday">{t("day.saturday")}</SelectItem>
                        <SelectItem value="sunday">{t("day.sunday")}</SelectItem>
                      </SelectContent>
                    </Select>
                            </div>
                  </div>
                  <div>
                            <Label htmlFor="weighInTime" className="text-sm font-medium mb-2 flex items-center">
                              <Clock className="h-3.5 w-3.5 mr-1.5 text-green-500/70" /> {t("reminders.time")}
                            </Label>
                            <div className="mt-1 relative">
                    <Input
                      id="weighInTime"
                      name="weighInTime"
                      type="time"
                      value={reminders.weighInTime}
                      onChange={handleInputChange}
                      className="pr-16"
                              />
                              
                              <Badge className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none bg-green-100 dark:bg-green-900/30 text-green-500 border-green-200 dark:border-green-800 hover:bg-green-200 dark:hover:bg-green-900/40">
                                {formatTime(reminders.weighInTime, locale)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center mt-3 text-xs text-muted-foreground">
                          <AlarmCheck className="h-3 w-3 mr-1.5" />
                          <span>{t("reminders.weighInHint", { day: t(`day.${reminders.weighInDay}`), time: formatTime(reminders.weighInTime, locale) })}</span>
                  </div>
                </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              
              <div className="flex justify-between items-center mt-8 pt-4 border-t border-border/30">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetToDefaults}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  <span>{t("reminders.resetButton")}</span>
                </Button>
                <Button 
                  type="submit" 
                  className="flex items-center"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span className="animate-spin mr-2">
                        <RefreshCw className="h-4 w-4" />
                      </span>
                      <span>{t("reminders.saving")}</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      <span>{t("reminders.saveSettings")}</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
      </Card>
      </motion.div>
    </div>
  );
}
