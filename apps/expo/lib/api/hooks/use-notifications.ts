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
    onMutate: async ({ notificationId }) => {
      const snapshots = queryClient.getQueriesData<GetNotificationsResponse>({
        queryKey: ["notifications", "list"],
      });

      queryClient.setQueriesData<GetNotificationsResponse>(
        { queryKey: ["notifications", "list"] },
        (old) => {
          if (!old) return old;
          const target = old.notifications.find((n) => n.id === notificationId);
          if (!target || target.readAt !== null) return old;
          return {
            ...old,
            notifications: old.notifications.map((n) =>
              n.id === notificationId
                ? { ...n, readAt: new Date().toISOString() }
                : n,
            ),
            unreadCount: Math.max(0, old.unreadCount - 1),
          };
        },
      );

      const countKey = notificationKeys.unreadCount();
      const previousCount = queryClient.getQueryData<{ unreadCount: number }>(
        countKey,
      );
      if (previousCount && previousCount.unreadCount > 0) {
        queryClient.setQueryData<{ unreadCount: number }>(countKey, {
          unreadCount: previousCount.unreadCount - 1,
        });
      }

      return { snapshots, previousCount };
    },
    onError: (_err, _vars, context) => {
      if (context?.snapshots) {
        for (const [key, data] of context.snapshots) {
          queryClient.setQueryData(key, data);
        }
      }
      if (context?.previousCount) {
        queryClient.setQueryData(
          notificationKeys.unreadCount(),
          context.previousCount,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
