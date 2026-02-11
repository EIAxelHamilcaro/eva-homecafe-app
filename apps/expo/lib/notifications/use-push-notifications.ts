import { useQueryClient } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect, useRef } from "react";

import { notificationKeys } from "@/lib/api/hooks/query-keys";
import { registerForPushNotifications } from "./push-notifications";

export function usePushNotifications(isAuthenticated: boolean) {
  const queryClient = useQueryClient();
  const pushTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    registerForPushNotifications().then((token) => {
      pushTokenRef.current = token;
    });
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const receivedSub = Notifications.addNotificationReceivedListener(() => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as {
          notificationType?: string;
          conversationId?: string;
        };
        const type = data?.notificationType;

        switch (type) {
          case "friend_request":
          case "friend_accepted":
            router.push("/(protected)/(tabs)/notifications");
            break;
          case "new_message":
            if (data?.conversationId) {
              router.push(
                `/(protected)/(tabs)/messages/${data.conversationId}` as never,
              );
            } else {
              router.push("/(protected)/(tabs)/messages");
            }
            break;
          case "reward_earned":
            router.push("/(protected)/(tabs)");
            break;
          default:
            router.push("/(protected)/(tabs)/notifications");
            break;
        }
      },
    );

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, [isAuthenticated, queryClient]);

  return pushTokenRef;
}
