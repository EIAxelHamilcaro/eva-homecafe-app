import { createModule } from "@evyweb/ioctopus";
import { DrizzleMoodboardRepository } from "@/adapters/repositories/moodboard.repository";
import { AddPinUseCase } from "@/application/use-cases/moodboard/add-pin.use-case";
import { CreateMoodboardUseCase } from "@/application/use-cases/moodboard/create-moodboard.use-case";
import { DeleteMoodboardUseCase } from "@/application/use-cases/moodboard/delete-moodboard.use-case";
import { DeletePinUseCase } from "@/application/use-cases/moodboard/delete-pin.use-case";
import { DI_SYMBOLS } from "../types";

export const createMoodboardModule = () => {
  const moodboardModule = createModule();

  moodboardModule
    .bind(DI_SYMBOLS.IMoodboardRepository)
    .toClass(DrizzleMoodboardRepository);

  moodboardModule
    .bind(DI_SYMBOLS.AddPinUseCase)
    .toClass(AddPinUseCase, [
      DI_SYMBOLS.IMoodboardRepository,
      DI_SYMBOLS.IEventDispatcher,
    ]);

  moodboardModule
    .bind(DI_SYMBOLS.CreateMoodboardUseCase)
    .toClass(CreateMoodboardUseCase, [
      DI_SYMBOLS.IMoodboardRepository,
      DI_SYMBOLS.IEventDispatcher,
    ]);

  moodboardModule
    .bind(DI_SYMBOLS.DeleteMoodboardUseCase)
    .toClass(DeleteMoodboardUseCase, [
      DI_SYMBOLS.IMoodboardRepository,
      DI_SYMBOLS.IStorageProvider,
      DI_SYMBOLS.IEventDispatcher,
    ]);

  moodboardModule
    .bind(DI_SYMBOLS.DeletePinUseCase)
    .toClass(DeletePinUseCase, [
      DI_SYMBOLS.IMoodboardRepository,
      DI_SYMBOLS.IStorageProvider,
      DI_SYMBOLS.IEventDispatcher,
    ]);

  return moodboardModule;
};
