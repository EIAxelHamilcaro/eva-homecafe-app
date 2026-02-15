import { Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IJournalReminderQueryProvider } from "@/application/ports/journal-reminder-query.provider.port";
import type { INotificationRepository } from "@/application/ports/notification-repository.port";
import type { Notification } from "@/domain/notification/notification.aggregate";
import { SendJournalRemindersUseCase } from "../send-journal-reminders.use-case";

describe("SendJournalRemindersUseCase", () => {
  let useCase: SendJournalRemindersUseCase;
  let mockNotificationRepo: INotificationRepository;
  let mockEventDispatcher: IEventDispatcher;
  let mockQueryProvider: IJournalReminderQueryProvider;

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
    mockEventDispatcher = {
      dispatch: vi.fn(),
      dispatchAll: vi.fn(),
    } as unknown as IEventDispatcher;
    mockQueryProvider = {
      getEligibleUsers: vi.fn(),
    } as unknown as IJournalReminderQueryProvider;

    useCase = new SendJournalRemindersUseCase(
      mockNotificationRepo,
      mockEventDispatcher,
      mockQueryProvider,
    );
  });

  describe("happy path", () => {
    it("should send reminders to eligible users", async () => {
      vi.mocked(mockQueryProvider.getEligibleUsers).mockResolvedValue([
        { userId: "user-1" },
        { userId: "user-2" },
      ]);
      vi.mocked(mockNotificationRepo.create).mockResolvedValue(
        Result.ok({} as Notification),
      );

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.eligibleUsers).toBe(2);
      expect(output.notificationsSent).toBe(2);
      expect(mockNotificationRepo.create).toHaveBeenCalledTimes(2);
      expect(mockEventDispatcher.dispatchAll).toHaveBeenCalledTimes(2);
    });

    it("should return 0 when no eligible users", async () => {
      vi.mocked(mockQueryProvider.getEligibleUsers).mockResolvedValue([]);

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.eligibleUsers).toBe(0);
      expect(output.notificationsSent).toBe(0);
      expect(mockNotificationRepo.create).not.toHaveBeenCalled();
    });

    it("should skip users when save fails (resilient)", async () => {
      vi.mocked(mockQueryProvider.getEligibleUsers).mockResolvedValue([
        { userId: "user-1" },
        { userId: "user-2" },
        { userId: "user-3" },
      ]);
      vi.mocked(mockNotificationRepo.create)
        .mockResolvedValueOnce(Result.ok({} as Notification))
        .mockResolvedValueOnce(Result.fail("Save failed"))
        .mockResolvedValueOnce(Result.ok({} as Notification));

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.eligibleUsers).toBe(3);
      expect(output.notificationsSent).toBe(2);
    });

    it("should report correct count of sent notifications", async () => {
      vi.mocked(mockQueryProvider.getEligibleUsers).mockResolvedValue([
        { userId: "user-1" },
        { userId: "user-2" },
        { userId: "user-3" },
        { userId: "user-4" },
      ]);
      vi.mocked(mockNotificationRepo.create)
        .mockResolvedValueOnce(Result.ok({} as Notification))
        .mockResolvedValueOnce(Result.fail("Save failed"))
        .mockResolvedValueOnce(Result.fail("Save failed"))
        .mockResolvedValueOnce(Result.ok({} as Notification));

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.eligibleUsers).toBe(4);
      expect(output.notificationsSent).toBe(2);
      expect(mockEventDispatcher.dispatchAll).toHaveBeenCalledTimes(2);
    });
  });
});
