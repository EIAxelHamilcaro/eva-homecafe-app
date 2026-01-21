import type { DomainEvent } from "@packages/ddd-kit";

export class FriendRequestRejectedEvent implements DomainEvent {
  public readonly type = "FriendRequestRejected";
  public readonly dateTimeOccurred: Date;
  public readonly aggregateId: string;

  constructor(
    requestId: string,
    public readonly senderId: string,
    public readonly receiverId: string,
  ) {
    this.aggregateId = requestId;
    this.dateTimeOccurred = new Date();
  }
}
