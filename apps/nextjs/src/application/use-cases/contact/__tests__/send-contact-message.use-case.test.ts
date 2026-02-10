import { Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IEmailProvider } from "@/application/ports/email.provider.port";
import { SendContactMessageUseCase } from "../send-contact-message.use-case";

describe("SendContactMessageUseCase", () => {
  let useCase: SendContactMessageUseCase;
  let mockEmailProvider: IEmailProvider;
  const testSupportEmail = "support@test.com";

  const validInput = {
    name: "John Doe",
    email: "john@example.com",
    subject: "Help with my account",
    message: "I need help resetting my password. Can you assist me please?",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockEmailProvider = {
      send: vi.fn().mockResolvedValue(Result.ok()),
    };
    useCase = new SendContactMessageUseCase(
      mockEmailProvider,
      testSupportEmail,
    );
  });

  describe("happy path", () => {
    it("should send contact email to support and confirmation to sender", async () => {
      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(mockEmailProvider.send).toHaveBeenCalledTimes(2);
    });

    it("should send support email to injected support address", async () => {
      await useCase.execute(validInput);

      const calls = vi.mocked(mockEmailProvider.send).mock.calls;
      const firstCall = calls[0]?.[0];
      expect(firstCall?.to).toBe(testSupportEmail);
    });

    it("should send support email with contact form data", async () => {
      await useCase.execute(validInput);

      const calls = vi.mocked(mockEmailProvider.send).mock.calls;
      const firstCall = calls[0]?.[0];
      expect(firstCall?.subject).toContain(validInput.subject);
      expect(firstCall?.html).toContain(validInput.name);
      expect(firstCall?.html).toContain(validInput.email);
      expect(firstCall?.html).toContain(validInput.message);
    });

    it("should send confirmation email to the sender", async () => {
      await useCase.execute(validInput);

      const calls = vi.mocked(mockEmailProvider.send).mock.calls;
      const secondCall = calls[1]?.[0];
      expect(secondCall?.to).toBe(validInput.email);
      expect(secondCall?.html).toContain(validInput.name);
    });
  });

  describe("HTML escaping", () => {
    it("should escape HTML special characters in name", async () => {
      await useCase.execute({
        ...validInput,
        name: '<script>alert("xss")</script>',
      });

      const calls = vi.mocked(mockEmailProvider.send).mock.calls;
      const supportHtml = calls[0]?.[0]?.html ?? "";
      expect(supportHtml).not.toContain("<script>");
      expect(supportHtml).toContain("&lt;script&gt;");
      expect(supportHtml).toContain("&quot;xss&quot;");
    });

    it("should escape HTML special characters in message", async () => {
      await useCase.execute({
        ...validInput,
        message: "Test & <b>bold</b> with 'quotes'",
      });

      const calls = vi.mocked(mockEmailProvider.send).mock.calls;
      const supportHtml = calls[0]?.[0]?.html ?? "";
      expect(supportHtml).toContain("Test &amp; &lt;b&gt;bold&lt;/b&gt;");
      expect(supportHtml).toContain("&#39;quotes&#39;");
    });
  });

  describe("error handling", () => {
    it("should fail when support email send fails", async () => {
      mockEmailProvider.send = vi
        .fn()
        .mockResolvedValue(Result.fail("Email service unavailable"));

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Email service unavailable");
    });

    it("should still succeed if confirmation email returns failure", async () => {
      mockEmailProvider.send = vi
        .fn()
        .mockResolvedValueOnce(Result.ok())
        .mockResolvedValueOnce(Result.fail("Confirmation failed"));

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
    });

    it("should still succeed if confirmation email throws exception", async () => {
      mockEmailProvider.send = vi
        .fn()
        .mockResolvedValueOnce(Result.ok())
        .mockRejectedValueOnce(new Error("Network error"));

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
    });
  });
});
