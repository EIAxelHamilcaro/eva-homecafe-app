import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IBoardRepository } from "@/application/ports/board-repository.port";
import type { Board } from "@/domain/board/board.aggregate";
import { CreateBoardUseCase } from "../create-board.use-case";
import { DeleteBoardUseCase } from "../delete-board.use-case";

function createMockRepo() {
  return {
    create: vi
      .fn()
      .mockImplementation((board: Board) => Promise.resolve(Result.ok(board))),
    update: vi.fn(),
    delete: vi
      .fn()
      .mockImplementation((id: unknown) => Promise.resolve(Result.ok(id))),
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
    items: [],
  });
  const output = result.getValue();
  const board = vi.mocked(repo.create).mock.calls[0]?.[0] as Board;

  vi.mocked(repo.findById).mockResolvedValue(Result.ok(Option.some(board)));

  return { boardId: output.id, board };
}

describe("DeleteBoardUseCase", () => {
  let useCase: DeleteBoardUseCase;
  let mockBoardRepo: IBoardRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockBoardRepo = createMockRepo();
    useCase = new DeleteBoardUseCase(mockBoardRepo);
  });

  describe("happy path", () => {
    it("should delete board owned by user", async () => {
      const { boardId } = await createTestBoardViaUseCase(mockBoardRepo);

      const result = await useCase.execute({
        boardId,
        userId: "user-123",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id).toBe(boardId);
      expect(mockBoardRepo.delete).toHaveBeenCalledOnce();
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
      expect(mockBoardRepo.delete).not.toHaveBeenCalled();
    });

    it("should fail when user does not own the board", async () => {
      const { boardId } = await createTestBoardViaUseCase(mockBoardRepo);

      const result = await useCase.execute({
        boardId,
        userId: "other-user",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Forbidden");
      expect(mockBoardRepo.delete).not.toHaveBeenCalled();
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

    it("should fail when repository delete returns error", async () => {
      const { boardId } = await createTestBoardViaUseCase(mockBoardRepo);
      vi.mocked(mockBoardRepo.delete).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute({
        boardId,
        userId: "user-123",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });
  });
});
