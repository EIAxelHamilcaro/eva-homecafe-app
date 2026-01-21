import { Option, Result, UUID } from "@packages/ddd-kit";
import type { notification as notificationTable } from "@packages/drizzle/schema";
import { Notification } from "@/domain/notification/notification.aggregate";
import { NotificationId } from "@/domain/notification/notification-id";
import {
  NotificationType,
  type NotificationTypeValue,
} from "@/domain/notification/value-objects/notification-type.vo";

type NotificationRecord = typeof notificationTable.$inferSelect;

type NotificationPersistence = Omit<
  NotificationRecord,
  "createdAt" | "readAt"
> & {
  createdAt?: Date;
  readAt?: Date | null;
};

export function notificationToDomain(
  record: NotificationRecord,
): Result<Notification> {
  const typeResult = NotificationType.create(
    record.type as NotificationTypeValue,
  );
  if (typeResult.isFailure) {
    return Result.fail(typeResult.getError());
  }

  const notification = Notification.reconstitute(
    {
      userId: record.userId,
      type: typeResult.getValue(),
      title: record.title,
      body: record.body,
      data: record.data,
      readAt: Option.fromNullable(record.readAt),
      createdAt: record.createdAt,
    },
    NotificationId.create(new UUID(record.id)),
  );

  return Result.ok(notification);
}

export function notificationToPersistence(
  notification: Notification,
): NotificationPersistence {
  const readAt = notification.get("readAt");

  return {
    id: notification.id.value.toString(),
    userId: notification.get("userId"),
    type: notification.get("type").value,
    title: notification.get("title"),
    body: notification.get("body"),
    data: notification.get("data"),
    createdAt: notification.get("createdAt"),
    readAt: readAt.isSome() ? readAt.unwrap() : null,
  };
}
