"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/storage";
import { wellnessService } from "@/services/wellness/wellness.service";

export function useWaterQuery(date: string) {
  return useQuery({
    queryKey: QUERY_KEYS.water(date),
    queryFn: () => Promise.resolve(wellnessService.getWater(date)),
  });
}

export function useAddWater(date: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ml: number) =>
      Promise.resolve(wellnessService.addWater(date, ml)),
    onSuccess: (data) => {
      qc.setQueryData(QUERY_KEYS.water(date), data);
    },
  });
}

export function useSleepQuery(date: string) {
  return useQuery({
    queryKey: QUERY_KEYS.sleep(date),
    queryFn: () => Promise.resolve(wellnessService.getSleep(date)),
  });
}

export function useSetSleep(date: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (hours: number) =>
      Promise.resolve(wellnessService.setSleep(date, hours)),
    onSuccess: (data) => {
      qc.setQueryData(QUERY_KEYS.sleep(date), data);
    },
  });
}

export function useActivityQuery(date: string) {
  return useQuery({
    queryKey: QUERY_KEYS.activity(date),
    queryFn: () => Promise.resolve(wellnessService.getActivity(date)),
  });
}

export function useAddActivity(date: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (minutes: number) =>
      Promise.resolve(wellnessService.addActivity(date, minutes)),
    onSuccess: (data) => {
      qc.setQueryData(QUERY_KEYS.activity(date), data);
    },
  });
}

export function useAddSteps(date: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (steps: number) =>
      Promise.resolve(wellnessService.addSteps(date, steps)),
    onSuccess: (data) => {
      qc.setQueryData(QUERY_KEYS.activity(date), data);
    },
  });
}

export function useWeightHistoryQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.weightHistory,
    queryFn: () => Promise.resolve(wellnessService.getWeightHistory()),
  });
}

export function useLogWeight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (kg: number) => Promise.resolve(wellnessService.logWeight(kg)),
    onSuccess: (data) => {
      qc.setQueryData(QUERY_KEYS.weightHistory, data);
    },
  });
}

export function useStreakQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.streak,
    queryFn: () => Promise.resolve(wellnessService.getStreak()),
  });
}

export function useWellnessMetaQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.wellnessMeta,
    queryFn: () => Promise.resolve(wellnessService.getMeta()),
  });
}
