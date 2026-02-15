import { Option, Result, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IFriendRequestRepository } from "@/application/ports/friend-request-repository.port";
import { FriendRequest } from "@/domain/friend/friend-request.aggregate";
import { FriendRequestId } from "@/domain/friend/friend-request-id";
import { FriendRequestStatus } from "@/domain/friend/value-objects/friend-request-status.vo";
import { RemoveFriendUseCase } from "../remove-friend.use-case";

describe("RemoveFriendUseCase", () => {
  let useCase: RemoveFriendUseCase;
  let mockFriendRequestRepo: IFriendRequestRepository;

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

    useCase = new RemoveFriendUseCase(mockFriendRequestRepo);
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

  describe("happy path", () => {
    it("should remove friend by deleting accepted friend request", async () => {
      const friendRequest = createAcceptedFriendRequest(
        "fr-1",
        "user-1",
        "friend-1",
      );

      vi.mocked(mockFriendRequestRepo.findByUsers).mockResolvedValue(
        Result.ok(Option.some(friendRequest)),
      );
      vi.mocked(mockFriendRequestRepo.delete).mockResolvedValue(
        Result.ok(friendRequest.id),
      );

      const result = await useCase.execute({
        userId: "user-1",
        friendUserId: "friend-1",
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.success).toBe(true);
      expect(output.message).toContain("removed successfully");
      expect(mockFriendRequestRepo.delete).toHaveBeenCalledOnce();
    });
  });

  describe("validation errors", () => {
    it("should fail when friendship not found", async () => {
      vi.mocked(mockFriendRequestRepo.findByUsers).mockResolvedValue(
        Result.ok(Option.none()),
      );

      const result = await useCase.execute({
        userId: "user-1",
        friendUserId: "friend-1",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Friendship not found");
    });

    it("should fail when friendship is not accepted", async () => {
      const pendingRequest = createPendingFriendRequest(
        "fr-1",
        "user-1",
        "friend-1",
      );

      vi.mocked(mockFriendRequestRepo.findByUsers).mockResolvedValue(
        Result.ok(Option.some(pendingRequest)),
      );

      const result = await useCase.execute({
        userId: "user-1",
        friendUserId: "friend-1",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Friendship not found");
    });
  });

  describe("error handling", () => {
    it("should fail when findByUsers fails", async () => {
      vi.mocked(mockFriendRequestRepo.findByUsers).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute({
        userId: "user-1",
        friendUserId: "friend-1",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });

    it("should fail when delete fails", async () => {
      const friendRequest = createAcceptedFriendRequest(
        "fr-1",
        "user-1",
        "friend-1",
      );

      vi.mocked(mockFriendRequestRepo.findByUsers).mockResolvedValue(
        Result.ok(Option.some(friendRequest)),
      );
      vi.mocked(mockFriendRequestRepo.delete).mockResolvedValue(
        Result.fail("Delete failed"),
      );

      const result = await useCase.execute({
        userId: "user-1",
        friendUserId: "friend-1",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Delete failed");
    });
  });
});
