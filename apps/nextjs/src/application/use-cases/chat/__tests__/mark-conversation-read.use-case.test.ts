import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IConversationRepository } from "@/application/ports/conversation-repository.port";
import { Conversation } from "@/domain/conversation/conversation.aggregate";
import { Participant } from "@/domain/conversation/value-objects/participant.vo";
import { MarkConversationReadUseCase } from "../mark-conversation-read.use-case";

describe("MarkConversationReadUseCase", () => {
  let useCase: MarkConversationReadUseCase;
  let mockConversationRepo: IConversationRepository;
  let conversation: Conversation;

  beforeEach(() => {
    vi.clearAllMocks();
    const p1 = Participant.createNew("user-1").getValue();
    const p2 = Participant.createNew("user-2").getValue();
    conversation = Conversation.create({
      participants: [p1, p2],
      createdBy: "user-1",
    }).getValue();

    mockConversationRepo = {
      create: vi.fn(),
      update: vi.fn().mockResolvedValue(Result.ok(conversation)),
      delete: vi.fn(),
      findById: vi.fn().mockResolvedValue(Result.ok(Option.some(conversation))),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      findByParticipants: vi.fn(),
      findAllForUser: vi.fn(),
    } as unknown as IConversationRepository;
    useCase = new MarkConversationReadUseCase(mockConversationRepo);
  });

  describe("happy path", () => {
    it("should mark the conversation as read", async () => {
      const result = await useCase.execute({
        conversationId: conversation.id.value.toString(),
        userId: "user-1",
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.conversationId).toBe(conversation.id.value.toString());
      expect(output.userId).toBe("user-1");
      expect(output.readAt).toBeDefined();
      expect(mockConversationRepo.update).toHaveBeenCalledOnce();
    });
  });

  describe("error handling", () => {
    it("should fail when conversation is not found", async () => {
      mockConversationRepo.findById = vi
        .fn()
        .mockResolvedValue(Result.ok(Option.none()));

      const result = await useCase.execute({
        conversationId: "non-existent",
        userId: "user-1",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Conversation not found");
    });

    it("should fail when user is not a participant", async () => {
      const result = await useCase.execute({
        conversationId: conversation.id.value.toString(),
        userId: "user-999",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Participant not found in conversation");
      expect(mockConversationRepo.update).not.toHaveBeenCalled();
    });

    it("should fail when findById returns error", async () => {
      mockConversationRepo.findById = vi
        .fn()
        .mockResolvedValue(Result.fail("Database error"));

      const result = await useCase.execute({
        conversationId: conversation.id.value.toString(),
        userId: "user-1",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });

    it("should fail when update returns error", async () => {
      mockConversationRepo.update = vi
        .fn()
        .mockResolvedValue(Result.fail("Update failed"));

      const result = await useCase.execute({
        conversationId: conversation.id.value.toString(),
        userId: "user-1",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Update failed");
    });
  });
});
