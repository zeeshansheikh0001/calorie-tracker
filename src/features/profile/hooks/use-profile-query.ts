"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/storage";
import { profileService } from "@/services/profile/profile.service";
import type { UserProfile } from "@/types/domain";

export function useProfileQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.profile,
    queryFn: () => profileService.get(),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (partial: Partial<UserProfile>) =>
      Promise.resolve(profileService.update(partial)),
    onSuccess: (profile) => {
      queryClient.setQueryData(QUERY_KEYS.profile, profile);
    },
  });
}

export function useGoalsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.goals,
    queryFn: async () => {
      const { goalsService } = await import("@/services/calorie/daily-log.service");
      return goalsService.get();
    },
  });
}

export function useSaveGoals() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goals: import("@/types/domain").Goal) => {
      const { goalsService } = await import("@/services/calorie/daily-log.service");
      return goalsService.save(goals);
    },
    onSuccess: (goals) => {
      queryClient.setQueryData(QUERY_KEYS.goals, goals);
    },
  });
}
