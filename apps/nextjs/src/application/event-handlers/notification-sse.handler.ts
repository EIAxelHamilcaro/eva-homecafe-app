import type { DomainEvent } from "@packages/ddd-kit";
import type { NotificationCreatedEvent } from "@/domain/notification/events/notification-created.event";

export interface INotificationBroadcast {
  sendNotification(
    userId: string,
    data: {
      notificationId: string;
      userId: string;
      notificationType: string;
      title: string;
      body: string;
    },
  ): void;
}

export class NotificationSSEHandler {
  constructor(private readonly broadcast: INotificationBroadcast) {}

  async handle(event: DomainEvent): Promise<void> {
    if (event.type !== "NotificationCreated") return;

    const notifEvent = event as NotificationCreatedEvent;

    this.broadcast.sendNotification(notifEvent.userId, {
      notificationId: notifEvent.aggregateId,
      userId: notifEvent.userId,
      notificationType: notifEvent.notificationType,
      title: notifEvent.title,
      body: notifEvent.body,
    });
  }
}
