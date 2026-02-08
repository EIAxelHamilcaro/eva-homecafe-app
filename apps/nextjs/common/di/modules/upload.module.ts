import { createModule } from "@evyweb/ioctopus";
import { LocalStorageService } from "@/adapters/services/storage/local-storage.service";
import { R2StorageService } from "@/adapters/services/storage/r2-storage.service";
import type { IStorageProvider } from "@/application/ports/storage.provider.port";
import { GenerateUploadUrlUseCase } from "@/application/use-cases/upload/generate-upload-url.use-case";
import { DI_SYMBOLS } from "../types";

export const createUploadModule = () => {
  const uploadModule = createModule();

  if (process.env.STORAGE_PROVIDER === "r2") {
    uploadModule
      .bind(DI_SYMBOLS.IStorageProvider)
      .toClass(R2StorageService as new () => IStorageProvider);
  } else {
    uploadModule
      .bind(DI_SYMBOLS.IStorageProvider)
      .toClass(LocalStorageService as new () => IStorageProvider);
  }

  uploadModule
    .bind(DI_SYMBOLS.GenerateUploadUrlUseCase)
    .toClass(GenerateUploadUrlUseCase, [DI_SYMBOLS.IStorageProvider]);

  return uploadModule;
};
