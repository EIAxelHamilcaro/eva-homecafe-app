import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IBoardRepository } from "@/application/ports/board-repository.port";
import type { Board } from "@/domain/board/board.aggregate";
import type { CardCompletedEvent } from "@/domain/board/events/card-completed.event";
import { AddCardToColumnUseCase } from "../add-card-to-column.use-case";
import { CreateKanbanBoardUseCase } from "../create-kanban-board.use-case";
import { UpdateCardUseCase } from "../update-card.use-case";

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

async function createBoardWithCard(repo: IBoardRepository) {
  const createUC = new CreateKanbanBoardUseCase(repo);
  const boardResult = await createUC.execute({
    title: "Test Board",
    userId: "user-123",
    columns: [],
  });
  const boardOutput = boardResult.getValue();
  const board = vi.mocked(repo.create).mock.calls[0]?.[0] as Board;

  const todoColumnId = boardOutput.columns[0]?.id as string;

  vi.mocked(repo.findById).mockResolvedValue(Result.ok(Option.some(board)));

  const addCardUC = new AddCardToColumnUseCase(repo);
  const cardResult = await addCardUC.execute({
    boardId: boardOutput.id,
    columnId: todoColumnId,
    userId: "user-123",
    title: "Test Card",
    progress: 0,
  });
  const cardOutput = cardResult.getValue();
  const cardId = cardOutput.columns.find((c) => c.id === todoColumnId)?.cards[0]
    ?.id as string;

  return { boardId: boardOutput.id, cardId, todoColumnId };
}

describe("UpdateCardUseCase", () => {
  let useCase: UpdateCardUseCase;
  let mockBoardRepo: IBoardRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockBoardRepo = createMockRepo();
    useCase = new UpdateCardUseCase(mockBoardRepo);
  });

  describe("happy path", () => {
    it("should update card title", async () => {
      const { boardId, cardId } = await createBoardWithCard(mockBoardRepo);

      const result = await useCase.execute({
        boardId,
        cardId,
        userId: "user-123",
        title: "Updated Title",
      });

      expect(result.isSuccess).toBe(true);
      const cards = result.getValue().columns.flatMap((c) => c.cards);
      const updatedCard = cards.find((c) => c.id === cardId);
      expect(updatedCard?.title).toBe("Updated Title");
    });

    it("should update card description", async () => {
      const { boardId, cardId } = await createBoardWithCard(mockBoardRepo);

      const result = await useCase.execute({
        boardId,
        cardId,
        userId: "user-123",
        description: "A detailed description",
      });

      expect(result.isSuccess).toBe(true);
      const cards = result.getValue().columns.flatMap((c) => c.cards);
      const updatedCard = cards.find((c) => c.id === cardId);
      expect(updatedCard?.description).toBe("A detailed description");
    });

    it("should update card progress", async () => {
      const { boardId, cardId } = await createBoardWithCard(mockBoardRepo);

      const result = await useCase.execute({
        boardId,
        cardId,
        userId: "user-123",
        progress: 50,
      });

      expect(result.isSuccess).toBe(true);
      const cards = result.getValue().columns.flatMap((c) => c.cards);
      const updatedCard = cards.find((c) => c.id === cardId);
      expect(updatedCard?.progress).toBe(50);
    });

    it("should update card due date", async () => {
      const { boardId, cardId } = await createBoardWithCard(mockBoardRepo);

      const result = await useCase.execute({
        boardId,
        cardId,
        userId: "user-123",
        dueDate: "2026-03-01",
      });

      expect(result.isSuccess).toBe(true);
      const cards = result.getValue().columns.flatMap((c) => c.cards);
      const updatedCard = cards.find((c) => c.id === cardId);
      expect(updatedCard?.dueDate).toBe("2026-03-01");
    });

    it("should emit CardCompletedEvent when progress reaches 100", async () => {
      const { boardId, cardId } = await createBoardWithCard(mockBoardRepo);

      await useCase.execute({
        boardId,
        cardId,
        userId: "user-123",
        progress: 100,
      });

      const updatedBoard = vi.mocked(mockBoardRepo.update).mock
        .calls[0]?.[0] as Board;
      const completionEvents = updatedBoard.domainEvents.filter(
        (e) => (e as unknown as CardCompletedEvent).type === "CardCompleted",
      );
      expect(completionEvents).toHaveLength(1);
    });

    it("should not emit CardCompletedEvent when progress below 100", async () => {
      const { boardId, cardId } = await createBoardWithCard(mockBoardRepo);

      await useCase.execute({
        boardId,
        cardId,
        userId: "user-123",
        progress: 50,
      });

      const updatedBoard = vi.mocked(mockBoardRepo.update).mock
        .calls[0]?.[0] as Board;
      const completionEvents = updatedBoard.domainEvents.filter(
        (e) => (e as unknown as CardCompletedEvent).type === "CardCompleted",
      );
      expect(completionEvents).toHaveLength(0);
    });

    it("should persist updates via repository", async () => {
      const { boardId, cardId } = await createBoardWithCard(mockBoardRepo);

      await useCase.execute({
        boardId,
        cardId,
        userId: "user-123",
        title: "New Title",
      });

      expect(mockBoardRepo.update).toHaveBeenCalled();
    });
  });

  describe("validation errors", () => {
    it("should fail when board not found", async () => {
      vi.mocked(mockBoardRepo.findById).mockResolvedValue(
        Result.ok(Option.none()),
      );

      const result = await useCase.execute({
        boardId: "non-existent",
        cardId: "card-id",
        userId: "user-123",
        title: "New Title",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Board not found");
    });

    it("should fail when user does not own the board", async () => {
      const { boardId, cardId } = await createBoardWithCard(mockBoardRepo);

      const result = await useCase.execute({
        boardId,
        cardId,
        userId: "other-user",
        title: "New Title",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Forbidden");
    });

    it("should fail when card not found", async () => {
      const { boardId } = await createBoardWithCard(mockBoardRepo);

      const result = await useCase.execute({
        boardId,
        cardId: "non-existent-card",
        userId: "user-123",
        title: "New Title",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Card not found");
    });

    it("should fail when title is empty", async () => {
      const { boardId, cardId } = await createBoardWithCard(mockBoardRepo);

      const result = await useCase.execute({
        boardId,
        cardId,
        userId: "user-123",
        title: "",
      });

      expect(result.isFailure).toBe(true);
    });

    it("should fail when progress is out of range", async () => {
      const { boardId, cardId } = await createBoardWithCard(mockBoardRepo);

      const result = await useCase.execute({
        boardId,
        cardId,
        userId: "user-123",
        progress: 150,
      });

      expect(result.isFailure).toBe(true);
    });
  });

  describe("error handling", () => {
    it("should fail when repository findById returns error", async () => {
      vi.mocked(mockBoardRepo.findById).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute({
        boardId: "some-id",
        cardId: "card-id",
        userId: "user-123",
        title: "New Title",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });

    it("should fail when repository update returns error", async () => {
      const { boardId, cardId } = await createBoardWithCard(mockBoardRepo);
      vi.mocked(mockBoardRepo.update).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute({
        boardId,
        cardId,
        userId: "user-123",
        title: "New Title",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });
  });
});
