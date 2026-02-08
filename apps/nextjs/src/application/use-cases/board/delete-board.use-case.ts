import { Result, type UseCase, UUID } from "@packages/ddd-kit";
import type {
  IDeleteBoardInputDto,
  IDeleteBoardOutputDto,
} from "@/application/dto/board/delete-board.dto";
import type { IBoardRepository } from "@/application/ports/board-repository.port";
import { BoardId } from "@/domain/board/board-id";

export class DeleteBoardUseCase
  implements UseCase<IDeleteBoardInputDto, IDeleteBoardOutputDto>
{
  constructor(private readonly boardRepo: IBoardRepository) {}

  async execute(
    input: IDeleteBoardInputDto,
  ): Promise<Result<IDeleteBoardOutputDto>> {
    const boardId = BoardId.create(new UUID(input.boardId));
    const findResult = await this.boardRepo.findById(boardId);

    if (findResult.isFailure) {
      return Result.fail(findResult.getError());
    }

    const option = findResult.getValue();
    if (option.isNone()) {
      return Result.fail("Board not found");
    }

    const board = option.unwrap();

    if (board.get("userId") !== input.userId) {
      return Result.fail("Forbidden");
    }

    const deleteResult = await this.boardRepo.delete(boardId);
    if (deleteResult.isFailure) {
      return Result.fail(deleteResult.getError());
    }

    return Result.ok({ id: input.boardId });
  }
}
