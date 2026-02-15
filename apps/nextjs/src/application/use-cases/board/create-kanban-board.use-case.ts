import { Result, type UseCase } from "@packages/ddd-kit";
import { boardToDto } from "@/application/dto/board/board-dto.mapper";
import type {
  ICreateKanbanBoardInputDto,
  ICreateKanbanBoardOutputDto,
} from "@/application/dto/board/create-kanban-board.dto";
import type { IBoardRepository } from "@/application/ports/board-repository.port";
import { Board } from "@/domain/board/board.aggregate";
import { Column } from "@/domain/board/column.entity";
import { BoardTitle } from "@/domain/board/value-objects/board-title.vo";
import { BoardType } from "@/domain/board/value-objects/board-type.vo";

const DEFAULT_COLUMNS = [
  { title: "To Do" },
  { title: "In Progress" },
  { title: "Done" },
];

export class CreateKanbanBoardUseCase
  implements UseCase<ICreateKanbanBoardInputDto, ICreateKanbanBoardOutputDto>
{
  constructor(private readonly boardRepo: IBoardRepository) {}

  async execute(
    input: ICreateKanbanBoardInputDto,
  ): Promise<Result<ICreateKanbanBoardOutputDto>> {
    const titleResult = BoardTitle.create(input.title);
    if (titleResult.isFailure) {
      return Result.fail(titleResult.getError());
    }

    const typeResult = BoardType.create("kanban" as string);
    if (typeResult.isFailure) {
      return Result.fail(typeResult.getError());
    }

    const inputColumns = input.columns ?? [];
    const columnDefs = inputColumns.length > 0 ? inputColumns : DEFAULT_COLUMNS;

    const columns = columnDefs.map((col, index) =>
      Column.create({ title: col.title, position: index }),
    );

    const boardResult = Board.create({
      userId: input.userId,
      title: titleResult.getValue(),
      type: typeResult.getValue(),
      columns,
      description: input.description,
      priority: input.priority,
      dueDate: input.dueDate,
      tags: input.tags,
      link: input.link,
    });

    if (boardResult.isFailure) {
      return Result.fail(boardResult.getError());
    }

    const board = boardResult.getValue();

    const saveResult = await this.boardRepo.create(board);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    return Result.ok(boardToDto(board));
  }
}
