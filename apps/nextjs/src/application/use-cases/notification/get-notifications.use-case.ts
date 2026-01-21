import { match, Result, type UseCase } from "@packages/ddd-kit";
import type {
  IGetNotificationsInputDto,
  IGetNotificationsOutputDto,
} from "@/application/dto/notification/get-notifications.dto";
import type { INotificationDto } from "@/application/dto/notification/notification.dto";
import type { INotificationRepository } from "@/application/ports/notification-repository.port";
import type { Notification } from "@/domain/notification/notification.aggregate";

export class GetNotificationsUseCase
  implements UseCase<IGetNotificationsInputDto, IGetNotificationsOutputDto>
{
  constructor(private readonly notificationRepo: INotificationRepository) {}

  async execute(
    input: IGetNotificationsInputDto,
  ): Promise<Result<IGetNotificationsOutputDto>> {
    const pagination = {
      page: input.page ?? 1,
      limit: input.limit ?? 20,
    };

    const notificationsResult = input.unreadOnly
      ? await this.notificationRepo.findUnreadByUserId(input.userId, pagination)
      : await this.notificationRepo.findByUserId(input.userId, pagination);

    if (notificationsResult.isFailure) {
      return Result.fail(notificationsResult.getError());
    }

    const unreadCountResult = await this.notificationRepo.countUnread(
      input.userId,
    );
    if (unreadCountResult.isFailure) {
      return Result.fail(unreadCountResult.getError());
    }

    const paginatedNotifications = notificationsResult.getValue();
    const notifications = paginatedNotifications.data.map((notification) =>
      this.mapToDto(notification),
    );

    return Result.ok({
      notifications,
      unreadCount: unreadCountResult.getValue(),
      pagination: paginatedNotifications.pagination,
    });
  }

  private mapToDto(notification: Notification): INotificationDto {
    const readAt = match(notification.get("readAt"), {
      Some: (date) => date.toISOString(),
      None: () => null,
    });

    return {
      id: notification.id.value.toString(),
      userId: notification.get("userId"),
      type: notification.get("type").value as
        | "friend_request"
        | "friend_accepted"
        | "new_message",
      title: notification.get("title"),
      body: notification.get("body"),
      data: notification.get("data"),
      readAt,
      createdAt: notification.get("createdAt").toISOString(),
    };
  }
}
