import { Result, type UseCase } from "@packages/ddd-kit";
import type {
  ICreateTableauInputDto,
  ICreateTableauOutputDto,
} from "@/application/dto/tableau/create-tableau.dto";
import { tableauToDto } from "@/application/dto/tableau/tableau-dto.mapper";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { ITableauRepository } from "@/application/ports/tableau-repository.port";
import { Tableau } from "@/domain/tableau/tableau.aggregate";
import { TableauTitle } from "@/domain/tableau/value-objects/tableau-title.vo";

export class CreateTableauUseCase
  implements UseCase<ICreateTableauInputDto, ICreateTableauOutputDto>
{
  constructor(
    private readonly tableauRepo: ITableauRepository,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(
    input: ICreateTableauInputDto,
  ): Promise<Result<ICreateTableauOutputDto>> {
    const titleResult = TableauTitle.create(input.title);
    if (titleResult.isFailure) {
      return Result.fail(titleResult.getError());
    }

    const tableauResult = Tableau.create({
      userId: input.userId,
      title: titleResult.getValue(),
    });

    if (tableauResult.isFailure) {
      return Result.fail(tableauResult.getError());
    }

    const tableau = tableauResult.getValue();

    const saveResult = await this.tableauRepo.create(tableau);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    await this.eventDispatcher.dispatchAll(tableau.domainEvents);
    tableau.clearEvents();

    return Result.ok(tableauToDto(tableau));
  }
}
