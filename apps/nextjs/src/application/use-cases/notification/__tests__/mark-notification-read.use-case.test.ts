import { Option, Result, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { INotificationRepository } from "@/application/ports/notification-repository.port";
import { Notification } from "@/domain/notification/notification.aggregate";
import { NotificationId } from "@/domain/notification/notification-id";
import { NotificationType } from "@/domain/notification/value-objects/notification-type.vo";
import { MarkNotificationReadUseCase } from "../mark-notification-read.use-case";

describe("MarkNotificationReadUseCase", () => {
  let useCase: MarkNotificationReadUseCase;
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

    useCase = new MarkNotificationReadUseCase(mockNotificationRepo);
  });

  const createMockNotification = (
    id: string,
    userId: string,
    options?: { readAt?: Date },
  ): Notification => {
    const typeVO = NotificationType.createFriendRequest();
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

  describe("happy path", () => {
    it("should mark notification as read successfully", async () => {
      const notificationId = new UUID().value.toString();
      const userId = "user-123";
      const notification = createMockNotification(notificationId, userId);

      vi.mocked(mockNotificationRepo.findById).mockResolvedValue(
        Result.ok(Option.some(notification)),
      );
      vi.mocked(mockNotificationRepo.update).mockResolvedValue(
        Result.ok(notification),
      );

      const result = await useCase.execute({
        notificationId,
        userId,
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.success).toBe(true);
      expect(output.message).toContain("marked as read");
      expect(mockNotificationRepo.update).toHaveBeenCalledOnce();
    });

    it("should return success when notification is already read", async () => {
      const notificationId = new UUID().value.toString();
      const userId = "user-123";
      const notification = createMockNotification(notificationId, userId, {
        readAt: new Date(),
      });

      vi.mocked(mockNotificationRepo.findById).mockResolvedValue(
        Result.ok(Option.some(notification)),
      );

      const result = await useCase.execute({
        notificationId,
        userId,
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.success).toBe(true);
      expect(output.message).toContain("already read");
      expect(mockNotificationRepo.update).not.toHaveBeenCalled();
    });
  });

  describe("authorization errors", () => {
    it("should fail when user does not own the notification", async () => {
      const notificationId = new UUID().value.toString();
      const ownerId = "owner-123";
      const wrongUserId = "wrong-user-456";
      const notification = createMockNotification(notificationId, ownerId);

      vi.mocked(mockNotificationRepo.findById).mockResolvedValue(
        Result.ok(Option.some(notification)),
      );

      const result = await useCase.execute({
        notificationId,
        userId: wrongUserId,
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("not authorized");
    });
  });

  describe("not found errors", () => {
    it("should fail when notification not found", async () => {
      const notificationId = new UUID().value.toString();

      vi.mocked(mockNotificationRepo.findById).mockResolvedValue(
        Result.ok(Option.none()),
      );

      const result = await useCase.execute({
        notificationId,
        userId: "user-123",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("not found");
    });
  });

  describe("error handling", () => {
    it("should fail when repository findById returns error", async () => {
      const notificationId = new UUID().value.toString();

      vi.mocked(mockNotificationRepo.findById).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute({
        notificationId,
        userId: "user-123",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });

    it("should fail when repository update returns error", async () => {
      const notificationId = new UUID().value.toString();
      const userId = "user-123";
      const notification = createMockNotification(notificationId, userId);

      vi.mocked(mockNotificationRepo.findById).mockResolvedValue(
        Result.ok(Option.some(notification)),
      );
      vi.mocked(mockNotificationRepo.update).mockResolvedValue(
        Result.fail("Update failed"),
      );

      const result = await useCase.execute({
        notificationId,
        userId,
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Update failed");
    });
  });
});
