import { createModule } from "@evyweb/ioctopus";
import { DrizzleGalleryRepository } from "@/adapters/repositories/gallery.repository";
import { AddPhotoUseCase } from "@/application/use-cases/gallery/add-photo.use-case";
import { DI_SYMBOLS } from "../types";

export const createGalleryModule = () => {
  const galleryModule = createModule();

  galleryModule
    .bind(DI_SYMBOLS.IGalleryRepository)
    .toClass(DrizzleGalleryRepository);

  galleryModule
    .bind(DI_SYMBOLS.AddPhotoUseCase)
    .toClass(AddPhotoUseCase, [DI_SYMBOLS.IGalleryRepository]);

  return galleryModule;
};
