import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@packages/drizzle", () => ({
  db: {
    selectDistinct: vi.fn(),
  },
  post: {
    userId: "user_id",
    isPrivate: "is_private",
    createdAt: "created_at",
  },
}));

vi.mock("drizzle-orm", () => ({
  and: (...args: unknown[]) => args,
  eq: (a: unknown, b: unknown) => [a, b],
  desc: (a: unknown) => a,
  sql: (strings: TemplateStringsArray, ...values: unknown[]) => ({
    strings,
    values,
  }),
}));

import { calculateStreak } from "../streak.query";

function makeDateResult(dateStr: string) {
  return { date: dateStr };
}

function formatLocal(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayStr(): string {
  return formatLocal(new Date());
}

function daysAgoStr(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return formatLocal(d);
}

describe("calculateStreak", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return zero streak when no private posts exist", async () => {
    const { db } = await import("@packages/drizzle");
    const mockChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([]),
    };
    vi.spyOn(db, "selectDistinct").mockReturnValue(mockChain as never);

    const result = await calculateStreak("user-123");

    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(0);
    expect(result.lastPostDate).toBeNull();
  });

  it("should return streak of 1 when only today has a post", async () => {
    const { db } = await import("@packages/drizzle");
    const mockChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([makeDateResult(todayStr())]),
    };
    vi.spyOn(db, "selectDistinct").mockReturnValue(mockChain as never);

    const result = await calculateStreak("user-123");

    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
    expect(result.lastPostDate).toBe(todayStr());
  });

  it("should count consecutive days correctly", async () => {
    const { db } = await import("@packages/drizzle");
    const dates = [
      makeDateResult(todayStr()),
      makeDateResult(daysAgoStr(1)),
      makeDateResult(daysAgoStr(2)),
      makeDateResult(daysAgoStr(3)),
      makeDateResult(daysAgoStr(4)),
    ];
    const mockChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue(dates),
    };
    vi.spyOn(db, "selectDistinct").mockReturnValue(mockChain as never);

    const result = await calculateStreak("user-123");

    expect(result.currentStreak).toBe(5);
    expect(result.longestStreak).toBe(5);
  });

  it("should reset current streak when a day is missed", async () => {
    const { db } = await import("@packages/drizzle");
    const dates = [
      makeDateResult(todayStr()),
      makeDateResult(daysAgoStr(1)),
      makeDateResult(daysAgoStr(3)),
      makeDateResult(daysAgoStr(4)),
      makeDateResult(daysAgoStr(5)),
    ];
    const mockChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue(dates),
    };
    vi.spyOn(db, "selectDistinct").mockReturnValue(mockChain as never);

    const result = await calculateStreak("user-123");

    expect(result.currentStreak).toBe(2);
    expect(result.longestStreak).toBe(3);
  });

  it("should count streak starting from yesterday", async () => {
    const { db } = await import("@packages/drizzle");
    const dates = [
      makeDateResult(daysAgoStr(1)),
      makeDateResult(daysAgoStr(2)),
      makeDateResult(daysAgoStr(3)),
    ];
    const mockChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue(dates),
    };
    vi.spyOn(db, "selectDistinct").mockReturnValue(mockChain as never);

    const result = await calculateStreak("user-123");

    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(3);
  });

  it("should return zero current streak when last post is more than 1 day ago", async () => {
    const { db } = await import("@packages/drizzle");
    const dates = [
      makeDateResult(daysAgoStr(3)),
      makeDateResult(daysAgoStr(4)),
      makeDateResult(daysAgoStr(5)),
    ];
    const mockChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue(dates),
    };
    vi.spyOn(db, "selectDistinct").mockReturnValue(mockChain as never);

    const result = await calculateStreak("user-123");

    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(3);
  });

  it("should track longest streak across gaps", async () => {
    const { db } = await import("@packages/drizzle");
    const dates = [
      makeDateResult(todayStr()),
      makeDateResult(daysAgoStr(3)),
      makeDateResult(daysAgoStr(4)),
      makeDateResult(daysAgoStr(5)),
      makeDateResult(daysAgoStr(6)),
      makeDateResult(daysAgoStr(7)),
    ];
    const mockChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue(dates),
    };
    vi.spyOn(db, "selectDistinct").mockReturnValue(mockChain as never);

    const result = await calculateStreak("user-123");

    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(5);
  });
});
