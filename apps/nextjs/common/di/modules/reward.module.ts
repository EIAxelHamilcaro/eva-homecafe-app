import { createModule } from "@evyweb/ioctopus";
import { broadcastNotification } from "@/adapters/controllers/chat/sse.controller";
import {
  getCountQueryForEventType,
  getQueryForField,
} from "@/adapters/queries/achievement.query";
import { DrizzleRewardRepository } from "@/adapters/repositories/reward.repository";
import { InProcessEventDispatcher } from "@/adapters/services/gamification/in-process-event-dispatcher";
import { ExpoPushNotificationService } from "@/adapters/services/push/expo-push-notification.service";
import { EmailNotificationHandler } from "@/application/event-handlers/email-notification.handler";
import { GamificationHandler } from "@/application/event-handlers/gamification.handler";
import {
  type INotificationBroadcast,
  NotificationSSEHandler,
} from "@/application/event-handlers/notification-sse.handler";
import { PushNotificationHandler } from "@/application/event-handlers/push-notification.handler";
import type { IAchievementQueryProvider } from "@/application/ports/achievement-query.provider.port";
import type { IEmailProvider } from "@/application/ports/email.provider.port";
import type { INotificationRepository } from "@/application/ports/notification-repository.port";
import type { IPushNotificationProvider } from "@/application/ports/push-notification-provider.port";
import type { IPushTokenRepository } from "@/application/ports/push-token-repository.port";
import type { IRewardRepository } from "@/application/ports/reward-repository.port";
import type { IUserRepository } from "@/application/ports/user.repository.port";
import type { IUserPreferenceRepository } from "@/application/ports/user-preference-repository.port";
import { EvaluateAchievementUseCase } from "@/application/use-cases/reward/evaluate-achievement.use-case";
import { DI_SYMBOLS } from "../types";

const queryProvider: IAchievementQueryProvider = {
  getQueryForField,
  getCountQueryForEventType,
};

const notificationBroadcast: INotificationBroadcast = {
  sendNotification: broadcastNotification,
};

export const createRewardModule = () => {
  const rewardModule = createModule();

  rewardModule
    .bind(DI_SYMBOLS.IRewardRepository)
    .toClass(DrizzleRewardRepository);

  rewardModule
    .bind(DI_SYMBOLS.IPushNotificationProvider)
    .toClass(ExpoPushNotificationService);

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
    (
      evaluateUseCase: EvaluateAchievementUseCase,
      pushProvider: IPushNotificationProvider,
      pushTokenRepo: IPushTokenRepository,
      userPrefRepo: IUserPreferenceRepository,
      emailProvider: IEmailProvider,
      userRepo: IUserRepository,
    ) => {
      const gamificationHandler = new GamificationHandler(evaluateUseCase);
      const pushHandler = new PushNotificationHandler(
        pushProvider,
        pushTokenRepo,
        userPrefRepo,
      );
      const emailHandler = new EmailNotificationHandler(
        emailProvider,
        userRepo,
        userPrefRepo,
      );
      const sseHandler = new NotificationSSEHandler(notificationBroadcast);
      const dispatcher = new InProcessEventDispatcher(
        gamificationHandler,
        pushHandler,
        emailHandler,
        sseHandler,
      );
      evaluateUseCase.setEventDispatcher(dispatcher);
      return dispatcher;
    },
    [
      DI_SYMBOLS.EvaluateAchievementUseCase,
      DI_SYMBOLS.IPushNotificationProvider,
      DI_SYMBOLS.IPushTokenRepository,
      DI_SYMBOLS.IUserPreferenceRepository,
      DI_SYMBOLS.IEmailProvider,
      DI_SYMBOLS.IUserRepository,
    ],
  );

  return rewardModule;
};
