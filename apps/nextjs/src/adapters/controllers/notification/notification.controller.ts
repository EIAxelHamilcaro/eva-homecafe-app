import { match } from "@packages/ddd-kit";
import { NextResponse } from "next/server";
import type { IGetSessionOutputDto } from "@/application/dto/get-session.dto";
import type { IGetNotificationsOutputDto } from "@/application/dto/notification/get-notifications.dto";
import type { IMarkNotificationReadOutputDto } from "@/application/dto/notification/mark-notification-read.dto";
import type { ISendJournalRemindersOutputDto } from "@/application/dto/notification/send-journal-reminders.dto";
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

export async function getNotifications(
  request: Request,
): Promise<NextResponse<IGetNotificationsOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = url.searchParams.get("page");
  const limit = url.searchParams.get("limit");
  const unreadOnly = url.searchParams.get("unreadOnly");

  const useCase = getInjection("GetNotificationsUseCase");
  const result = await useCase.execute({
    userId: session.user.id,
    page: page ? Number.parseInt(page, 10) : undefined,
    limit: limit ? Number.parseInt(limit, 10) : undefined,
    unreadOnly: unreadOnly === "true",
  });

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 500 });
  }

  return NextResponse.json(result.getValue());
}

export async function markAsRead(
  request: Request,
): Promise<NextResponse<IMarkNotificationReadOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const segments = url.pathname.split("/");
  const readIndex = segments.indexOf("read");
  const notificationId = readIndex > 0 ? segments[readIndex - 1] : undefined;

  if (!notificationId) {
    return NextResponse.json(
      { error: "Notification ID is required" },
      { status: 400 },
    );
  }

  const useCase = getInjection("MarkNotificationReadUseCase");
  const result = await useCase.execute({
    notificationId,
    userId: session.user.id,
  });

  if (result.isFailure) {
    const error = result.getError();
    if (error === "Notification not found") {
      return NextResponse.json({ error }, { status: 404 });
    }
    if (error === "You are not authorized to mark this notification as read") {
      return NextResponse.json({ error }, { status: 403 });
    }
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(result.getValue());
}

export async function getUnreadCount(
  request: Request,
): Promise<NextResponse<{ unreadCount: number } | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const useCase = getInjection("GetNotificationsUseCase");
  const result = await useCase.execute({
    userId: session.user.id,
    page: 1,
    limit: 1,
  });

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 500 });
  }

  return NextResponse.json({ unreadCount: result.getValue().unreadCount });
}

export async function sendJournalReminders(
  request: Request,
): Promise<NextResponse<ISendJournalRemindersOutputDto | { error: string }>> {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const useCase = getInjection("SendJournalRemindersUseCase");
  const result = await useCase.execute();

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 500 });
  }

  return NextResponse.json(result.getValue());
}
