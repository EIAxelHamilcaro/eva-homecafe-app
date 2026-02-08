import { createPaginatedResult, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IBoardRepository } from "@/application/ports/board-repository.port";
import type { Board } from "@/domain/board/board.aggregate";
import { CreateBoardUseCase } from "../create-board.use-case";
import { GetUserBoardsUseCase } from "../get-user-boards.use-case";

function createMockRepo() {
  return {
    create: vi
      .fn()
      .mockImplementation((board: Board) => Promise.resolve(Result.ok(board))),
    update: vi.fn(),
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

async function createTestBoard(
  repo: IBoardRepository,
  type: "todo" | "kanban" = "todo",
) {
  const createUC = new CreateBoardUseCase(repo);
  await createUC.execute({
    title: "Test Board",
    type,
    userId: "user-123",
    items: [],
  });
  return vi.mocked(repo.create).mock.calls.at(-1)?.[0] as Board;
}

describe("GetUserBoardsUseCase", () => {
  let useCase: GetUserBoardsUseCase;
  let mockBoardRepo: IBoardRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockBoardRepo = createMockRepo();
    useCase = new GetUserBoardsUseCase(mockBoardRepo);
  });

  describe("happy path", () => {
    it("should return paginated boards for user", async () => {
      const board = await createTestBoard(mockBoardRepo);
      vi.mocked(mockBoardRepo.findByUserId).mockResolvedValue(
        Result.ok(createPaginatedResult([board], { page: 1, limit: 20 }, 1)),
      );

      const result = await useCase.execute({
        userId: "user-123",
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.boards).toHaveLength(1);
      expect(output.boards[0]?.title).toBe("Test Board");
      expect(output.boards[0]?.type).toBe("todo");
      expect(output.pagination.total).toBe(1);
    });

    it("should return empty list when user has no boards", async () => {
      vi.mocked(mockBoardRepo.findByUserId).mockResolvedValue(
        Result.ok(createPaginatedResult([], { page: 1, limit: 20 }, 0)),
      );

      const result = await useCase.execute({
        userId: "user-123",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().boards).toHaveLength(0);
    });

    it("should pass pagination params to repository", async () => {
      vi.mocked(mockBoardRepo.findByUserId).mockResolvedValue(
        Result.ok(createPaginatedResult([], { page: 2, limit: 10 }, 0)),
      );

      await useCase.execute({
        userId: "user-123",
        page: 2,
        limit: 10,
      });

      expect(mockBoardRepo.findByUserId).toHaveBeenCalledWith(
        "user-123",
        { page: 2, limit: 10 },
        undefined,
      );
    });

    it("should pass type filter to repository", async () => {
      const todoBoard = await createTestBoard(mockBoardRepo, "todo");
      vi.mocked(mockBoardRepo.findByUserId).mockResolvedValue(
        Result.ok(
          createPaginatedResult([todoBoard], { page: 1, limit: 20 }, 1),
        ),
      );

      const result = await useCase.execute({
        userId: "user-123",
        type: "todo",
      });

      expect(result.isSuccess).toBe(true);
      expect(mockBoardRepo.findByUserId).toHaveBeenCalledWith(
        "user-123",
        { page: 1, limit: 20 },
        "todo",
      );
      expect(result.getValue().boards).toHaveLength(1);
      expect(result.getValue().boards[0]?.type).toBe("todo");
    });

    it("should map board columns and cards to DTO", async () => {
      const board = await createTestBoard(mockBoardRepo);
      vi.mocked(mockBoardRepo.findByUserId).mockResolvedValue(
        Result.ok(createPaginatedResult([board], { page: 1, limit: 20 }, 1)),
      );

      const result = await useCase.execute({ userId: "user-123" });

      expect(result.isSuccess).toBe(true);
      const boardDto = result.getValue().boards[0];
      expect(boardDto?.columns).toHaveLength(1);
      expect(boardDto?.columns[0]?.title).toBe("Items");
    });
  });

  describe("error handling", () => {
    it("should fail when repository returns error", async () => {
      vi.mocked(mockBoardRepo.findByUserId).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute({ userId: "user-123" });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });
  });
});
