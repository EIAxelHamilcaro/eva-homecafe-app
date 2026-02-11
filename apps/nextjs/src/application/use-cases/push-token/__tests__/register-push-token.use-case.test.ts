import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IPushTokenRepository } from "@/application/ports/push-token-repository.port";
import { PushToken } from "@/domain/push-token/push-token.aggregate";
import { RegisterPushTokenUseCase } from "../register-push-token.use-case";

describe("RegisterPushTokenUseCase", () => {
  let useCase: RegisterPushTokenUseCase;
  let mockPushTokenRepo: {
    findByToken: ReturnType<typeof vi.fn>;
    deleteByToken: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };

  const validInput = {
    userId: "user-1",
    token: "ExponentPushToken[xxxx]",
    platform: "ios" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPushTokenRepo = {
      findByToken: vi.fn(),
      deleteByToken: vi.fn(),
      create: vi.fn(),
    };
    useCase = new RegisterPushTokenUseCase(
      mockPushTokenRepo as unknown as IPushTokenRepository,
    );
  });

  describe("happy path", () => {
    it("should create a new push token when token does not exist", async () => {
      mockPushTokenRepo.findByToken.mockResolvedValue(Result.ok(Option.none()));
      mockPushTokenRepo.create.mockResolvedValue(
        Result.ok(
          PushToken.create({
            userId: validInput.userId,
            token: validInput.token,
            platform: validInput.platform,
          }),
        ),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toHaveProperty("id");
      expect(mockPushTokenRepo.create).toHaveBeenCalledOnce();
    });

    it("should return existing token id when token already registered for same user", async () => {
      const existingToken = PushToken.create({
        userId: validInput.userId,
        token: validInput.token,
        platform: validInput.platform,
      });

      mockPushTokenRepo.findByToken.mockResolvedValue(
        Result.ok(Option.some(existingToken)),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id).toBe(existingToken.id.value.toString());
      expect(mockPushTokenRepo.create).not.toHaveBeenCalled();
    });

    it("should replace token when it belongs to a different user", async () => {
      const existingToken = PushToken.create({
        userId: "other-user",
        token: validInput.token,
        platform: validInput.platform,
      });

      mockPushTokenRepo.findByToken.mockResolvedValue(
        Result.ok(Option.some(existingToken)),
      );
      mockPushTokenRepo.deleteByToken.mockResolvedValue(Result.ok());
      mockPushTokenRepo.create.mockResolvedValue(
        Result.ok(
          PushToken.create({
            userId: validInput.userId,
            token: validInput.token,
            platform: validInput.platform,
          }),
        ),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(mockPushTokenRepo.deleteByToken).toHaveBeenCalledWith(
        validInput.token,
      );
      expect(mockPushTokenRepo.create).toHaveBeenCalledOnce();
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
      const existingToken = PushToken.create({
        userId: "other-user",
        token: validInput.token,
        platform: validInput.platform,
      });

      mockPushTokenRepo.findByToken.mockResolvedValue(
        Result.ok(Option.some(existingToken)),
      );
      mockPushTokenRepo.deleteByToken.mockResolvedValue(
        Result.fail("Delete failed"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Delete failed");
    });

    it("should fail when create returns error", async () => {
      mockPushTokenRepo.findByToken.mockResolvedValue(Result.ok(Option.none()));
      mockPushTokenRepo.create.mockResolvedValue(Result.fail("Create failed"));

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Create failed");
    });
  });
});
