import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  EmotionYearCalendarResponse,
  RecordEmotionInput,
  RecordEmotionResponse,
} from "@/types/emotion";
import { api } from "../client";
import { emotionKeys } from "./query-keys";

export { emotionKeys };

export function useEmotionYearCalendar(year: number) {
  return useQuery({
    queryKey: emotionKeys.yearCalendar(year),
    queryFn: () =>
      api.get<EmotionYearCalendarResponse>(`/api/v1/emotion?year=${year}`),
    staleTime: 1000 * 60 * 5,
  });
}

export function useRecordEmotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RecordEmotionInput) =>
      api.post<RecordEmotionResponse>("/api/v1/emotion", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emotionKeys.all });
    },
  });
}
