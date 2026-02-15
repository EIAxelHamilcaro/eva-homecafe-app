import { createModule } from "@evyweb/ioctopus";
import { DrizzleBoardRepository } from "@/adapters/repositories/board.repository";
import { AddCardToColumnUseCase } from "@/application/use-cases/board/add-card-to-column.use-case";
import { AddColumnUseCase } from "@/application/use-cases/board/add-column.use-case";
import { CreateBoardUseCase } from "@/application/use-cases/board/create-board.use-case";
import { CreateKanbanBoardUseCase } from "@/application/use-cases/board/create-kanban-board.use-case";
import { DeleteBoardUseCase } from "@/application/use-cases/board/delete-board.use-case";
import { GetUserBoardsUseCase } from "@/application/use-cases/board/get-user-boards.use-case";
import { MoveCardUseCase } from "@/application/use-cases/board/move-card.use-case";
import { RemoveCardUseCase } from "@/application/use-cases/board/remove-card.use-case";
import { RemoveColumnUseCase } from "@/application/use-cases/board/remove-column.use-case";
import { UpdateBoardUseCase } from "@/application/use-cases/board/update-board.use-case";
import { UpdateCardUseCase } from "@/application/use-cases/board/update-card.use-case";
import { UpdateColumnUseCase } from "@/application/use-cases/board/update-column.use-case";
import { DI_SYMBOLS } from "../types";

export const createBoardModule = () => {
  const boardModule = createModule();

  boardModule.bind(DI_SYMBOLS.IBoardRepository).toClass(DrizzleBoardRepository);

  boardModule
    .bind(DI_SYMBOLS.AddCardToColumnUseCase)
    .toClass(AddCardToColumnUseCase, [DI_SYMBOLS.IBoardRepository]);

  boardModule
    .bind(DI_SYMBOLS.AddColumnUseCase)
    .toClass(AddColumnUseCase, [DI_SYMBOLS.IBoardRepository]);

  boardModule
    .bind(DI_SYMBOLS.CreateBoardUseCase)
    .toClass(CreateBoardUseCase, [
      DI_SYMBOLS.IBoardRepository,
      DI_SYMBOLS.IEventDispatcher,
    ]);

  boardModule
    .bind(DI_SYMBOLS.CreateKanbanBoardUseCase)
    .toClass(CreateKanbanBoardUseCase, [DI_SYMBOLS.IBoardRepository]);

  boardModule
    .bind(DI_SYMBOLS.DeleteBoardUseCase)
    .toClass(DeleteBoardUseCase, [DI_SYMBOLS.IBoardRepository]);

  boardModule
    .bind(DI_SYMBOLS.GetUserBoardsUseCase)
    .toClass(GetUserBoardsUseCase, [DI_SYMBOLS.IBoardRepository]);

  boardModule
    .bind(DI_SYMBOLS.MoveCardUseCase)
    .toClass(MoveCardUseCase, [DI_SYMBOLS.IBoardRepository]);

  boardModule
    .bind(DI_SYMBOLS.RemoveCardUseCase)
    .toClass(RemoveCardUseCase, [DI_SYMBOLS.IBoardRepository]);

  boardModule
    .bind(DI_SYMBOLS.RemoveColumnUseCase)
    .toClass(RemoveColumnUseCase, [DI_SYMBOLS.IBoardRepository]);

  boardModule
    .bind(DI_SYMBOLS.UpdateBoardUseCase)
    .toClass(UpdateBoardUseCase, [DI_SYMBOLS.IBoardRepository]);

  boardModule
    .bind(DI_SYMBOLS.UpdateCardUseCase)
    .toClass(UpdateCardUseCase, [
      DI_SYMBOLS.IBoardRepository,
      DI_SYMBOLS.IEventDispatcher,
    ]);

  boardModule
    .bind(DI_SYMBOLS.UpdateColumnUseCase)
    .toClass(UpdateColumnUseCase, [DI_SYMBOLS.IBoardRepository]);

  return boardModule;
};
