import { Result, type UseCase, UUID } from "@packages/ddd-kit";
import { chronologieToDto } from "@/application/dto/chronologie/chronologie-dto.mapper";
import type {
  IRemoveEntryInputDto,
  IRemoveEntryOutputDto,
} from "@/application/dto/chronologie/remove-entry.dto";
import type { IChronologieRepository } from "@/application/ports/chronologie-repository.port";
import { ChronologieEntryId } from "@/domain/chronologie/chronologie-entry-id";
import { ChronologieId } from "@/domain/chronologie/chronologie-id";

export class RemoveChronologieEntryUseCase
  implements UseCase<IRemoveEntryInputDto, IRemoveEntryOutputDto>
{
  constructor(private readonly chronologieRepo: IChronologieRepository) {}

  async execute(
    input: IRemoveEntryInputDto,
  ): Promise<Result<IRemoveEntryOutputDto>> {
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

    const entryId = ChronologieEntryId.create(new UUID(input.entryId));
    const removeResult = chronologie.removeEntry(entryId);
    if (removeResult.isFailure) {
      return Result.fail(removeResult.getError());
    }

    const saveResult = await this.chronologieRepo.update(chronologie);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    return Result.ok(chronologieToDto(chronologie));
  }
}
