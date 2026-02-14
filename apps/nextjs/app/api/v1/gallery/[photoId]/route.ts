import type { NextRequest } from "next/server";
import {
  deletePhotoController,
  togglePhotoPrivacyController,
} from "@/adapters/controllers/gallery/gallery.controller";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ photoId: string }> },
) {
  const { photoId } = await params;
  return deletePhotoController(request, photoId);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ photoId: string }> },
) {
  const { photoId } = await params;
  return togglePhotoPrivacyController(request, photoId);
}
