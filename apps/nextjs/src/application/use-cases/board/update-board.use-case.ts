import { Result, type UseCase, UUID } from "@packages/ddd-kit";
import { boardToDto } from "@/application/dto/board/board-dto.mapper";
import type {
  IUpdateBoardInputDto,
  IUpdateBoardOutputDto,
} from "@/application/dto/board/update-board.dto";
import type { IBoardRepository } from "@/application/ports/board-repository.port";
import { BoardId } from "@/domain/board/board-id";
import { Card } from "@/domain/board/card.entity";
import { BoardTitle } from "@/domain/board/value-objects/board-title.vo";
import { CardTitle } from "@/domain/board/value-objects/card-title.vo";

export class UpdateBoardUseCase
  implements UseCase<IUpdateBoardInputDto, IUpdateBoardOutputDto>
{
  constructor(private readonly boardRepo: IBoardRepository) {}

  async execute(
    input: IUpdateBoardInputDto,
  ): Promise<Result<IUpdateBoardOutputDto>> {
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

    if (input.title !== undefined) {
      const titleResult = BoardTitle.create(input.title);
      if (titleResult.isFailure) {
        return Result.fail(titleResult.getError());
      }
      board.updateTitle(titleResult.getValue());
    }

    if (input.toggleCardIds) {
      for (const cardId of input.toggleCardIds) {
        const toggleResult = board.toggleCard(cardId);
        if (toggleResult.isFailure) {
          return Result.fail(toggleResult.getError());
        }
      }
    }

    if (input.removeCardIds) {
      for (const cardId of input.removeCardIds) {
        const removeResult = board.removeCard(cardId);
        if (removeResult.isFailure) {
          return Result.fail(removeResult.getError());
        }
      }
    }

    if (input.addCards && input.addCards.length > 0) {
      const columns = board.get("columns");
      const firstColumn = columns[0];
      if (!firstColumn) {
        return Result.fail("Board has no columns");
      }

      const existingCards = firstColumn.get("cards");
      let maxPosition =
        existingCards.length > 0
          ? Math.max(...existingCards.map((c) => c.get("position")))
          : -1;

      for (const item of input.addCards) {
        const cardTitleResult = CardTitle.create(item.title);
        if (cardTitleResult.isFailure) {
          return Result.fail(cardTitleResult.getError());
        }

        maxPosition += 1;
        const card = Card.create({
          title: cardTitleResult.getValue(),
          position: maxPosition,
        });

        const addResult = board.addCardToColumn(
          firstColumn.id.value.toString(),
          card,
        );
        if (addResult.isFailure) {
          return Result.fail(addResult.getError());
        }
      }
    }

    const saveResult = await this.boardRepo.update(board);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    return Result.ok(boardToDto(board));
  }
}
