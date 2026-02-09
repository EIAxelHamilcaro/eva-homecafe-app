import { createModule } from "@evyweb/ioctopus";
import { DrizzleMoodRepository } from "@/adapters/repositories/mood.repository";
import { RecordMoodUseCase } from "@/application/use-cases/mood/record-mood.use-case";
import { DI_SYMBOLS } from "../types";

export const createMoodModule = () => {
  const moodModule = createModule();

  moodModule.bind(DI_SYMBOLS.IMoodRepository).toClass(DrizzleMoodRepository);

  moodModule
    .bind(DI_SYMBOLS.RecordMoodUseCase)
    .toClass(RecordMoodUseCase, [
      DI_SYMBOLS.IMoodRepository,
      DI_SYMBOLS.IEventDispatcher,
    ]);

  return moodModule;
};
