import { Result, type UseCase, UUID } from "@packages/ddd-kit";
import { tableauToDto } from "@/application/dto/tableau/tableau-dto.mapper";
import type {
  IUpdateRowInputDto,
  IUpdateRowOutputDto,
} from "@/application/dto/tableau/update-row.dto";
import type { ITableauRepository } from "@/application/ports/tableau-repository.port";
import { TableauId } from "@/domain/tableau/tableau-id";
import { RowName } from "@/domain/tableau/value-objects/row-name.vo";
import { RowPriority } from "@/domain/tableau/value-objects/row-priority.vo";
import { RowStatus } from "@/domain/tableau/value-objects/row-status.vo";

export class UpdateTableauRowUseCase
  implements UseCase<IUpdateRowInputDto, IUpdateRowOutputDto>
{
  constructor(private readonly tableauRepo: ITableauRepository) {}

  async execute(
    input: IUpdateRowInputDto,
  ): Promise<Result<IUpdateRowOutputDto>> {
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

    const updates: Record<string, unknown> = {};

    if (input.name !== undefined) {
      const nameResult = RowName.create(input.name);
      if (nameResult.isFailure) {
        return Result.fail(nameResult.getError());
      }
      updates.name = nameResult.getValue();
    }

    if ("text" in input) {
      updates.text = input.text;
    }

    if (input.status !== undefined) {
      const statusResult = RowStatus.create(input.status as string);
      if (statusResult.isFailure) {
        return Result.fail(statusResult.getError());
      }
      updates.status = statusResult.getValue();
    }

    if (input.priority !== undefined) {
      const priorityResult = RowPriority.create(input.priority as string);
      if (priorityResult.isFailure) {
        return Result.fail(priorityResult.getError());
      }
      updates.priority = priorityResult.getValue();
    }

    if ("date" in input) {
      updates.date = input.date;
    }

    if (input.files !== undefined) {
      updates.files = input.files;
    }

    const updateResult = tableau.updateRow(
      input.rowId,
      updates as Parameters<typeof tableau.updateRow>[1],
    );
    if (updateResult.isFailure) {
      return Result.fail(updateResult.getError());
    }

    const saveResult = await this.tableauRepo.update(tableau);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    return Result.ok(tableauToDto(tableau));
  }
}
