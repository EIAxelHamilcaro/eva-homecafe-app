import { createPaginatedResult, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IConversationRepository } from "@/application/ports/conversation-repository.port";
import { Conversation } from "@/domain/conversation/conversation.aggregate";
import { Participant } from "@/domain/conversation/value-objects/participant.vo";
import { GetConversationsUseCase } from "../get-conversations.use-case";

describe("GetConversationsUseCase", () => {
  let useCase: GetConversationsUseCase;
  let mockConversationRepo: IConversationRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockConversationRepo = {
      create: vi.fn(),
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
    useCase = new GetConversationsUseCase(mockConversationRepo);
  });

  describe("happy path", () => {
    it("should return paginated conversations", async () => {
      const p1 = Participant.createNew("user-1").getValue();
      const p2 = Participant.createNew("user-2").getValue();
      const conv = Conversation.create({
        participants: [p1, p2],
        createdBy: "user-1",
      }).getValue();

      mockConversationRepo.findAllForUser = vi
        .fn()
        .mockResolvedValue(
          Result.ok(createPaginatedResult([conv], { page: 1, limit: 20 }, 1)),
        );

      const result = await useCase.execute({ userId: "user-1" });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.conversations).toHaveLength(1);
      expect(output.pagination.total).toBe(1);
    });

    it("should return empty list when no conversations exist", async () => {
      mockConversationRepo.findAllForUser = vi
        .fn()
        .mockResolvedValue(
          Result.ok(createPaginatedResult([], { page: 1, limit: 20 }, 0)),
        );

      const result = await useCase.execute({ userId: "user-1" });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.conversations).toHaveLength(0);
      expect(output.pagination.total).toBe(0);
    });
  });

  describe("error handling", () => {
    it("should fail when repository returns error", async () => {
      mockConversationRepo.findAllForUser = vi
        .fn()
        .mockResolvedValue(Result.fail("Database error"));

      const result = await useCase.execute({ userId: "user-1" });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });
  });
});
