import { Result, type UseCase, UUID } from "@packages/ddd-kit";
import { chronologieToDto } from "@/application/dto/chronologie/chronologie-dto.mapper";
import type {
  IUpdateEntryInputDto,
  IUpdateEntryOutputDto,
} from "@/application/dto/chronologie/update-entry.dto";
import type { IChronologieRepository } from "@/application/ports/chronologie-repository.port";
import { ChronologieId } from "@/domain/chronologie/chronologie-id";
import { EntryTitle } from "@/domain/chronologie/value-objects/entry-title.vo";

export class UpdateChronologieEntryUseCase
  implements UseCase<IUpdateEntryInputDto, IUpdateEntryOutputDto>
{
  constructor(private readonly chronologieRepo: IChronologieRepository) {}

  async execute(
    input: IUpdateEntryInputDto,
  ): Promise<Result<IUpdateEntryOutputDto>> {
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

    const updates: Record<string, unknown> = {};

    if (input.title !== undefined) {
      const titleResult = EntryTitle.create(input.title);
      if (titleResult.isFailure) {
        return Result.fail(titleResult.getError());
      }
      updates.title = titleResult.getValue();
    }

    if ("startDate" in input) {
      updates.startDate = input.startDate;
    }

    if ("endDate" in input) {
      updates.endDate = input.endDate;
    }

    if (input.color !== undefined) {
      updates.color = input.color;
    }

    const updateResult = chronologie.updateEntry(
      input.entryId,
      updates as Parameters<typeof chronologie.updateEntry>[1],
    );
    if (updateResult.isFailure) {
      return Result.fail(updateResult.getError());
    }

    const saveResult = await this.chronologieRepo.update(chronologie);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    return Result.ok(chronologieToDto(chronologie));
  }
}
