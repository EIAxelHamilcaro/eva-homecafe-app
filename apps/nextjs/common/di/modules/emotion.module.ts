import { createModule } from "@evyweb/ioctopus";
import { DrizzleEmotionRepository } from "@/adapters/repositories/emotion.repository";
import { RecordEmotionUseCase } from "@/application/use-cases/emotion/record-emotion.use-case";
import { DI_SYMBOLS } from "../types";

export const createEmotionModule = () => {
  const emotionModule = createModule();

  emotionModule
    .bind(DI_SYMBOLS.IEmotionRepository)
    .toClass(DrizzleEmotionRepository);

  emotionModule
    .bind(DI_SYMBOLS.RecordEmotionUseCase)
    .toClass(RecordEmotionUseCase, [
      DI_SYMBOLS.IEmotionRepository,
      DI_SYMBOLS.IEventDispatcher,
    ]);

  return emotionModule;
};
