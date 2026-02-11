import Constants from "expo-constants";

export const isExpoGo = Constants.appOwnership === "expo";

export async function getNotificationsModule() {
  if (isExpoGo) return null;
  try {
    return await import("expo-notifications");
  } catch {
    return null;
  }
}
