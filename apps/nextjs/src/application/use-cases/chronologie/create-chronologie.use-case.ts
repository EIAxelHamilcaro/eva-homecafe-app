import { Result, type UseCase } from "@packages/ddd-kit";
import { chronologieToDto } from "@/application/dto/chronologie/chronologie-dto.mapper";
import type {
  ICreateChronologieInputDto,
  ICreateChronologieOutputDto,
} from "@/application/dto/chronologie/create-chronologie.dto";
import type { IChronologieRepository } from "@/application/ports/chronologie-repository.port";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import { Chronologie } from "@/domain/chronologie/chronologie.aggregate";
import { ChronologieTitle } from "@/domain/chronologie/value-objects/chronologie-title.vo";

export class CreateChronologieUseCase
  implements UseCase<ICreateChronologieInputDto, ICreateChronologieOutputDto>
{
  constructor(
    private readonly chronologieRepo: IChronologieRepository,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(
    input: ICreateChronologieInputDto,
  ): Promise<Result<ICreateChronologieOutputDto>> {
    const titleResult = ChronologieTitle.create(input.title);
    if (titleResult.isFailure) {
      return Result.fail(titleResult.getError());
    }

    const chronologieResult = Chronologie.create({
      userId: input.userId,
      title: titleResult.getValue(),
    });

    if (chronologieResult.isFailure) {
      return Result.fail(chronologieResult.getError());
    }

    const chronologie = chronologieResult.getValue();

    const saveResult = await this.chronologieRepo.create(chronologie);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    await this.eventDispatcher.dispatchAll(chronologie.domainEvents);
    chronologie.clearEvents();

    return Result.ok(chronologieToDto(chronologie));
  }
}
