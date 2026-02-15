import { Result, type UseCase, UUID } from "@packages/ddd-kit";
import type {
  IAddRowInputDto,
  IAddRowOutputDto,
} from "@/application/dto/tableau/add-row.dto";
import { tableauToDto } from "@/application/dto/tableau/tableau-dto.mapper";
import type { ITableauRepository } from "@/application/ports/tableau-repository.port";
import { TableauId } from "@/domain/tableau/tableau-id";
import { TableauRow } from "@/domain/tableau/tableau-row.entity";
import { RowName } from "@/domain/tableau/value-objects/row-name.vo";
import { RowPriority } from "@/domain/tableau/value-objects/row-priority.vo";
import { RowStatus } from "@/domain/tableau/value-objects/row-status.vo";

export class AddTableauRowUseCase
  implements UseCase<IAddRowInputDto, IAddRowOutputDto>
{
  constructor(private readonly tableauRepo: ITableauRepository) {}

  async execute(input: IAddRowInputDto): Promise<Result<IAddRowOutputDto>> {
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

    const nameResult = RowName.create(input.name);
    if (nameResult.isFailure) {
      return Result.fail(nameResult.getError());
    }

    const statusResult = RowStatus.create((input.status ?? "todo") as string);
    if (statusResult.isFailure) {
      return Result.fail(statusResult.getError());
    }

    const priorityResult = RowPriority.create(
      (input.priority ?? "medium") as string,
    );
    if (priorityResult.isFailure) {
      return Result.fail(priorityResult.getError());
    }

    const position = tableau.get("rows").length;
    const row = TableauRow.create({
      name: nameResult.getValue(),
      text: input.text,
      status: statusResult.getValue(),
      priority: priorityResult.getValue(),
      date: input.date,
      files: input.files,
      position,
    });

    tableau.addRow(row);

    const saveResult = await this.tableauRepo.update(tableau);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    return Result.ok(tableauToDto(tableau));
  }
}
