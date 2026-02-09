import { createModule } from "@evyweb/ioctopus";
import {
  getCountQueryForEventType,
  getQueryForField,
} from "@/adapters/queries/achievement.query";
import { DrizzleRewardRepository } from "@/adapters/repositories/reward.repository";
import { InProcessEventDispatcher } from "@/adapters/services/gamification/in-process-event-dispatcher";
import { GamificationHandler } from "@/application/event-handlers/gamification.handler";
import type { IAchievementQueryProvider } from "@/application/ports/achievement-query.provider.port";
import type { INotificationRepository } from "@/application/ports/notification-repository.port";
import type { IRewardRepository } from "@/application/ports/reward-repository.port";
import { EvaluateAchievementUseCase } from "@/application/use-cases/reward/evaluate-achievement.use-case";
import { DI_SYMBOLS } from "../types";

const queryProvider: IAchievementQueryProvider = {
  getQueryForField,
  getCountQueryForEventType,
};

export const createRewardModule = () => {
  const rewardModule = createModule();

  rewardModule
    .bind(DI_SYMBOLS.IRewardRepository)
    .toClass(DrizzleRewardRepository);

  rewardModule
    .bind(DI_SYMBOLS.EvaluateAchievementUseCase)
    .toHigherOrderFunction(
      (
        rewardRepo: IRewardRepository,
        notificationRepo: INotificationRepository,
      ) => {
        return new EvaluateAchievementUseCase(
          rewardRepo,
          notificationRepo,
          queryProvider,
        );
      },
      [DI_SYMBOLS.IRewardRepository, DI_SYMBOLS.INotificationRepository],
    );

  rewardModule.bind(DI_SYMBOLS.IEventDispatcher).toHigherOrderFunction(
    (evaluateUseCase: EvaluateAchievementUseCase) => {
      const handler = new GamificationHandler(evaluateUseCase);
      return new InProcessEventDispatcher(handler);
    },
    [DI_SYMBOLS.EvaluateAchievementUseCase],
  );

  return rewardModule;
};
