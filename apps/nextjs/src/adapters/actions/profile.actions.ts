"use server";

import { revalidatePath } from "next/cache";
import { authGuard } from "@/adapters/guards/auth.guard";
import type { IUpdateProfileOutputDto } from "@/application/dto/profile/update-profile.dto";
import { updateProfileInputDtoSchema } from "@/application/dto/profile/update-profile.dto";
import type { ActionResult } from "@/common/action-result";
import { getInjection } from "@/common/di/container";

export async function updateProfileAction(input: {
  displayName?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  phone?: string | null;
  birthday?: string | null;
  profession?: string | null;
  address?: {
    street: string;
    zipCode: string;
    city: string;
    country: string;
  } | null;
}): Promise<ActionResult<IUpdateProfileOutputDto>> {
  const guard = await authGuard();
  if (!guard.authenticated) {
    return { success: false, error: "Non authentifié" };
  }

  const parsed = updateProfileInputDtoSchema.safeParse({
    userId: guard.session.user.id,
    displayName: input.displayName,
    bio: input.bio,
    avatarUrl: input.avatarUrl,
    phone: input.phone,
    birthday: input.birthday,
    profession: input.profession,
    address: input.address,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const useCase = getInjection("UpdateProfileUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  revalidatePath("/profile");

  return { success: true, data: result.getValue() };
}
