import { Option, type PaginatedResult, Result, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IGetUserPostsInputDto } from "@/application/dto/post/get-user-posts.dto";
import type { IPostRepository } from "@/application/ports/post-repository.port";
import { Post } from "@/domain/post/post.aggregate";
import { PostId } from "@/domain/post/post-id";
import { PostContent } from "@/domain/post/value-objects/post-content.vo";
import { PostReactionsList } from "@/domain/post/watched-lists/post-reactions.list";
import { GetUserPostsUseCase } from "../get-user-posts.use-case";

function createMockPost(
  overrides: { userId?: string; isPrivate?: boolean; images?: string[] } = {},
): Post {
  const testContent: string = "<p>Test content</p>";
  const content = PostContent.create(testContent).getValue();
  const postId = PostId.create(new UUID<string>("post-1"));
  return Post.reconstitute(
    {
      userId: overrides.userId ?? "user-123",
      content,
      isPrivate: overrides.isPrivate ?? false,
      images: overrides.images ?? [],
      reactions: PostReactionsList.create([]),
      createdAt: new Date("2026-01-15T10:00:00Z"),
      updatedAt: Option.none(),
    },
    postId,
  );
}

describe("GetUserPostsUseCase", () => {
  let useCase: GetUserPostsUseCase;
  let mockPostRepo: IPostRepository;

  const validInput: IGetUserPostsInputDto = {
    userId: "user-123",
    page: 1,
    limit: 20,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPostRepo = {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      findByUserId: vi.fn(),
    } as unknown as IPostRepository;
    useCase = new GetUserPostsUseCase(mockPostRepo);
  });

  describe("happy path", () => {
    it("should return paginated posts for a user", async () => {
      const mockPosts = [createMockPost(), createMockPost({ isPrivate: true })];
      const paginatedResult: PaginatedResult<Post> = {
        data: mockPosts,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      vi.mocked(mockPostRepo.findByUserId).mockResolvedValue(
        Result.ok(paginatedResult),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.posts).toHaveLength(2);
      expect(output.pagination.total).toBe(2);
      expect(output.pagination.page).toBe(1);
      expect(output.pagination.limit).toBe(20);
    });

    it("should return empty posts array when user has no posts", async () => {
      const paginatedResult: PaginatedResult<Post> = {
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      vi.mocked(mockPostRepo.findByUserId).mockResolvedValue(
        Result.ok(paginatedResult),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.posts).toHaveLength(0);
      expect(output.pagination.total).toBe(0);
    });

    it("should use default pagination when not provided", async () => {
      const paginatedResult: PaginatedResult<Post> = {
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      vi.mocked(mockPostRepo.findByUserId).mockResolvedValue(
        Result.ok(paginatedResult),
      );

      await useCase.execute({ userId: "user-123" });

      expect(mockPostRepo.findByUserId).toHaveBeenCalledWith("user-123", {
        page: 1,
        limit: 20,
      });
    });

    it("should pass custom pagination parameters", async () => {
      const paginatedResult: PaginatedResult<Post> = {
        data: [],
        pagination: {
          page: 3,
          limit: 10,
          total: 50,
          totalPages: 5,
          hasNextPage: true,
          hasPreviousPage: true,
        },
      };
      vi.mocked(mockPostRepo.findByUserId).mockResolvedValue(
        Result.ok(paginatedResult),
      );

      await useCase.execute({ userId: "user-123", page: 3, limit: 10 });

      expect(mockPostRepo.findByUserId).toHaveBeenCalledWith("user-123", {
        page: 3,
        limit: 10,
      });
    });

    it("should map post aggregate to DTO correctly", async () => {
      const mockPost = createMockPost({
        images: ["https://cdn.example.com/img1.jpg"],
      });
      const paginatedResult: PaginatedResult<Post> = {
        data: [mockPost],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      vi.mocked(mockPostRepo.findByUserId).mockResolvedValue(
        Result.ok(paginatedResult),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const posts = result.getValue().posts;
      expect(posts).toHaveLength(1);
      const post = posts[0]!;
      expect(post.id).toBeDefined();
      expect(post.content).toBe("<p>Test content</p>");
      expect(post.isPrivate).toBe(false);
      expect(post.images).toEqual(["https://cdn.example.com/img1.jpg"]);
      expect(post.userId).toBe("user-123");
      expect(post.createdAt).toBe("2026-01-15T10:00:00.000Z");
      expect(post.updatedAt).toBeNull();
    });
  });

  describe("error handling", () => {
    it("should fail when repository returns error", async () => {
      vi.mocked(mockPostRepo.findByUserId).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });
  });
});
