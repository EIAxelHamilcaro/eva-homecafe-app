import { Result, type UseCase, UUID } from "@packages/ddd-kit";
import { boardToDto } from "@/application/dto/board/board-dto.mapper";
import type {
  IRemoveCardInputDto,
  IRemoveCardOutputDto,
} from "@/application/dto/board/remove-card.dto";
import type { IBoardRepository } from "@/application/ports/board-repository.port";
import { BoardId } from "@/domain/board/board-id";

export class RemoveCardUseCase
  implements UseCase<IRemoveCardInputDto, IRemoveCardOutputDto>
{
  constructor(private readonly boardRepo: IBoardRepository) {}

  async execute(
    input: IRemoveCardInputDto,
  ): Promise<Result<IRemoveCardOutputDto>> {
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

    const removeResult = board.removeCard(input.cardId);
    if (removeResult.isFailure) {
      return Result.fail(removeResult.getError());
    }

    const saveResult = await this.boardRepo.update(board);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    return Result.ok(boardToDto(board));
  }
}
