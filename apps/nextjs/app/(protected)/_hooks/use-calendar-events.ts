"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ICalendarEventDto } from "@/application/dto/calendar-event/common-calendar-event.dto";
import type { IGetCalendarEventsOutputDto } from "@/application/dto/calendar-event/get-calendar-events.dto";
import { apiFetch } from "@/common/api";

export const calendarEventKeys = {
  all: ["calendar-events"] as const,
  month: (month: string) => ["calendar-events", month] as const,
  google: (month: string) => ["google-calendar", month] as const,
};

interface IGoogleCalendarResponse {
  events: Array<{
    id: string;
    title: string;
    date: string;
    color: string;
    source: "google";
  }>;
  connected: boolean;
}

export function useCalendarEventsQuery(month: string) {
  return useQuery<IGetCalendarEventsOutputDto>({
    queryKey: calendarEventKeys.month(month),
    queryFn: () =>
      apiFetch<IGetCalendarEventsOutputDto>(
        `/api/v1/calendar-events?month=${month}`,
      ),
    staleTime: 30_000,
  });
}

export function useGoogleCalendarEventsQuery(month: string) {
  return useQuery<IGoogleCalendarResponse>({
    queryKey: calendarEventKeys.google(month),
    queryFn: () =>
      apiFetch<IGoogleCalendarResponse>(
        `/api/v1/google-calendar/events?month=${month}`,
      ),
    staleTime: 60_000,
  });
}

export function useCreateCalendarEventMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    ICalendarEventDto,
    Error,
    { title: string; color: string; date: string; addToGoogle?: boolean }
  >({
    mutationFn: async (input) => {
      const event = await apiFetch<ICalendarEventDto>(
        "/api/v1/calendar-events",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: input.title,
            color: input.color,
            date: input.date,
          }),
        },
      );

      if (input.addToGoogle) {
        await apiFetch("/api/v1/google-calendar/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: input.title, date: input.date }),
        }).catch(() => {});
      }

      return event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarEventKeys.all });
      queryClient.invalidateQueries({ queryKey: ["google-calendar"] });
    },
  });
}

export function useUpdateCalendarEventMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    ICalendarEventDto,
    Error,
    { eventId: string; title?: string; color?: string; date?: string }
  >({
    mutationFn: ({ eventId, ...updates }) =>
      apiFetch<ICalendarEventDto>(`/api/v1/calendar-events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarEventKeys.all });
    },
  });
}

export function useDeleteCalendarEventMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ deleted: true }, Error, { eventId: string }>({
    mutationFn: ({ eventId }) =>
      apiFetch(`/api/v1/calendar-events/${eventId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarEventKeys.all });
    },
  });
}
