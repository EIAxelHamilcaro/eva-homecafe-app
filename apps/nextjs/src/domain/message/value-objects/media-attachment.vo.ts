import { Option, Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

export const MAX_ATTACHMENT_SIZE = 50 * 1024 * 1024; // 50MB in bytes

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

const dimensionsSchema = z.object({
  width: z.number().int().positive("Width must be a positive integer"),
  height: z.number().int().positive("Height must be a positive integer"),
});

export interface IDimensions {
  width: number;
  height: number;
}

const mediaAttachmentSchema = z.object({
  id: z.string().uuid("Invalid attachment ID"),
  url: z.string().url("Invalid URL format"),
  mimeType: z.enum(ALLOWED_MIME_TYPES, {
    message: "Invalid or unsupported media type",
  }),
  size: z
    .number()
    .positive("File size must be positive")
    .max(MAX_ATTACHMENT_SIZE, "File size must be less than 50MB"),
  filename: z
    .string()
    .min(1, "Filename is required")
    .max(255, "Filename must be less than 255 characters"),
  dimensions: dimensionsSchema.optional(),
});

export interface IMediaAttachmentProps {
  id: string;
  url: string;
  mimeType: AllowedMimeType;
  size: number;
  filename: string;
  dimensions?: IDimensions;
}

export class MediaAttachment extends ValueObject<IMediaAttachmentProps> {
  get id(): string {
    return this._value.id;
  }

  get url(): string {
    return this._value.url;
  }

  get mimeType(): AllowedMimeType {
    return this._value.mimeType;
  }

  get size(): number {
    return this._value.size;
  }

  get filename(): string {
    return this._value.filename;
  }

  get dimensions(): Option<IDimensions> {
    return Option.fromNullable(this._value.dimensions);
  }

  get isImage(): boolean {
    return this._value.mimeType.startsWith("image/");
  }

  get isDocument(): boolean {
    return !this.isImage;
  }

  protected validate(
    value: IMediaAttachmentProps,
  ): Result<IMediaAttachmentProps> {
    const result = mediaAttachmentSchema.safeParse(value);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid media attachment");
    }

    return Result.ok(result.data);
  }

  equals(other: ValueObject<IMediaAttachmentProps>): boolean {
    return this._value.id === other.value.id;
  }

  static isAllowedMimeType(mimeType: string): mimeType is AllowedMimeType {
    return ALLOWED_MIME_TYPES.includes(mimeType as AllowedMimeType);
  }
}
