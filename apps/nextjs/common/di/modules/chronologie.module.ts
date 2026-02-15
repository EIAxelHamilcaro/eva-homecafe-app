import { createModule } from "@evyweb/ioctopus";
import { DrizzleChronologieRepository } from "@/adapters/repositories/chronologie.repository";
import { AddChronologieEntryUseCase } from "@/application/use-cases/chronologie/add-chronologie-entry.use-case";
import { CreateChronologieUseCase } from "@/application/use-cases/chronologie/create-chronologie.use-case";
import { DeleteChronologieUseCase } from "@/application/use-cases/chronologie/delete-chronologie.use-case";
import { GetUserChronologiesUseCase } from "@/application/use-cases/chronologie/get-user-chronologies.use-case";
import { RemoveChronologieEntryUseCase } from "@/application/use-cases/chronologie/remove-chronologie-entry.use-case";
import { UpdateChronologieEntryUseCase } from "@/application/use-cases/chronologie/update-chronologie-entry.use-case";
import { DI_SYMBOLS } from "../types";

export const createChronologieModule = () => {
  const chronologieModule = createModule();

  chronologieModule
    .bind(DI_SYMBOLS.IChronologieRepository)
    .toClass(DrizzleChronologieRepository);

  chronologieModule
    .bind(DI_SYMBOLS.AddChronologieEntryUseCase)
    .toClass(AddChronologieEntryUseCase, [
      DI_SYMBOLS.IChronologieRepository,
      DI_SYMBOLS.IEventDispatcher,
    ]);

  chronologieModule
    .bind(DI_SYMBOLS.CreateChronologieUseCase)
    .toClass(CreateChronologieUseCase, [
      DI_SYMBOLS.IChronologieRepository,
      DI_SYMBOLS.IEventDispatcher,
    ]);

  chronologieModule
    .bind(DI_SYMBOLS.DeleteChronologieUseCase)
    .toClass(DeleteChronologieUseCase, [DI_SYMBOLS.IChronologieRepository]);

  chronologieModule
    .bind(DI_SYMBOLS.GetUserChronologiesUseCase)
    .toClass(GetUserChronologiesUseCase, [DI_SYMBOLS.IChronologieRepository]);

  chronologieModule
    .bind(DI_SYMBOLS.RemoveChronologieEntryUseCase)
    .toClass(RemoveChronologieEntryUseCase, [
      DI_SYMBOLS.IChronologieRepository,
    ]);

  chronologieModule
    .bind(DI_SYMBOLS.UpdateChronologieEntryUseCase)
    .toClass(UpdateChronologieEntryUseCase, [
      DI_SYMBOLS.IChronologieRepository,
    ]);

  return chronologieModule;
};
