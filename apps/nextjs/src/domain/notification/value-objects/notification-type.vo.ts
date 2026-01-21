import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

export const NotificationTypeEnum = {
  FRIEND_REQUEST: "friend_request",
  FRIEND_ACCEPTED: "friend_accepted",
  NEW_MESSAGE: "new_message",
} as const;

export type NotificationTypeValue =
  (typeof NotificationTypeEnum)[keyof typeof NotificationTypeEnum];

const schema = z.enum(["friend_request", "friend_accepted", "new_message"]);

export class NotificationType extends ValueObject<NotificationTypeValue> {
  protected validate(
    value: NotificationTypeValue,
  ): Result<NotificationTypeValue> {
    const result = schema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid notification type");
    }
    return Result.ok(result.data);
  }

  get isFriendRequest(): boolean {
    return this.value === NotificationTypeEnum.FRIEND_REQUEST;
  }

  get isFriendAccepted(): boolean {
    return this.value === NotificationTypeEnum.FRIEND_ACCEPTED;
  }

  get isNewMessage(): boolean {
    return this.value === NotificationTypeEnum.NEW_MESSAGE;
  }

  static createFriendRequest(): Result<NotificationType> {
    return NotificationType.create(
      NotificationTypeEnum.FRIEND_REQUEST as NotificationTypeValue,
    ) as Result<NotificationType>;
  }

  static createFriendAccepted(): Result<NotificationType> {
    return NotificationType.create(
      NotificationTypeEnum.FRIEND_ACCEPTED as NotificationTypeValue,
    ) as Result<NotificationType>;
  }

  static createNewMessage(): Result<NotificationType> {
    return NotificationType.create(
      NotificationTypeEnum.NEW_MESSAGE as NotificationTypeValue,
    ) as Result<NotificationType>;
  }
}
