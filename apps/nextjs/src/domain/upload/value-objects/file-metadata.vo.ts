import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

export const ALLOWED_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];
export type AllowedFileType = (typeof ALLOWED_FILE_TYPES)[number];

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export interface IFileMetadataProps {
  filename: string;
  mimeType: AllowedFileType;
  size: number;
}

const schema = z.object({
  filename: z.string().min(1, "Filename is required"),
  mimeType: z.enum(ALLOWED_FILE_TYPES, {
    message: "Unsupported file type",
  }),
  size: z
    .number()
    .positive("File size must be positive")
    .max(MAX_FILE_SIZE, "File size exceeds 20MB limit"),
});

export class FileMetadata extends ValueObject<IFileMetadataProps> {
  protected validate(value: IFileMetadataProps): Result<IFileMetadataProps> {
    const result = schema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid file metadata");
    }
    return Result.ok(result.data);
  }

  get filename(): string {
    return this.value.filename;
  }

  get mimeType(): AllowedFileType {
    return this.value.mimeType;
  }

  get size(): number {
    return this.value.size;
  }

  get extension(): string {
    const parts = this.value.filename.split(".");
    return parts.length > 1 ? `.${parts[parts.length - 1]}` : "";
  }
}
