import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@packages/drizzle", () => ({
  db: {
    select: vi.fn(),
  },
  friendRequest: {
    senderId: "sender_id",
    receiverId: "receiver_id",
    status: "status",
  },
  post: {
    id: "id",
    userId: "user_id",
    content: "content",
    isPrivate: "is_private",
    images: "images",
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
  user: {
    id: "user_id",
    name: "name",
    image: "image",
  },
  profile: {
    userId: "user_id",
    displayName: "display_name",
    avatarUrl: "avatar_url",
  },
}));

vi.mock("drizzle-orm", () => ({
  and: (...args: unknown[]) => args,
  or: (...args: unknown[]) => args,
  eq: (a: unknown, b: unknown) => [a, b],
  desc: (a: unknown) => a,
  inArray: (a: unknown, b: unknown) => [a, b],
  sql: (strings: TemplateStringsArray, ...values: unknown[]) => ({
    strings,
    values,
    as: (alias: string) => alias,
  }),
}));

import { getFriendFeed } from "../friend-feed.query";

function createMockFriendsChain(
  friends: { senderId: string; receiverId: string }[],
) {
  return {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue(friends),
  };
}

function createMockPostsChain(records: unknown[]) {
  return {
    from: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockResolvedValue(records),
  };
}

function createMockCountChain(count: number) {
  return {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue([{ count }]),
  };
}

