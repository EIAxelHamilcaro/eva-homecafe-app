import {
  addPhotoController,
  getUserGalleryController,
} from "@/adapters/controllers/gallery/gallery.controller";

export const GET = getUserGalleryController;
export const POST = addPhotoController;
