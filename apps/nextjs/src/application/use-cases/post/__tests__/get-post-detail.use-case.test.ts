import { Option, Result, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IGetPostDetailInputDto } from "@/application/dto/post/get-post-detail.dto";
import type { IPostRepository } from "@/application/ports/post-repository.port";
import { Post } from "@/domain/post/post.aggregate";
import { PostId } from "@/domain/post/post-id";
import { PostContent } from "@/domain/post/value-objects/post-content.vo";
import { GetPostDetailUseCase } from "../get-post-detail.use-case";

function createMockPost(
  overrides: {
    id?: string;
    userId?: string;
    isPrivate?: boolean;
    updatedAt?: Date | null;
  } = {},
): Post {
  const testContent: string = "<p>Full post content</p>";
  const content = PostContent.create(testContent).getValue();
  const postId = PostId.create(new UUID<string>(overrides.id ?? "post-1"));
  return Post.reconstitute(
    {
      userId: overrides.userId ?? "user-123",
      content,
      isPrivate: overrides.isPrivate ?? false,
      images: ["https://cdn.example.com/img1.jpg"],
      createdAt: new Date("2026-01-15T10:00:00Z"),
      updatedAt: overrides.updatedAt
        ? Option.some(overrides.updatedAt)
        : Option.none(),
    },
    postId,
  );
}

describe("GetPostDetailUseCase", () => {
  let useCase: GetPostDetailUseCase;
  let mockPostRepo: IPostRepository;

  const validInput: IGetPostDetailInputDto = {
    postId: "post-1",
    requestingUserId: "user-123",
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
    useCase = new GetPostDetailUseCase(mockPostRepo);
  });

  describe("happy path", () => {
    it("should return post detail for own public post", async () => {
      const mockPost = createMockPost();
      vi.mocked(mockPostRepo.findById).mockResolvedValue(
        Result.ok(Option.some(mockPost)),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.id).toBeDefined();
      expect(output.content).toBe("<p>Full post content</p>");
      expect(output.isPrivate).toBe(false);
      expect(output.images).toEqual(["https://cdn.example.com/img1.jpg"]);
      expect(output.userId).toBe("user-123");
      expect(output.createdAt).toBe("2026-01-15T10:00:00.000Z");
      expect(output.updatedAt).toBeNull();
    });

    it("should return post detail for own private post", async () => {
      const mockPost = createMockPost({ isPrivate: true });
      vi.mocked(mockPostRepo.findById).mockResolvedValue(
        Result.ok(Option.some(mockPost)),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().isPrivate).toBe(true);
    });

    it("should return post detail with updatedAt when present", async () => {
      const updatedDate = new Date("2026-01-16T12:00:00Z");
      const mockPost = createMockPost({ updatedAt: updatedDate });
      vi.mocked(mockPostRepo.findById).mockResolvedValue(
        Result.ok(Option.some(mockPost)),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().updatedAt).toBe("2026-01-16T12:00:00.000Z");
    });

    it("should return public post from another user", async () => {
      const mockPost = createMockPost({ userId: "other-user" });
      vi.mocked(mockPostRepo.findById).mockResolvedValue(
        Result.ok(Option.some(mockPost)),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().userId).toBe("other-user");
    });
  });

  describe("access control", () => {
    it("should fail when trying to view another user's private post", async () => {
      const mockPost = createMockPost({
        userId: "other-user",
        isPrivate: true,
      });
      vi.mocked(mockPostRepo.findById).mockResolvedValue(
        Result.ok(Option.some(mockPost)),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Post not found");
    });
  });

  describe("not found", () => {
    it("should fail when post does not exist", async () => {
      vi.mocked(mockPostRepo.findById).mockResolvedValue(
        Result.ok(Option.none()),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Post not found");
    });
  });

  describe("error handling", () => {
    it("should fail when repository returns error", async () => {
      vi.mocked(mockPostRepo.findById).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });
  });
});
