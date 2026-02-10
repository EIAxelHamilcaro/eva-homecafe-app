import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@packages/drizzle", () => ({
  db: {
    select: () => ({
      from: (_table: unknown) => ({
        where: (_condition: unknown) => ({
          orderBy: (_order: unknown) => ({
            limit: (_l: number) => ({
              offset: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      }),
    }),
  },
  post: {
    id: "id",
    userId: "user_id",
    content: "content",
    isPrivate: "is_private",
    images: "images",
    createdAt: "created_at",
    updatedAt: "updated_at",
    $inferSelect: {},
  },
}));

vi.mock("drizzle-orm", () => ({
  and: (...args: unknown[]) => args,
  eq: (a: unknown, b: unknown) => [a, b],
  desc: (a: unknown) => a,
  sql: (strings: TemplateStringsArray, ..._values: unknown[]) => ({
    strings,
    values: _values,
  }),
}));

import { getJournalEntries } from "../journal.query";

describe("getJournalEntries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty groups when no private posts exist", async () => {
    const { db } = await import("@packages/drizzle");
    const mockChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockResolvedValue([]),
    };
    const mockCountChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ count: 0 }]),
    };

    let callCount = 0;
    vi.spyOn(db, "select").mockImplementation(() => {
      callCount++;
      if (callCount === 1) return mockChain as never;
      return mockCountChain as never;
    });

    const result = await getJournalEntries("user-123");

    expect(result.groups).toEqual([]);
    expect(result.pagination.total).toBe(0);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(20);
    expect(result.pagination.hasNextPage).toBe(false);
    expect(result.pagination.hasPreviousPage).toBe(false);
  });

  it("should group posts by date", async () => {
    const { db } = await import("@packages/drizzle");
    const mockRecords = [
      {
        id: "post-1",
        userId: "user-123",
        content: "<p>Entry 1</p>",
        isPrivate: true,
        images: [],
        createdAt: new Date("2026-02-08T14:00:00Z"),
        updatedAt: null,
      },
      {
        id: "post-2",
        userId: "user-123",
        content: "<p>Entry 2</p>",
        isPrivate: true,
        images: [],
        createdAt: new Date("2026-02-08T10:00:00Z"),
        updatedAt: null,
      },
      {
        id: "post-3",
        userId: "user-123",
        content: "<p>Entry 3</p>",
        isPrivate: true,
        images: [],
        createdAt: new Date("2026-02-07T09:00:00Z"),
        updatedAt: null,
      },
    ];

    const mockChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockResolvedValue(mockRecords),
    };
    const mockCountChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ count: 3 }]),
    };

    let callCount = 0;
    vi.spyOn(db, "select").mockImplementation(() => {
      callCount++;
      if (callCount === 1) return mockChain as never;
      return mockCountChain as never;
    });

    const result = await getJournalEntries("user-123");

    expect(result.groups).toHaveLength(2);
    expect(result.groups[0]?.date).toBe("2026-02-08");
    expect(result.groups[0]?.posts).toHaveLength(2);
    expect(result.groups[1]?.date).toBe("2026-02-07");
    expect(result.groups[1]?.posts).toHaveLength(1);
    expect(result.pagination.total).toBe(3);
  });

  it("should apply pagination defaults", async () => {
    const { db } = await import("@packages/drizzle");
    const mockChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockResolvedValue([]),
    };
    const mockCountChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ count: 0 }]),
    };

    let callCount = 0;
    vi.spyOn(db, "select").mockImplementation(() => {
      callCount++;
      if (callCount === 1) return mockChain as never;
      return mockCountChain as never;
    });

    const result = await getJournalEntries("user-123");

    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(20);
  });

  it("should calculate pagination correctly", async () => {
    const { db } = await import("@packages/drizzle");
    const mockChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockResolvedValue([]),
    };
    const mockCountChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ count: 45 }]),
    };

    let callCount = 0;
    vi.spyOn(db, "select").mockImplementation(() => {
      callCount++;
      if (callCount === 1) return mockChain as never;
      return mockCountChain as never;
    });

    const result = await getJournalEntries("user-123", undefined, 2, 20);

    expect(result.pagination.total).toBe(45);
    expect(result.pagination.totalPages).toBe(3);
    expect(result.pagination.page).toBe(2);
    expect(result.pagination.hasNextPage).toBe(true);
    expect(result.pagination.hasPreviousPage).toBe(true);
  });

  it("should serialize dates as ISO strings", async () => {
    const { db } = await import("@packages/drizzle");
    const mockRecords = [
      {
        id: "post-1",
        userId: "user-123",
        content: "<p>Test</p>",
        isPrivate: true,
        images: ["img1.jpg"],
        createdAt: new Date("2026-02-08T14:30:00Z"),
        updatedAt: new Date("2026-02-08T15:00:00Z"),
      },
    ];

    const mockChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockResolvedValue(mockRecords),
    };
    const mockCountChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ count: 1 }]),
    };

    let callCount = 0;
    vi.spyOn(db, "select").mockImplementation(() => {
      callCount++;
      if (callCount === 1) return mockChain as never;
      return mockCountChain as never;
    });

    const result = await getJournalEntries("user-123");

    const postDto = result.groups[0]
      ?.posts[0] as (typeof result.groups)[number]["posts"][number];
    expect(postDto.createdAt).toBe("2026-02-08T14:30:00.000Z");
    expect(postDto.updatedAt).toBe("2026-02-08T15:00:00.000Z");
    expect(postDto.images).toEqual(["img1.jpg"]);
  });
});
