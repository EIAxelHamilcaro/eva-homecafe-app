import { match } from "@packages/ddd-kit";
import { NextResponse } from "next/server";
import type { IGetSessionOutputDto } from "@/application/dto/get-session.dto";
import {
  createProfileInputDtoSchema,
  type ICreateProfileOutputDto,
} from "@/application/dto/profile/create-profile.dto";
import type { IGetProfileOutputDto } from "@/application/dto/profile/get-profile.dto";
import {
  type IUpdateProfileOutputDto,
  updateProfileInputDtoSchema,
} from "@/application/dto/profile/update-profile.dto";
import { auth } from "@/common/auth";
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

export async function getProfileController(
  request: Request,
): Promise<NextResponse<IGetProfileOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const useCase = getInjection("GetProfileUseCase");
  const result = await useCase.execute({ userId: session.user.id });

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 500 });
  }

  return NextResponse.json(result.getValue());
}

export async function getProfileByUserIdController(
  request: Request,
  userId: string,
): Promise<NextResponse<IGetProfileOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const useCase = getInjection("GetProfileUseCase");
  const result = await useCase.execute({ userId });

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 500 });
  }

  return NextResponse.json(result.getValue());
}

export async function createProfileController(
  request: Request,
): Promise<NextResponse<ICreateProfileOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = createProfileInputDtoSchema.safeParse({
    userId: session.user.id,
    displayName: json.displayName,
    bio: json.bio,
    avatarUrl: json.avatarUrl,
    phone: json.phone,
    birthday: json.birthday,
    profession: json.profession,
    address: json.address,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("CreateProfileUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    const error = result.getError();
    if (error.includes("already exists")) {
      return NextResponse.json({ error }, { status: 409 });
    }
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json(result.getValue(), { status: 201 });
}

export async function updateProfileController(
  request: Request,
): Promise<NextResponse<IUpdateProfileOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = updateProfileInputDtoSchema.safeParse({
    userId: session.user.id,
    displayName: json.displayName,
    bio: json.bio,
    avatarUrl: json.avatarUrl,
    phone: json.phone,
    birthday: json.birthday,
    profession: json.profession,
    address: json.address,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("UpdateProfileUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    const error = result.getError();
    if (error.includes("not found")) {
      return NextResponse.json({ error }, { status: 404 });
    }
    return NextResponse.json({ error }, { status: 400 });
  }

  if (json.avatarUrl !== undefined) {
    try {
      await auth.api.updateUser({
        headers: request.headers,
        body: { image: json.avatarUrl },
      });
    } catch {
      // non-blocking: profile updated even if auth sync fails
    }
  }

  return NextResponse.json(result.getValue());
}
