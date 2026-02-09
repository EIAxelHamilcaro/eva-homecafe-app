import { Result, type UseCase, UUID } from "@packages/ddd-kit";
import type {
  IDeletePhotoInputDto,
  IDeletePhotoOutputDto,
} from "@/application/dto/gallery/delete-photo.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IGalleryRepository } from "@/application/ports/gallery-repository.port";
import type { IStorageProvider } from "@/application/ports/storage.provider.port";
import { PhotoId } from "@/domain/gallery/photo-id";

export class DeletePhotoUseCase
  implements UseCase<IDeletePhotoInputDto, IDeletePhotoOutputDto>
{
  constructor(
    private readonly galleryRepo: IGalleryRepository,
    private readonly storageProvider: IStorageProvider,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(
    input: IDeletePhotoInputDto,
  ): Promise<Result<IDeletePhotoOutputDto>> {
    const photoId = PhotoId.create(new UUID(input.photoId));
    const findResult = await this.galleryRepo.findById(photoId);

    if (findResult.isFailure) {
      return Result.fail(findResult.getError());
    }

    const option = findResult.getValue();
    if (option.isNone()) {
      return Result.fail("Photo not found");
    }

    const photo = option.unwrap();

    if (photo.get("userId") !== input.userId) {
      return Result.fail("Forbidden");
    }

    let r2Key: string;
    try {
      r2Key = new URL(photo.get("url")).pathname.slice(1);
    } catch {
      return Result.fail("Invalid photo URL");
    }

    const deleteStorageResult = await this.storageProvider.delete(r2Key);
    if (deleteStorageResult.isFailure) {
      return Result.fail(deleteStorageResult.getError());
    }

    photo.markDeleted();

    const deleteResult = await this.galleryRepo.delete(photoId);
    if (deleteResult.isFailure) {
      return Result.fail(deleteResult.getError());
    }

    await this.eventDispatcher.dispatchAll(photo.domainEvents);
    photo.clearEvents();

    return Result.ok({ id: input.photoId });
  }
}
