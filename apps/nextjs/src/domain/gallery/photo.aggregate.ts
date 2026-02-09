import { Aggregate, type Option, Result, UUID } from "@packages/ddd-kit";
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
  createdAt: Date;
}

export interface ICreatePhotoProps {
  userId: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  caption: Option<PhotoCaption>;
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
        createdAt: now,
      },
      newId,
    );

    photo.addEvent(
      new PhotoUploadedEvent(newId.value.toString(), props.userId, props.url),
    );

    return Result.ok(photo);
  }

  static reconstitute(props: IPhotoProps, id: PhotoId): Photo {
    return new Photo(props, id);
  }
}
