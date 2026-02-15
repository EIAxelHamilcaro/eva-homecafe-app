import { Result, type UseCase, UUID } from "@packages/ddd-kit";
import { boardToDto } from "@/application/dto/board/board-dto.mapper";
import type {
  IUpdateCardInputDto,
  IUpdateCardOutputDto,
} from "@/application/dto/board/update-card.dto";
import type { IBoardRepository } from "@/application/ports/board-repository.port";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import { BoardId } from "@/domain/board/board-id";
import { CardProgress } from "@/domain/board/value-objects/card-progress.vo";
import { CardTitle } from "@/domain/board/value-objects/card-title.vo";

export class UpdateCardUseCase
  implements UseCase<IUpdateCardInputDto, IUpdateCardOutputDto>
{
  constructor(
    private readonly boardRepo: IBoardRepository,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(
    input: IUpdateCardInputDto,
  ): Promise<Result<IUpdateCardOutputDto>> {
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

    const updates: Parameters<typeof board.updateCard>[1] = {};

    if (input.title !== undefined) {
      const titleResult = CardTitle.create(input.title);
      if (titleResult.isFailure) {
        return Result.fail(titleResult.getError());
      }
      updates.title = titleResult.getValue();
    }

    if ("description" in input) {
      updates.description = input.description ?? undefined;
    }

    if ("content" in input) {
      updates.content = input.content ?? undefined;
    }

    if (input.progress !== undefined) {
      const progressResult = CardProgress.create(input.progress);
      if (progressResult.isFailure) {
        return Result.fail(progressResult.getError());
      }
      updates.progress = progressResult.getValue();
    }

    if ("priority" in input) {
      updates.priority = input.priority ?? undefined;
    }

    if (input.tags !== undefined) {
      updates.tags = input.tags;
    }

    if ("link" in input) {
      updates.link = input.link ?? undefined;
    }

    if ("dueDate" in input) {
      updates.dueDate = input.dueDate ?? undefined;
    }

    const updateResult = board.updateCard(input.cardId, updates);
    if (updateResult.isFailure) {
      return Result.fail(updateResult.getError());
    }

    const saveResult = await this.boardRepo.update(board);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    await this.eventDispatcher.dispatchAll(board.domainEvents);
    board.clearEvents();

    return Result.ok(boardToDto(board));
  }
}
