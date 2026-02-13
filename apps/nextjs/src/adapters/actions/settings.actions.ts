"use server";

import { revalidatePath } from "next/cache";
import { authGuard } from "@/adapters/guards/auth.guard";
import type { IUpdateUserPreferencesOutputDto } from "@/application/dto/user-preference/update-user-preferences.dto";
import { updateUserPreferencesInputDtoSchema } from "@/application/dto/user-preference/update-user-preferences.dto";
import type { ActionResult } from "@/common/action-result";
import { getInjection } from "@/common/di/container";

export async function updateSettingsAction(input: {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  notifyNewMessages?: boolean;
  notifyFriendActivity?: boolean;
  notifyBadgesEarned?: boolean;
  notifyJournalReminder?: boolean;
  profileVisibility?: boolean;
  rewardsVisibility?: "everyone" | "friends" | "nobody";
  themeMode?: "light" | "dark" | "system";
  language?: "fr" | "en";
  timeFormat?: "12h" | "24h";
}): Promise<ActionResult<IUpdateUserPreferencesOutputDto>> {
  const guard = await authGuard();
  if (!guard.authenticated) {
    return { success: false, error: "Non authentifié" };
  }

  const parsed = updateUserPreferencesInputDtoSchema.safeParse({
    userId: guard.session.user.id,
    ...input,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const useCase = getInjection("UpdateUserPreferencesUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  revalidatePath("/settings");

  return { success: true, data: result.getValue() };
}
