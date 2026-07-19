"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { QUERY_KEYS } from "@/constants/storage";
import {
  dailyLogService,
  formatLogDate,
} from "@/services/calorie/daily-log.service";
import type { FoodEntry } from "@/types/domain";

export function useSelectedLogDate() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const dateKey = useMemo(() => formatLogDate(selectedDate), [selectedDate]);
  return { selectedDate, setSelectedDate, dateKey };
}

export function useDailyLogQuery(dateKey: string) {
  const summaryQuery = useQuery({
    queryKey: QUERY_KEYS.dailyLog(dateKey),
    queryFn: () => dailyLogService.getSummary(dateKey),
  });

  const entriesQuery = useQuery({
    queryKey: QUERY_KEYS.foodEntries(dateKey),
    queryFn: () => dailyLogService.getEntries(dateKey),
  });

  return {
    dailyLog: summaryQuery.data ?? null,
    foodEntries: entriesQuery.data ?? [],
    isLoading: summaryQuery.isLoading || entriesQuery.isLoading,
    isError: summaryQuery.isError || entriesQuery.isError,
    refetch: async () => {
      await Promise.all([summaryQuery.refetch(), entriesQuery.refetch()]);
    },
  };
}

export function useAddFoodEntry(dateKey: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<FoodEntry, "id" | "timestamp">) =>
      Promise.resolve(dailyLogService.addEntry(dateKey, data)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dailyLog(dateKey) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.foodEntries(dateKey) });
      void queryClient.invalidateQueries({ queryKey: ["weekLogs"] });
    },
  });
}

export function useDeleteFoodEntry(dateKey: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entryId: string) =>
      Promise.resolve(dailyLogService.deleteEntry(dateKey, entryId)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dailyLog(dateKey) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.foodEntries(dateKey) });
      void queryClient.invalidateQueries({ queryKey: ["weekLogs"] });
    },
  });
}
