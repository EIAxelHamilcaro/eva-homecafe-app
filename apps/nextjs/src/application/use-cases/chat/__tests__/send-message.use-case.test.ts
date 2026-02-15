import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IConversationRepository } from "@/application/ports/conversation-repository.port";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IMessageRepository } from "@/application/ports/message-repository.port";
import type { INotificationRepository } from "@/application/ports/notification-repository.port";
import { Conversation } from "@/domain/conversation/conversation.aggregate";
import { Participant } from "@/domain/conversation/value-objects/participant.vo";
import type { Message } from "@/domain/message/message.entity";
import { SendMessageUseCase } from "../send-message.use-case";

describe("SendMessageUseCase", () => {
  let useCase: SendMessageUseCase;
  let mockConversationRepo: IConversationRepository;
  let mockMessageRepo: IMessageRepository;
  let mockNotificationRepo: INotificationRepository;
  let mockEventDispatcher: IEventDispatcher;
  let conversation: Conversation;

  beforeEach(() => {
    vi.clearAllMocks();
    const p1 = Participant.createNew("sender-1").getValue();
    const p2 = Participant.createNew("user-2").getValue();
    conversation = Conversation.create({
      participants: [p1, p2],
      createdBy: "sender-1",
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
    mockMessageRepo = {
      create: vi
        .fn()
        .mockImplementation((msg: Message) => Promise.resolve(Result.ok(msg))),
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
    mockNotificationRepo = {
      create: vi.fn().mockResolvedValue(Result.ok({})),
      update: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      findByUserId: vi.fn(),
      findUnreadByUserId: vi.fn(),
      markAsRead: vi.fn(),
      countUnread: vi.fn(),
    } as unknown as INotificationRepository;
    mockEventDispatcher = {
      dispatch: vi.fn(),
      dispatchAll: vi.fn(),
    };
    useCase = new SendMessageUseCase(
      mockConversationRepo,
      mockMessageRepo,
      mockNotificationRepo,
      mockEventDispatcher,
    );
  });

  describe("happy path", () => {
    it("should send a text message", async () => {
      const result = await useCase.execute({
        conversationId: conversation.id.value.toString(),
        senderId: "sender-1",
        content: "Hello!",
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.messageId).toBeDefined();
      expect(output.conversationId).toBe(conversation.id.value.toString());
      expect(output.senderId).toBe("sender-1");
      expect(output.content).toBe("Hello!");
      expect(mockMessageRepo.create).toHaveBeenCalledOnce();
    });

    it("should send a message with attachments only (no content)", async () => {
      const result = await useCase.execute({
        conversationId: conversation.id.value.toString(),
        senderId: "sender-1",
        attachments: [
          {
            id: "att-1",
            url: "https://cdn.example.com/img.jpg",
            mimeType: "image/jpeg",
            size: 1024,
            filename: "img.jpg",
          },
        ],
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.content).toBeNull();
      expect(output.attachments).toHaveLength(1);
      expect(mockMessageRepo.create).toHaveBeenCalledOnce();
    });
  });

  describe("validation errors", () => {
    it("should fail when message has no content and no attachments", async () => {
      const result = await useCase.execute({
        conversationId: conversation.id.value.toString(),
        senderId: "sender-1",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe(
        "Message must have content or at least one attachment",
      );
      expect(mockMessageRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should fail when conversation is not found", async () => {
      mockConversationRepo.findById = vi
        .fn()
        .mockResolvedValue(Result.ok(Option.none()));

      const result = await useCase.execute({
        conversationId: "non-existent",
        senderId: "sender-1",
        content: "Hello!",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Conversation not found");
    });

    it("should fail when user is not a participant", async () => {
      const result = await useCase.execute({
        conversationId: conversation.id.value.toString(),
        senderId: "user-999",
        content: "Hello!",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe(
        "User is not a participant in this conversation",
      );
    });

    it("should fail when messageRepo.create fails", async () => {
      mockMessageRepo.create = vi
        .fn()
        .mockResolvedValue(Result.fail("Database error"));

      const result = await useCase.execute({
        conversationId: conversation.id.value.toString(),
        senderId: "sender-1",
        content: "Hello!",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });
  });
});
