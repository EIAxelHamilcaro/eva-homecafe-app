import { Result, type UseCase } from "@packages/ddd-kit";
import { boardToDto } from "@/application/dto/board/board-dto.mapper";
import type {
  IGetBoardsInputDto,
  IGetBoardsOutputDto,
} from "@/application/dto/board/get-boards.dto";
import type { IBoardRepository } from "@/application/ports/board-repository.port";

export class GetUserBoardsUseCase
  implements UseCase<IGetBoardsInputDto, IGetBoardsOutputDto>
{
  constructor(private readonly boardRepo: IBoardRepository) {}

  async execute(
    input: IGetBoardsInputDto,
  ): Promise<Result<IGetBoardsOutputDto>> {
    const pagination = {
      page: input.page ?? 1,
      limit: input.limit ?? 20,
    };

    const result = await this.boardRepo.findByUserId(
      input.userId,
      pagination,
      input.type,
    );

    if (result.isFailure) {
      return Result.fail(result.getError());
    }

    const paginatedBoards = result.getValue();

    return Result.ok({
      boards: paginatedBoards.data.map(boardToDto),
      pagination: paginatedBoards.pagination,
    });
  }
}
