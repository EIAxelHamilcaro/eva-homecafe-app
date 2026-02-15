import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IMessageRepository } from "@/application/ports/message-repository.port";
import { Message } from "@/domain/message/message.entity";
import { MessageContent } from "@/domain/message/value-objects/message-content.vo";
import { AddReactionUseCase } from "../add-reaction.use-case";

describe("AddReactionUseCase", () => {
  let useCase: AddReactionUseCase;
  let mockMessageRepo: IMessageRepository;
  let message: Message;

  beforeEach(() => {
    vi.clearAllMocks();
    const content = MessageContent.create("Hello").getValue();
    message = Message.create({
      conversationId: "conv-1",
      senderId: "user-1",
      content: Option.some(content),
    }).getValue();

    mockMessageRepo = {
      create: vi.fn(),
      update: vi
        .fn()
        .mockImplementation((msg: Message) => Promise.resolve(Result.ok(msg))),
      delete: vi.fn(),
      findById: vi.fn().mockResolvedValue(Result.ok(Option.some(message))),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      findByConversation: vi.fn(),
    } as unknown as IMessageRepository;
    useCase = new AddReactionUseCase(mockMessageRepo);
  });

  describe("happy path", () => {
    it("should add a reaction and return action 'added'", async () => {
      const result = await useCase.execute({
        messageId: message.id.value.toString(),
        userId: "user-2",
        emoji: "\u{1F44D}",
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.action).toBe("added");
      expect(output.emoji).toBe("\u{1F44D}");
      expect(output.userId).toBe("user-2");
      expect(mockMessageRepo.update).toHaveBeenCalledOnce();
    });

    it("should remove an existing reaction and return action 'removed'", async () => {
      message.addReaction("user-2", "\u{1F44D}");

      const result = await useCase.execute({
        messageId: message.id.value.toString(),
        userId: "user-2",
        emoji: "\u{1F44D}",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().action).toBe("removed");
      expect(mockMessageRepo.update).toHaveBeenCalledOnce();
    });
  });

  describe("error handling", () => {
    it("should fail when message is not found", async () => {
      mockMessageRepo.findById = vi
        .fn()
        .mockResolvedValue(Result.ok(Option.none()));

      const result = await useCase.execute({
        messageId: "non-existent",
        userId: "user-2",
        emoji: "\u{1F44D}",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Message not found");
    });

    it("should fail when findById returns error", async () => {
      mockMessageRepo.findById = vi
        .fn()
        .mockResolvedValue(Result.fail("Database error"));

      const result = await useCase.execute({
        messageId: message.id.value.toString(),
        userId: "user-2",
        emoji: "\u{1F44D}",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });

    it("should fail when update returns error", async () => {
      mockMessageRepo.update = vi
        .fn()
        .mockResolvedValue(Result.fail("Update failed"));

      const result = await useCase.execute({
        messageId: message.id.value.toString(),
        userId: "user-2",
        emoji: "\u{1F44D}",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Update failed");
    });
  });
});
