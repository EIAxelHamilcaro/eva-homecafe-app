import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IBoardRepository } from "@/application/ports/board-repository.port";
import type { Board } from "@/domain/board/board.aggregate";
import { AddColumnUseCase } from "../add-column.use-case";
import { CreateBoardUseCase } from "../create-board.use-case";
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

  return { boardId: output.id, board };
}

async function createTodoBoard(repo: IBoardRepository) {
  const createUC = new CreateBoardUseCase(repo);
  const result = await createUC.execute({
    title: "Todo Board",
    type: "todo",
    userId: "user-123",
    items: [],
  });
  const output = result.getValue();
  const board = vi.mocked(repo.create).mock.calls[0]?.[0] as Board;

  vi.mocked(repo.findById).mockResolvedValue(Result.ok(Option.some(board)));

  return { boardId: output.id, board };
}

describe("AddColumnUseCase", () => {
  let useCase: AddColumnUseCase;
  let mockBoardRepo: IBoardRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockBoardRepo = createMockRepo();
    useCase = new AddColumnUseCase(mockBoardRepo);
  });

  describe("happy path", () => {
    it("should add a column to a kanban board", async () => {
      const { boardId } = await createKanbanBoard(mockBoardRepo);

      const result = await useCase.execute({
        boardId,
        userId: "user-123",
        title: "Review",
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.columns).toHaveLength(4);
      expect(output.columns[3]?.title).toBe("Review");
    });

    it("should persist updates via repository", async () => {
      const { boardId } = await createKanbanBoard(mockBoardRepo);

      await useCase.execute({
        boardId,
        userId: "user-123",
        title: "Review",
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
        userId: "user-123",
        title: "Review",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Board not found");
    });

    it("should fail when user does not own the board", async () => {
      const { boardId } = await createKanbanBoard(mockBoardRepo);

      const result = await useCase.execute({
        boardId,
        userId: "other-user",
        title: "Review",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Forbidden");
    });

    it("should fail when board is not kanban type", async () => {
      const { boardId } = await createTodoBoard(mockBoardRepo);

      const result = await useCase.execute({
        boardId,
        userId: "user-123",
        title: "Review",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Can only add columns to kanban boards");
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
        title: "Review",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });

    it("should fail when repository update returns error", async () => {
      const { boardId } = await createKanbanBoard(mockBoardRepo);
      vi.mocked(mockBoardRepo.update).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute({
        boardId,
        userId: "user-123",
        title: "Review",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });
  });
});
