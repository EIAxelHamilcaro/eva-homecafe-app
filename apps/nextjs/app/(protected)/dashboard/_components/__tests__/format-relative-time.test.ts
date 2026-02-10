import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatRelativeTime } from "../format-relative-time";

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-10T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return 'Just now' for less than 1 minute ago", () => {
    const date = new Date("2026-02-10T11:59:30.000Z");
    expect(formatRelativeTime(date)).toBe("Just now");
  });

  it("should return 'Just now' for exactly now", () => {
    const date = new Date("2026-02-10T12:00:00.000Z");
    expect(formatRelativeTime(date)).toBe("Just now");
  });

  it("should return minutes ago for 1-59 minutes", () => {
    const date = new Date("2026-02-10T11:55:00.000Z");
    expect(formatRelativeTime(date)).toBe("5m ago");
  });

  it("should return '1m ago' at exactly 1 minute", () => {
    const date = new Date("2026-02-10T11:59:00.000Z");
    expect(formatRelativeTime(date)).toBe("1m ago");
  });

  it("should return '59m ago' at 59 minutes", () => {
    const date = new Date("2026-02-10T11:01:00.000Z");
    expect(formatRelativeTime(date)).toBe("59m ago");
  });

  it("should return hours ago for 1-23 hours", () => {
    const date = new Date("2026-02-10T09:00:00.000Z");
    expect(formatRelativeTime(date)).toBe("3h ago");
  });

  it("should return '1h ago' at exactly 1 hour", () => {
    const date = new Date("2026-02-10T11:00:00.000Z");
    expect(formatRelativeTime(date)).toBe("1h ago");
  });

  it("should return '23h ago' at 23 hours", () => {
    const date = new Date("2026-02-09T13:00:00.000Z");
    expect(formatRelativeTime(date)).toBe("23h ago");
  });

  it("should return 'Yesterday' for exactly 1 day ago", () => {
    const date = new Date("2026-02-09T12:00:00.000Z");
    expect(formatRelativeTime(date)).toBe("Yesterday");
  });

  it("should return formatted date for 2+ days ago", () => {
    const date = new Date("2026-02-08T12:00:00.000Z");
    expect(formatRelativeTime(date)).toBe(
      new Date("2026-02-08T12:00:00.000Z").toLocaleDateString(),
    );
  });

  it("should return 'Just now' for future dates (clock skew)", () => {
    const date = new Date("2026-02-10T12:00:30.000Z");
    expect(formatRelativeTime(date)).toBe("Just now");
  });
});
