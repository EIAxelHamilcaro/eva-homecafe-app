import { Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ICreateBoardInputDto } from "@/application/dto/board/create-board.dto";
import type { IBoardRepository } from "@/application/ports/board-repository.port";
import type { Board } from "@/domain/board/board.aggregate";
import type { BoardCreatedEvent } from "@/domain/board/events/board-created.event";
import { CreateBoardUseCase } from "../create-board.use-case";

describe("CreateBoardUseCase", () => {
  let useCase: CreateBoardUseCase;
  let mockBoardRepo: IBoardRepository;

  const validInput: ICreateBoardInputDto = {
    title: "Groceries",
    type: "todo",
    userId: "user-123",
    items: [{ title: "Milk" }, { title: "Eggs" }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockBoardRepo = {
      create: vi
        .fn()
        .mockImplementation((board: Board) =>
          Promise.resolve(Result.ok(board)),
        ),
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
    useCase = new CreateBoardUseCase(mockBoardRepo);
  });

  describe("happy path", () => {
    it("should create a todo board with items", async () => {
      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.title).toBe("Groceries");
      expect(output.type).toBe("todo");
      expect(output.id).toBeDefined();
      expect(output.createdAt).toBeDefined();
      expect(output.columns).toHaveLength(1);
      const column = output.columns[0] as (typeof output.columns)[0];
      expect(column.title).toBe("Items");
      expect(column.cards).toHaveLength(2);
      expect((column.cards[0] as (typeof column.cards)[0]).title).toBe("Milk");
      expect((column.cards[1] as (typeof column.cards)[0]).title).toBe("Eggs");
    });

    it("should create a todo board without items", async () => {
      const result = await useCase.execute({
        ...validInput,
        items: [],
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      const column = output.columns[0] as (typeof output.columns)[0];
      expect(column.cards).toHaveLength(0);
    });

    it("should set card positions sequentially", async () => {
      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const column = result.getValue().columns[0] as {
        cards: Array<{ position: number }>;
      };
      expect(column.cards[0]?.position).toBe(0);
      expect(column.cards[1]?.position).toBe(1);
    });

    it("should set all cards as not completed", async () => {
      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const column = result.getValue().columns[0] as {
        cards: Array<{ isCompleted: boolean }>;
      };
      for (const card of column.cards) {
        expect(card.isCompleted).toBe(false);
      }
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
      expect(event.boardType).toBe("todo");
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

    it("should fail when item title is empty", async () => {
      const result = await useCase.execute({
        ...validInput,
        items: [{ title: "" }],
      });

      expect(result.isFailure).toBe(true);
      expect(mockBoardRepo.create).not.toHaveBeenCalled();
    });

    it("should fail when item title exceeds 200 characters", async () => {
      const result = await useCase.execute({
        ...validInput,
        items: [{ title: "a".repeat(201) }],
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
