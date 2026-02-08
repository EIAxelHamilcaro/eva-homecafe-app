import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IBoardRepository } from "@/application/ports/board-repository.port";
import type { Board } from "@/domain/board/board.aggregate";
import { AddCardToColumnUseCase } from "../add-card-to-column.use-case";
import { CreateKanbanBoardUseCase } from "../create-kanban-board.use-case";

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

async function createKanbanBoard(repo: IBoardRepository) {
  const createUC = new CreateKanbanBoardUseCase(repo);
  const result = await createUC.execute({
    title: "Test Board",
    userId: "user-123",
    columns: [],
  });
  const output = result.getValue();
  const board = vi.mocked(repo.create).mock.calls[0]?.[0] as Board;

  vi.mocked(repo.findById).mockResolvedValue(Result.ok(Option.some(board)));

  return {
    boardId: output.id,
    todoColumnId: output.columns[0]?.id as string,
    inProgressColumnId: output.columns[1]?.id as string,
    doneColumnId: output.columns[2]?.id as string,
  };
}

describe("AddCardToColumnUseCase", () => {
  let useCase: AddCardToColumnUseCase;
  let mockBoardRepo: IBoardRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockBoardRepo = createMockRepo();
    useCase = new AddCardToColumnUseCase(mockBoardRepo);
  });

  describe("happy path", () => {
    it("should add a card to specified column", async () => {
      const { boardId, todoColumnId } = await createKanbanBoard(mockBoardRepo);

      const result = await useCase.execute({
        boardId,
        columnId: todoColumnId,
        userId: "user-123",
        title: "New Card",
        progress: 0,
      });

      expect(result.isSuccess).toBe(true);
      const todoCol = result
        .getValue()
        .columns.find((c) => c.id === todoColumnId);
      expect(todoCol?.cards).toHaveLength(1);
      expect(todoCol?.cards[0]?.title).toBe("New Card");
    });

    it("should add card with description", async () => {
      const { boardId, todoColumnId } = await createKanbanBoard(mockBoardRepo);

      const result = await useCase.execute({
        boardId,
        columnId: todoColumnId,
        userId: "user-123",
        title: "Card with desc",
        description: "Some description",
        progress: 0,
      });

      expect(result.isSuccess).toBe(true);
      const card = result.getValue().columns.find((c) => c.id === todoColumnId)
        ?.cards[0];
      expect(card?.description).toBe("Some description");
    });

    it("should add card with progress and due date", async () => {
      const { boardId, todoColumnId } = await createKanbanBoard(mockBoardRepo);

      const result = await useCase.execute({
        boardId,
        columnId: todoColumnId,
        userId: "user-123",
        title: "Card with metadata",
        progress: 25,
        dueDate: "2026-04-01",
      });

      expect(result.isSuccess).toBe(true);
      const card = result.getValue().columns.find((c) => c.id === todoColumnId)
        ?.cards[0];
      expect(card?.progress).toBe(25);
      expect(card?.dueDate).toBe("2026-04-01");
    });

    it("should set card position correctly", async () => {
      const { boardId, todoColumnId } = await createKanbanBoard(mockBoardRepo);

      await useCase.execute({
        boardId,
        columnId: todoColumnId,
        userId: "user-123",
        title: "First Card",
        progress: 0,
      });

      const result = await useCase.execute({
        boardId,
        columnId: todoColumnId,
        userId: "user-123",
        title: "Second Card",
        progress: 0,
      });

      expect(result.isSuccess).toBe(true);
      const todoCol = result
        .getValue()
        .columns.find((c) => c.id === todoColumnId);
      expect(todoCol?.cards).toHaveLength(2);
      expect(todoCol?.cards[0]?.position).toBe(0);
      expect(todoCol?.cards[1]?.position).toBe(1);
    });

    it("should persist updates via repository", async () => {
      const { boardId, todoColumnId } = await createKanbanBoard(mockBoardRepo);

      await useCase.execute({
        boardId,
        columnId: todoColumnId,
        userId: "user-123",
        title: "New Card",
        progress: 0,
      });

      expect(mockBoardRepo.update).toHaveBeenCalledOnce();
    });
  });

  describe("validation errors", () => {
    it("should fail when board not found", async () => {
      vi.mocked(mockBoardRepo.findById).mockResolvedValue(
        Result.ok(Option.none()),
      );

      const result = await useCase.execute({
        boardId: "non-existent",
        columnId: "col-id",
        userId: "user-123",
        title: "New Card",
        progress: 0,
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Board not found");
    });

    it("should fail when user does not own the board", async () => {
      const { boardId, todoColumnId } = await createKanbanBoard(mockBoardRepo);

      const result = await useCase.execute({
        boardId,
        columnId: todoColumnId,
        userId: "other-user",
        title: "New Card",
        progress: 0,
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Forbidden");
    });

    it("should fail when column not found", async () => {
      const { boardId } = await createKanbanBoard(mockBoardRepo);

      const result = await useCase.execute({
        boardId,
        columnId: "non-existent-col",
        userId: "user-123",
        title: "New Card",
        progress: 0,
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Column not found");
    });

    it("should fail when card title is empty", async () => {
      const { boardId, todoColumnId } = await createKanbanBoard(mockBoardRepo);

      const result = await useCase.execute({
        boardId,
        columnId: todoColumnId,
        userId: "user-123",
        title: "",
        progress: 0,
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
        columnId: "col-id",
        userId: "user-123",
        title: "New Card",
        progress: 0,
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });

    it("should fail when repository update returns error", async () => {
      const { boardId, todoColumnId } = await createKanbanBoard(mockBoardRepo);
      vi.mocked(mockBoardRepo.update).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute({
        boardId,
        columnId: todoColumnId,
        userId: "user-123",
        title: "New Card",
        progress: 0,
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });
  });
});
