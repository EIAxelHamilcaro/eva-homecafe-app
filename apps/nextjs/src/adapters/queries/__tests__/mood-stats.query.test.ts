import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@packages/drizzle", () => ({
  db: {
    select: vi.fn(),
  },
  moodEntry: {
    userId: "user_id",
    moodDate: "mood_date",
    moodCategory: "mood_category",
    moodIntensity: "mood_intensity",
  },
}));

vi.mock("drizzle-orm", () => ({
  and: (...args: unknown[]) => args,
  eq: (a: unknown, b: unknown) => [a, b],
  gte: (a: unknown, b: unknown) => ["gte", a, b],
  avg: (a: unknown) => ({ as: () => a }),
  count: () => ({ as: () => "count" }),
  desc: (a: unknown) => a,
}));

import { getMoodStats } from "../mood-stats.query";

describe("getMoodStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty stats when no entries exist for the week", async () => {
    const { db } = await import("@packages/drizzle");
    const mockCategoryChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([]),
    };
    const mockSummaryChain = {
      from: vi.fn().mockReturnThis(),
      where: vi
        .fn()
        .mockResolvedValue([{ totalEntries: 0, averageIntensity: null }]),
    };

    let callCount = 0;
    vi.spyOn(db, "select").mockImplementation(() => {
      callCount++;
      if (callCount === 1) return mockCategoryChain as never;
      return mockSummaryChain as never;
    });

    const result = await getMoodStats("user-123", "week");

    expect(result.categoryDistribution).toEqual([]);
    expect(result.totalEntries).toBe(0);
    expect(result.averageIntensity).toBe(0);
    expect(result.dominantMood).toBeNull();
  });

  it("should calculate category distribution with correct percentages", async () => {
    const { db } = await import("@packages/drizzle");
    const mockCategoryChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([
        { category: "bonheur", count: 3 },
        { category: "calme", count: 2 },
      ]),
    };
    const mockSummaryChain = {
      from: vi.fn().mockReturnThis(),
      where: vi
        .fn()
        .mockResolvedValue([{ totalEntries: 5, averageIntensity: "6.4" }]),
    };

    let callCount = 0;
    vi.spyOn(db, "select").mockImplementation(() => {
      callCount++;
      if (callCount === 1) return mockCategoryChain as never;
      return mockSummaryChain as never;
    });

    const result = await getMoodStats("user-123", "week");

    expect(result.categoryDistribution).toEqual([
      { category: "bonheur", count: 3, percentage: 60 },
      { category: "calme", count: 2, percentage: 40 },
    ]);
    expect(result.totalEntries).toBe(5);
    expect(result.averageIntensity).toBe(6.4);
    expect(result.dominantMood).toBe("bonheur");
  });

  it("should round average intensity to one decimal place", async () => {
    const { db } = await import("@packages/drizzle");
    const mockCategoryChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([{ category: "tristesse", count: 3 }]),
    };
    const mockSummaryChain = {
      from: vi.fn().mockReturnThis(),
      where: vi
        .fn()
        .mockResolvedValue([{ totalEntries: 3, averageIntensity: "7.333333" }]),
    };

    let callCount = 0;
    vi.spyOn(db, "select").mockImplementation(() => {
      callCount++;
      if (callCount === 1) return mockCategoryChain as never;
      return mockSummaryChain as never;
    });

    const result = await getMoodStats("user-123", "week");

    expect(result.averageIntensity).toBe(7.3);
  });

  it("should accept 6months period", async () => {
    const { db } = await import("@packages/drizzle");
    const mockCategoryChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([
        { category: "excitation", count: 10 },
        { category: "bonheur", count: 8 },
        { category: "calme", count: 2 },
      ]),
    };
    const mockSummaryChain = {
      from: vi.fn().mockReturnThis(),
      where: vi
        .fn()
        .mockResolvedValue([{ totalEntries: 20, averageIntensity: "5.5" }]),
    };

    let callCount = 0;
    vi.spyOn(db, "select").mockImplementation(() => {
      callCount++;
      if (callCount === 1) return mockCategoryChain as never;
      return mockSummaryChain as never;
    });

    const result = await getMoodStats("user-123", "6months");

    expect(result.totalEntries).toBe(20);
    expect(result.dominantMood).toBe("excitation");
    expect(result.categoryDistribution).toHaveLength(3);
    expect(result.categoryDistribution[0]?.percentage).toBe(50);
    expect(result.categoryDistribution[1]?.percentage).toBe(40);
    expect(result.categoryDistribution[2]?.percentage).toBe(10);
  });

  it("should handle null average intensity gracefully", async () => {
    const { db } = await import("@packages/drizzle");
    const mockCategoryChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([]),
    };
    const mockSummaryChain = {
      from: vi.fn().mockReturnThis(),
      where: vi
        .fn()
        .mockResolvedValue([{ totalEntries: 0, averageIntensity: null }]),
    };

    let callCount = 0;
    vi.spyOn(db, "select").mockImplementation(() => {
      callCount++;
      if (callCount === 1) return mockCategoryChain as never;
      return mockSummaryChain as never;
    });

    const result = await getMoodStats("user-123", "week");

    expect(result.averageIntensity).toBe(0);
  });
});
