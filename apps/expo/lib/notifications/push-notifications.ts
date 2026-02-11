import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";

import { api } from "@/lib/api/client";

import { getNotificationsModule } from "./safe-notifications";

getNotificationsModule().then((Notifications) => {
  if (!Notifications) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null;

  try {
    const Notifications = await getNotificationsModule();
    if (!Notifications) return null;

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") return null;

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;

    await api.post("/api/v1/push-tokens", {
      token,
      platform: Platform.OS,
    });

    return token;
  } catch {
    return null;
  }
}

export async function unregisterPushNotifications(
  token: string,
): Promise<void> {
  try {
    await api.delete("/api/v1/push-tokens", { token });
  } catch {}
}
