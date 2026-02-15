import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@packages/drizzle", () => ({
  db: {
    select: () => ({
      from: () => ({
        innerJoin: () => ({
          innerJoin: () => ({
            where: () => ({
              orderBy: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      }),
    }),
  },
  card: {
    id: "id",
    title: "title",
    description: "description",
    dueDate: "due_date",
    createdAt: "created_at",
    isCompleted: "is_completed",
    progress: "progress",
    columnId: "column_id",
  },
  boardColumn: {
    id: "id",
    boardId: "board_id",
    title: "title",
  },
  board: {
    id: "id",
    userId: "user_id",
    title: "title",
    type: "type",
  },
}));

vi.mock("drizzle-orm", () => ({
  and: (...args: unknown[]) => args,
  eq: (a: unknown, b: unknown) => [a, b],
  asc: (a: unknown) => a,
  isNotNull: (a: unknown) => a,
  gte: (a: unknown, b: unknown) => ["gte", a, b],
  lte: (a: unknown, b: unknown) => ["lte", a, b],
}));

import { getChronology } from "../chronology.query";

describe("getChronology", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty cards and eventDates when no cards have due dates", async () => {
    const { db } = await import("@packages/drizzle");
    const mockChain = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([]),
    };
    vi.spyOn(db, "select").mockReturnValue(mockChain as never);

    const result = await getChronology("user-123", "2026-02");

    expect(result.cards).toEqual([]);
    expect(result.eventDates).toEqual({});
  });

  it("should return cards mapped to DTOs with correct fields", async () => {
    const { db } = await import("@packages/drizzle");
    const mockRecords = [
      {
        id: "card-1",
        title: "Fix login bug",
        description: "Auth issue",
        dueDate: "2026-02-10",
        createdAt: new Date("2026-01-15T10:00:00Z"),
        isCompleted: false,
        progress: 60,
        boardId: "board-1",
        boardTitle: "Sprint 3",
        boardType: "kanban",
        columnTitle: "In Progress",
      },
      {
        id: "card-2",
        title: "Design review",
        description: null,
        dueDate: "2026-02-10",
        createdAt: new Date("2026-02-01T10:00:00Z"),
        isCompleted: false,
        progress: 0,
        boardId: "board-2",
        boardTitle: "Design",
        boardType: "todo",
        columnTitle: "Tasks",
      },
    ];

    const mockChain = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue(mockRecords),
    };
    vi.spyOn(db, "select").mockReturnValue(mockChain as never);

    const result = await getChronology("user-123", "2026-02");

    expect(result.cards).toHaveLength(2);
    expect(result.cards[0]).toEqual({
      id: "card-1",
      title: "Fix login bug",
      description: "Auth issue",
      dueDate: "2026-02-10",
      createdAt: "2026-01-15",
      isCompleted: false,
      progress: 60,
      boardId: "board-1",
      boardTitle: "Sprint 3",
      boardType: "kanban",
      columnTitle: "In Progress",
    });
    expect(result.cards[1]).toEqual({
      id: "card-2",
      title: "Design review",
      description: null,
      dueDate: "2026-02-10",
      createdAt: "2026-02-01",
      isCompleted: false,
      progress: 0,
      boardId: "board-2",
      boardTitle: "Design",
      boardType: "todo",
      columnTitle: "Tasks",
    });
  });

  it("should build eventDates map with correct counts and unique boards", async () => {
    const { db } = await import("@packages/drizzle");
    const mockRecords = [
      {
        id: "card-1",
        title: "Task A",
        description: null,
        dueDate: "2026-02-10",
        createdAt: new Date("2026-02-01T10:00:00Z"),
        isCompleted: false,
        progress: 0,
        boardId: "board-1",
        boardTitle: "Sprint 3",
        boardType: "kanban",
        columnTitle: "Todo",
      },
      {
        id: "card-2",
        title: "Task B",
        description: null,
        dueDate: "2026-02-10",
        createdAt: new Date("2026-02-01T10:00:00Z"),
        isCompleted: false,
        progress: 50,
        boardId: "board-1",
        boardTitle: "Sprint 3",
        boardType: "kanban",
        columnTitle: "In Progress",
      },
      {
        id: "card-3",
        title: "Task C",
        description: null,
        dueDate: "2026-02-15",
        createdAt: new Date("2026-02-05T10:00:00Z"),
        isCompleted: true,
        progress: 100,
        boardId: "board-2",
        boardTitle: "Design",
        boardType: "todo",
        columnTitle: "Done",
      },
    ];

    const mockChain = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue(mockRecords),
    };
    vi.spyOn(db, "select").mockReturnValue(mockChain as never);

    const result = await getChronology("user-123", "2026-02");

    expect(result.eventDates["2026-02-10"]).toEqual({
      count: 2,
      boards: [{ id: "board-1", title: "Sprint 3" }],
    });
    expect(result.eventDates["2026-02-15"]).toEqual({
      count: 1,
      boards: [{ id: "board-2", title: "Design" }],
    });
  });

  it("should handle null progress as 0", async () => {
    const { db } = await import("@packages/drizzle");
    const mockRecords = [
      {
        id: "card-1",
        title: "Task",
        description: null,
        dueDate: "2026-02-05",
        createdAt: new Date("2026-02-01T10:00:00Z"),
        isCompleted: false,
        progress: null,
        boardId: "board-1",
        boardTitle: "Board",
        boardType: "todo",
        columnTitle: "Tasks",
      },
    ];

    const mockChain = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue(mockRecords),
    };
    vi.spyOn(db, "select").mockReturnValue(mockChain as never);

    const result = await getChronology("user-123", "2026-02");

    expect(result.cards[0]?.progress).toBe(0);
  });

  it("should default to current month when month is not provided", async () => {
    const { db } = await import("@packages/drizzle");
    const mockChain = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([]),
    };
    vi.spyOn(db, "select").mockReturnValue(mockChain as never);

    const result = await getChronology("user-123");

    expect(result.cards).toEqual([]);
    expect(result.eventDates).toEqual({});
  });

  it("should include multiple boards in eventDates for same date", async () => {
    const { db } = await import("@packages/drizzle");
    const mockRecords = [
      {
        id: "card-1",
        title: "Task A",
        description: null,
        dueDate: "2026-02-20",
        createdAt: new Date("2026-02-01T10:00:00Z"),
        isCompleted: false,
        progress: 0,
        boardId: "board-1",
        boardTitle: "Sprint",
        boardType: "kanban",
        columnTitle: "Todo",
      },
      {
        id: "card-2",
        title: "Task B",
        description: null,
        dueDate: "2026-02-20",
        createdAt: new Date("2026-02-01T10:00:00Z"),
        isCompleted: false,
        progress: 0,
        boardId: "board-2",
        boardTitle: "Design",
        boardType: "todo",
        columnTitle: "Tasks",
      },
    ];

    const mockChain = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue(mockRecords),
    };
    vi.spyOn(db, "select").mockReturnValue(mockChain as never);

    const result = await getChronology("user-123", "2026-02");

    expect(result.eventDates["2026-02-20"]?.count).toBe(2);
    expect(result.eventDates["2026-02-20"]?.boards).toHaveLength(2);
    expect(result.eventDates["2026-02-20"]?.boards[0]).toEqual({
      id: "board-1",
      title: "Sprint",
    });
    expect(result.eventDates["2026-02-20"]?.boards[1]).toEqual({
      id: "board-2",
      title: "Design",
    });
  });

  it("should call where with userId filter, isNotNull, and date range", async () => {
    const { db } = await import("@packages/drizzle");
    const { eq, isNotNull, gte, lte } = await import("drizzle-orm");
    const { board, card } = await import("@packages/drizzle");

    const mockChain = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([]),
    };
    vi.spyOn(db, "select").mockReturnValue(mockChain as never);

    await getChronology("user-456", "2026-03");

    expect(mockChain.where).toHaveBeenCalledOnce();
    const whereArgs = mockChain.where.mock.calls[0]?.[0] as unknown[];
    expect(whereArgs).toBeDefined();
    expect(whereArgs).toHaveLength(4);
    expect(whereArgs[0]).toEqual(eq(board.userId, "user-456"));
    expect(whereArgs[1]).toEqual(isNotNull(card.dueDate));
    expect(whereArgs[2]).toEqual(gte(card.dueDate, "2026-03-01"));
    expect(whereArgs[3]).toEqual(lte(card.dueDate, "2026-03-31"));
  });

  it("should call innerJoin for boardColumn and board tables", async () => {
    const { db } = await import("@packages/drizzle");

    const mockChain = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([]),
    };
    vi.spyOn(db, "select").mockReturnValue(mockChain as never);

    await getChronology("user-123", "2026-02");

    expect(mockChain.innerJoin).toHaveBeenCalledTimes(2);
  });
});
