import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IPushTokenRepository } from "@/application/ports/push-token-repository.port";
import { PushToken } from "@/domain/push-token/push-token.aggregate";
import { UnregisterPushTokenUseCase } from "../unregister-push-token.use-case";

describe("UnregisterPushTokenUseCase", () => {
  let useCase: UnregisterPushTokenUseCase;
  let mockPushTokenRepo: {
    findByToken: ReturnType<typeof vi.fn>;
    deleteByToken: ReturnType<typeof vi.fn>;
  };

  const validInput = {
    token: "ExponentPushToken[xxxx]",
    userId: "user-1",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPushTokenRepo = {
      findByToken: vi.fn(),
      deleteByToken: vi.fn(),
    };
    useCase = new UnregisterPushTokenUseCase(
      mockPushTokenRepo as unknown as IPushTokenRepository,
    );
  });

  describe("happy path", () => {
    it("should successfully unregister a push token owned by user", async () => {
      const existingToken = PushToken.create({
        userId: "user-1",
        token: validInput.token,
        platform: "ios",
      });

      mockPushTokenRepo.findByToken.mockResolvedValue(
        Result.ok(Option.some(existingToken)),
      );
      mockPushTokenRepo.deleteByToken.mockResolvedValue(Result.ok());

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual({ success: true });
      expect(mockPushTokenRepo.deleteByToken).toHaveBeenCalledWith(
        validInput.token,
      );
    });

    it("should succeed when token does not exist (idempotent)", async () => {
      mockPushTokenRepo.findByToken.mockResolvedValue(Result.ok(Option.none()));
      mockPushTokenRepo.deleteByToken.mockResolvedValue(Result.ok());

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual({ success: true });
    });
  });

  describe("security", () => {
    it("should fail when token belongs to a different user", async () => {
      const otherUserToken = PushToken.create({
        userId: "other-user",
        token: validInput.token,
        platform: "ios",
      });

      mockPushTokenRepo.findByToken.mockResolvedValue(
        Result.ok(Option.some(otherUserToken)),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Token does not belong to user");
      expect(mockPushTokenRepo.deleteByToken).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should fail when findByToken returns error", async () => {
      mockPushTokenRepo.findByToken.mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });

    it("should fail when deleteByToken returns error", async () => {
      mockPushTokenRepo.findByToken.mockResolvedValue(Result.ok(Option.none()));
      mockPushTokenRepo.deleteByToken.mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });
  });
});
