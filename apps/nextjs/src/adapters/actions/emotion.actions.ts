"use server";

import { revalidatePath } from "next/cache";
import { authGuard } from "@/adapters/guards/auth.guard";
import type { IRecordEmotionOutputDto } from "@/application/dto/emotion/record-emotion.dto";
import { recordEmotionInputDtoSchema } from "@/application/dto/emotion/record-emotion.dto";
import type { ActionResult } from "@/common/action-result";
import { getInjection } from "@/common/di/container";

export async function recordEmotionAction(input: {
  category: string;
  emotionDate: string;
}): Promise<ActionResult<IRecordEmotionOutputDto>> {
  const guard = await authGuard();
  if (!guard.authenticated) {
    return { success: false, error: "Non authentifié" };
  }

  const parsed = recordEmotionInputDtoSchema.safeParse({
    ...input,
    userId: guard.session.user.id,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const useCase = getInjection("RecordEmotionUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  revalidatePath("/moodboard");
  revalidatePath("/dashboard");

  return { success: true, data: result.getValue() };
}
