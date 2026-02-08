import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@packages/drizzle", () => ({
  db: {
    execute: vi.fn(),
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
  sql: (strings: TemplateStringsArray, ...values: unknown[]) => ({
    strings,
    values,
  }),
}));

import { getMoodTrends } from "../mood-trends.query";

describe("getMoodTrends", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty months when no entries exist", async () => {
    const { db } = await import("@packages/drizzle");
    vi.spyOn(db, "execute").mockResolvedValue({ rows: [] } as never);

    const result = await getMoodTrends("user-123");

    expect(result.months).toEqual([]);
  });

  it("should return monthly data with dominant category", async () => {
    const { db } = await import("@packages/drizzle");
    vi.spyOn(db, "execute").mockResolvedValue({
      rows: [
        {
          month: "2026-01",
          dominant_category: "bonheur",
          avg_intensity: "6.5",
          entry_count: "10",
        },
        {
          month: "2026-02",
          dominant_category: "calme",
          avg_intensity: "7.2",
          entry_count: "5",
        },
      ],
    } as never);

    const result = await getMoodTrends("user-123");

    expect(result.months).toHaveLength(2);
    expect(result.months[0]).toEqual({
      month: "2026-01",
      dominantCategory: "bonheur",
      averageIntensity: 6.5,
      entryCount: 10,
    });
    expect(result.months[1]).toEqual({
      month: "2026-02",
      dominantCategory: "calme",
      averageIntensity: 7.2,
      entryCount: 5,
    });
  });

  it("should round average intensity to one decimal place", async () => {
    const { db } = await import("@packages/drizzle");
    vi.spyOn(db, "execute").mockResolvedValue({
      rows: [
        {
          month: "2026-01",
          dominant_category: "anxiete",
          avg_intensity: "6.666667",
          entry_count: "3",
        },
      ],
    } as never);

    const result = await getMoodTrends("user-123");

    expect(result.months[0]?.averageIntensity).toBe(6.7);
  });

  it("should fallback to unknown when dominant category is null", async () => {
    const { db } = await import("@packages/drizzle");
    vi.spyOn(db, "execute").mockResolvedValue({
      rows: [
        {
          month: "2026-01",
          dominant_category: null,
          avg_intensity: "5.0",
          entry_count: "1",
        },
      ],
    } as never);

    const result = await getMoodTrends("user-123");

    expect(result.months[0]?.dominantCategory).toBe("unknown");
  });
});
