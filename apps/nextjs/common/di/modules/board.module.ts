import { createModule } from "@evyweb/ioctopus";
import { DrizzleBoardRepository } from "@/adapters/repositories/board.repository";
import { CreateBoardUseCase } from "@/application/use-cases/board/create-board.use-case";
import { DeleteBoardUseCase } from "@/application/use-cases/board/delete-board.use-case";
import { GetUserBoardsUseCase } from "@/application/use-cases/board/get-user-boards.use-case";
import { UpdateBoardUseCase } from "@/application/use-cases/board/update-board.use-case";
import { DI_SYMBOLS } from "../types";

export const createBoardModule = () => {
  const boardModule = createModule();

  boardModule.bind(DI_SYMBOLS.IBoardRepository).toClass(DrizzleBoardRepository);

  boardModule
    .bind(DI_SYMBOLS.CreateBoardUseCase)
    .toClass(CreateBoardUseCase, [DI_SYMBOLS.IBoardRepository]);

  boardModule
    .bind(DI_SYMBOLS.DeleteBoardUseCase)
    .toClass(DeleteBoardUseCase, [DI_SYMBOLS.IBoardRepository]);

  boardModule
    .bind(DI_SYMBOLS.GetUserBoardsUseCase)
    .toClass(GetUserBoardsUseCase, [DI_SYMBOLS.IBoardRepository]);

  boardModule
    .bind(DI_SYMBOLS.UpdateBoardUseCase)
    .toClass(UpdateBoardUseCase, [DI_SYMBOLS.IBoardRepository]);

  return boardModule;
};
