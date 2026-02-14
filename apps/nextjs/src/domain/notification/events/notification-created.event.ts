import type { DomainEvent } from "@packages/ddd-kit";

export class NotificationCreatedEvent implements DomainEvent {
  public readonly type = "NotificationCreated";
  public readonly dateTimeOccurred: Date;
  public readonly aggregateId: string;

  constructor(
    notificationId: string,
    public readonly userId: string,
    public readonly notificationType: string,
    public readonly title: string,
    public readonly body: string,
  ) {
    this.aggregateId = notificationId;
    this.dateTimeOccurred = new Date();
  }
}
