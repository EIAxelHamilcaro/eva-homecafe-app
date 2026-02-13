import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  MoodStatsResponse,
  MoodTrendsResponse,
  MoodWeekResponse,
  RecordMoodInput,
  RecordMoodResponse,
  TodayMoodResponse,
} from "@/types/mood";
import { api } from "../client";
import { moodKeys } from "./query-keys";

export { moodKeys };

export function useTodayMood() {
  return useQuery({
    queryKey: moodKeys.today(),
    queryFn: () => api.get<TodayMoodResponse | null>("/api/v1/mood"),
    staleTime: 1000 * 60,
  });
}

export function useMoodByDate(date: string) {
  return useQuery({
    queryKey: moodKeys.byDate(date),
    queryFn: () =>
      api.get<TodayMoodResponse | null>(`/api/v1/mood?date=${date}`),
    staleTime: 1000 * 60,
  });
}

export function useMoodWeek() {
  return useQuery({
    queryKey: moodKeys.week(),
    queryFn: () => api.get<MoodWeekResponse>("/api/v1/mood/week"),
    staleTime: 1000 * 60,
  });
}

export function useMoodStats(period: "week" | "6months") {
  return useQuery({
    queryKey: moodKeys.stats(period),
    queryFn: () =>
      api.get<MoodStatsResponse>(`/api/v1/mood/stats?period=${period}`),
    staleTime: 1000 * 60 * 5,
  });
}

export function useMoodTrends() {
  return useQuery({
    queryKey: moodKeys.trends(),
    queryFn: () => api.get<MoodTrendsResponse>("/api/v1/mood/trends"),
    staleTime: 1000 * 60 * 5,
  });
}

export function useRecordMood() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RecordMoodInput) =>
      api.post<RecordMoodResponse>("/api/v1/mood", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moodKeys.all });
    },
  });
}
