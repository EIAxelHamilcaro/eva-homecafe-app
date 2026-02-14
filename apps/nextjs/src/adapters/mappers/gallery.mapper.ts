import { Option, Result, UUID } from "@packages/ddd-kit";
import type { photo as photoTable } from "@packages/drizzle/schema";
import { Photo } from "@/domain/gallery/photo.aggregate";
import { PhotoId } from "@/domain/gallery/photo-id";
import { PhotoCaption } from "@/domain/gallery/value-objects/photo-caption.vo";

type PhotoRecord = typeof photoTable.$inferSelect;

type PhotoPersistence = Omit<PhotoRecord, "createdAt"> & {
  createdAt?: Date;
};

export function photoToDomain(record: PhotoRecord): Result<Photo> {
  let caption: Option<PhotoCaption> = Option.none();

  if (record.caption) {
    const captionResult = PhotoCaption.create(record.caption);
    if (captionResult.isFailure) {
      return Result.fail(captionResult.getError());
    }
    caption = Option.some(captionResult.getValue());
  }

  const photo = Photo.reconstitute(
    {
      userId: record.userId,
      url: record.url,
      filename: record.filename,
      mimeType: record.mimeType,
      size: record.size,
      caption,
      isPrivate: record.isPrivate,
      createdAt: record.createdAt,
    },
    PhotoId.create(new UUID(record.id)),
  );

  return Result.ok(photo);
}

export function photoToPersistence(photo: Photo): PhotoPersistence {
  const caption = photo.get("caption");

  return {
    id: photo.id.value.toString(),
    userId: photo.get("userId"),
    url: photo.get("url"),
    filename: photo.get("filename"),
    mimeType: photo.get("mimeType"),
    size: photo.get("size"),
    caption: caption.isSome() ? caption.unwrap().value : null,
    isPrivate: photo.get("isPrivate"),
    createdAt: photo.get("createdAt"),
  };
}
