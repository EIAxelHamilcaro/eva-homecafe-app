import { Result, type UseCase } from "@packages/ddd-kit";
import type {
  IRecordMoodInputDto,
  IRecordMoodOutputDto,
} from "@/application/dto/mood/record-mood.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IMoodRepository } from "@/application/ports/mood-repository.port";
import { MoodEntry } from "@/domain/mood/mood-entry.aggregate";
import { MoodCategory } from "@/domain/mood/value-objects/mood-category.vo";
import { MoodIntensity } from "@/domain/mood/value-objects/mood-intensity.vo";

export class RecordMoodUseCase
  implements UseCase<IRecordMoodInputDto, IRecordMoodOutputDto>
{
  constructor(
    private readonly moodRepo: IMoodRepository,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(
    input: IRecordMoodInputDto,
  ): Promise<Result<IRecordMoodOutputDto>> {
    const categoryResult = MoodCategory.create(input.category as string);
    if (categoryResult.isFailure) {
      return Result.fail(categoryResult.getError());
    }

    const intensityResult = MoodIntensity.create(input.intensity);
    if (intensityResult.isFailure) {
      return Result.fail(intensityResult.getError());
    }

    const targetDate = input.moodDate ?? this.getTodayDateStr();

    const existingResult = await this.moodRepo.findByUserIdAndDate(
      input.userId,
      targetDate,
    );
    if (existingResult.isFailure) {
      return Result.fail(existingResult.getError());
    }

    const existing = existingResult.getValue();

    if (existing.isSome()) {
      const entry = existing.unwrap();
      entry.update(categoryResult.getValue(), intensityResult.getValue());

      const updateResult = await this.moodRepo.update(entry);
      if (updateResult.isFailure) {
        return Result.fail(updateResult.getError());
      }

      await this.eventDispatcher.dispatchAll(entry.domainEvents);
      entry.clearEvents();

      return Result.ok(this.toOutputDto(entry, true));
    }

    const entryResult = MoodEntry.create({
      userId: input.userId,
      category: categoryResult.getValue(),
      intensity: intensityResult.getValue(),
      moodDate: targetDate,
    });
    if (entryResult.isFailure) {
      return Result.fail(entryResult.getError());
    }

    const entry = entryResult.getValue();

    const saveResult = await this.moodRepo.create(entry);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    await this.eventDispatcher.dispatchAll(entry.domainEvents);
    entry.clearEvents();

    return Result.ok(this.toOutputDto(entry, false));
  }

  private getTodayDateStr(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }

  private toOutputDto(
    entry: MoodEntry,
    isUpdate: boolean,
  ): IRecordMoodOutputDto {
    return {
      id: entry.id.value.toString(),
      userId: entry.get("userId"),
      category: entry.get("category").value,
      intensity: entry.get("intensity").value,
      createdAt: entry.get("createdAt").toISOString(),
      isUpdate,
    };
  }
}
