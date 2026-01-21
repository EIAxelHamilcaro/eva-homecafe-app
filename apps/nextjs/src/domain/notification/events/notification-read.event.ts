import type { DomainEvent } from "@packages/ddd-kit";

export class NotificationReadEvent implements DomainEvent {
  public readonly type = "NotificationRead";
  public readonly dateTimeOccurred: Date;
  public readonly aggregateId: string;

  constructor(
    notificationId: string,
    public readonly userId: string,
  ) {
    this.aggregateId = notificationId;
    this.dateTimeOccurred = new Date();
  }
}
