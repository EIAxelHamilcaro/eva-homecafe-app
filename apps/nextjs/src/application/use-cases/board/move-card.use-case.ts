import { Result, type UseCase, UUID } from "@packages/ddd-kit";
import { boardToDto } from "@/application/dto/board/board-dto.mapper";
import type {
  IMoveCardInputDto,
  IMoveCardOutputDto,
} from "@/application/dto/board/move-card.dto";
import type { IBoardRepository } from "@/application/ports/board-repository.port";
import { BoardId } from "@/domain/board/board-id";

export class MoveCardUseCase
  implements UseCase<IMoveCardInputDto, IMoveCardOutputDto>
{
  constructor(private readonly boardRepo: IBoardRepository) {}

  async execute(input: IMoveCardInputDto): Promise<Result<IMoveCardOutputDto>> {
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

    const cardOption = board.findCard(input.cardId);
    if (cardOption.isNone()) {
      return Result.fail("Card not found");
    }

    const currentColumnId = this.findCardColumnId(board, input.cardId);
    if (!currentColumnId) {
      return Result.fail("Card not found in any column");
    }

    if (currentColumnId === input.toColumnId) {
      const reorderResult = board.reorderCard(
        input.toColumnId,
        input.cardId,
        input.newPosition,
      );
      if (reorderResult.isFailure) {
        return Result.fail(reorderResult.getError());
      }
    } else {
      const moveResult = board.moveCard(
        input.cardId,
        input.toColumnId,
        input.newPosition,
      );
      if (moveResult.isFailure) {
        return Result.fail(moveResult.getError());
      }
    }

    const saveResult = await this.boardRepo.update(board);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    return Result.ok(boardToDto(board));
  }

  private findCardColumnId(
    board: import("@/domain/board/board.aggregate").Board,
    cardId: string,
  ): string | undefined {
    for (const column of board.get("columns")) {
      const cardOption = column.findCard(cardId);
      if (cardOption.isSome()) {
        return column.id.value.toString();
      }
    }
    return undefined;
  }
}
