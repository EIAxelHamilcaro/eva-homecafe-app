import { Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ICreateKanbanBoardInputDto } from "@/application/dto/board/create-kanban-board.dto";
import type { IBoardRepository } from "@/application/ports/board-repository.port";
import type { Board } from "@/domain/board/board.aggregate";
import type { BoardCreatedEvent } from "@/domain/board/events/board-created.event";
import { CreateKanbanBoardUseCase } from "../create-kanban-board.use-case";

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

describe("CreateKanbanBoardUseCase", () => {
  let useCase: CreateKanbanBoardUseCase;
  let mockBoardRepo: IBoardRepository;

  const validInput: ICreateKanbanBoardInputDto = {
    title: "Sprint 1",
    userId: "user-123",
    columns: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockBoardRepo = createMockRepo();
    useCase = new CreateKanbanBoardUseCase(mockBoardRepo);
  });

  describe("happy path", () => {
    it("should create a kanban board with default columns when none specified", async () => {
      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.title).toBe("Sprint 1");
      expect(output.type).toBe("kanban");
      expect(output.columns).toHaveLength(3);
      expect(output.columns[0]?.title).toBe("To Do");
      expect(output.columns[1]?.title).toBe("In Progress");
      expect(output.columns[2]?.title).toBe("Done");
    });

    it("should create a kanban board with custom columns", async () => {
      const result = await useCase.execute({
        ...validInput,
        columns: [
          { title: "Backlog" },
          { title: "Review" },
          { title: "Deployed" },
        ],
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.columns).toHaveLength(3);
      expect(output.columns[0]?.title).toBe("Backlog");
      expect(output.columns[1]?.title).toBe("Review");
      expect(output.columns[2]?.title).toBe("Deployed");
    });

    it("should set column positions sequentially", async () => {
      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.columns[0]?.position).toBe(0);
      expect(output.columns[1]?.position).toBe(1);
      expect(output.columns[2]?.position).toBe(2);
    });

    it("should persist the board via repository", async () => {
      await useCase.execute(validInput);

      expect(mockBoardRepo.create).toHaveBeenCalledOnce();
    });

    it("should add BoardCreatedEvent", async () => {
      await useCase.execute(validInput);

      const createdBoard = vi.mocked(mockBoardRepo.create).mock
        .calls[0]?.[0] as Board;
      expect(createdBoard.domainEvents).toHaveLength(1);

      const event = createdBoard
        .domainEvents[0] as unknown as BoardCreatedEvent;
      expect(event.type).toBe("BoardCreated");
      expect(event.userId).toBe("user-123");
      expect(event.boardType).toBe("kanban");
    });

    it("should create columns with empty cards", async () => {
      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      for (const col of result.getValue().columns) {
        expect(col.cards).toHaveLength(0);
      }
    });
  });

  describe("validation errors", () => {
    it("should fail when title is empty", async () => {
      const result = await useCase.execute({
        ...validInput,
        title: "",
      });

      expect(result.isFailure).toBe(true);
      expect(mockBoardRepo.create).not.toHaveBeenCalled();
    });

    it("should fail when title exceeds 100 characters", async () => {
      const result = await useCase.execute({
        ...validInput,
        title: "a".repeat(101),
      });

      expect(result.isFailure).toBe(true);
      expect(mockBoardRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should fail when repository returns error", async () => {
      vi.mocked(mockBoardRepo.create).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });
  });
});
