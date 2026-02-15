import { Result, type UseCase, UUID } from "@packages/ddd-kit";
import { boardToDto } from "@/application/dto/board/board-dto.mapper";
import type {
  IUpdateColumnInputDto,
  IUpdateColumnOutputDto,
} from "@/application/dto/board/update-column.dto";
import type { IBoardRepository } from "@/application/ports/board-repository.port";
import { BoardId } from "@/domain/board/board-id";

export class UpdateColumnUseCase
  implements UseCase<IUpdateColumnInputDto, IUpdateColumnOutputDto>
{
  constructor(private readonly boardRepo: IBoardRepository) {}

  async execute(
    input: IUpdateColumnInputDto,
  ): Promise<Result<IUpdateColumnOutputDto>> {
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
      const result = board.updateColumnTitle(input.columnId, input.title);
      if (result.isFailure) {
        return Result.fail(result.getError());
      }
    }

    if (input.color !== undefined) {
      const result = board.updateColumnColor(
        input.columnId,
        input.color ?? undefined,
      );
      if (result.isFailure) {
        return Result.fail(result.getError());
      }
    }

    const saveResult = await this.boardRepo.update(board);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    return Result.ok(boardToDto(board));
  }
}
