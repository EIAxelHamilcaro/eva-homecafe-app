import { match } from "@packages/ddd-kit";
import { NextResponse } from "next/server";
import { getEmotionYearCalendar } from "@/adapters/queries/emotion-year-calendar.query";
import type { IRecordEmotionOutputDto } from "@/application/dto/emotion/record-emotion.dto";
import { recordEmotionInputDtoSchema } from "@/application/dto/emotion/record-emotion.dto";
import type { IGetSessionOutputDto } from "@/application/dto/get-session.dto";
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

export async function getEmotionYearCalendarController(
  request: Request,
): Promise<
  NextResponse<
    { entries: { date: string; category: string }[] } | { error: string }
  >
> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const yearParam = url.searchParams.get("year");
  const year = yearParam
    ? Number.parseInt(yearParam, 10)
    : new Date().getFullYear();

  if (Number.isNaN(year) || year < 2000 || year > 2100) {
    return NextResponse.json(
      { error: "Year must be between 2000 and 2100" },
      { status: 400 },
    );
  }

  try {
    const entries = await getEmotionYearCalendar(session.user.id, year);
    return NextResponse.json({ entries });
  } catch {
    return NextResponse.json(
      { error: "Failed to load emotion year calendar" },
      { status: 500 },
    );
  }
}

export async function recordEmotionController(
  request: Request,
): Promise<NextResponse<IRecordEmotionOutputDto | { error: string }>> {
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

  const parsed = recordEmotionInputDtoSchema.safeParse({
    ...(json as Record<string, unknown>),
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("RecordEmotionUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 422 });
  }

  const output = result.getValue();
  return NextResponse.json(output, { status: output.isUpdate ? 200 : 201 });
}
