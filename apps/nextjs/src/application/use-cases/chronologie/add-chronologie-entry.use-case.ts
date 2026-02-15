import { Result, type UseCase, UUID } from "@packages/ddd-kit";
import type {
  IAddEntryInputDto,
  IAddEntryOutputDto,
} from "@/application/dto/chronologie/add-entry.dto";
import { chronologieToDto } from "@/application/dto/chronologie/chronologie-dto.mapper";
import type { IChronologieRepository } from "@/application/ports/chronologie-repository.port";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import { ChronologieId } from "@/domain/chronologie/chronologie-id";
import { EntryTitle } from "@/domain/chronologie/value-objects/entry-title.vo";

export class AddChronologieEntryUseCase
  implements UseCase<IAddEntryInputDto, IAddEntryOutputDto>
{
  constructor(
    private readonly chronologieRepo: IChronologieRepository,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(input: IAddEntryInputDto): Promise<Result<IAddEntryOutputDto>> {
    const chronologieId = ChronologieId.create(new UUID(input.chronologieId));
    const findResult = await this.chronologieRepo.findById(chronologieId);

    if (findResult.isFailure) {
      return Result.fail(findResult.getError());
    }

    const option = findResult.getValue();
    if (option.isNone()) {
      return Result.fail("Chronologie not found");
    }

    const chronologie = option.unwrap();
    if (chronologie.get("userId") !== input.userId) {
      return Result.fail("Forbidden");
    }

    const titleResult = EntryTitle.create(input.title);
    if (titleResult.isFailure) {
      return Result.fail(titleResult.getError());
    }

    chronologie.addEntry({
      title: titleResult.getValue().value,
      startDate: input.startDate,
      endDate: input.endDate,
      color: input.color,
    });

    const saveResult = await this.chronologieRepo.update(chronologie);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    await this.eventDispatcher.dispatchAll(chronologie.domainEvents);
    chronologie.clearEvents();

    return Result.ok(chronologieToDto(chronologie));
  }
}
