import { createPaginatedResult, Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IConversationRepository } from "@/application/ports/conversation-repository.port";
import type { IMessageRepository } from "@/application/ports/message-repository.port";
import { Conversation } from "@/domain/conversation/conversation.aggregate";
import { Participant } from "@/domain/conversation/value-objects/participant.vo";
import { Message } from "@/domain/message/message.entity";
import { MessageContent } from "@/domain/message/value-objects/message-content.vo";
import { GetMessagesUseCase } from "../get-messages.use-case";

describe("GetMessagesUseCase", () => {
  let useCase: GetMessagesUseCase;
  let mockConversationRepo: IConversationRepository;
  let mockMessageRepo: IMessageRepository;
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
    mockMessageRepo = {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      findByConversation: vi.fn(),
    } as unknown as IMessageRepository;
    useCase = new GetMessagesUseCase(mockConversationRepo, mockMessageRepo);
  });

  describe("happy path", () => {
    it("should return paginated messages", async () => {
      const content = MessageContent.create("Hello" as string).getValue();
      const message = Message.create({
        conversationId: conversation.id.value.toString(),
        senderId: "user-1",
        content: Option.some(content),
      }).getValue();

      mockMessageRepo.findByConversation = vi
        .fn()
        .mockResolvedValue(
          Result.ok(
            createPaginatedResult([message], { page: 1, limit: 20 }, 1),
          ),
        );

      const result = await useCase.execute({
        conversationId: conversation.id.value.toString(),
        userId: "user-1",
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.messages).toHaveLength(1);
      expect(output.messages[0]?.content).toBe("Hello");
      expect(output.pagination.total).toBe(1);
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
      expect(result.getError()).toBe(
        "User is not a participant in this conversation",
      );
    });

    it("should fail when conversationRepo.findById returns error", async () => {
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

    it("should fail when messageRepo.findByConversation returns error", async () => {
      mockMessageRepo.findByConversation = vi
        .fn()
        .mockResolvedValue(Result.fail("Database error"));

      const result = await useCase.execute({
        conversationId: conversation.id.value.toString(),
        userId: "user-1",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });
  });
});
