import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IConversationRepository } from "@/application/ports/conversation-repository.port";
import { Conversation } from "@/domain/conversation/conversation.aggregate";
import { Participant } from "@/domain/conversation/value-objects/participant.vo";
import { DeleteConversationUseCase } from "../delete-conversation.use-case";

describe("DeleteConversationUseCase", () => {
  let useCase: DeleteConversationUseCase;
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
      update: vi.fn(),
      delete: vi.fn().mockResolvedValue(Result.ok(conversation.id)),
      findById: vi.fn().mockResolvedValue(Result.ok(Option.some(conversation))),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      findByParticipants: vi.fn(),
      findAllForUser: vi.fn(),
    } as unknown as IConversationRepository;
    useCase = new DeleteConversationUseCase(mockConversationRepo);
  });

  describe("happy path", () => {
    it("should delete the conversation", async () => {
      const result = await useCase.execute({
        conversationId: conversation.id.value.toString(),
        userId: "user-1",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().conversationId).toBe(
        conversation.id.value.toString(),
      );
      expect(mockConversationRepo.delete).toHaveBeenCalledOnce();
    });
  });

  describe("error handling", () => {
    it("should fail when conversation is not found", async () => {
      mockConversationRepo.findById = vi
        .fn()
        .mockResolvedValue(Result.ok(Option.none()));

      const result = await useCase.execute({
        conversationId: "non-existent-id",
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
      expect(result.getError()).toBe(
        "User is not a participant in this conversation",
      );
      expect(mockConversationRepo.delete).not.toHaveBeenCalled();
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

    it("should fail when delete returns error", async () => {
      mockConversationRepo.delete = vi
        .fn()
        .mockResolvedValue(Result.fail("Delete failed"));

      const result = await useCase.execute({
        conversationId: conversation.id.value.toString(),
        userId: "user-1",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Delete failed");
    });
  });
});
