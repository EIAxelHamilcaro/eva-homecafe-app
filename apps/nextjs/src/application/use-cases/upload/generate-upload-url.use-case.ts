import crypto from "node:crypto";
import { Result, type UseCase } from "@packages/ddd-kit";
import type {
  IGenerateUploadUrlInputDto,
  IGenerateUploadUrlOutputDto,
} from "@/application/dto/upload/generate-upload-url.dto";
import type { IStorageProvider } from "@/application/ports/storage.provider.port";
import { FileMetadata } from "@/domain/upload/value-objects/file-metadata.vo";
import { UploadContext } from "@/domain/upload/value-objects/upload-context.vo";

const DEFAULT_EXPIRES_IN = 900; // 15 minutes

export class GenerateUploadUrlUseCase
  implements UseCase<IGenerateUploadUrlInputDto, IGenerateUploadUrlOutputDto>
{
  constructor(private readonly storageProvider: IStorageProvider) {}

  async execute(
    input: IGenerateUploadUrlInputDto,
  ): Promise<Result<IGenerateUploadUrlOutputDto>> {
    const contextResult = UploadContext.create(input.context);
    if (contextResult.isFailure) {
      return Result.fail(contextResult.getError());
    }

    const fileMetadataResult = FileMetadata.create({
      filename: input.filename,
      mimeType: input.mimeType,
      size: input.size,
    });
    if (fileMetadataResult.isFailure) {
      return Result.fail(fileMetadataResult.getError());
    }

    const fileMetadata = fileMetadataResult.getValue();
    const extension =
      fileMetadata.extension || this.getExtensionFromMimeType(input.mimeType);
    const key = `${input.context}/${input.userId}/${crypto.randomUUID()}${extension}`;

    const presignedResult =
      await this.storageProvider.generatePresignedUploadUrl({
        key,
        mimeType: input.mimeType,
        size: fileMetadata.size,
        expiresIn: DEFAULT_EXPIRES_IN,
      });

    if (presignedResult.isFailure) {
      return Result.fail(presignedResult.getError());
    }

    const presigned = presignedResult.getValue();

    return Result.ok({
      uploadUrl: presigned.uploadUrl,
      fileUrl: presigned.fileUrl,
      key: presigned.key,
      expiresAt: presigned.expiresAt.toISOString(),
    });
  }

  private getExtensionFromMimeType(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
      "image/webp": ".webp",
      "application/pdf": ".pdf",
      "text/plain": ".txt",
      "text/csv": ".csv",
      "application/msword": ".doc",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        ".docx",
      "application/vnd.ms-excel": ".xls",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        ".xlsx",
    };
    return mimeToExt[mimeType] ?? "";
  }
}
