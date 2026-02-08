import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface IFileMetadataProps {
  filename: string;
  mimeType: AllowedImageType;
  size: number;
}

const schema = z.object({
  filename: z.string().min(1, "Filename is required"),
  mimeType: z.enum(ALLOWED_IMAGE_TYPES, {
    message: "Only image files are accepted (jpeg, png, gif, webp)",
  }),
  size: z
    .number()
    .positive("File size must be positive")
    .max(MAX_FILE_SIZE, "File size exceeds 10MB limit"),
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

  get mimeType(): AllowedImageType {
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
