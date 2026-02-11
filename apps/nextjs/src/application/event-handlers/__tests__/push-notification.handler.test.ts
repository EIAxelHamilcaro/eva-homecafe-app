import { type DomainEvent, Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IPushNotificationProvider } from "@/application/ports/push-notification-provider.port";
import type { IPushTokenRepository } from "@/application/ports/push-token-repository.port";
import type { IUserPreferenceRepository } from "@/application/ports/user-preference-repository.port";
import { NotificationCreatedEvent } from "@/domain/notification/events/notification-created.event";
import { PushToken } from "@/domain/push-token/push-token.aggregate";
import { UserPreference } from "@/domain/user-preference/user-preference.aggregate";
import { PushNotificationHandler } from "../push-notification.handler";

function createMockPrefs(
  overrides: Partial<{
    pushNotifications: boolean;
    notifyFriendActivity: boolean;
    notifyNewMessages: boolean;
    notifyBadgesEarned: boolean;
    notifyJournalReminder: boolean;
  }> = {},
): UserPreference {
  const prefs = UserPreference.createDefault("user-1").getValue();
  if (Object.keys(overrides).length > 0) {
    prefs.updatePreferences(
      overrides as Parameters<typeof prefs.updatePreferences>[0],
    );
  }
  return prefs;
}

