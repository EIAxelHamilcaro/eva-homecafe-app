import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IBoardRepository } from "@/application/ports/board-repository.port";
import type { Board } from "@/domain/board/board.aggregate";
import { AddCardToColumnUseCase } from "../add-card-to-column.use-case";
import { CreateKanbanBoardUseCase } from "../create-kanban-board.use-case";
import { MoveCardUseCase } from "../move-card.use-case";

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

async function createKanbanBoardWithCard(repo: IBoardRepository) {
  const createUC = new CreateKanbanBoardUseCase(repo);
  const boardResult = await createUC.execute({
    title: "Test Board",
    userId: "user-123",
    columns: [],
  });
  const boardOutput = boardResult.getValue();
  const board = vi.mocked(repo.create).mock.calls[0]?.[0] as Board;

  const todoColumnId = boardOutput.columns[0]?.id as string;
  const inProgressColumnId = boardOutput.columns[1]?.id as string;
  const doneColumnId = boardOutput.columns[2]?.id as string;

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

  return {
    boardId: boardOutput.id,
    todoColumnId,
    inProgressColumnId,
    doneColumnId,
    cardId,
  };
}

describe("MoveCardUseCase", () => {
  let useCase: MoveCardUseCase;
  let mockBoardRepo: IBoardRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockBoardRepo = createMockRepo();
    useCase = new MoveCardUseCase(mockBoardRepo);
  });

  describe("happy path", () => {
    it("should move card between columns", async () => {
      const { boardId, inProgressColumnId, cardId } =
        await createKanbanBoardWithCard(mockBoardRepo);

      const result = await useCase.execute({
        boardId,
        cardId,
        toColumnId: inProgressColumnId,
        newPosition: 0,
        userId: "user-123",
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      const inProgressCol = output.columns.find(
        (c) => c.id === inProgressColumnId,
      );
      expect(inProgressCol?.cards).toHaveLength(1);
      expect(inProgressCol?.cards[0]?.id).toBe(cardId);
    });

    it("should reorder card within same column", async () => {
      const { boardId, todoColumnId } =
        await createKanbanBoardWithCard(mockBoardRepo);

      const addCardUC = new AddCardToColumnUseCase(mockBoardRepo);
      await addCardUC.execute({
        boardId,
        columnId: todoColumnId,
        userId: "user-123",
        title: "Second Card",
        progress: 0,
      });

      const reorderResult = await useCase.execute({
        boardId,
        cardId: (
          await mockBoardRepo.findById(
            {} as Parameters<typeof mockBoardRepo.findById>[0],
          )
        )
          .getValue()
          .unwrap()
          .get("columns")
          .find((c) => c.id.value.toString() === todoColumnId)
          ?.get("cards")[0]
          ?.id.value.toString() as string,
        toColumnId: todoColumnId,
        newPosition: 1,
        userId: "user-123",
      });

      expect(reorderResult.isSuccess).toBe(true);
    });

    it("should persist updates via repository", async () => {
      const { boardId, inProgressColumnId, cardId } =
        await createKanbanBoardWithCard(mockBoardRepo);

      await useCase.execute({
        boardId,
        cardId,
        toColumnId: inProgressColumnId,
        newPosition: 0,
        userId: "user-123",
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
        toColumnId: "col-id",
        newPosition: 0,
        userId: "user-123",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Board not found");
    });

    it("should fail when user does not own the board", async () => {
      const { boardId, inProgressColumnId, cardId } =
        await createKanbanBoardWithCard(mockBoardRepo);

      const result = await useCase.execute({
        boardId,
        cardId,
        toColumnId: inProgressColumnId,
        newPosition: 0,
        userId: "other-user",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Forbidden");
    });

    it("should fail when card not found", async () => {
      const { boardId, inProgressColumnId } =
        await createKanbanBoardWithCard(mockBoardRepo);

      const result = await useCase.execute({
        boardId,
        cardId: "non-existent-card",
        toColumnId: inProgressColumnId,
        newPosition: 0,
        userId: "user-123",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Card not found");
    });

    it("should fail when target column not found", async () => {
      const { boardId, cardId } =
        await createKanbanBoardWithCard(mockBoardRepo);

      const result = await useCase.execute({
        boardId,
        cardId,
        toColumnId: "non-existent-col",
        newPosition: 0,
        userId: "user-123",
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
        toColumnId: "col-id",
        newPosition: 0,
        userId: "user-123",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });

    it("should fail when repository update returns error", async () => {
      const { boardId, inProgressColumnId, cardId } =
        await createKanbanBoardWithCard(mockBoardRepo);
      vi.mocked(mockBoardRepo.update).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute({
        boardId,
        cardId,
        toColumnId: inProgressColumnId,
        newPosition: 0,
        userId: "user-123",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });
  });
});
