"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { IGetNotificationsOutputDto } from "@/application/dto/notification/get-notifications.dto";
import type { IMarkNotificationReadOutputDto } from "@/application/dto/notification/mark-notification-read.dto";
import { apiFetch } from "@/common/api";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: ["notifications", "list"] as const,
  unreadCount: ["notifications", "unread-count"] as const,
};

export function useNotificationsQuery() {
  return useQuery<IGetNotificationsOutputDto>({
    queryKey: notificationKeys.list,
    queryFn: () =>
      apiFetch<IGetNotificationsOutputDto>("/api/v1/notifications"),
    refetchInterval: 30_000,
  });
}

export function useUnreadCountQuery() {
  return useQuery<{ unreadCount: number }>({
    queryKey: notificationKeys.unreadCount,
    queryFn: () =>
      apiFetch<{ unreadCount: number }>("/api/v1/notifications/unread-count"),
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation<IMarkNotificationReadOutputDto, Error, { id: string }>({
    mutationFn: ({ id }) =>
      apiFetch<IMarkNotificationReadOutputDto>(
        `/api/v1/notifications/${id}/read`,
        { method: "POST" },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
