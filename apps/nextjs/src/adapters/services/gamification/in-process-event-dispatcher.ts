import type { DomainEvent } from "@packages/ddd-kit";
import type { EmailNotificationHandler } from "@/application/event-handlers/email-notification.handler";
import type { GamificationHandler } from "@/application/event-handlers/gamification.handler";
import type { NotificationSSEHandler } from "@/application/event-handlers/notification-sse.handler";
import type { PushNotificationHandler } from "@/application/event-handlers/push-notification.handler";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";

export class InProcessEventDispatcher implements IEventDispatcher {
  constructor(
    private readonly gamificationHandler: GamificationHandler,
    private readonly pushNotificationHandler?: PushNotificationHandler,
    private readonly emailNotificationHandler?: EmailNotificationHandler,
    private readonly notificationSSEHandler?: NotificationSSEHandler,
  ) {}

  async dispatch(event: DomainEvent): Promise<void> {
    try {
      await this.gamificationHandler.handle(event);
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: intentional server-side error logging for event handler failures
      console.error("[EventDispatcher] GamificationHandler error:", error);
    }

    if (this.pushNotificationHandler) {
      try {
        await this.pushNotificationHandler.handle(event);
      } catch (error) {
        // biome-ignore lint/suspicious/noConsole: intentional server-side error logging for event handler failures
        console.error(
          "[EventDispatcher] PushNotificationHandler error:",
          error,
        );
      }
    }

    if (this.emailNotificationHandler) {
      try {
        await this.emailNotificationHandler.handle(event);
      } catch (error) {
        // biome-ignore lint/suspicious/noConsole: intentional server-side error logging for event handler failures
        console.error(
          "[EventDispatcher] EmailNotificationHandler error:",
          error,
        );
      }
    }

    if (this.notificationSSEHandler) {
      try {
        await this.notificationSSEHandler.handle(event);
      } catch (error) {
        // biome-ignore lint/suspicious/noConsole: intentional server-side error logging for event handler failures
        console.error("[EventDispatcher] NotificationSSEHandler error:", error);
      }
    }
  }

  async dispatchAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.dispatch(event);
    }
  }
}
