import { Result, type UseCase, UUID } from "@packages/ddd-kit";
import type {
  IMarkNotificationReadInputDto,
  IMarkNotificationReadOutputDto,
} from "@/application/dto/notification/mark-notification-read.dto";
import type { INotificationRepository } from "@/application/ports/notification-repository.port";
import { NotificationId } from "@/domain/notification/notification-id";

export class MarkNotificationReadUseCase
  implements
    UseCase<IMarkNotificationReadInputDto, IMarkNotificationReadOutputDto>
{
  constructor(private readonly notificationRepo: INotificationRepository) {}

  async execute(
    input: IMarkNotificationReadInputDto,
  ): Promise<Result<IMarkNotificationReadOutputDto>> {
    const notificationId = NotificationId.create(
      new UUID(input.notificationId),
    );

    const notificationResult =
      await this.notificationRepo.findById(notificationId);
    if (notificationResult.isFailure) {
      return Result.fail(notificationResult.getError());
    }

    const notificationOption = notificationResult.getValue();
    if (notificationOption.isNone()) {
      return Result.fail("Notification not found");
    }

    const notification = notificationOption.unwrap();

    if (notification.get("userId") !== input.userId) {
      return Result.fail(
        "You are not authorized to mark this notification as read",
      );
    }

    if (notification.isRead) {
      return Result.ok({
        success: true,
        message: "Notification was already read",
      });
    }

    const markResult = notification.markAsRead();
    if (markResult.isFailure) {
      return Result.fail(markResult.getError());
    }

    const updateResult = await this.notificationRepo.update(notification);
    if (updateResult.isFailure) {
      return Result.fail(updateResult.getError());
    }

    return Result.ok({
      success: true,
      message: "Notification marked as read",
    });
  }
}
