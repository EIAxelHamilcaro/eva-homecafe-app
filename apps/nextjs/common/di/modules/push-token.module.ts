import { createModule } from "@evyweb/ioctopus";
import { DrizzlePushTokenRepository } from "@/adapters/repositories/push-token.repository";
import { RegisterPushTokenUseCase } from "@/application/use-cases/push-token/register-push-token.use-case";
import { UnregisterPushTokenUseCase } from "@/application/use-cases/push-token/unregister-push-token.use-case";
import { DI_SYMBOLS } from "../types";

export const createPushTokenModule = () => {
  const pushTokenModule = createModule();

  pushTokenModule
    .bind(DI_SYMBOLS.IPushTokenRepository)
    .toClass(DrizzlePushTokenRepository);

  pushTokenModule
    .bind(DI_SYMBOLS.RegisterPushTokenUseCase)
    .toClass(RegisterPushTokenUseCase, [DI_SYMBOLS.IPushTokenRepository]);

  pushTokenModule
    .bind(DI_SYMBOLS.UnregisterPushTokenUseCase)
    .toClass(UnregisterPushTokenUseCase, [DI_SYMBOLS.IPushTokenRepository]);

  return pushTokenModule;
};
