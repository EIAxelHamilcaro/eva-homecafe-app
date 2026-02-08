import type { DomainEvent } from "@packages/ddd-kit";

export class PostUpdatedEvent implements DomainEvent {
  public readonly type = "PostUpdated";
  public readonly dateTimeOccurred: Date;
  public readonly aggregateId: string;

  constructor(
    postId: string,
    public readonly userId: string,
    public readonly isPrivate: boolean,
  ) {
    this.aggregateId = postId;
    this.dateTimeOccurred = new Date();
  }
}
