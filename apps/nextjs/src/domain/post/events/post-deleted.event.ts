import type { DomainEvent } from "@packages/ddd-kit";

export class PostDeletedEvent implements DomainEvent {
  public readonly type = "PostDeleted";
  public readonly dateTimeOccurred: Date;
  public readonly aggregateId: string;

  constructor(
    postId: string,
    public readonly userId: string,
  ) {
    this.aggregateId = postId;
    this.dateTimeOccurred = new Date();
  }
}
