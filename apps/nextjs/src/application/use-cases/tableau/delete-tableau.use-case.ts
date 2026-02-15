import { Result, type UseCase, UUID } from "@packages/ddd-kit";
import type {
  IDeleteTableauInputDto,
  IDeleteTableauOutputDto,
} from "@/application/dto/tableau/delete-tableau.dto";
import type { ITableauRepository } from "@/application/ports/tableau-repository.port";
import { TableauId } from "@/domain/tableau/tableau-id";

export class DeleteTableauUseCase
  implements UseCase<IDeleteTableauInputDto, IDeleteTableauOutputDto>
{
  constructor(private readonly tableauRepo: ITableauRepository) {}

  async execute(
    input: IDeleteTableauInputDto,
  ): Promise<Result<IDeleteTableauOutputDto>> {
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

    const deleteResult = await this.tableauRepo.delete(tableauId);
    if (deleteResult.isFailure) {
      return Result.fail(deleteResult.getError());
    }

    return Result.ok({ id: input.tableauId });
  }
}
