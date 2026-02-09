import { Result, type UseCase, UUID } from "@packages/ddd-kit";
import type {
  IDeletePinInputDto,
  IDeletePinOutputDto,
} from "@/application/dto/moodboard/delete-pin.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IMoodboardRepository } from "@/application/ports/moodboard-repository.port";
import type { IStorageProvider } from "@/application/ports/storage.provider.port";
import { MoodboardId } from "@/domain/moodboard/moodboard-id";
import { PinId } from "@/domain/moodboard/pin-id";

export class DeletePinUseCase
  implements UseCase<IDeletePinInputDto, IDeletePinOutputDto>
{
  constructor(
    private readonly moodboardRepo: IMoodboardRepository,
    private readonly storageProvider: IStorageProvider,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(
    input: IDeletePinInputDto,
  ): Promise<Result<IDeletePinOutputDto>> {
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

    const pinId = PinId.create(new UUID(input.pinId));
    const pin = moodboard
      .get("pins")
      .find((p) => p.id.value.toString() === pinId.value.toString());

    if (!pin) {
      return Result.fail("Pin not found");
    }

    const removeResult = moodboard.removePin(pinId);
    if (removeResult.isFailure) {
      return Result.fail(removeResult.getError());
    }

    const updateResult = await this.moodboardRepo.update(moodboard);
    if (updateResult.isFailure) {
      return Result.fail(updateResult.getError());
    }

    await this.eventDispatcher.dispatchAll(moodboard.domainEvents);
    moodboard.clearEvents();

    if (pin.get("type").value === "image" && pin.get("imageUrl").isSome()) {
      try {
        const r2Key = new URL(pin.get("imageUrl").unwrap()).pathname.slice(1);
        await this.storageProvider.delete(r2Key);
      } catch {
        // best-effort R2 cleanup
      }
    }

    return Result.ok({ id: input.pinId });
  }
}
