import type { DomainEvent } from "@packages/ddd-kit";

export class StickerEarnedEvent implements DomainEvent {
  public readonly type = "StickerEarned";
  public readonly dateTimeOccurred: Date;
  public readonly aggregateId: string;

  constructor(
    rewardId: string,
    public readonly userId: string,
    public readonly achievementKey: string,
  ) {
    this.aggregateId = rewardId;
    this.dateTimeOccurred = new Date();
  }
}
