import { Result, type UseCase } from "@packages/ddd-kit";
import { boardToDto } from "@/application/dto/board/board-dto.mapper";
import type {
  ICreateBoardInputDto,
  ICreateBoardOutputDto,
} from "@/application/dto/board/create-board.dto";
import type { IBoardRepository } from "@/application/ports/board-repository.port";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import { Board } from "@/domain/board/board.aggregate";
import { Card } from "@/domain/board/card.entity";
import { Column } from "@/domain/board/column.entity";
import { BoardTitle } from "@/domain/board/value-objects/board-title.vo";
import { BoardType } from "@/domain/board/value-objects/board-type.vo";
import { CardTitle } from "@/domain/board/value-objects/card-title.vo";

export class CreateBoardUseCase
  implements UseCase<ICreateBoardInputDto, ICreateBoardOutputDto>
{
  constructor(
    private readonly boardRepo: IBoardRepository,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(
    input: ICreateBoardInputDto,
  ): Promise<Result<ICreateBoardOutputDto>> {
    const titleResult = BoardTitle.create(input.title);
    if (titleResult.isFailure) {
      return Result.fail(titleResult.getError());
    }

    const typeResult = BoardType.create(input.type as string);
    if (typeResult.isFailure) {
      return Result.fail(typeResult.getError());
    }

    const cards: Card[] = [];
    for (let i = 0; i < input.items.length; i++) {
      const item = input.items[i];
      if (!item) continue;
      const cardTitleResult = CardTitle.create(item.title);
      if (cardTitleResult.isFailure) {
        return Result.fail(cardTitleResult.getError());
      }
      cards.push(
        Card.create({
          title: cardTitleResult.getValue(),
          position: i,
        }),
      );
    }

    const column = Column.create({
      title: "Items",
      position: 0,
      cards,
    });

    const boardResult = Board.create({
      userId: input.userId,
      title: titleResult.getValue(),
      type: typeResult.getValue(),
      columns: [column],
    });

    if (boardResult.isFailure) {
      return Result.fail(boardResult.getError());
    }

    const board = boardResult.getValue();

    const saveResult = await this.boardRepo.create(board);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    await this.eventDispatcher.dispatchAll(board.domainEvents);
    board.clearEvents();

    return Result.ok(boardToDto(board));
  }
}
