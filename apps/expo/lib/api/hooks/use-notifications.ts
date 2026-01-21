import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  GetNotificationsResponse,
  MarkNotificationReadInput,
  Notification,
} from "@/types/notification";
import { api } from "../client";
import { notificationKeys } from "./query-keys";

export { notificationKeys };

export function useNotifications(page = 1, limit = 20, unreadOnly = false) {
  return useQuery({
    queryKey: notificationKeys.list(page, limit, unreadOnly),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (unreadOnly) {
        params.set("unreadOnly", "true");
      }
      return api.get<GetNotificationsResponse>(
        `/api/v1/notifications?${params}`,
      );
    },
    staleTime: 1000 * 30,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () =>
      api.get<{ unreadCount: number }>("/api/v1/notifications/unread-count"),
    staleTime: 1000 * 30,
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ notificationId }: MarkNotificationReadInput) =>
      api.post<{ notification: Notification }>(
        `/api/v1/notifications/${notificationId}/read`,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
