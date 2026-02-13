import { match } from "@packages/ddd-kit";
import { NextResponse } from "next/server";
import { getMoodStats } from "@/adapters/queries/mood-stats.query";
import { getMoodTrends } from "@/adapters/queries/mood-trends.query";
import { getMoodWeek } from "@/adapters/queries/mood-week.query";
import {
  getMoodByDate,
  getTodayMood,
} from "@/adapters/queries/today-mood.query";
import type { IGetSessionOutputDto } from "@/application/dto/get-session.dto";
import type { IGetMoodStatsOutputDto } from "@/application/dto/mood/get-mood-stats.dto";
import { getMoodStatsInputDtoSchema } from "@/application/dto/mood/get-mood-stats.dto";
import type { IGetMoodTrendsOutputDto } from "@/application/dto/mood/get-mood-trends.dto";
import type { IGetMoodWeekOutputDto } from "@/application/dto/mood/get-mood-week.dto";
import type { IGetTodayMoodOutputDto } from "@/application/dto/mood/get-today-mood.dto";
import type { IRecordMoodOutputDto } from "@/application/dto/mood/record-mood.dto";
import { recordMoodInputDtoSchema } from "@/application/dto/mood/record-mood.dto";
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

export async function recordMoodController(
  request: Request,
): Promise<NextResponse<IRecordMoodOutputDto | { error: string }>> {
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

  const parsed = recordMoodInputDtoSchema.safeParse({
    ...(json as Record<string, unknown>),
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("RecordMoodUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 422 });
  }

  const output = result.getValue();
  return NextResponse.json(output, { status: output.isUpdate ? 200 : 201 });
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export async function getTodayMoodController(
  request: Request,
): Promise<NextResponse<IGetTodayMoodOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const dateParam = url.searchParams.get("date");
    const result =
      dateParam && DATE_REGEX.test(dateParam)
        ? await getMoodByDate(session.user.id, dateParam)
        : await getTodayMood(session.user.id);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to load today's mood" },
      { status: 500 },
    );
  }
}

export async function getMoodWeekController(
  request: Request,
): Promise<NextResponse<IGetMoodWeekOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await getMoodWeek(session.user.id);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to load mood week data" },
      { status: 500 },
    );
  }
}

export async function getMoodStatsController(
  request: Request,
): Promise<NextResponse<IGetMoodStatsOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const parsed = getMoodStatsInputDtoSchema.safeParse({
    userId: session.user.id,
    period: url.searchParams.get("period") ?? "",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  try {
    const result = await getMoodStats(session.user.id, parsed.data.period);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to load mood stats" },
      { status: 500 },
    );
  }
}

export async function getMoodTrendsController(
  request: Request,
): Promise<NextResponse<IGetMoodTrendsOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await getMoodTrends(session.user.id);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to load mood trends" },
      { status: 500 },
    );
  }
}
