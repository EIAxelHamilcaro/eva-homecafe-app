import { Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IInviteTokenRepository } from "@/application/ports/invite-token-repository.port";
import { GetInviteLinkUseCase } from "../get-invite-link.use-case";

describe("GetInviteLinkUseCase", () => {
  let useCase: GetInviteLinkUseCase;
  let mockInviteTokenRepo: IInviteTokenRepository;
  const inviteBaseUrl = "evahomecafeapp://invite";

  beforeEach(() => {
    vi.clearAllMocks();
    mockInviteTokenRepo = {
      create: vi.fn(),
      findByToken: vi.fn(),
      markAsUsed: vi.fn(),
      deleteExpired: vi.fn(),
    } as unknown as IInviteTokenRepository;

    useCase = new GetInviteLinkUseCase(mockInviteTokenRepo, inviteBaseUrl);
  });

  describe("happy path", () => {
    it("should generate an invite link successfully", async () => {
      vi.mocked(mockInviteTokenRepo.create).mockResolvedValue(Result.ok());

      const result = await useCase.execute({ userId: "user-123" });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.inviteUrl).toContain(inviteBaseUrl);
      expect(output.token).toBeDefined();
      expect(output.token.length).toBeGreaterThan(0);
      expect(output.expiresAt).toBeDefined();
      expect(mockInviteTokenRepo.create).toHaveBeenCalledOnce();
    });

    it("should generate unique tokens on each call", async () => {
      vi.mocked(mockInviteTokenRepo.create).mockResolvedValue(Result.ok());

      const result1 = await useCase.execute({ userId: "user-123" });
      const result2 = await useCase.execute({ userId: "user-123" });

      expect(result1.isSuccess).toBe(true);
      expect(result2.isSuccess).toBe(true);
      expect(result1.getValue().token).not.toBe(result2.getValue().token);
    });

    it("should set expiry to 24 hours from now", async () => {
      vi.mocked(mockInviteTokenRepo.create).mockResolvedValue(Result.ok());

      const beforeExecution = new Date();
      const result = await useCase.execute({ userId: "user-123" });
      const afterExecution = new Date();

      expect(result.isSuccess).toBe(true);
      const expiresAt = new Date(result.getValue().expiresAt);

      const expectedExpiryMin = new Date(beforeExecution);
      expectedExpiryMin.setHours(expectedExpiryMin.getHours() + 24);

      const expectedExpiryMax = new Date(afterExecution);
      expectedExpiryMax.setHours(expectedExpiryMax.getHours() + 24);

      expect(expiresAt.getTime()).toBeGreaterThanOrEqual(
        expectedExpiryMin.getTime() - 1000,
      );
      expect(expiresAt.getTime()).toBeLessThanOrEqual(
        expectedExpiryMax.getTime() + 1000,
      );
    });

    it("should format invite URL correctly", async () => {
      vi.mocked(mockInviteTokenRepo.create).mockResolvedValue(Result.ok());

      const result = await useCase.execute({ userId: "user-123" });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.inviteUrl).toBe(`${inviteBaseUrl}/${output.token}`);
    });
  });

  describe("error handling", () => {
    it("should fail when repository create returns error", async () => {
      vi.mocked(mockInviteTokenRepo.create).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute({ userId: "user-123" });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });
  });
});
