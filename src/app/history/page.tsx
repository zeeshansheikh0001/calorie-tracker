"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Flame, Drumstick, Droplets, Wheat, Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import type { FoodEntry } from "@/types";

interface DailyLogEntry {
  date: string; // YYYY-MM-DD
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

function formatDate(date: Date) {
  // Returns YYYY-MM-DD in local time
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function HistoryPage() {
  const [logs, setLogs] = useState<DailyLogEntry[]>([]);
  const [foodLogs, setFoodLogs] = useState<Record<string, FoodEntry[]>>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    // Gather all daily logs and food entries from localStorage
    const entries: DailyLogEntry[] = [];
    const foodMap: Record<string, FoodEntry[]> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("dailyLog_")) {
        try {
          const log = JSON.parse(localStorage.getItem(key) || "null");
          if (log && log.date && typeof log.calories === "number") {
            entries.push(log);
            // Fetch food entries for this date
            const foodKey = `foodEntries_${log.date}`;
            const foodRaw = localStorage.getItem(foodKey);
            if (foodRaw) {
              foodMap[log.date] = JSON.parse(foodRaw);
            } else {
              foodMap[log.date] = [];
            }
          }
        } catch {}
      }
    }
    // Sort by date descending
    entries.sort((a, b) => b.date.localeCompare(a.date));
    setLogs(entries);
    setFoodLogs(foodMap);
  }, []);

  // Filter logs by selected date
  const filteredLogs = selectedDate
    ? logs.filter((log) => log.date === formatDate(selectedDate))
    : logs;

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CalendarIcon className="h-7 w-7 text-primary" />
          History
        </h1>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 2px 12px 0 rgba(0,0,0,0.10)" }}
              whileTap={{ scale: 0.97 }}
              className={
                `flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-primary/80 text-white font-semibold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40` +
                (selectedDate ? "" : " opacity-90")
              }
              onClick={() => setIsCalendarOpen((open) => !open)}
              type="button"
            >
              <CalendarIcon className="h-5 w-5 text-white/90" />
              <span className="font-poppins text-base tracking-wide">
                {selectedDate ? (
                  <span className="text-white/90 font-bold">{formatDate(selectedDate)}</span>
                ) : (
                  <span className="text-white/80">Pick a date</span>
                )}
              </span>
            </motion.button>
          </PopoverTrigger>
          <AnimatePresence>
            {isCalendarOpen && (
              <PopoverContent
                className="w-auto p-0 rounded-2xl shadow-2xl border-0 bg-background/95 animate-fade-in"
                align="end"
                asChild
              >
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18 }}
                >
                  <Calendar
                    mode="single"
                    selected={selectedDate || undefined}
                    onSelect={(date) => {
                      setSelectedDate(date ?? null);
                      setIsCalendarOpen(false);
                    }}
                    className="rounded-xl border-none shadow-none font-poppins"
                    disabled={(date) => date > new Date()}
                    captionLayout="dropdown"
                    fromYear={2020}
                    toYear={new Date().getFullYear()}
                    classNames={{
                      caption_label: "text-base font-semibold text-primary/90",
                      nav: "space-x-2 flex items-center",
                      nav_button: "h-8 w-8 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-all",
                      dropdown: "rounded-lg border border-primary/20 px-2 py-1 text-sm font-medium text-primary bg-background/80 focus:outline-none focus:ring-2 focus:ring-primary/30",
                    }}
                  />
                  {selectedDate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2 rounded-full text-primary/90 hover:bg-primary/10"
                      onClick={() => {
                        setSelectedDate(null);
                        setIsCalendarOpen(false);
                      }}
                    >
                      Clear date filter
                    </Button>
                  )}
                </motion.div>
              </PopoverContent>
            )}
          </AnimatePresence>
        </Popover>
      </div>
      {filteredLogs.length === 0 ? (
        <div className="text-center text-muted-foreground mt-16 text-lg">
          {selectedDate
            ? `No log found for ${formatDate(selectedDate)}.`
            : "No past logs found. Start logging your meals to see your history here!"}
        </div>
      ) : (
        <div className="space-y-5">
          {filteredLogs.map((log) => (
            <Card key={log.date} className="shadow-lg rounded-xl">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  {log.date}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Daily Summary
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 py-4">
                <div className="flex flex-row gap-6 justify-between items-center">
                  <div className="flex flex-col items-center">
                    <Flame className="h-6 w-6 text-red-500 mb-1" />
                    <span className="font-bold text-lg">{log.calories}</span>
                    <span className="text-xs text-muted-foreground">kcal</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Wheat className="h-6 w-6 text-emerald-500 mb-1" />
                    <span className="font-bold text-lg">{log.carbs}</span>
                    <span className="text-xs text-muted-foreground">Carbs</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Drumstick className="h-6 w-6 text-blue-500 mb-1" />
                    <span className="font-bold text-lg">{log.protein}</span>
                    <span className="text-xs text-muted-foreground">Protein</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Droplets className="h-6 w-6 text-amber-500 mb-1" />
                    <span className="font-bold text-lg">{log.fat}</span>
                    <span className="text-xs text-muted-foreground">Fat</span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="font-semibold text-primary mb-1 text-base">Meals:</div>
                  {foodLogs[log.date] && foodLogs[log.date].length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {foodLogs[log.date].map((entry) => (
                        <Card key={entry.id} className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden rounded-xl relative">
                          <CardContent className="p-4 space-y-3 mr-8">
                            <div className="flex justify-between items-start">
                              <h3 className="text-lg font-semibold text-foreground flex-1 truncate title-poppins" title={entry.name}>{entry.name}</h3>
                              <div className="flex items-center font-bold text-lg text-poppins" style={{color: 'hsl(var(--text-kcal-raw))'}}>
                                <Flame className="h-5 w-5 mr-1.5" />
                                {Math.round(entry.calories)}
                                <span className="text-xs font-normal ml-1 text-muted-foreground">kcal</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                              <div className="flex flex-col items-center p-2 bg-secondary/20 rounded-md">
                                <span className="font-medium text-sm text-poppins" style={{color: 'hsl(var(--text-protein-raw))'}}>{Math.round(entry.protein)}g</span>
                                <span className="text-poppins">Protein</span>
                              </div>
                              <div className="flex flex-col items-center p-2 bg-secondary/20 rounded-md">
                                <span className="font-medium text-sm text-poppins" style={{color: 'hsl(var(--text-fat-raw))'}}>{Math.round(entry.fat)}g</span>
                                <span className="text-poppins">Fat</span>
                              </div>
                              <div className="flex flex-col items-center p-2 bg-secondary/20 rounded-md">
                                <span className="font-medium text-sm text-poppins" style={{color: 'hsl(var(--text-carbs-raw))'}}>{Math.round(entry.carbs)}g</span>
                                <span className="text-poppins">Carbs</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground italic">No foods logged for this day.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 