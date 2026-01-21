import {
  createPaginatedResult,
  DEFAULT_PAGINATION,
  Option,
  type PaginatedResult,
  type PaginationParams,
  Result,
} from "@packages/ddd-kit";
import {
  and,
  type DbClient,
  db,
  desc,
  eq,
  isNull,
  type Transaction,
} from "@packages/drizzle";
import { notification as notificationTable } from "@packages/drizzle/schema";
import {
  notificationToDomain,
  notificationToPersistence,
} from "@/adapters/mappers/notification.mapper";
import type { INotificationRepository } from "@/application/ports/notification-repository.port";
import type { Notification } from "@/domain/notification/notification.aggregate";
import type { NotificationId } from "@/domain/notification/notification-id";

export class DrizzleNotificationRepository implements INotificationRepository {
  private getDb(trx?: Transaction): DbClient | Transaction {
    return trx ?? db;
  }

  async create(
    entity: Notification,
    trx?: Transaction,
  ): Promise<Result<Notification>> {
    try {
      const data = notificationToPersistence(entity);
      await this.getDb(trx)
        .insert(notificationTable)
        .values({
          ...data,
          createdAt: data.createdAt ?? new Date(),
        });
      return Result.ok(entity);
    } catch (error) {
      return Result.fail(`Failed to create notification: ${error}`);
    }
  }

  async update(
    entity: Notification,
    trx?: Transaction,
  ): Promise<Result<Notification>> {
    try {
      const data = notificationToPersistence(entity);
      await this.getDb(trx)
        .update(notificationTable)
        .set({
          readAt: data.readAt,
        })
        .where(eq(notificationTable.id, String(entity.id.value)));
      return Result.ok(entity);
    } catch (error) {
      return Result.fail(`Failed to update notification: ${error}`);
    }
  }

  async delete(
    id: NotificationId,
    trx?: Transaction,
  ): Promise<Result<NotificationId>> {
    try {
      await this.getDb(trx)
        .delete(notificationTable)
        .where(eq(notificationTable.id, String(id.value)));
      return Result.ok(id);
    } catch (error) {
      return Result.fail(`Failed to delete notification: ${error}`);
    }
  }

  async findById(id: NotificationId): Promise<Result<Option<Notification>>> {
    try {
      const result = await db
        .select()
        .from(notificationTable)
        .where(eq(notificationTable.id, String(id.value)))
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const notificationResult = notificationToDomain(record);
      if (notificationResult.isFailure) {
        return Result.fail(notificationResult.getError());
      }

      return Result.ok(Option.some(notificationResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find notification by id: ${error}`);
    }
  }

  async findByUserId(
    userId: string,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Notification>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const records = await db
        .select()
        .from(notificationTable)
        .where(eq(notificationTable.userId, userId))
        .orderBy(desc(notificationTable.createdAt))
        .limit(pagination.limit)
        .offset(offset);

      const countResult = await db
        .select()
        .from(notificationTable)
        .where(eq(notificationTable.userId, userId));

      const notifications: Notification[] = [];
      for (const record of records) {
        const notificationResult = notificationToDomain(record);
        if (notificationResult.isFailure) {
          return Result.fail(notificationResult.getError());
        }
        notifications.push(notificationResult.getValue());
      }

      return Result.ok(
        createPaginatedResult(notifications, pagination, countResult.length),
      );
    } catch (error) {
      return Result.fail(`Failed to find notifications for user: ${error}`);
    }
  }

  async findUnreadByUserId(
    userId: string,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Notification>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const records = await db
        .select()
        .from(notificationTable)
        .where(
          and(
            eq(notificationTable.userId, userId),
            isNull(notificationTable.readAt),
          ),
        )
        .orderBy(desc(notificationTable.createdAt))
        .limit(pagination.limit)
        .offset(offset);

      const countResult = await db
        .select()
        .from(notificationTable)
        .where(
          and(
            eq(notificationTable.userId, userId),
            isNull(notificationTable.readAt),
          ),
        );

      const notifications: Notification[] = [];
      for (const record of records) {
        const notificationResult = notificationToDomain(record);
        if (notificationResult.isFailure) {
          return Result.fail(notificationResult.getError());
        }
        notifications.push(notificationResult.getValue());
      }

      return Result.ok(
        createPaginatedResult(notifications, pagination, countResult.length),
      );
    } catch (error) {
      return Result.fail(`Failed to find unread notifications: ${error}`);
    }
  }

  async markAsRead(id: NotificationId): Promise<Result<void>> {
    try {
      await db
        .update(notificationTable)
        .set({ readAt: new Date() })
        .where(eq(notificationTable.id, String(id.value)));
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Failed to mark notification as read: ${error}`);
    }
  }

  async countUnread(userId: string): Promise<Result<number>> {
    try {
      const result = await db
        .select()
        .from(notificationTable)
        .where(
          and(
            eq(notificationTable.userId, userId),
            isNull(notificationTable.readAt),
          ),
        );
      return Result.ok(result.length);
    } catch (error) {
      return Result.fail(`Failed to count unread notifications: ${error}`);
    }
  }

  async findAll(
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Notification>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const [records, countResult] = await Promise.all([
        db
          .select()
          .from(notificationTable)
          .orderBy(desc(notificationTable.createdAt))
          .limit(pagination.limit)
          .offset(offset),
        this.count(),
      ]);

      if (countResult.isFailure) {
        return Result.fail(countResult.getError());
      }

      const notifications: Notification[] = [];
      for (const record of records) {
        const notificationResult = notificationToDomain(record);
        if (notificationResult.isFailure) {
          return Result.fail(notificationResult.getError());
        }
        notifications.push(notificationResult.getValue());
      }

      return Result.ok(
        createPaginatedResult(
          notifications,
          pagination,
          countResult.getValue(),
        ),
      );
    } catch (error) {
      return Result.fail(`Failed to find all notifications: ${error}`);
    }
  }

  async findMany(
    props: Partial<Notification["_props"]>,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Notification>>> {
    try {
      const userId = props.userId;

      if (!userId) {
        return this.findAll(pagination);
      }

      return this.findByUserId(userId, pagination);
    } catch (error) {
      return Result.fail(`Failed to find notifications: ${error}`);
    }
  }

  async findBy(
    props: Partial<Notification["_props"]>,
  ): Promise<Result<Option<Notification>>> {
    try {
      const userId = props.userId;

      if (!userId) {
        return Result.ok(Option.none());
      }

      const result = await db
        .select()
        .from(notificationTable)
        .where(eq(notificationTable.userId, userId))
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const notificationResult = notificationToDomain(record);
      if (notificationResult.isFailure) {
        return Result.fail(notificationResult.getError());
      }

      return Result.ok(Option.some(notificationResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find notification: ${error}`);
    }
  }

  async exists(id: NotificationId): Promise<Result<boolean>> {
    try {
      const result = await db
        .select({ id: notificationTable.id })
        .from(notificationTable)
        .where(eq(notificationTable.id, String(id.value)))
        .limit(1);
      return Result.ok(result.length > 0);
    } catch (error) {
      return Result.fail(`Failed to check notification existence: ${error}`);
    }
  }

  async count(): Promise<Result<number>> {
    try {
      const result = await db.select().from(notificationTable);
      return Result.ok(result.length);
    } catch (error) {
      return Result.fail(`Failed to count notifications: ${error}`);
    }
  }
}
