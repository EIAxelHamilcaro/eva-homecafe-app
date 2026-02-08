import { Result, type UseCase, UUID } from "@packages/ddd-kit";
import type {
  IAddCardInputDto,
  IAddCardOutputDto,
} from "@/application/dto/board/add-card.dto";
import { boardToDto } from "@/application/dto/board/board-dto.mapper";
import type { IBoardRepository } from "@/application/ports/board-repository.port";
import { BoardId } from "@/domain/board/board-id";
import { Card } from "@/domain/board/card.entity";
import { CardTitle } from "@/domain/board/value-objects/card-title.vo";

export class AddCardToColumnUseCase
  implements UseCase<IAddCardInputDto, IAddCardOutputDto>
{
  constructor(private readonly boardRepo: IBoardRepository) {}

  async execute(input: IAddCardInputDto): Promise<Result<IAddCardOutputDto>> {
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

    const cardTitleResult = CardTitle.create(input.title);
    if (cardTitleResult.isFailure) {
      return Result.fail(cardTitleResult.getError());
    }

    const column = board
      .get("columns")
      .find((c) => c.id.value.toString() === input.columnId);
    if (!column) {
      return Result.fail("Column not found");
    }

    const existingCards = column.get("cards");
    const maxPosition =
      existingCards.length > 0
        ? Math.max(...existingCards.map((c) => c.get("position")))
        : -1;

    const card = Card.create({
      title: cardTitleResult.getValue(),
      description: input.description ?? undefined,
      position: maxPosition + 1,
      progress: input.progress,
      dueDate: input.dueDate ?? undefined,
    });

    const addResult = board.addCardToColumn(input.columnId, card);
    if (addResult.isFailure) {
      return Result.fail(addResult.getError());
    }

    const saveResult = await this.boardRepo.update(board);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    return Result.ok(boardToDto(board));
  }
}
