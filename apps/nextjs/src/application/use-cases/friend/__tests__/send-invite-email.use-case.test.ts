import { Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IEmailProvider } from "@/application/ports/email.provider.port";
import type {
  IInviteTokenRepository,
  InviteToken,
} from "@/application/ports/invite-token-repository.port";
import { SendInviteEmailUseCase } from "../send-invite-email.use-case";

describe("SendInviteEmailUseCase", () => {
  let useCase: SendInviteEmailUseCase;
  let mockInviteTokenRepo: IInviteTokenRepository;
  let mockEmailProvider: IEmailProvider;
  const inviteBaseUrl = "evahomecafeapp://invite";

  beforeEach(() => {
    vi.clearAllMocks();
    mockInviteTokenRepo = {
      create: vi.fn(),
      findByToken: vi.fn(),
      markAsUsed: vi.fn(),
      deleteExpired: vi.fn(),
    } as unknown as IInviteTokenRepository;
    mockEmailProvider = {
      send: vi.fn(),
    } as unknown as IEmailProvider;

    useCase = new SendInviteEmailUseCase(
      mockInviteTokenRepo,
      mockEmailProvider,
      inviteBaseUrl,
    );
  });

  const mockInviteToken: InviteToken = {
    id: "token-id-123",
    userId: "user-123",
    token: "generated-token-uuid",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    usedAt: null,
    createdAt: new Date(),
  };

  describe("happy path", () => {
    it("should create invite token and send email successfully", async () => {
      vi.mocked(mockInviteTokenRepo.create).mockResolvedValue(
        Result.ok(mockInviteToken),
      );
      vi.mocked(mockEmailProvider.send).mockResolvedValue(Result.ok());

      const result = await useCase.execute({
        recipientEmail: "friend@example.com",
        userId: "user-123",
        senderName: "Alice",
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.success).toBe(true);
      expect(output.message).toContain("friend@example.com");

      expect(mockInviteTokenRepo.create).toHaveBeenCalledOnce();
      expect(mockInviteTokenRepo.create).toHaveBeenCalledWith(
        "user-123",
        expect.any(String),
        expect.any(Date),
      );

      expect(mockEmailProvider.send).toHaveBeenCalledOnce();
      expect(mockEmailProvider.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "friend@example.com",
          subject: expect.stringContaining("Alice"),
          html: expect.stringContaining("Alice"),
        }),
      );
    });

    it("should include invite URL in the email HTML", async () => {
      vi.mocked(mockInviteTokenRepo.create).mockResolvedValue(
        Result.ok(mockInviteToken),
      );
      vi.mocked(mockEmailProvider.send).mockResolvedValue(Result.ok());

      await useCase.execute({
        recipientEmail: "friend@example.com",
        userId: "user-123",
        senderName: "Alice",
      });

      const sendCalls = vi.mocked(mockEmailProvider.send).mock.calls;
      expect(sendCalls).toHaveLength(1);
      const emailPayload = sendCalls[0]?.[0];
      expect(emailPayload?.html).toContain(inviteBaseUrl);
    });
  });

  describe("error handling", () => {
    it("should fail when invite token creation fails", async () => {
      vi.mocked(mockInviteTokenRepo.create).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute({
        recipientEmail: "friend@example.com",
        userId: "user-123",
        senderName: "Alice",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
      expect(mockEmailProvider.send).not.toHaveBeenCalled();
    });

    it("should fail when email sending fails", async () => {
      vi.mocked(mockInviteTokenRepo.create).mockResolvedValue(
        Result.ok(mockInviteToken),
      );
      vi.mocked(mockEmailProvider.send).mockResolvedValue(
        Result.fail("Email service unavailable"),
      );

      const result = await useCase.execute({
        recipientEmail: "friend@example.com",
        userId: "user-123",
        senderName: "Alice",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Email service unavailable");
    });
  });
});
