import { Option, Result, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IFriendRequestRepository } from "@/application/ports/friend-request-repository.port";
import type {
  IInviteTokenRepository,
  InviteToken,
} from "@/application/ports/invite-token-repository.port";
import type { INotificationRepository } from "@/application/ports/notification-repository.port";
import type { IProfileRepository } from "@/application/ports/profile-repository.port";
import type { IUserRepository } from "@/application/ports/user.repository.port";
import type { FriendRequest } from "@/domain/friend/friend-request.aggregate";
import type { Notification } from "@/domain/notification/notification.aggregate";
import { Profile } from "@/domain/profile/profile.aggregate";
import { DisplayName } from "@/domain/profile/value-objects/display-name.vo";
import { User } from "@/domain/user/user.aggregate";
import { Email } from "@/domain/user/value-objects/email.vo";
import { Name } from "@/domain/user/value-objects/name.vo";
import { AcceptInviteLinkUseCase } from "../accept-invite-link.use-case";

describe("AcceptInviteLinkUseCase", () => {
  let useCase: AcceptInviteLinkUseCase;
  let mockInviteTokenRepo: IInviteTokenRepository;
  let mockFriendRequestRepo: IFriendRequestRepository;
  let mockUserRepo: IUserRepository;
  let mockProfileRepo: IProfileRepository;
  let mockNotificationRepo: INotificationRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockInviteTokenRepo = {
      create: vi.fn(),
      findByToken: vi.fn(),
      markAsUsed: vi.fn(),
      deleteExpired: vi.fn(),
    } as unknown as IInviteTokenRepository;
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

    useCase = new AcceptInviteLinkUseCase(
      mockInviteTokenRepo,
      mockFriendRequestRepo,
      mockUserRepo,
      mockProfileRepo,
      mockNotificationRepo,
    );
  });

  const createMockInviteToken = (
    userId: string,
    options?: { usedAt?: Date | null; expiresAt?: Date },
  ): InviteToken => {
    const expiresAt = options?.expiresAt ?? new Date(Date.now() + 86400000);
    return {
      id: new UUID().value.toString(),
      userId,
      token: new UUID().value.toString(),
      expiresAt,
      usedAt: options?.usedAt ?? null,
      createdAt: new Date(),
    };
  };

  const createMockUser = (id: string, name: string): User => {
    const emailVO = Email.create(`${id}@test.com`);
    const nameVO = Name.create(name);
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
    it("should accept invite link successfully", async () => {
      const inviterId = "inviter-123";
      const acceptorId = "acceptor-456";
      const inviteToken = createMockInviteToken(inviterId);
      const inviter = createMockUser(inviterId, "Inviter Name");
      const inviterProfile = createMockProfile(inviterId, "Inviter Display");
      const acceptorProfile = createMockProfile(acceptorId, "Acceptor Display");

      vi.mocked(mockInviteTokenRepo.findByToken).mockResolvedValue(
        Result.ok(Option.some(inviteToken)),
      );
      vi.mocked(mockFriendRequestRepo.existsBetweenUsers).mockResolvedValue(
        Result.ok(false),
      );
      vi.mocked(mockUserRepo.findById).mockResolvedValue(
        Result.ok(Option.some(inviter)),
      );
      vi.mocked(mockFriendRequestRepo.create).mockResolvedValue(
        Result.ok({} as FriendRequest),
      );
      vi.mocked(mockInviteTokenRepo.markAsUsed).mockResolvedValue(Result.ok());
      vi.mocked(mockProfileRepo.findByUserId).mockImplementation(
        async (userId) => {
          if (userId === inviterId) {
            return Result.ok(Option.some(inviterProfile as Profile));
          }
          return Result.ok(Option.some(acceptorProfile as Profile));
        },
      );
      vi.mocked(mockNotificationRepo.create).mockResolvedValue(
        Result.ok({} as Notification),
      );

      const result = await useCase.execute({
        token: inviteToken.token,
        userId: acceptorId,
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.success).toBe(true);
      expect(output.friendId).toBe(inviterId);
      expect(output.message).toContain("friends");
      expect(mockFriendRequestRepo.create).toHaveBeenCalledOnce();
      expect(mockInviteTokenRepo.markAsUsed).toHaveBeenCalledOnce();
      expect(mockNotificationRepo.create).toHaveBeenCalledTimes(2);
    });
  });

  describe("invalid token errors", () => {
    it("should fail when token not found", async () => {
      vi.mocked(mockInviteTokenRepo.findByToken).mockResolvedValue(
        Result.ok(Option.none()),
      );

      const result = await useCase.execute({
        token: "invalid-token",
        userId: "user-123",
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.success).toBe(false);
      expect(output.message).toContain("Invalid");
    });

    it("should fail when token already used", async () => {
      const inviteToken = createMockInviteToken("inviter-123", {
        usedAt: new Date(),
      });

      vi.mocked(mockInviteTokenRepo.findByToken).mockResolvedValue(
        Result.ok(Option.some(inviteToken)),
      );

      const result = await useCase.execute({
        token: inviteToken.token,
        userId: "acceptor-456",
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.success).toBe(false);
      expect(output.message).toContain("already been used");
    });

    it("should fail when token expired", async () => {
      const expiredDate = new Date(Date.now() - 86400000);
      const inviteToken = createMockInviteToken("inviter-123", {
        expiresAt: expiredDate,
      });

      vi.mocked(mockInviteTokenRepo.findByToken).mockResolvedValue(
        Result.ok(Option.some(inviteToken)),
      );

      const result = await useCase.execute({
        token: inviteToken.token,
        userId: "acceptor-456",
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.success).toBe(false);
      expect(output.message).toContain("expired");
    });
  });

  describe("business rule errors", () => {
    it("should fail when accepting own invite", async () => {
      const userId = "user-123";
      const inviteToken = createMockInviteToken(userId);

      vi.mocked(mockInviteTokenRepo.findByToken).mockResolvedValue(
        Result.ok(Option.some(inviteToken)),
      );

      const result = await useCase.execute({
        token: inviteToken.token,
        userId,
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.success).toBe(false);
      expect(output.message).toContain("own invite");
    });

    it("should fail when already friends", async () => {
      const inviterId = "inviter-123";
      const acceptorId = "acceptor-456";
      const inviteToken = createMockInviteToken(inviterId);

      vi.mocked(mockInviteTokenRepo.findByToken).mockResolvedValue(
        Result.ok(Option.some(inviteToken)),
      );
      vi.mocked(mockFriendRequestRepo.existsBetweenUsers).mockResolvedValue(
        Result.ok(true),
      );

      const result = await useCase.execute({
        token: inviteToken.token,
        userId: acceptorId,
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.success).toBe(false);
      expect(output.message).toContain("already connected");
    });

    it("should fail when inviter no longer exists", async () => {
      const inviterId = "inviter-123";
      const acceptorId = "acceptor-456";
      const inviteToken = createMockInviteToken(inviterId);

      vi.mocked(mockInviteTokenRepo.findByToken).mockResolvedValue(
        Result.ok(Option.some(inviteToken)),
      );
      vi.mocked(mockFriendRequestRepo.existsBetweenUsers).mockResolvedValue(
        Result.ok(false),
      );
      vi.mocked(mockUserRepo.findById).mockResolvedValue(
        Result.ok(Option.none()),
      );

      const result = await useCase.execute({
        token: inviteToken.token,
        userId: acceptorId,
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.success).toBe(false);
      expect(output.message).toContain("no longer exists");
    });
  });

  describe("error handling", () => {
    it("should fail when token repository returns error", async () => {
      vi.mocked(mockInviteTokenRepo.findByToken).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute({
        token: "token",
        userId: "user-123",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });

    it("should fail when friend request repository returns error", async () => {
      const inviteToken = createMockInviteToken("inviter-123");

      vi.mocked(mockInviteTokenRepo.findByToken).mockResolvedValue(
        Result.ok(Option.some(inviteToken)),
      );
      vi.mocked(mockFriendRequestRepo.existsBetweenUsers).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute({
        token: inviteToken.token,
        userId: "acceptor-456",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });
  });
});
