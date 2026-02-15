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
import { GetFriendsUseCase } from "../get-friends.use-case";

describe("GetFriendsUseCase", () => {
  let useCase: GetFriendsUseCase;
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

    useCase = new GetFriendsUseCase(
      mockFriendRequestRepo,
      mockUserRepo,
      mockProfileRepo,
    );
  });

  const createAcceptedFriendRequest = (
    id: string,
    senderId: string,
    receiverId: string,
  ): FriendRequest => {
    const status = FriendRequestStatus.createAccepted().getValue();
    return FriendRequest.reconstitute(
      {
        senderId,
        receiverId,
        status,
        createdAt: new Date(),
        respondedAt: Option.some(new Date()),
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
    it("should return list of friends with profile data", async () => {
      const currentUserId = "user-1";
      const friendUserId = "friend-1";
      const friendRequest = createAcceptedFriendRequest(
        "fr-1",
        currentUserId,
        friendUserId,
      );
      const friendUser = createMockUser(
        friendUserId,
        "friend@test.com",
        "FriendName",
      );
      const friendProfile = createMockProfile(
        "profile-1",
        friendUserId,
        "FriendDisplay",
      );

      vi.mocked(mockFriendRequestRepo.findFriendsForUser).mockResolvedValue(
        Result.ok({
          data: [friendRequest],
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
        Result.ok(Option.some(friendUser)),
      );
      vi.mocked(mockProfileRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.some(friendProfile)),
      );

      const result = await useCase.execute({ userId: currentUserId });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.friends).toHaveLength(1);
      const firstFriend = output.friends[0];
      expect(firstFriend).toBeDefined();
      expect(firstFriend?.userId).toBe(friendUserId);
      expect(firstFriend?.email).toBe("friend@test.com");
      expect(firstFriend?.name).toBe("FriendName");
      expect(firstFriend?.displayName).toBe("FriendDisplay");
      expect(output.pagination.total).toBe(1);
    });

    it("should return empty list when no friends", async () => {
      vi.mocked(mockFriendRequestRepo.findFriendsForUser).mockResolvedValue(
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
      expect(output.friends).toHaveLength(0);
      expect(output.pagination.total).toBe(0);
    });

    it("should handle user without profile", async () => {
      const currentUserId = "user-1";
      const friendUserId = "friend-1";
      const friendRequest = createAcceptedFriendRequest(
        "fr-1",
        currentUserId,
        friendUserId,
      );
      const friendUser = createMockUser(
        friendUserId,
        "friend@test.com",
        "FriendName",
      );

      vi.mocked(mockFriendRequestRepo.findFriendsForUser).mockResolvedValue(
        Result.ok({
          data: [friendRequest],
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
        Result.ok(Option.some(friendUser)),
      );
      vi.mocked(mockProfileRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.none()),
      );

      const result = await useCase.execute({ userId: currentUserId });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.friends).toHaveLength(1);
      const friendNoProfile = output.friends[0];
      expect(friendNoProfile).toBeDefined();
      expect(friendNoProfile?.displayName).toBeNull();
      expect(friendNoProfile?.avatarUrl).toBeNull();
    });

    it("should use default pagination when not provided", async () => {
      vi.mocked(mockFriendRequestRepo.findFriendsForUser).mockResolvedValue(
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

      expect(mockFriendRequestRepo.findFriendsForUser).toHaveBeenCalledWith(
        "user-1",
        { page: 1, limit: 20 },
      );
    });
  });

  describe("error handling", () => {
    it("should fail when findFriendsForUser fails", async () => {
      vi.mocked(mockFriendRequestRepo.findFriendsForUser).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute({ userId: "user-1" });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });

    it("should fail when userRepo.findById fails", async () => {
      const friendRequest = createAcceptedFriendRequest(
        "fr-1",
        "user-1",
        "friend-1",
      );

      vi.mocked(mockFriendRequestRepo.findFriendsForUser).mockResolvedValue(
        Result.ok({
          data: [friendRequest],
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

    it("should fail when profileRepo.findByUserId fails", async () => {
      const friendRequest = createAcceptedFriendRequest(
        "fr-1",
        "user-1",
        "friend-1",
      );
      const friendUser = createMockUser(
        "friend-1",
        "friend@test.com",
        "Friend",
      );

      vi.mocked(mockFriendRequestRepo.findFriendsForUser).mockResolvedValue(
        Result.ok({
          data: [friendRequest],
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
        Result.ok(Option.some(friendUser)),
      );
      vi.mocked(mockProfileRepo.findByUserId).mockResolvedValue(
        Result.fail("Profile lookup failed"),
      );

      const result = await useCase.execute({ userId: "user-1" });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Profile lookup failed");
    });
  });
});
