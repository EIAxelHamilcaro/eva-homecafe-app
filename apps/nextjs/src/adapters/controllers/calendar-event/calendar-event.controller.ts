import { match } from "@packages/ddd-kit";
import { NextResponse } from "next/server";
import { createCalendarEventInputDtoSchema } from "@/application/dto/calendar-event/create-calendar-event.dto";
import { deleteCalendarEventInputDtoSchema } from "@/application/dto/calendar-event/delete-calendar-event.dto";
import { getCalendarEventsInputDtoSchema } from "@/application/dto/calendar-event/get-calendar-events.dto";
import { updateCalendarEventInputDtoSchema } from "@/application/dto/calendar-event/update-calendar-event.dto";
import type { IGetSessionOutputDto } from "@/application/dto/get-session.dto";
import { getInjection } from "@/common/di/container";

async function getAuthenticatedUser(
  request: Request,
): Promise<IGetSessionOutputDto | null> {
  const useCase = getInjection("GetSessionUseCase");
  const result = await useCase.execute(request.headers);
  if (result.isFailure) return null;
  return match<IGetSessionOutputDto, IGetSessionOutputDto | null>(
    result.getValue(),
    {
      Some: (session) => session,
      None: () => null,
    },
  );
}

export async function getCalendarEventsController(request: Request) {
  const session = await getAuthenticatedUser(request);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const month = url.searchParams.get("month");

  const parsed = getCalendarEventsInputDtoSchema.safeParse({
    userId: session.user.id,
    month,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("GetUserCalendarEventsUseCase");
  const result = await useCase.execute(parsed.data);
  if (result.isFailure)
    return NextResponse.json({ error: result.getError() }, { status: 500 });
  return NextResponse.json(result.getValue());
}

export async function createCalendarEventController(request: Request) {
  const session = await getAuthenticatedUser(request);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createCalendarEventInputDtoSchema.safeParse({
    ...(json as Record<string, unknown>),
    userId: session.user.id,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("CreateCalendarEventUseCase");
  const result = await useCase.execute(parsed.data);
  if (result.isFailure)
    return NextResponse.json({ error: result.getError() }, { status: 500 });
  return NextResponse.json(result.getValue(), { status: 201 });
}

export async function updateCalendarEventController(
  request: Request,
  eventId: string,
) {
  const session = await getAuthenticatedUser(request);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateCalendarEventInputDtoSchema.safeParse({
    ...(json as Record<string, unknown>),
    eventId,
    userId: session.user.id,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("UpdateCalendarEventUseCase");
  const result = await useCase.execute(parsed.data);
  if (result.isFailure) {
    const error = result.getError();
    if (error === "Forbidden")
      return NextResponse.json({ error }, { status: 403 });
    if (error === "Event not found")
      return NextResponse.json({ error }, { status: 404 });
    return NextResponse.json({ error }, { status: 500 });
  }
  return NextResponse.json(result.getValue());
}

export async function deleteCalendarEventController(
  request: Request,
  eventId: string,
) {
  const session = await getAuthenticatedUser(request);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = deleteCalendarEventInputDtoSchema.safeParse({
    eventId,
    userId: session.user.id,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("DeleteCalendarEventUseCase");
  const result = await useCase.execute(parsed.data);
  if (result.isFailure) {
    const error = result.getError();
    if (error === "Forbidden")
      return NextResponse.json({ error }, { status: 403 });
    if (error === "Event not found")
      return NextResponse.json({ error }, { status: 404 });
    return NextResponse.json({ error }, { status: 500 });
  }
  return NextResponse.json(result.getValue());
}
