import { Option, Result, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IFriendRequestRepository } from "@/application/ports/friend-request-repository.port";
import type { IProfileRepository } from "@/application/ports/profile-repository.port";
import type { IUserRepository } from "@/application/ports/user.repository.port";
import { FriendRequest } from "@/domain/friend/friend-request.aggregate";
import { FriendRequestId } from "@/domain/friend/friend-request-id";
import { FriendRequestStatus } from "@/domain/friend/value-objects/friend-request-status.vo";
import { Profile } from "@/domain/profile/profile.aggregate";
import { DisplayName } from "@/domain/profile/value-objects/display-name.vo";
import { User } from "@/domain/user/user.aggregate";
import { Email } from "@/domain/user/value-objects/email.vo";
import { Name } from "@/domain/user/value-objects/name.vo";
import { GetPendingRequestsUseCase } from "../get-pending-requests.use-case";

describe("GetPendingRequestsUseCase", () => {
  let useCase: GetPendingRequestsUseCase;
  let mockFriendRequestRepo: IFriendRequestRepository;
  let mockUserRepo: IUserRepository;
  let mockProfileRepo: IProfileRepository;

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
    mockUserRepo = {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      findByEmail: vi.fn(),
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

    useCase = new GetPendingRequestsUseCase(
      mockFriendRequestRepo,
      mockUserRepo,
      mockProfileRepo,
    );
  });

  const createPendingFriendRequest = (
    id: string,
    senderId: string,
    receiverId: string,
  ): FriendRequest => {
    const status = FriendRequestStatus.createPending().getValue();
    return FriendRequest.reconstitute(
      {
        senderId,
        receiverId,
        status,
        createdAt: new Date(),
        respondedAt: Option.none(),
      },
      FriendRequestId.create(new UUID(id)),
    );
  };

  const createMockUser = (id: string, email: string, name: string): User => {
    const emailVO = Email.create(email).getValue();
    const nameVO = Name.create(name).getValue();
    return User.create(
      {
        email: emailVO,
        name: nameVO,
        emailVerified: true,
        image: Option.none(),
      },
      new UUID(id),
    ).getValue();
  };

  const createMockProfile = (
    id: string,
    userId: string,
    displayName: string,
  ): Profile => {
    const displayNameVO = DisplayName.create(displayName).getValue();
    return Profile.create(
      {
        userId,
        displayName: displayNameVO,
        bio: Option.none(),
        avatarUrl: Option.none(),
      },
      new UUID(id),
    );
  };

  describe("happy path", () => {
    it("should return pending requests with sender info", async () => {
      const currentUserId = "user-1";
      const senderId = "sender-1";
      const pendingRequest = createPendingFriendRequest(
        "fr-1",
        senderId,
        currentUserId,
      );
      const senderUser = createMockUser(
        senderId,
        "sender@test.com",
        "SenderName",
      );
      const senderProfile = createMockProfile(
        "profile-1",
        senderId,
        "SenderDisplay",
      );

      vi.mocked(mockFriendRequestRepo.findPendingForUser).mockResolvedValue(
        Result.ok({
          data: [pendingRequest],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),
      );
      vi.mocked(mockUserRepo.findById).mockResolvedValue(
        Result.ok(Option.some(senderUser)),
      );
      vi.mocked(mockProfileRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.some(senderProfile)),
      );

      const result = await useCase.execute({ userId: currentUserId });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.requests).toHaveLength(1);
      expect(output.requests[0]?.senderId).toBe(senderId);
      expect(output.requests[0]?.receiverId).toBe(currentUserId);
      expect(output.requests[0]?.senderEmail).toBe("sender@test.com");
      expect(output.requests[0]?.senderName).toBe("SenderName");
      expect(output.requests[0]?.senderDisplayName).toBe("SenderDisplay");
      expect(output.pagination.total).toBe(1);
    });

    it("should return empty list when no pending requests", async () => {
      vi.mocked(mockFriendRequestRepo.findPendingForUser).mockResolvedValue(
        Result.ok({
          data: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),
      );

      const result = await useCase.execute({ userId: "user-1" });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.requests).toHaveLength(0);
      expect(output.pagination.total).toBe(0);
    });

    it("should use default pagination when not provided", async () => {
      vi.mocked(mockFriendRequestRepo.findPendingForUser).mockResolvedValue(
        Result.ok({
          data: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),
      );

      await useCase.execute({ userId: "user-1" });

      expect(mockFriendRequestRepo.findPendingForUser).toHaveBeenCalledWith(
        "user-1",
        { page: 1, limit: 20 },
      );
    });
  });

  describe("error handling", () => {
    it("should fail when findPendingForUser fails", async () => {
      vi.mocked(mockFriendRequestRepo.findPendingForUser).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute({ userId: "user-1" });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });

    it("should fail when userRepo.findById fails", async () => {
      const pendingRequest = createPendingFriendRequest(
        "fr-1",
        "sender-1",
        "user-1",
      );

      vi.mocked(mockFriendRequestRepo.findPendingForUser).mockResolvedValue(
        Result.ok({
          data: [pendingRequest],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),
      );
      vi.mocked(mockUserRepo.findById).mockResolvedValue(
        Result.fail("User lookup failed"),
      );

      const result = await useCase.execute({ userId: "user-1" });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("User lookup failed");
    });
  });
});
