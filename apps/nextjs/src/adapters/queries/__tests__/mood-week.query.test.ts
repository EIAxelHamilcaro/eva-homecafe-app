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
  lte: (a: unknown, b: unknown) => ["lte", a, b],
  asc: (a: unknown) => a,
  sql: (strings: TemplateStringsArray, ...values: unknown[]) => ({
    strings,
    values,
  }),
}));

import { getMoodWeek } from "../mood-week.query";

describe("getMoodWeek", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty entries when no mood records exist for the week", async () => {
    const { db } = await import("@packages/drizzle");
    const mockChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([]),
    };
    vi.spyOn(db, "select").mockReturnValue(mockChain as never);

    const result = await getMoodWeek("user-123");

    expect(result.entries).toEqual([]);
  });

  it("should return entries with correct day of week mapping", async () => {
    const { db } = await import("@packages/drizzle");
    const mockRecords = [
      { moodDate: "2026-02-02", moodCategory: "bonheur", moodIntensity: 7 },
      { moodDate: "2026-02-03", moodCategory: "calme", moodIntensity: 5 },
    ];
    const mockChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue(mockRecords),
    };
    vi.spyOn(db, "select").mockReturnValue(mockChain as never);

    const result = await getMoodWeek("user-123");

    expect(result.entries).toHaveLength(2);
    expect(result.entries[0]).toEqual({
      date: "2026-02-02",
      dayOfWeek: "Monday",
      category: "bonheur",
      intensity: 7,
    });
    expect(result.entries[1]).toEqual({
      date: "2026-02-03",
      dayOfWeek: "Tuesday",
      category: "calme",
      intensity: 5,
    });
  });

  it("should map Sunday correctly", async () => {
    const { db } = await import("@packages/drizzle");
    const mockRecords = [
      { moodDate: "2026-02-08", moodCategory: "ennui", moodIntensity: 3 },
    ];
    const mockChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue(mockRecords),
    };
    vi.spyOn(db, "select").mockReturnValue(mockChain as never);

    const result = await getMoodWeek("user-123");

    expect(result.entries[0]?.dayOfWeek).toBe("Sunday");
  });

  it("should preserve the original date string in entries", async () => {
    const { db } = await import("@packages/drizzle");
    const mockRecords = [
      { moodDate: "2026-02-04", moodCategory: "anxiete", moodIntensity: 8 },
    ];
    const mockChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue(mockRecords),
    };
    vi.spyOn(db, "select").mockReturnValue(mockChain as never);

    const result = await getMoodWeek("user-123");

    expect(result.entries[0]?.date).toBe("2026-02-04");
    expect(result.entries[0]?.category).toBe("anxiete");
    expect(result.entries[0]?.intensity).toBe(8);
  });
});
