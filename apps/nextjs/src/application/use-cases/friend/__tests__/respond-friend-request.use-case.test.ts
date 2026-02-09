import { Option, Result, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IFriendRequestRepository } from "@/application/ports/friend-request-repository.port";
import type { INotificationRepository } from "@/application/ports/notification-repository.port";
import type { IProfileRepository } from "@/application/ports/profile-repository.port";
import type { FriendRequestAcceptedEvent } from "@/domain/friend/events/friend-request-accepted.event";
import { FriendRequest } from "@/domain/friend/friend-request.aggregate";
import type { Notification } from "@/domain/notification/notification.aggregate";
import { Profile } from "@/domain/profile/profile.aggregate";
import { DisplayName } from "@/domain/profile/value-objects/display-name.vo";
import { RespondFriendRequestUseCase } from "../respond-friend-request.use-case";

describe("RespondFriendRequestUseCase", () => {
  let useCase: RespondFriendRequestUseCase;
  let mockFriendRequestRepo: IFriendRequestRepository;
  let mockNotificationRepo: INotificationRepository;
  let mockProfileRepo: IProfileRepository;
  let mockEventDispatcher: IEventDispatcher;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFriendRequestRepo = {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      findByUsers: vi.fn(),
      findPendingForUser: vi.fn(),
      findFriendsForUser: vi.fn(),
      existsBetweenUsers: vi.fn(),
    } as unknown as IFriendRequestRepository;
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
    mockProfileRepo = {
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
      existsByUserId: vi.fn(),
    } as unknown as IProfileRepository;

    mockEventDispatcher = {
      dispatch: vi.fn(),
      dispatchAll: vi.fn(),
    };

    useCase = new RespondFriendRequestUseCase(
      mockFriendRequestRepo,
      mockNotificationRepo,
      mockProfileRepo,
      mockEventDispatcher,
    );
  });

  const createMockFriendRequest = (
    senderId: string,
    receiverId: string,
  ): FriendRequest => {
    const result = FriendRequest.create({ senderId, receiverId });
    return result.getValue();
  };

  const createMockProfile = (
    userId: string,
    displayName: string,
  ): Profile | null => {
    const displayNameResult = DisplayName.create(displayName);
    if (displayNameResult.isFailure) return null;
    return Profile.create({
      userId,
      displayName: displayNameResult.getValue(),
      bio: Option.none(),
      avatarUrl: Option.none(),
    });
  };

  describe("happy path", () => {
    it("should accept a friend request successfully", async () => {
      const senderId = "sender-123";
      const receiverId = "receiver-456";
      const requestId = new UUID().value.toString();
      const friendRequest = createMockFriendRequest(senderId, receiverId);
      const profile = createMockProfile(receiverId, "Receiver Name");

      vi.mocked(mockFriendRequestRepo.findById).mockResolvedValue(
        Result.ok(Option.some(friendRequest)),
      );
      vi.mocked(mockFriendRequestRepo.update).mockResolvedValue(
        Result.ok(friendRequest),
      );
      vi.mocked(mockProfileRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.some(profile!)),
      );
      vi.mocked(mockNotificationRepo.create).mockResolvedValue(
        Result.ok({} as Notification),
      );

      const result = await useCase.execute({
        requestId,
        accept: true,
        userId: receiverId,
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.success).toBe(true);
      expect(output.message).toContain("accepted");
      expect(mockFriendRequestRepo.update).toHaveBeenCalledOnce();
      expect(mockNotificationRepo.create).toHaveBeenCalledOnce();
    });

    it("should dispatch FriendRequestAcceptedEvent on accept", async () => {
      const senderId = "sender-123";
      const receiverId = "receiver-456";
      const requestId = new UUID().value.toString();
      const friendRequest = createMockFriendRequest(senderId, receiverId);
      const profile = createMockProfile(receiverId, "Receiver Name");

      vi.mocked(mockFriendRequestRepo.findById).mockResolvedValue(
        Result.ok(Option.some(friendRequest)),
      );
      vi.mocked(mockFriendRequestRepo.update).mockResolvedValue(
        Result.ok(friendRequest),
      );
      vi.mocked(mockProfileRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.some(profile!)),
      );
      vi.mocked(mockNotificationRepo.create).mockResolvedValue(
        Result.ok({} as Notification),
      );

      await useCase.execute({
        requestId,
        accept: true,
        userId: receiverId,
      });

      const events = vi.mocked(mockEventDispatcher.dispatchAll).mock
        .calls[0]?.[0] as unknown[];
      const acceptedEvent = events.find(
        (e) =>
          (e as unknown as FriendRequestAcceptedEvent).type ===
          "FriendRequestAccepted",
      ) as unknown as FriendRequestAcceptedEvent;
      expect(acceptedEvent).toBeDefined();
      expect(acceptedEvent.senderId).toBe(senderId);
      expect(acceptedEvent.receiverId).toBe(receiverId);
    });

    it("should reject a friend request successfully", async () => {
      const senderId = "sender-123";
      const receiverId = "receiver-456";
      const requestId = new UUID().value.toString();
      const friendRequest = createMockFriendRequest(senderId, receiverId);

      vi.mocked(mockFriendRequestRepo.findById).mockResolvedValue(
        Result.ok(Option.some(friendRequest)),
      );
      vi.mocked(mockFriendRequestRepo.update).mockResolvedValue(
        Result.ok(friendRequest),
      );

      const result = await useCase.execute({
        requestId,
        accept: false,
        userId: receiverId,
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.success).toBe(true);
      expect(output.message).toContain("rejected");
      expect(mockFriendRequestRepo.update).toHaveBeenCalledOnce();
      expect(mockNotificationRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("authorization errors", () => {
    it("should fail when user is not the receiver", async () => {
      const senderId = "sender-123";
      const receiverId = "receiver-456";
      const wrongUserId = "wrong-user-789";
      const requestId = new UUID().value.toString();
      const friendRequest = createMockFriendRequest(senderId, receiverId);

      vi.mocked(mockFriendRequestRepo.findById).mockResolvedValue(
        Result.ok(Option.some(friendRequest)),
      );

      const result = await useCase.execute({
        requestId,
        accept: true,
        userId: wrongUserId,
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("not authorized");
    });
  });

  describe("not found errors", () => {
    it("should fail when friend request not found", async () => {
      const requestId = new UUID().value.toString();

      vi.mocked(mockFriendRequestRepo.findById).mockResolvedValue(
        Result.ok(Option.none()),
      );

      const result = await useCase.execute({
        requestId,
        accept: true,
        userId: "user-123",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("not found");
    });
  });

  describe("error handling", () => {
    it("should fail when repository findById returns error", async () => {
      const requestId = new UUID().value.toString();

      vi.mocked(mockFriendRequestRepo.findById).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute({
        requestId,
        accept: true,
        userId: "user-123",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });

    it("should fail when repository update returns error", async () => {
      const senderId = "sender-123";
      const receiverId = "receiver-456";
      const requestId = new UUID().value.toString();
      const friendRequest = createMockFriendRequest(senderId, receiverId);

      vi.mocked(mockFriendRequestRepo.findById).mockResolvedValue(
        Result.ok(Option.some(friendRequest)),
      );
      vi.mocked(mockFriendRequestRepo.update).mockResolvedValue(
        Result.fail("Update failed"),
      );

      const result = await useCase.execute({
        requestId,
        accept: true,
        userId: receiverId,
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Update failed");
    });
  });
});
