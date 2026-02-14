import { Option, Result, type UseCase } from "@packages/ddd-kit";
import type {
  IAddPhotoInputDto,
  IAddPhotoOutputDto,
} from "@/application/dto/gallery/add-photo.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IGalleryRepository } from "@/application/ports/gallery-repository.port";
import { Photo } from "@/domain/gallery/photo.aggregate";
import { PhotoCaption } from "@/domain/gallery/value-objects/photo-caption.vo";

export class AddPhotoUseCase
  implements UseCase<IAddPhotoInputDto, IAddPhotoOutputDto>
{
  constructor(
    private readonly galleryRepo: IGalleryRepository,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(input: IAddPhotoInputDto): Promise<Result<IAddPhotoOutputDto>> {
    let caption: Option<PhotoCaption> = Option.none();

    if (input.caption) {
      const captionResult = PhotoCaption.create(input.caption);
      if (captionResult.isFailure) {
        return Result.fail(captionResult.getError());
      }
      caption = Option.some(captionResult.getValue());
    }

    const photoResult = Photo.create({
      userId: input.userId,
      url: input.url,
      filename: input.filename,
      mimeType: input.mimeType,
      size: input.size,
      caption,
      isPrivate: input.isPrivate,
    });

    if (photoResult.isFailure) {
      return Result.fail(photoResult.getError());
    }

    const photo = photoResult.getValue();

    const saveResult = await this.galleryRepo.create(photo);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    await this.eventDispatcher.dispatchAll(photo.domainEvents);
    photo.clearEvents();

    return Result.ok({
      id: photo.id.value.toString(),
      url: photo.get("url"),
      filename: photo.get("filename"),
      mimeType: photo.get("mimeType"),
      size: photo.get("size"),
      caption: photo.get("caption").isSome()
        ? photo.get("caption").unwrap().value
        : null,
      isPrivate: photo.get("isPrivate"),
      userId: photo.get("userId"),
      createdAt: photo.get("createdAt").toISOString(),
    });
  }
}
