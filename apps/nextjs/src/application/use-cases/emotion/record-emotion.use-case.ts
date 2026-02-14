import { Result, type UseCase } from "@packages/ddd-kit";
import type {
  IRecordEmotionInputDto,
  IRecordEmotionOutputDto,
} from "@/application/dto/emotion/record-emotion.dto";
import type { IEmotionRepository } from "@/application/ports/emotion-repository.port";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import { EmotionEntry } from "@/domain/emotion/emotion-entry.aggregate";
import { EmotionCategory } from "@/domain/emotion/value-objects/emotion-category.vo";

export class RecordEmotionUseCase
  implements UseCase<IRecordEmotionInputDto, IRecordEmotionOutputDto>
{
  constructor(
    private readonly emotionRepo: IEmotionRepository,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(
    input: IRecordEmotionInputDto,
  ): Promise<Result<IRecordEmotionOutputDto>> {
    const categoryResult = EmotionCategory.create(input.category as string);
    if (categoryResult.isFailure) {
      return Result.fail(categoryResult.getError());
    }

    const existingResult = await this.emotionRepo.findByUserIdAndDate(
      input.userId,
      input.emotionDate,
    );
    if (existingResult.isFailure) {
      return Result.fail(existingResult.getError());
    }

    const existing = existingResult.getValue();

    if (existing.isSome()) {
      const entry = existing.unwrap();
      entry.update(categoryResult.getValue());

      const updateResult = await this.emotionRepo.update(entry);
      if (updateResult.isFailure) {
        return Result.fail(updateResult.getError());
      }

      await this.eventDispatcher.dispatchAll(entry.domainEvents);
      entry.clearEvents();

      return Result.ok(this.toOutputDto(entry, true));
    }

    const entryResult = EmotionEntry.create({
      userId: input.userId,
      category: categoryResult.getValue(),
      emotionDate: input.emotionDate,
    });
    if (entryResult.isFailure) {
      return Result.fail(entryResult.getError());
    }

    const entry = entryResult.getValue();

    const saveResult = await this.emotionRepo.create(entry);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    await this.eventDispatcher.dispatchAll(entry.domainEvents);
    entry.clearEvents();

    return Result.ok(this.toOutputDto(entry, false));
  }

  private toOutputDto(
    entry: EmotionEntry,
    isUpdate: boolean,
  ): IRecordEmotionOutputDto {
    return {
      id: entry.id.value.toString(),
      userId: entry.get("userId"),
      category: entry.get("category").value,
      isUpdate,
    };
  }
}
