import { createModule } from "@evyweb/ioctopus";
import { DrizzleMoodboardRepository } from "@/adapters/repositories/moodboard.repository";
import { CreateMoodboardUseCase } from "@/application/use-cases/moodboard/create-moodboard.use-case";
import { DI_SYMBOLS } from "../types";

export const createMoodboardModule = () => {
  const moodboardModule = createModule();

  moodboardModule
    .bind(DI_SYMBOLS.IMoodboardRepository)
    .toClass(DrizzleMoodboardRepository);

  moodboardModule
    .bind(DI_SYMBOLS.CreateMoodboardUseCase)
    .toClass(CreateMoodboardUseCase, [DI_SYMBOLS.IMoodboardRepository]);

  return moodboardModule;
};
