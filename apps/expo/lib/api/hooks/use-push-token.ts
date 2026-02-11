import { useMutation } from "@tanstack/react-query";

import {
  registerForPushNotifications,
  unregisterPushNotifications,
} from "@/lib/notifications/push-notifications";

export function useRegisterPushToken() {
  return useMutation({
    mutationFn: registerForPushNotifications,
  });
}

export function useUnregisterPushToken() {
  return useMutation({
    mutationFn: (token: string) => unregisterPushNotifications(token),
  });
}
