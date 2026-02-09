import { match } from "@packages/ddd-kit";
import { NextResponse } from "next/server";
import {
  type GetUserMoodboardsOutputDto,
  getMoodboardDetail,
  getUserMoodboards,
  type MoodboardDetailDto,
} from "@/adapters/queries/moodboard.query";
import type { IGetSessionOutputDto } from "@/application/dto/get-session.dto";
import type { ICreateMoodboardOutputDto } from "@/application/dto/moodboard/create-moodboard.dto";
import { createMoodboardInputDtoSchema } from "@/application/dto/moodboard/create-moodboard.dto";
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

export async function getUserMoodboardsController(
  request: Request,
): Promise<NextResponse<GetUserMoodboardsOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const pageRaw = url.searchParams.get("page");
  const limitRaw = url.searchParams.get("limit");
  const page = pageRaw ? Number.parseInt(pageRaw, 10) : Number.NaN;
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : Number.NaN;

  try {
    const result = await getUserMoodboards(
      session.user.id,
      page > 0 ? page : undefined,
      limit > 0 && limit <= 100 ? limit : undefined,
    );
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to load moodboards" },
      { status: 500 },
    );
  }
}

export async function getMoodboardDetailController(
  request: Request,
  moodboardId: string,
): Promise<NextResponse<MoodboardDetailDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await getMoodboardDetail(moodboardId, session.user.id);

    if (!result) {
      return NextResponse.json(
        { error: "Moodboard not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to load moodboard" },
      { status: 500 },
    );
  }
}

export async function createMoodboardController(
  request: Request,
): Promise<NextResponse<ICreateMoodboardOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createMoodboardInputDtoSchema.safeParse({
    ...(json as Record<string, unknown>),
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("CreateMoodboardUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 500 });
  }

  return NextResponse.json(result.getValue(), { status: 201 });
}
