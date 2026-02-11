import { Result } from "@packages/ddd-kit";
import type {
  IPushNotificationProvider,
  PushPayload,
} from "@/application/ports/push-notification-provider.port";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

interface ExpoTicket {
  status: "ok" | "error";
  message?: string;
  details?: { error?: string };
}

export class ExpoPushNotificationService implements IPushNotificationProvider {
  async send(
    expoPushToken: string,
    payload: PushPayload,
  ): Promise<Result<void>> {
    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: expoPushToken,
          sound: "default",
          title: payload.title,
          body: payload.body,
          data: payload.data,
        }),
      });

      if (!response.ok) {
        return Result.fail("Push notification delivery failed");
      }

      const body = (await response.json()) as { data: ExpoTicket[] };
      const ticket = body?.data?.[0];

      if (ticket?.status === "error") {
        const errorType = ticket.details?.error ?? "unknown";
        // biome-ignore lint/suspicious/noConsole: intentional server-side error logging for push delivery failures
        console.error(
          `[ExpoPush] Ticket error for ${expoPushToken}: ${errorType} - ${ticket.message}`,
        );
        return Result.fail(`Push ticket error: ${errorType}`);
      }

      return Result.ok();
    } catch (error) {
      return Result.fail(`Push notification error: ${error}`);
    }
  }
}
