import { Result, type UseCase } from "@packages/ddd-kit";
import type {
  IUploadMediaInputDto,
  IUploadMediaOutputDto,
} from "@/application/dto/chat/upload-media.dto";
import {
  ALLOWED_IMAGE_TYPES,
  type AllowedImageType,
  MAX_IMAGE_SIZE,
} from "@/application/dto/chat/upload-media.dto";
import type { IStorageProvider } from "@/application/ports/storage.provider.port";
import {
  FileTooLargeError,
  InvalidMediaTypeError,
} from "@/domain/message/errors/message.errors";

export class UploadMediaUseCase
  implements UseCase<IUploadMediaInputDto, IUploadMediaOutputDto>
{
  constructor(private readonly storageProvider: IStorageProvider) {}

  async execute(
    input: IUploadMediaInputDto,
  ): Promise<Result<IUploadMediaOutputDto>> {
    const { file, filename, mimeType, userId } = input;

    const validationResult = this.validateInput(file, mimeType);
    if (validationResult.isFailure) {
      return Result.fail(validationResult.getError());
    }

    const uploadResult = await this.storageProvider.upload({
      file,
      filename,
      mimeType,
      folder: `chat/${userId}`,
    });

    if (uploadResult.isFailure) {
      return Result.fail(uploadResult.getError());
    }

    const uploadedFile = uploadResult.getValue();

    return Result.ok({
      id: uploadedFile.id,
      url: uploadedFile.url,
      mimeType: uploadedFile.mimeType,
      size: uploadedFile.size,
      filename: uploadedFile.filename,
      dimensions: null,
    });
  }

  private validateInput(file: Buffer, mimeType: string): Result<void> {
    if (!this.isAllowedImageType(mimeType)) {
      return Result.fail(new InvalidMediaTypeError(mimeType).message);
    }

    if (file.length > MAX_IMAGE_SIZE) {
      return Result.fail(
        new FileTooLargeError(file.length, MAX_IMAGE_SIZE).message,
      );
    }

    return Result.ok(undefined);
  }

  private isAllowedImageType(mimeType: string): mimeType is AllowedImageType {
    return ALLOWED_IMAGE_TYPES.includes(mimeType as AllowedImageType);
  }
}