describe("getFriendFeed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty result when user has no friends", async () => {
    const { db } = await import("@packages/drizzle");

    vi.mocked(db.select).mockReturnValue(createMockFriendsChain([]) as never);

    const result = await getFriendFeed("user-123");

    expect(result.data).toEqual([]);
    expect(result.hasFriends).toBe(false);
    expect(result.pagination.total).toBe(0);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.hasNextPage).toBe(false);
    expect(result.pagination.hasPreviousPage).toBe(false);
  });

  it("should return empty result when friends have no public posts", async () => {
    const { db } = await import("@packages/drizzle");

    let callCount = 0;
    vi.mocked(db.select).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return createMockFriendsChain([
          { senderId: "user-123", receiverId: "friend-1" },
        ]) as never;
      }
      if (callCount === 2) {
        return createMockPostsChain([]) as never;
      }
      return createMockCountChain(0) as never;
    });

    const result = await getFriendFeed("user-123");

    expect(result.data).toEqual([]);
    expect(result.hasFriends).toBe(true);
    expect(result.pagination.total).toBe(0);
  });

  it("should return friends' public posts with author info", async () => {
    const { db } = await import("@packages/drizzle");

    const mockPostRecords = [
      {
        id: "post-1",
        content: "<p>Hello from friend</p>",
        images: ["img1.jpg"],
        createdAt: new Date("2026-02-08T14:00:00Z"),
        updatedAt: null,
        authorId: "friend-1",
        authorName: "Alice",
        authorImage: null,
        displayName: "Alice D.",
        avatarUrl: "https://example.com/avatar.jpg",
        reactionCount: 0,
        hasReacted: false,
      },
    ];

    let callCount = 0;
    vi.mocked(db.select).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return createMockFriendsChain([
          { senderId: "user-123", receiverId: "friend-1" },
        ]) as never;
      }
      if (callCount === 2) {
        return createMockPostsChain(mockPostRecords) as never;
      }
      return createMockCountChain(1) as never;
    });

    const result = await getFriendFeed("user-123");

    expect(result.data).toHaveLength(1);
    expect(result.data[0]!.id).toBe("post-1");
    expect(result.data[0]!.content).toBe("<p>Hello from friend</p>");
    expect(result.data[0]!.images).toEqual(["img1.jpg"]);
    expect(result.data[0]!.createdAt).toBe("2026-02-08T14:00:00.000Z");
    expect(result.data[0]!.updatedAt).toBeNull();
    expect(result.data[0]!.author.id).toBe("friend-1");
    expect(result.data[0]!.author.name).toBe("Alice");
    expect(result.data[0]!.author.displayName).toBe("Alice D.");
    expect(result.data[0]!.author.avatarUrl).toBe(
      "https://example.com/avatar.jpg",
    );
    expect(result.data[0]!.reactionCount).toBe(0);
    expect(result.data[0]!.hasReacted).toBe(false);
  });

  it("should extract friend IDs correctly from both sender and receiver positions", async () => {
    const { db } = await import("@packages/drizzle");

    let callCount = 0;
    vi.mocked(db.select).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return createMockFriendsChain([
          { senderId: "user-123", receiverId: "friend-1" },
          { senderId: "friend-2", receiverId: "user-123" },
        ]) as never;
      }
      if (callCount === 2) {
        return createMockPostsChain([]) as never;
      }
      return createMockCountChain(0) as never;
    });

    const result = await getFriendFeed("user-123");

    expect(result.data).toEqual([]);
    expect(db.select).toHaveBeenCalledTimes(3);
  });

  it("should use author image as fallback when no profile avatar", async () => {
    const { db } = await import("@packages/drizzle");

    const mockPostRecords = [
      {
        id: "post-1",
        content: "<p>Test</p>",
        images: [],
        createdAt: new Date("2026-02-08T10:00:00Z"),
        updatedAt: null,
        authorId: "friend-1",
        authorName: "Bob",
        authorImage: "https://example.com/user-image.jpg",
        displayName: null,
        avatarUrl: null,
        reactionCount: 0,
        hasReacted: false,
      },
    ];

    let callCount = 0;
    vi.mocked(db.select).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return createMockFriendsChain([
          { senderId: "user-123", receiverId: "friend-1" },
        ]) as never;
      }
      if (callCount === 2) {
        return createMockPostsChain(mockPostRecords) as never;
      }
      return createMockCountChain(1) as never;
    });

    const result = await getFriendFeed("user-123");

    expect(result.data[0]!.author.avatarUrl).toBe(
      "https://example.com/user-image.jpg",
    );
    expect(result.data[0]!.author.displayName).toBeNull();
  });

  it("should apply pagination defaults", async () => {
    const { db } = await import("@packages/drizzle");

    vi.mocked(db.select).mockReturnValue(createMockFriendsChain([]) as never);

    const result = await getFriendFeed("user-123");

    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(20);
  });

  it("should calculate pagination correctly", async () => {
    const { db } = await import("@packages/drizzle");

    let callCount = 0;
    vi.mocked(db.select).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return createMockFriendsChain([
          { senderId: "user-123", receiverId: "friend-1" },
        ]) as never;
      }
      if (callCount === 2) {
        return createMockPostsChain([]) as never;
      }
      return createMockCountChain(45) as never;
    });

    const result = await getFriendFeed("user-123", 2, 20);

    expect(result.pagination.total).toBe(45);
    expect(result.pagination.totalPages).toBe(3);
    expect(result.pagination.page).toBe(2);
    expect(result.pagination.hasNextPage).toBe(true);
    expect(result.pagination.hasPreviousPage).toBe(true);
  });

  it("should serialize updatedAt when present", async () => {
    const { db } = await import("@packages/drizzle");

    const mockPostRecords = [
      {
        id: "post-1",
        content: "<p>Updated post</p>",
        images: [],
        createdAt: new Date("2026-02-08T10:00:00Z"),
        updatedAt: new Date("2026-02-08T12:00:00Z"),
        authorId: "friend-1",
        authorName: "Charlie",
        authorImage: null,
        displayName: "Charlie C.",
        avatarUrl: null,
        reactionCount: 0,
        hasReacted: false,
      },
    ];

    let callCount = 0;
    vi.mocked(db.select).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return createMockFriendsChain([
          { senderId: "user-123", receiverId: "friend-1" },
        ]) as never;
      }
      if (callCount === 2) {
        return createMockPostsChain(mockPostRecords) as never;
      }
      return createMockCountChain(1) as never;
    });

    const result = await getFriendFeed("user-123");

    expect(result.data[0]!.createdAt).toBe("2026-02-08T10:00:00.000Z");
    expect(result.data[0]!.updatedAt).toBe("2026-02-08T12:00:00.000Z");
  });
});
