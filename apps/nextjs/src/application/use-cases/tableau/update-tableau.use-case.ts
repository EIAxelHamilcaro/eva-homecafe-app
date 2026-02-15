import { Result, type UseCase, UUID } from "@packages/ddd-kit";
import { tableauToDto } from "@/application/dto/tableau/tableau-dto.mapper";
import type {
  IUpdateTableauInputDto,
  IUpdateTableauOutputDto,
} from "@/application/dto/tableau/update-tableau.dto";
import type { ITableauRepository } from "@/application/ports/tableau-repository.port";
import { TableauId } from "@/domain/tableau/tableau-id";
import { TableauTitle } from "@/domain/tableau/value-objects/tableau-title.vo";

export class UpdateTableauUseCase
  implements UseCase<IUpdateTableauInputDto, IUpdateTableauOutputDto>
{
  constructor(private readonly tableauRepo: ITableauRepository) {}

  async execute(
    input: IUpdateTableauInputDto,
  ): Promise<Result<IUpdateTableauOutputDto>> {
    const tableauId = TableauId.create(new UUID(input.tableauId));
    const findResult = await this.tableauRepo.findById(tableauId);

    if (findResult.isFailure) return Result.fail(findResult.getError());

    const option = findResult.getValue();
    if (option.isNone()) return Result.fail("Tableau not found");

    const tableau = option.unwrap();
    if (tableau.get("userId") !== input.userId) return Result.fail("Forbidden");

    if (input.title !== undefined) {
      const titleResult = TableauTitle.create(input.title);
      if (titleResult.isFailure) return Result.fail(titleResult.getError());
      tableau.updateTitle(titleResult.getValue());
    }

    if (input.statusOptions !== undefined) {
      tableau.updateStatusOptions(input.statusOptions);
    }

    if (input.priorityOptions !== undefined) {
      tableau.updatePriorityOptions(input.priorityOptions);
    }

    if (input.columns !== undefined) {
      tableau.updateColumns(input.columns);
    }

    if (input.columnOrder !== undefined) {
      tableau.updateColumnOrder(input.columnOrder);
    }

    const saveResult = await this.tableauRepo.update(tableau);
    if (saveResult.isFailure) return Result.fail(saveResult.getError());

    return Result.ok(tableauToDto(tableau));
  }
}