describe("PushNotificationHandler", () => {
  let handler: PushNotificationHandler;
  let mockPushProvider: { send: ReturnType<typeof vi.fn> };
  let mockPushTokenRepo: { findByUserId: ReturnType<typeof vi.fn> };
  let mockUserPrefRepo: { findByUserId: ReturnType<typeof vi.fn> };

  const mockToken = PushToken.create({
    userId: "user-1",
    token: "ExponentPushToken[xxxx]",
    platform: "ios",
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockPushProvider = { send: vi.fn().mockResolvedValue(Result.ok()) };
    mockPushTokenRepo = { findByUserId: vi.fn() };
    mockUserPrefRepo = { findByUserId: vi.fn() };
    handler = new PushNotificationHandler(
      mockPushProvider as unknown as IPushNotificationProvider,
      mockPushTokenRepo as unknown as IPushTokenRepository,
      mockUserPrefRepo as unknown as IUserPreferenceRepository,
    );
  });

  describe("event filtering", () => {
    it("should ignore non-NotificationCreated events", async () => {
      const event = { type: "SomeOtherEvent" } as DomainEvent;

      await handler.handle(event);

      expect(mockUserPrefRepo.findByUserId).not.toHaveBeenCalled();
    });
  });

  describe("happy path", () => {
    it("should send push notification for friend_request when enabled", async () => {
      const event = new NotificationCreatedEvent(
        "notif-1",
        "user-1",
        "friend_request",
        "New Friend Request",
      );
      const prefs = createMockPrefs();

      mockUserPrefRepo.findByUserId.mockResolvedValue(
        Result.ok(Option.some(prefs)),
      );
      mockPushTokenRepo.findByUserId.mockResolvedValue(Result.ok([mockToken]));

      await handler.handle(event);

      expect(mockPushProvider.send).toHaveBeenCalledWith(
        "ExponentPushToken[xxxx]",
        expect.objectContaining({
          title: "New Friend Request",
          body: "",
          data: {
            notificationType: "friend_request",
            notificationId: "notif-1",
          },
        }),
      );
    });

    it("should send to multiple devices", async () => {
      const event = new NotificationCreatedEvent(
        "notif-1",
        "user-1",
        "new_message",
        "New Message",
      );
      const prefs = createMockPrefs();
      const token2 = PushToken.create({
        userId: "user-1",
        token: "ExponentPushToken[yyyy]",
        platform: "android",
      });

      mockUserPrefRepo.findByUserId.mockResolvedValue(
        Result.ok(Option.some(prefs)),
      );
      mockPushTokenRepo.findByUserId.mockResolvedValue(
        Result.ok([mockToken, token2]),
      );

      await handler.handle(event);

      expect(mockPushProvider.send).toHaveBeenCalledTimes(2);
    });
  });

  describe("preference checking", () => {
    it("should skip when master push toggle is disabled", async () => {
      const event = new NotificationCreatedEvent(
        "notif-1",
        "user-1",
        "friend_request",
        "New Friend Request",
      );
      const prefs = createMockPrefs({ pushNotifications: false });

      mockUserPrefRepo.findByUserId.mockResolvedValue(
        Result.ok(Option.some(prefs)),
      );

      await handler.handle(event);

      expect(mockPushTokenRepo.findByUserId).not.toHaveBeenCalled();
      expect(mockPushProvider.send).not.toHaveBeenCalled();
    });

    it("should skip when specific notification type is disabled", async () => {
      const event = new NotificationCreatedEvent(
        "notif-1",
        "user-1",
        "new_message",
        "New Message",
      );
      const prefs = createMockPrefs({ notifyNewMessages: false });

      mockUserPrefRepo.findByUserId.mockResolvedValue(
        Result.ok(Option.some(prefs)),
      );

      await handler.handle(event);

      expect(mockPushProvider.send).not.toHaveBeenCalled();
    });

    it("should skip friend_accepted when notifyFriendActivity is disabled", async () => {
      const event = new NotificationCreatedEvent(
        "notif-1",
        "user-1",
        "friend_accepted",
        "Friend Accepted",
      );
      const prefs = createMockPrefs({ notifyFriendActivity: false });

      mockUserPrefRepo.findByUserId.mockResolvedValue(
        Result.ok(Option.some(prefs)),
      );

      await handler.handle(event);

      expect(mockPushProvider.send).not.toHaveBeenCalled();
    });

    it("should skip reward_earned when notifyBadgesEarned is disabled", async () => {
      const event = new NotificationCreatedEvent(
        "notif-1",
        "user-1",
        "reward_earned",
        "Badge Earned!",
      );
      const prefs = createMockPrefs({ notifyBadgesEarned: false });

      mockUserPrefRepo.findByUserId.mockResolvedValue(
        Result.ok(Option.some(prefs)),
      );

      await handler.handle(event);

      expect(mockPushProvider.send).not.toHaveBeenCalled();
    });

    it("should send when user has no preferences (defaults to enabled)", async () => {
      const event = new NotificationCreatedEvent(
        "notif-1",
        "user-1",
        "friend_request",
        "New Friend Request",
      );

      mockUserPrefRepo.findByUserId.mockResolvedValue(Result.ok(Option.none()));
      mockPushTokenRepo.findByUserId.mockResolvedValue(Result.ok([mockToken]));

      await handler.handle(event);

      expect(mockPushProvider.send).toHaveBeenCalledOnce();
    });
  });

  describe("edge cases", () => {
    it("should not send when user has no push tokens", async () => {
      const event = new NotificationCreatedEvent(
        "notif-1",
        "user-1",
        "friend_request",
        "New Friend Request",
      );
      const prefs = createMockPrefs();

      mockUserPrefRepo.findByUserId.mockResolvedValue(
        Result.ok(Option.some(prefs)),
      );
      mockPushTokenRepo.findByUserId.mockResolvedValue(Result.ok([]));

      await handler.handle(event);

      expect(mockPushProvider.send).not.toHaveBeenCalled();
    });

    it("should silently fail when preference lookup fails", async () => {
      const event = new NotificationCreatedEvent(
        "notif-1",
        "user-1",
        "friend_request",
        "New Friend Request",
      );

      mockUserPrefRepo.findByUserId.mockResolvedValue(
        Result.fail("Database error"),
      );

      await handler.handle(event);

      expect(mockPushTokenRepo.findByUserId).not.toHaveBeenCalled();
    });

    it("should silently fail when token lookup fails", async () => {
      const event = new NotificationCreatedEvent(
        "notif-1",
        "user-1",
        "friend_request",
        "New Friend Request",
      );
      const prefs = createMockPrefs();

      mockUserPrefRepo.findByUserId.mockResolvedValue(
        Result.ok(Option.some(prefs)),
      );
      mockPushTokenRepo.findByUserId.mockResolvedValue(
        Result.fail("Token lookup error"),
      );

      await handler.handle(event);

      expect(mockPushProvider.send).not.toHaveBeenCalled();
    });
  });
});
