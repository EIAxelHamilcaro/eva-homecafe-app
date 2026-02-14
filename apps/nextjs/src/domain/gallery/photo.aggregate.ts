import { Aggregate, type Option, Result, UUID } from "@packages/ddd-kit";
import { PhotoDeletedEvent } from "./events/photo-deleted.event";
import { PhotoUploadedEvent } from "./events/photo-uploaded.event";
import { PhotoId } from "./photo-id";
import type { PhotoCaption } from "./value-objects/photo-caption.vo";

export interface IPhotoProps {
  userId: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  caption: Option<PhotoCaption>;
  isPrivate: boolean;
  createdAt: Date;
}

export interface ICreatePhotoProps {
  userId: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  caption: Option<PhotoCaption>;
  isPrivate: boolean;
}

export class Photo extends Aggregate<IPhotoProps> {
  private constructor(props: IPhotoProps, id?: UUID<string | number>) {
    super(props, id);
  }

  get id(): PhotoId {
    return PhotoId.create(this._id);
  }

  static create(
    props: ICreatePhotoProps,
    id?: UUID<string | number>,
  ): Result<Photo> {
    const newId = id ?? new UUID<string>();
    const now = new Date();

    const photo = new Photo(
      {
        userId: props.userId,
        url: props.url,
        filename: props.filename,
        mimeType: props.mimeType,
        size: props.size,
        caption: props.caption,
        isPrivate: props.isPrivate,
        createdAt: now,
      },
      newId,
    );

    photo.addEvent(
      new PhotoUploadedEvent(newId.value.toString(), props.userId, props.url),
    );

    return Result.ok(photo);
  }

  markDeleted(): void {
    this.addEvent(
      new PhotoDeletedEvent(
        this.id.value.toString(),
        this._props.userId,
        this._props.url,
      ),
    );
  }

  static reconstitute(props: IPhotoProps, id: PhotoId): Photo {
    return new Photo(props, id);
  }
}
