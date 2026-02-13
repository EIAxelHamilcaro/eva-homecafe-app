"use server";

import { revalidatePath } from "next/cache";
import { authGuard } from "@/adapters/guards/auth.guard";
import type { IAddPhotoOutputDto } from "@/application/dto/gallery/add-photo.dto";
import { addPhotoInputDtoSchema } from "@/application/dto/gallery/add-photo.dto";
import type { IDeletePhotoOutputDto } from "@/application/dto/gallery/delete-photo.dto";
import type { ActionResult } from "@/common/action-result";
import { getInjection } from "@/common/di/container";

export async function addPhotoAction(input: {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  caption?: string;
}): Promise<ActionResult<IAddPhotoOutputDto>> {
  const guard = await authGuard();
  if (!guard.authenticated) {
    return { success: false, error: "Non authentifié" };
  }

  const parsed = addPhotoInputDtoSchema.safeParse({
    ...input,
    userId: guard.session.user.id,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const useCase = getInjection("AddPhotoUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  revalidatePath("/gallery");
  revalidatePath("/dashboard");

  return { success: true, data: result.getValue() };
}

export async function deletePhotoAction(
  photoId: string,
): Promise<ActionResult<IDeletePhotoOutputDto>> {
  const guard = await authGuard();
  if (!guard.authenticated) {
    return { success: false, error: "Non authentifié" };
  }

  const useCase = getInjection("DeletePhotoUseCase");
  const result = await useCase.execute({
    photoId,
    userId: guard.session.user.id,
  });

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  revalidatePath("/gallery");
  revalidatePath("/dashboard");

  return { success: true, data: result.getValue() };
}
