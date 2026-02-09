import { Result, type UseCase } from "@packages/ddd-kit";
import type {
  ICreateMoodboardInputDto,
  ICreateMoodboardOutputDto,
} from "@/application/dto/moodboard/create-moodboard.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IMoodboardRepository } from "@/application/ports/moodboard-repository.port";
import { Moodboard } from "@/domain/moodboard/moodboard.aggregate";
import { MoodboardTitle } from "@/domain/moodboard/value-objects/moodboard-title.vo";

export class CreateMoodboardUseCase
  implements UseCase<ICreateMoodboardInputDto, ICreateMoodboardOutputDto>
{
  constructor(
    private readonly moodboardRepo: IMoodboardRepository,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(
    input: ICreateMoodboardInputDto,
  ): Promise<Result<ICreateMoodboardOutputDto>> {
    const titleResult = MoodboardTitle.create(input.title);
    if (titleResult.isFailure) {
      return Result.fail(titleResult.getError());
    }

    const moodboardResult = Moodboard.create({
      userId: input.userId,
      title: titleResult.getValue(),
    });
    if (moodboardResult.isFailure) {
      return Result.fail(moodboardResult.getError());
    }

    const moodboard = moodboardResult.getValue();
    const saveResult = await this.moodboardRepo.create(moodboard);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    await this.eventDispatcher.dispatchAll(moodboard.domainEvents);
    moodboard.clearEvents();

    return Result.ok({
      id: moodboard.id.value.toString(),
      title: moodboard.get("title").value,
      userId: moodboard.get("userId"),
      createdAt: moodboard.get("createdAt").toISOString(),
    });
  }
}
