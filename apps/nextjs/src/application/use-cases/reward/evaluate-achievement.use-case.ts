import { Result, type UseCase } from "@packages/ddd-kit";
import type {
  IEvaluateAchievementInputDto,
  IEvaluateAchievementOutputDto,
} from "@/application/dto/reward/evaluate-achievement.dto";
import type { IAchievementQueryProvider } from "@/application/ports/achievement-query.provider.port";
import type { INotificationRepository } from "@/application/ports/notification-repository.port";
import type {
  IAchievementDefinitionRecord,
  IRewardRepository,
} from "@/application/ports/reward-repository.port";
import { Notification } from "@/domain/notification/notification.aggregate";
import { NotificationType } from "@/domain/notification/value-objects/notification-type.vo";
import { UserReward } from "@/domain/reward/user-reward.aggregate";
import { AchievementType } from "@/domain/reward/value-objects/achievement-type.vo";

export class EvaluateAchievementUseCase
  implements
    UseCase<IEvaluateAchievementInputDto, IEvaluateAchievementOutputDto>
{
  constructor(
    private readonly rewardRepo: IRewardRepository,
    private readonly notificationRepo: INotificationRepository,
    private readonly queryProvider: IAchievementQueryProvider,
  ) {}

  async execute(
    input: IEvaluateAchievementInputDto,
  ): Promise<Result<IEvaluateAchievementOutputDto>> {
    const { userId, eventType } = input;

    const definitionsResult =
      await this.rewardRepo.getDefinitionsByEventType(eventType);
    if (definitionsResult.isFailure) {
      return Result.fail(definitionsResult.getError());
    }

    const definitions = definitionsResult.getValue();
    if (definitions.length === 0) {
      return Result.ok({ newRewards: [] });
    }

    const newRewards: IEvaluateAchievementOutputDto["newRewards"] = [];

    for (const definition of definitions) {
      const rewardResult = await this.evaluateDefinition(userId, definition);
      if (rewardResult.isSuccess) {
        const reward = rewardResult.getValue();
        if (reward) {
          newRewards.push(reward);
        }
      }
    }

    return Result.ok({ newRewards });
  }

  private async evaluateDefinition(
    userId: string,
    definition: IAchievementDefinitionRecord,
  ): Promise<
    Result<IEvaluateAchievementOutputDto["newRewards"][number] | null>
  > {
    const existingResult = await this.rewardRepo.findByUserIdAndDefinitionId(
      userId,
      definition.id,
    );
    if (existingResult.isFailure) {
      return Result.fail(existingResult.getError());
    }

    if (existingResult.getValue().isSome()) {
      return Result.ok(null);
    }

    const meetsThreshold = await this.checkThreshold(userId, definition);
    if (!meetsThreshold) {
      return Result.ok(null);
    }

    const typeResult = AchievementType.create(definition.type);
    if (typeResult.isFailure) {
      return Result.fail(typeResult.getError());
    }

    const rewardResult = UserReward.create({
      userId,
      achievementDefinitionId: definition.id,
      achievementType: typeResult.getValue() as AchievementType,
      achievementKey: definition.key,
    });
    if (rewardResult.isFailure) {
      return Result.fail(rewardResult.getError());
    }

    const reward = rewardResult.getValue();
    const saveResult = await this.rewardRepo.create(reward);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }
    reward.clearEvents();

    await this.createNotification(userId, definition);

    return Result.ok({
      id: reward.id.value.toString(),
      achievementKey: definition.key,
      achievementType: definition.type,
      name: definition.name,
    });
  }

  private async checkThreshold(
    userId: string,
    definition: IAchievementDefinitionRecord,
  ): Promise<boolean> {
    const { criteria } = definition;

    const specialQuery = this.queryProvider.getQueryForField(criteria.field);
    if (specialQuery) {
      const value = await specialQuery(userId);
      return value >= criteria.threshold;
    }

    const countQuery = this.queryProvider.getCountQueryForEventType(
      criteria.eventType,
    );
    if (countQuery) {
      const value = await countQuery(userId);
      return value >= criteria.threshold;
    }

    return false;
  }

  private async createNotification(
    userId: string,
    definition: IAchievementDefinitionRecord,
  ): Promise<void> {
    try {
      const typeResult = NotificationType.createRewardEarned();
      if (typeResult.isFailure) return;

      const notificationResult = Notification.create({
        userId,
        type: typeResult.getValue() as NotificationType,
        title: `Nouvelle récompense : ${definition.name}`,
        body: definition.description,
        data: {
          achievementId: definition.id,
          achievementType: definition.type,
          achievementKey: definition.key,
        },
      });
      if (notificationResult.isFailure) return;

      await this.notificationRepo.create(notificationResult.getValue());
    } catch {}
  }
}
