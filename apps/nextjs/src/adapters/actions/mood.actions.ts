"use server";

import { revalidatePath } from "next/cache";
import { authGuard } from "@/adapters/guards/auth.guard";
import type { IRecordMoodOutputDto } from "@/application/dto/mood/record-mood.dto";
import { recordMoodInputDtoSchema } from "@/application/dto/mood/record-mood.dto";
import type { ActionResult } from "@/common/action-result";
import { getInjection } from "@/common/di/container";

export async function recordMoodAction(input: {
  category: string;
  intensity: number;
  moodDate?: string;
}): Promise<ActionResult<IRecordMoodOutputDto>> {
  const guard = await authGuard();
  if (!guard.authenticated) {
    return { success: false, error: "Non authentifié" };
  }

  const parsed = recordMoodInputDtoSchema.safeParse({
    ...input,
    userId: guard.session.user.id,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const useCase = getInjection("RecordMoodUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  revalidatePath("/mood");
  revalidatePath("/dashboard");
  revalidatePath("/moodboard");

  return { success: true, data: result.getValue() };
}
