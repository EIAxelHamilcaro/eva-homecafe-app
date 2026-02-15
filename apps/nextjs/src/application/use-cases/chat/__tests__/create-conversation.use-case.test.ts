import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IConversationRepository } from "@/application/ports/conversation-repository.port";
import { Conversation } from "@/domain/conversation/conversation.aggregate";
import { Participant } from "@/domain/conversation/value-objects/participant.vo";
import { CreateConversationUseCase } from "../create-conversation.use-case";

describe("CreateConversationUseCase", () => {
  let useCase: CreateConversationUseCase;
  let mockConversationRepo: IConversationRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockConversationRepo = {
      create: vi.fn().mockResolvedValue(Result.ok({})),
      update: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      findByParticipants: vi.fn(),
      findAllForUser: vi.fn(),
    } as unknown as IConversationRepository;
    useCase = new CreateConversationUseCase(mockConversationRepo);
  });

  describe("happy path", () => {
    it("should create a new conversation when none exists", async () => {
      mockConversationRepo.findByParticipants = vi
        .fn()
        .mockResolvedValue(Result.ok(Option.none()));

      const result = await useCase.execute({
        userId: "user-1",
        recipientId: "user-2",
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.conversationId).toBeDefined();
      expect(output.isNew).toBe(true);
      expect(mockConversationRepo.create).toHaveBeenCalledOnce();
    });

    it("should return existing conversation when one exists between participants", async () => {
      const p1 = Participant.createNew("user-1").getValue();
      const p2 = Participant.createNew("user-2").getValue();
      const conv = Conversation.create({
        participants: [p1, p2],
        createdBy: "user-1",
      }).getValue();

      mockConversationRepo.findByParticipants = vi
        .fn()
        .mockResolvedValue(Result.ok(Option.some(conv)));

      const result = await useCase.execute({
        userId: "user-1",
        recipientId: "user-2",
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.conversationId).toBe(conv.id.value.toString());
      expect(output.isNew).toBe(false);
      expect(mockConversationRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("validation errors", () => {
    it("should fail when userId equals recipientId", async () => {
      const result = await useCase.execute({
        userId: "user-1",
        recipientId: "user-1",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe(
        "Cannot create conversation with yourself",
      );
      expect(mockConversationRepo.findByParticipants).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should fail when findByParticipants returns error", async () => {
      mockConversationRepo.findByParticipants = vi
        .fn()
        .mockResolvedValue(Result.fail("Database error"));

      const result = await useCase.execute({
        userId: "user-1",
        recipientId: "user-2",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });

    it("should fail when create returns error", async () => {
      mockConversationRepo.findByParticipants = vi
        .fn()
        .mockResolvedValue(Result.ok(Option.none()));
      mockConversationRepo.create = vi
        .fn()
        .mockResolvedValue(Result.fail("Database error"));

      const result = await useCase.execute({
        userId: "user-1",
        recipientId: "user-2",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });
  });
});
