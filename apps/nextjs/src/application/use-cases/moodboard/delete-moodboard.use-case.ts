import { Result, type UseCase, UUID } from "@packages/ddd-kit";
import type {
  IDeleteMoodboardInputDto,
  IDeleteMoodboardOutputDto,
} from "@/application/dto/moodboard/delete-moodboard.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IMoodboardRepository } from "@/application/ports/moodboard-repository.port";
import type { IStorageProvider } from "@/application/ports/storage.provider.port";
import { MoodboardId } from "@/domain/moodboard/moodboard-id";

export class DeleteMoodboardUseCase
  implements UseCase<IDeleteMoodboardInputDto, IDeleteMoodboardOutputDto>
{
  constructor(
    private readonly moodboardRepo: IMoodboardRepository,
    private readonly storageProvider: IStorageProvider,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(
    input: IDeleteMoodboardInputDto,
  ): Promise<Result<IDeleteMoodboardOutputDto>> {
    const moodboardId = MoodboardId.create(new UUID(input.moodboardId));
    const findResult = await this.moodboardRepo.findById(moodboardId);
    if (findResult.isFailure) {
      return Result.fail(findResult.getError());
    }

    const moodboardOption = findResult.getValue();
    if (moodboardOption.isNone()) {
      return Result.fail("Moodboard not found");
    }

    const moodboard = moodboardOption.unwrap();
    if (moodboard.get("userId") !== input.userId) {
      return Result.fail("Forbidden");
    }

    const imagePins = moodboard
      .get("pins")
      .filter(
        (p) => p.get("type").value === "image" && p.get("imageUrl").isSome(),
      );

    const markResult = moodboard.markForDeletion();
    if (markResult.isFailure) {
      return Result.fail(markResult.getError());
    }

    const deleteResult = await this.moodboardRepo.delete(moodboardId);
    if (deleteResult.isFailure) {
      return Result.fail(deleteResult.getError());
    }

    await this.eventDispatcher.dispatchAll(moodboard.domainEvents);
    moodboard.clearEvents();

    for (const pin of imagePins) {
      try {
        const r2Key = new URL(pin.get("imageUrl").unwrap()).pathname.slice(1);
        await this.storageProvider.delete(r2Key);
      } catch {
        // best-effort R2 cleanup
      }
    }

    return Result.ok({ id: input.moodboardId });
  }
}
