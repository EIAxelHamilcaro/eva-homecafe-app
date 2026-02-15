import { createModule } from "@evyweb/ioctopus";
import { DrizzleTableauRepository } from "@/adapters/repositories/tableau.repository";
import { AddTableauRowUseCase } from "@/application/use-cases/tableau/add-tableau-row.use-case";
import { CreateTableauUseCase } from "@/application/use-cases/tableau/create-tableau.use-case";
import { DeleteTableauUseCase } from "@/application/use-cases/tableau/delete-tableau.use-case";
import { GetUserTableauxUseCase } from "@/application/use-cases/tableau/get-user-tableaux.use-case";
import { RemoveTableauRowUseCase } from "@/application/use-cases/tableau/remove-tableau-row.use-case";
import { UpdateTableauRowUseCase } from "@/application/use-cases/tableau/update-tableau-row.use-case";
import { DI_SYMBOLS } from "../types";

export const createTableauModule = () => {
  const tableauModule = createModule();

  tableauModule
    .bind(DI_SYMBOLS.ITableauRepository)
    .toClass(DrizzleTableauRepository);

  tableauModule
    .bind(DI_SYMBOLS.AddTableauRowUseCase)
    .toClass(AddTableauRowUseCase, [DI_SYMBOLS.ITableauRepository]);

  tableauModule
    .bind(DI_SYMBOLS.CreateTableauUseCase)
    .toClass(CreateTableauUseCase, [
      DI_SYMBOLS.ITableauRepository,
      DI_SYMBOLS.IEventDispatcher,
    ]);

  tableauModule
    .bind(DI_SYMBOLS.DeleteTableauUseCase)
    .toClass(DeleteTableauUseCase, [DI_SYMBOLS.ITableauRepository]);

  tableauModule
    .bind(DI_SYMBOLS.GetUserTableauxUseCase)
    .toClass(GetUserTableauxUseCase, [DI_SYMBOLS.ITableauRepository]);

  tableauModule
    .bind(DI_SYMBOLS.RemoveTableauRowUseCase)
    .toClass(RemoveTableauRowUseCase, [DI_SYMBOLS.ITableauRepository]);

  tableauModule
    .bind(DI_SYMBOLS.UpdateTableauRowUseCase)
    .toClass(UpdateTableauRowUseCase, [DI_SYMBOLS.ITableauRepository]);

  return tableauModule;
};
