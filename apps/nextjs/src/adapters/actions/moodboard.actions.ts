"use server";

import { revalidatePath } from "next/cache";
import { authGuard } from "@/adapters/guards/auth.guard";
import type { IAddPinOutputDto } from "@/application/dto/moodboard/add-pin.dto";
import { addPinInputDtoSchema } from "@/application/dto/moodboard/add-pin.dto";
import type { ICreateMoodboardOutputDto } from "@/application/dto/moodboard/create-moodboard.dto";
import { createMoodboardInputDtoSchema } from "@/application/dto/moodboard/create-moodboard.dto";
import type { IDeleteMoodboardOutputDto } from "@/application/dto/moodboard/delete-moodboard.dto";
import type { IDeletePinOutputDto } from "@/application/dto/moodboard/delete-pin.dto";
import type { ActionResult } from "@/common/action-result";
import { getInjection } from "@/common/di/container";

export async function createMoodboardAction(input: {
  title: string;
}): Promise<ActionResult<ICreateMoodboardOutputDto>> {
  const guard = await authGuard();
  if (!guard.authenticated) {
    return { success: false, error: "Non authentifié" };
  }

  const parsed = createMoodboardInputDtoSchema.safeParse({
    ...input,
    userId: guard.session.user.id,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const useCase = getInjection("CreateMoodboardUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  revalidatePath("/moodboard");
  revalidatePath("/dashboard");

  return { success: true, data: result.getValue() };
}

export async function addPinAction(
  moodboardId: string,
  input:
    | { type: "image"; imageUrl: string; color?: string }
    | { type: "color"; color: string; imageUrl?: string },
): Promise<ActionResult<IAddPinOutputDto>> {
  const guard = await authGuard();
  if (!guard.authenticated) {
    return { success: false, error: "Non authentifié" };
  }

  const parsed = addPinInputDtoSchema.safeParse({
    ...input,
    moodboardId,
    userId: guard.session.user.id,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const useCase = getInjection("AddPinUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  revalidatePath("/moodboard");
  revalidatePath(`/moodboard/${moodboardId}`);

  return { success: true, data: result.getValue() };
}

export async function deletePinAction(
  moodboardId: string,
  pinId: string,
): Promise<ActionResult<IDeletePinOutputDto>> {
  const guard = await authGuard();
  if (!guard.authenticated) {
    return { success: false, error: "Non authentifié" };
  }

  const useCase = getInjection("DeletePinUseCase");
  const result = await useCase.execute({
    moodboardId,
    pinId,
    userId: guard.session.user.id,
  });

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  revalidatePath("/moodboard");
  revalidatePath(`/moodboard/${moodboardId}`);

  return { success: true, data: result.getValue() };
}

export async function deleteMoodboardAction(
  moodboardId: string,
): Promise<ActionResult<IDeleteMoodboardOutputDto>> {
  const guard = await authGuard();
  if (!guard.authenticated) {
    return { success: false, error: "Non authentifié" };
  }

  const useCase = getInjection("DeleteMoodboardUseCase");
  const result = await useCase.execute({
    moodboardId,
    userId: guard.session.user.id,
  });

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  revalidatePath("/moodboard");
  revalidatePath("/dashboard");

  return { success: true, data: result.getValue() };
}
