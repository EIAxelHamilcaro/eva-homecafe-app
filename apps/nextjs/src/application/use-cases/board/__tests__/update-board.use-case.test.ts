import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IBoardRepository } from "@/application/ports/board-repository.port";
import type { Board } from "@/domain/board/board.aggregate";
import { CreateBoardUseCase } from "../create-board.use-case";
import { UpdateBoardUseCase } from "../update-board.use-case";

function createMockRepo() {
  return {
    create: vi
      .fn()
      .mockImplementation((board: Board) => Promise.resolve(Result.ok(board))),
    update: vi
      .fn()
      .mockImplementation((board: Board) => Promise.resolve(Result.ok(board))),
    delete: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
    findMany: vi.fn(),
    findBy: vi.fn(),
    exists: vi.fn(),
    count: vi.fn(),
    findByUserId: vi.fn(),
  } as unknown as IBoardRepository;
}

async function createTestBoardViaUseCase(repo: IBoardRepository) {
  const createUC = new CreateBoardUseCase(repo);
  const result = await createUC.execute({
    title: "Test Board",
    type: "todo",
    userId: "user-123",
    items: [{ title: "Buy milk" }],
  });
  const output = result.getValue();
  const boardId = output.id;
  const cardId = (output.columns[0] as { cards: Array<{ id: string }> })
    .cards[0]?.id;

  const findResult = await vi.mocked(repo.create).mock.calls[0]?.[0];
  vi.mocked(repo.findById).mockResolvedValue(
    Result.ok(Option.some(findResult as Board)),
  );

  return { boardId, cardId: cardId as string, board: findResult as Board };
}

describe("UpdateBoardUseCase", () => {
  let useCase: UpdateBoardUseCase;
  let mockBoardRepo: IBoardRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockBoardRepo = createMockRepo();
    useCase = new UpdateBoardUseCase(mockBoardRepo);
  });

  describe("happy path", () => {
    it("should update board title", async () => {
      const { boardId } = await createTestBoardViaUseCase(mockBoardRepo);

      const result = await useCase.execute({
        boardId,
        userId: "user-123",
        title: "Updated Title",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().title).toBe("Updated Title");
      expect(mockBoardRepo.update).toHaveBeenCalledOnce();
    });

    it("should toggle card completion", async () => {
      const { boardId, cardId } =
        await createTestBoardViaUseCase(mockBoardRepo);

      const result = await useCase.execute({
        boardId,
        userId: "user-123",
        toggleCardIds: [cardId],
      });

      expect(result.isSuccess).toBe(true);
      const col = result.getValue().columns[0] as {
        cards: Array<{ isCompleted: boolean }>;
      };
      expect(col.cards[0]?.isCompleted).toBe(true);
    });

    it("should add new cards", async () => {
      const { boardId } = await createTestBoardViaUseCase(mockBoardRepo);

      const result = await useCase.execute({
        boardId,
        userId: "user-123",
        addCards: [{ title: "New item" }],
      });

      expect(result.isSuccess).toBe(true);
      const col = result.getValue().columns[0] as {
        cards: Array<{ title: string }>;
      };
      expect(col.cards).toHaveLength(2);
      expect(col.cards[1]?.title).toBe("New item");
    });

    it("should remove cards", async () => {
      const { boardId, cardId } =
        await createTestBoardViaUseCase(mockBoardRepo);

      const result = await useCase.execute({
        boardId,
        userId: "user-123",
        removeCardIds: [cardId],
      });

      expect(result.isSuccess).toBe(true);
      const col = result.getValue().columns[0] as {
        cards: Array<{ title: string }>;
      };
      expect(col.cards).toHaveLength(0);
    });

    it("should handle multiple operations at once", async () => {
      const { boardId } = await createTestBoardViaUseCase(mockBoardRepo);

      const result = await useCase.execute({
        boardId,
        userId: "user-123",
        title: "New Title",
        addCards: [{ title: "Added item" }],
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().title).toBe("New Title");
      const col = result.getValue().columns[0] as {
        cards: Array<{ title: string }>;
      };
      expect(col.cards).toHaveLength(2);
    });
  });

  describe("validation errors", () => {
    it("should fail when board not found", async () => {
      vi.mocked(mockBoardRepo.findById).mockResolvedValue(
        Result.ok(Option.none()),
      );

      const result = await useCase.execute({
        boardId: "non-existent",
        userId: "user-123",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Board not found");
    });

    it("should fail when user does not own the board", async () => {
      const { boardId } = await createTestBoardViaUseCase(mockBoardRepo);

      const result = await useCase.execute({
        boardId,
        userId: "other-user",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Forbidden");
    });

    it("should fail when title is empty", async () => {
      const { boardId } = await createTestBoardViaUseCase(mockBoardRepo);

      const result = await useCase.execute({
        boardId,
        userId: "user-123",
        title: "",
      });

      expect(result.isFailure).toBe(true);
    });

    it("should fail when toggling non-existent card", async () => {
      const { boardId } = await createTestBoardViaUseCase(mockBoardRepo);

      const result = await useCase.execute({
        boardId,
        userId: "user-123",
        toggleCardIds: ["non-existent-card"],
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Card not found");
    });

    it("should fail when removing non-existent card", async () => {
      const { boardId } = await createTestBoardViaUseCase(mockBoardRepo);

      const result = await useCase.execute({
        boardId,
        userId: "user-123",
        removeCardIds: ["non-existent-card"],
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Card not found");
    });
  });

  describe("error handling", () => {
    it("should fail when repository findById returns error", async () => {
      vi.mocked(mockBoardRepo.findById).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute({
        boardId: "some-id",
        userId: "user-123",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });

    it("should fail when repository update returns error", async () => {
      const { boardId } = await createTestBoardViaUseCase(mockBoardRepo);
      vi.mocked(mockBoardRepo.update).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute({
        boardId,
        userId: "user-123",
        title: "New Title",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });
  });
});
