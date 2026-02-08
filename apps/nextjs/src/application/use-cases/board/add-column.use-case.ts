import { Result, type UseCase, UUID } from "@packages/ddd-kit";
import type {
  IAddColumnInputDto,
  IAddColumnOutputDto,
} from "@/application/dto/board/add-column.dto";
import { boardToDto } from "@/application/dto/board/board-dto.mapper";
import type { IBoardRepository } from "@/application/ports/board-repository.port";
import { BoardId } from "@/domain/board/board-id";

export class AddColumnUseCase
  implements UseCase<IAddColumnInputDto, IAddColumnOutputDto>
{
  constructor(private readonly boardRepo: IBoardRepository) {}

  async execute(
    input: IAddColumnInputDto,
  ): Promise<Result<IAddColumnOutputDto>> {
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

    if (board.get("type").value !== "kanban") {
      return Result.fail("Can only add columns to kanban boards");
    }

    const addResult = board.addColumn(input.title);
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
