import { match } from "@packages/ddd-kit";
import { NextResponse } from "next/server";
import type { IGetSessionOutputDto } from "@/application/dto/get-session.dto";
import type { IGetUserPreferencesOutputDto } from "@/application/dto/user-preference/get-user-preferences.dto";
import {
  type IUpdateUserPreferencesOutputDto,
  updateUserPreferencesInputDtoSchema,
} from "@/application/dto/user-preference/update-user-preferences.dto";
import { getInjection } from "@/common/di/container";

async function getAuthenticatedUser(
  request: Request,
): Promise<IGetSessionOutputDto | null> {
  const useCase = getInjection("GetSessionUseCase");
  const result = await useCase.execute(request.headers);

  if (result.isFailure) {
    return null;
  }

  return match<IGetSessionOutputDto, IGetSessionOutputDto | null>(
    result.getValue(),
    {
      Some: (session) => session,
      None: () => null,
    },
  );
}

export async function getSettingsController(
  request: Request,
): Promise<NextResponse<IGetUserPreferencesOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const useCase = getInjection("GetUserPreferencesUseCase");
  const result = await useCase.execute({ userId: session.user.id });

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 500 });
  }

  return NextResponse.json(result.getValue());
}

export async function updateSettingsController(
  request: Request,
): Promise<NextResponse<IUpdateUserPreferencesOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = updateUserPreferencesInputDtoSchema.safeParse({
    userId: session.user.id,
    ...json,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("UpdateUserPreferencesUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 400 });
  }

  return NextResponse.json(result.getValue());
}
