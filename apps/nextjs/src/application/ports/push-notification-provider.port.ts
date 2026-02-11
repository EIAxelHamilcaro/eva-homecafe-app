import type { Result } from "@packages/ddd-kit";

export interface PushPayload {
  title: string;
  body: string;
  data: Record<string, unknown>;
}

export interface IPushNotificationProvider {
  send(expoPushToken: string, payload: PushPayload): Promise<Result<void>>;
}
