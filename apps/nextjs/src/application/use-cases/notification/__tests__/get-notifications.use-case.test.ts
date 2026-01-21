import {
  Option,
  type PaginatedResult,
  type PaginationParams,
  Result,
  UUID,
} from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { INotificationRepository } from "@/application/ports/notification-repository.port";
import { Notification } from "@/domain/notification/notification.aggregate";
import { NotificationId } from "@/domain/notification/notification-id";
import { NotificationType } from "@/domain/notification/value-objects/notification-type.vo";
import { GetNotificationsUseCase } from "../get-notifications.use-case";

describe("GetNotificationsUseCase", () => {
  let useCase: GetNotificationsUseCase;
  let mockNotificationRepo: INotificationRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockNotificationRepo = {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      findByUserId: vi.fn(),
      findUnreadByUserId: vi.fn(),
      markAsRead: vi.fn(),
      countUnread: vi.fn(),
    } as unknown as INotificationRepository;

    useCase = new GetNotificationsUseCase(mockNotificationRepo);
  });

  const createMockNotification = (
    id: string,
    userId: string,
    type: "friend_request" | "friend_accepted" | "new_message",
    options?: { readAt?: Date },
  ): Notification => {
    const typeVO = NotificationType.create(type);
    if (typeVO.isFailure) throw new Error("Invalid type");

    return Notification.reconstitute(
      {
        userId,
        type: typeVO.getValue(),
        title: "Test Title",
        body: "Test Body",
        data: { key: "value" },
        readAt: options?.readAt ? Option.some(options.readAt) : Option.none(),
        createdAt: new Date(),
      },
      NotificationId.create(new UUID(id)),
    );
  };

  const createPaginatedResult = (
    notifications: Notification[],
    pagination: PaginationParams = { page: 1, limit: 20 },
  ): PaginatedResult<Notification> => ({
    data: notifications,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: notifications.length,
      totalPages: Math.ceil(notifications.length / pagination.limit),
      hasNextPage: false,
      hasPreviousPage: false,
    },
  });

  describe("happy path", () => {
    it("should return all notifications for a user", async () => {
      const userId = "user-123";
      const notifications = [
        createMockNotification("notif-1", userId, "friend_request"),
        createMockNotification("notif-2", userId, "friend_accepted"),
      ];

      vi.mocked(mockNotificationRepo.findByUserId).mockResolvedValue(
        Result.ok(createPaginatedResult(notifications)),
      );
      vi.mocked(mockNotificationRepo.countUnread).mockResolvedValue(
        Result.ok(1),
      );

      const result = await useCase.execute({ userId });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.notifications).toHaveLength(2);
      expect(output.unreadCount).toBe(1);
      expect(output.pagination.total).toBe(2);
      expect(mockNotificationRepo.findByUserId).toHaveBeenCalledWith(userId, {
        page: 1,
        limit: 20,
      });
    });

    it("should return only unread notifications when unreadOnly is true", async () => {
      const userId = "user-123";
      const notifications = [
        createMockNotification("notif-1", userId, "friend_request"),
      ];

      vi.mocked(mockNotificationRepo.findUnreadByUserId).mockResolvedValue(
        Result.ok(createPaginatedResult(notifications)),
      );
      vi.mocked(mockNotificationRepo.countUnread).mockResolvedValue(
        Result.ok(1),
      );

      const result = await useCase.execute({ userId, unreadOnly: true });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.notifications).toHaveLength(1);
      expect(mockNotificationRepo.findUnreadByUserId).toHaveBeenCalledOnce();
      expect(mockNotificationRepo.findByUserId).not.toHaveBeenCalled();
    });

    it("should apply custom pagination parameters", async () => {
      const userId = "user-123";
      const notifications: Notification[] = [];

      vi.mocked(mockNotificationRepo.findByUserId).mockResolvedValue(
        Result.ok(createPaginatedResult(notifications, { page: 2, limit: 10 })),
      );
      vi.mocked(mockNotificationRepo.countUnread).mockResolvedValue(
        Result.ok(0),
      );

      const result = await useCase.execute({ userId, page: 2, limit: 10 });

      expect(result.isSuccess).toBe(true);
      expect(mockNotificationRepo.findByUserId).toHaveBeenCalledWith(userId, {
        page: 2,
        limit: 10,
      });
    });

    it("should map notification to DTO correctly", async () => {
      const userId = "user-123";
      const readAt = new Date("2026-01-15T10:00:00Z");
      const notifications = [
        createMockNotification("notif-1", userId, "friend_request", { readAt }),
      ];

      vi.mocked(mockNotificationRepo.findByUserId).mockResolvedValue(
        Result.ok(createPaginatedResult(notifications)),
      );
      vi.mocked(mockNotificationRepo.countUnread).mockResolvedValue(
        Result.ok(0),
      );

      const result = await useCase.execute({ userId });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.notifications).toHaveLength(1);
      const notif = output.notifications[0]!;
      expect(notif.id).toBe("notif-1");
      expect(notif.userId).toBe(userId);
      expect(notif.type).toBe("friend_request");
      expect(notif.title).toBe("Test Title");
      expect(notif.body).toBe("Test Body");
      expect(notif.data).toEqual({ key: "value" });
      expect(notif.readAt).toBe(readAt.toISOString());
    });

    it("should return null for readAt when notification is unread", async () => {
      const userId = "user-123";
      const notifications = [
        createMockNotification("notif-1", userId, "friend_request"),
      ];

      vi.mocked(mockNotificationRepo.findByUserId).mockResolvedValue(
        Result.ok(createPaginatedResult(notifications)),
      );
      vi.mocked(mockNotificationRepo.countUnread).mockResolvedValue(
        Result.ok(1),
      );

      const result = await useCase.execute({ userId });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.notifications).toHaveLength(1);
      expect(output.notifications[0]!.readAt).toBeNull();
    });

    it("should return empty list when no notifications exist", async () => {
      const userId = "user-123";

      vi.mocked(mockNotificationRepo.findByUserId).mockResolvedValue(
        Result.ok(createPaginatedResult([])),
      );
      vi.mocked(mockNotificationRepo.countUnread).mockResolvedValue(
        Result.ok(0),
      );

      const result = await useCase.execute({ userId });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.notifications).toHaveLength(0);
      expect(output.unreadCount).toBe(0);
    });
  });

  describe("error handling", () => {
    it("should fail when findByUserId returns error", async () => {
      vi.mocked(mockNotificationRepo.findByUserId).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute({ userId: "user-123" });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });

    it("should fail when findUnreadByUserId returns error", async () => {
      vi.mocked(mockNotificationRepo.findUnreadByUserId).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute({
        userId: "user-123",
        unreadOnly: true,
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });

    it("should fail when countUnread returns error", async () => {
      vi.mocked(mockNotificationRepo.findByUserId).mockResolvedValue(
        Result.ok(createPaginatedResult([])),
      );
      vi.mocked(mockNotificationRepo.countUnread).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute({ userId: "user-123" });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });
  });
});
