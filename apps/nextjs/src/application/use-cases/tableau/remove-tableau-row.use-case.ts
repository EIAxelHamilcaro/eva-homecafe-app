import { Result, type UseCase, UUID } from "@packages/ddd-kit";
import type {
  IRemoveRowInputDto,
  IRemoveRowOutputDto,
} from "@/application/dto/tableau/remove-row.dto";
import { tableauToDto } from "@/application/dto/tableau/tableau-dto.mapper";
import type { ITableauRepository } from "@/application/ports/tableau-repository.port";
import { TableauId } from "@/domain/tableau/tableau-id";

export class RemoveTableauRowUseCase
  implements UseCase<IRemoveRowInputDto, IRemoveRowOutputDto>
{
  constructor(private readonly tableauRepo: ITableauRepository) {}

  async execute(
    input: IRemoveRowInputDto,
  ): Promise<Result<IRemoveRowOutputDto>> {
    const tableauId = TableauId.create(new UUID(input.tableauId));
    const findResult = await this.tableauRepo.findById(tableauId);

    if (findResult.isFailure) {
      return Result.fail(findResult.getError());
    }

    const option = findResult.getValue();
    if (option.isNone()) {
      return Result.fail("Tableau not found");
    }

    const tableau = option.unwrap();
    if (tableau.get("userId") !== input.userId) {
      return Result.fail("Forbidden");
    }

    const removeResult = tableau.removeRow(input.rowId);
    if (removeResult.isFailure) {
      return Result.fail(removeResult.getError());
    }

    const saveResult = await this.tableauRepo.update(tableau);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    return Result.ok(tableauToDto(tableau));
  }
}
