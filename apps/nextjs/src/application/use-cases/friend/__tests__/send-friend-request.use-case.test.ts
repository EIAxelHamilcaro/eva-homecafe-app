import { Option, Result, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IEmailProvider } from "@/application/ports/email.provider.port";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IFriendRequestRepository } from "@/application/ports/friend-request-repository.port";
import type { IInviteTokenRepository } from "@/application/ports/invite-token-repository.port";
import type { INotificationRepository } from "@/application/ports/notification-repository.port";
import type { IUserRepository } from "@/application/ports/user.repository.port";
import type { FriendRequest } from "@/domain/friend/friend-request.aggregate";
import type { Notification } from "@/domain/notification/notification.aggregate";
import { User } from "@/domain/user/user.aggregate";
import { Email } from "@/domain/user/value-objects/email.vo";
import { Name } from "@/domain/user/value-objects/name.vo";
import { SendFriendRequestUseCase } from "../send-friend-request.use-case";

describe("SendFriendRequestUseCase", () => {
  let useCase: SendFriendRequestUseCase;
  let mockUserRepo: IUserRepository;
  let mockFriendRequestRepo: IFriendRequestRepository;
  let mockNotificationRepo: INotificationRepository;
  let mockEmailProvider: IEmailProvider;
  let mockEventDispatcher: IEventDispatcher;
  let mockInviteTokenRepo: IInviteTokenRepository;
  const appUrl = "http://localhost:3000";

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserRepo = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
    } as unknown as IUserRepository;
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
    mockEmailProvider = {
      send: vi.fn(),
    } as unknown as IEmailProvider;
    mockEventDispatcher = {
      dispatch: vi.fn(),
      dispatchAll: vi.fn(),
    } as unknown as IEventDispatcher;
    mockInviteTokenRepo = {
      create: vi.fn().mockResolvedValue(Result.ok({ token: "mock-token" })),
      findByToken: vi.fn(),
      markAsUsed: vi.fn(),
      deleteExpired: vi.fn(),
    } as unknown as IInviteTokenRepository;

    useCase = new SendFriendRequestUseCase(
      mockUserRepo,
      mockFriendRequestRepo,
      mockNotificationRepo,
      mockEmailProvider,
      mockEventDispatcher,
      mockInviteTokenRepo,
      appUrl,
    );
  });

  const createMockUser = (id: string, email: string, name: string): User => {
    const emailVO = Email.create(email);
    const nameVO = Name.create(name);
    if (emailVO.isFailure || nameVO.isFailure) {
      throw new Error("Invalid user data");
    }
    const userResult = User.create(
      {
        email: emailVO.getValue(),
        name: nameVO.getValue(),
        emailVerified: true,
        image: Option.none(),
      },
      new UUID(id),
    );
    return userResult.getValue();
  };

  describe("happy path", () => {
    it("should send friend request to existing user", async () => {
      const senderId = "sender-123";
      const receiverId = "receiver-456";
      const receiver = createMockUser(
        receiverId,
        "receiver@test.com",
        "Receiver",
      );

      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(
        Result.ok(Option.some(receiver)),
      );
      vi.mocked(mockFriendRequestRepo.existsBetweenUsers).mockResolvedValue(
        Result.ok(false),
      );
      vi.mocked(mockFriendRequestRepo.create).mockResolvedValue(
        Result.ok({} as FriendRequest),
      );
      vi.mocked(mockNotificationRepo.create).mockResolvedValue(
        Result.ok({} as Notification),
      );

      const result = await useCase.execute({
        receiverEmail: "receiver@test.com",
        senderId,
        senderName: "Sender",
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.status).toBe("request_sent");
      expect(output.message).toContain("sent successfully");
      expect(mockFriendRequestRepo.create).toHaveBeenCalledOnce();
      expect(mockNotificationRepo.create).toHaveBeenCalledOnce();
    });

    it("should send invitation email to non-existing user", async () => {
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(
        Result.ok(Option.none()),
      );
      vi.mocked(mockEmailProvider.send).mockResolvedValue(Result.ok());

      const result = await useCase.execute({
        receiverEmail: "nonexistent@test.com",
        senderId: "sender-123",
        senderName: "Sender",
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.status).toBe("invitation_sent");
      expect(output.message).toContain("Invitation email sent");
      expect(mockEmailProvider.send).toHaveBeenCalledOnce();
      expect(mockFriendRequestRepo.create).not.toHaveBeenCalled();
    });

    it("should return already_friends when request exists between users", async () => {
      const senderId = "sender-123";
      const receiverId = "receiver-456";
      const receiver = createMockUser(
        receiverId,
        "receiver@test.com",
        "Receiver",
      );

      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(
        Result.ok(Option.some(receiver)),
      );
      vi.mocked(mockFriendRequestRepo.existsBetweenUsers).mockResolvedValue(
        Result.ok(true),
      );

      const result = await useCase.execute({
        receiverEmail: "receiver@test.com",
        senderId,
        senderName: "Sender",
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.status).toBe("already_friends");
      expect(mockFriendRequestRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("validation errors", () => {
    it("should fail when sending friend request to yourself", async () => {
      const userId = "user-123";
      const user = createMockUser(userId, "user@test.com", "User");

      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(
        Result.ok(Option.some(user)),
      );

      const result = await useCase.execute({
        receiverEmail: "user@test.com",
        senderId: userId,
        senderName: "User",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("yourself");
    });
  });

  describe("error handling", () => {
    it("should fail when user repository returns error", async () => {
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute({
        receiverEmail: "test@test.com",
        senderId: "sender-123",
        senderName: "Sender",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });

    it("should fail when friend request repository returns error", async () => {
      const receiverId = "receiver-456";
      const receiver = createMockUser(
        receiverId,
        "receiver@test.com",
        "Receiver",
      );

      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(
        Result.ok(Option.some(receiver)),
      );
      vi.mocked(mockFriendRequestRepo.existsBetweenUsers).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute({
        receiverEmail: "receiver@test.com",
        senderId: "sender-123",
        senderName: "Sender",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });

    it("should fail when email provider returns error", async () => {
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(
        Result.ok(Option.none()),
      );
      vi.mocked(mockEmailProvider.send).mockResolvedValue(
        Result.fail("Email service unavailable"),
      );

      const result = await useCase.execute({
        receiverEmail: "nonexistent@test.com",
        senderId: "sender-123",
        senderName: "Sender",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Email service unavailable");
    });

    it("should fail when saving friend request fails", async () => {
      const receiverId = "receiver-456";
      const receiver = createMockUser(
        receiverId,
        "receiver@test.com",
        "Receiver",
      );

      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(
        Result.ok(Option.some(receiver)),
      );
      vi.mocked(mockFriendRequestRepo.existsBetweenUsers).mockResolvedValue(
        Result.ok(false),
      );
      vi.mocked(mockFriendRequestRepo.create).mockResolvedValue(
        Result.fail("Save failed"),
      );

      const result = await useCase.execute({
        receiverEmail: "receiver@test.com",
        senderId: "sender-123",
        senderName: "Sender",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Save failed");
    });
  });
});
