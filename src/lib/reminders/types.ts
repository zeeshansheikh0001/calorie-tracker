export type DrinkWaterFrequency =
  | "every_hour"
  | "every_2_hours"
  | "every_3_hours";

export type ReminderSettings = {
  logMeals: boolean;
  logMealsTime: string;
  drinkWater: boolean;
  drinkWaterFrequency: DrinkWaterFrequency | string;
  weighIn: boolean;
  weighInDay: string;
  weighInTime: string;
};

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  logMeals: true,
  logMealsTime: "19:00",
  drinkWater: false,
  drinkWaterFrequency: "every_2_hours",
  weighIn: false,
  weighInDay: "monday",
  weighInTime: "08:00",
};
