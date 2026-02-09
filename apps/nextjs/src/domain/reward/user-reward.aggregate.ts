import { Aggregate, Result, UUID } from "@packages/ddd-kit";
import { BadgeEarnedEvent } from "./events/badge-earned.event";
import { StickerEarnedEvent } from "./events/sticker-earned.event";
import { RewardId } from "./reward-id";
import type { AchievementType } from "./value-objects/achievement-type.vo";

export interface IUserRewardProps {
  userId: string;
  achievementDefinitionId: string;
  achievementType: AchievementType;
  achievementKey: string;
  earnedAt: Date;
}

export interface ICreateUserRewardProps {
  userId: string;
  achievementDefinitionId: string;
  achievementType: AchievementType;
  achievementKey: string;
}

export class UserReward extends Aggregate<IUserRewardProps> {
  private constructor(props: IUserRewardProps, id?: UUID<string | number>) {
    super(props, id);
  }

  get id(): RewardId {
    return RewardId.create(this._id);
  }

  static create(
    props: ICreateUserRewardProps,
    id?: UUID<string | number>,
  ): Result<UserReward> {
    const newId = id ?? new UUID<string>();
    const now = new Date();

    const reward = new UserReward(
      {
        userId: props.userId,
        achievementDefinitionId: props.achievementDefinitionId,
        achievementType: props.achievementType,
        achievementKey: props.achievementKey,
        earnedAt: now,
      },
      newId,
    );

    const idStr = newId.value.toString();
    if (props.achievementType.value === "sticker") {
      reward.addEvent(
        new StickerEarnedEvent(idStr, props.userId, props.achievementKey),
      );
    } else {
      reward.addEvent(
        new BadgeEarnedEvent(idStr, props.userId, props.achievementKey),
      );
    }

    return Result.ok(reward);
  }

  static reconstitute(props: IUserRewardProps, id: RewardId): UserReward {
    return new UserReward(props, id);
  }
}
