import type {
  BaseRepository,
  Option,
  PaginatedResult,
  PaginationParams,
  Result,
} from "@packages/ddd-kit";
import type { Notification } from "@/domain/notification/notification.aggregate";
import type { NotificationId } from "@/domain/notification/notification-id";

export interface INotificationRepository extends BaseRepository<Notification> {
  findById(id: NotificationId): Promise<Result<Option<Notification>>>;
  findByUserId(
    userId: string,
    pagination?: PaginationParams,
  ): Promise<Result<PaginatedResult<Notification>>>;
  findUnreadByUserId(
    userId: string,
    pagination?: PaginationParams,
  ): Promise<Result<PaginatedResult<Notification>>>;
  markAsRead(id: NotificationId): Promise<Result<void>>;
  countUnread(userId: string): Promise<Result<number>>;
}
