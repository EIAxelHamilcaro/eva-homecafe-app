"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { IGetMoodStatsOutputDto } from "@/application/dto/mood/get-mood-stats.dto";
import type { IGetMoodTrendsOutputDto } from "@/application/dto/mood/get-mood-trends.dto";
import type { IGetMoodWeekOutputDto } from "@/application/dto/mood/get-mood-week.dto";
import type { IGetTodayMoodOutputDto } from "@/application/dto/mood/get-today-mood.dto";
import type { IRecordMoodOutputDto } from "@/application/dto/mood/record-mood.dto";
import { apiFetch } from "@/common/api";

export const moodKeys = {
  all: ["mood"] as const,
  today: ["mood", "today"] as const,
  week: ["mood", "week"] as const,
  stats: ["mood", "stats"] as const,
  trends: ["mood", "trends"] as const,
};

export function useTodayMoodQuery() {
  return useQuery<IGetTodayMoodOutputDto>({
    queryKey: moodKeys.today,
    queryFn: () => apiFetch<IGetTodayMoodOutputDto>("/api/v1/mood"),
    staleTime: 60_000,
  });
}

export function useMoodWeekQuery() {
  return useQuery<IGetMoodWeekOutputDto>({
    queryKey: moodKeys.week,
    queryFn: () => apiFetch<IGetMoodWeekOutputDto>("/api/v1/mood/week"),
    staleTime: 30_000,
  });
}

export function useMoodStatsQuery() {
  return useQuery<IGetMoodStatsOutputDto>({
    queryKey: moodKeys.stats,
    queryFn: () => apiFetch<IGetMoodStatsOutputDto>("/api/v1/mood/stats"),
    staleTime: 30_000,
  });
}

export function useMoodTrendsQuery() {
  return useQuery<IGetMoodTrendsOutputDto>({
    queryKey: moodKeys.trends,
    queryFn: () => apiFetch<IGetMoodTrendsOutputDto>("/api/v1/mood/trends"),
    staleTime: 30_000,
  });
}

export function useRecordMoodMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    IRecordMoodOutputDto,
    Error,
    { category: string; intensity: number }
  >({
    mutationFn: ({ category, intensity }) =>
      apiFetch<IRecordMoodOutputDto>("/api/v1/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, intensity }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moodKeys.all });
    },
  });
}
