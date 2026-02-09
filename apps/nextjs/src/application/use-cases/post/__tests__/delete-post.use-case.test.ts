import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IDeletePostInputDto } from "@/application/dto/post/delete-post.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IPostRepository } from "@/application/ports/post-repository.port";
import type { PostDeletedEvent } from "@/domain/post/events/post-deleted.event";
import { Post } from "@/domain/post/post.aggregate";
import type { PostId } from "@/domain/post/post-id";
import { PostContent } from "@/domain/post/value-objects/post-content.vo";
import { DeletePostUseCase } from "../delete-post.use-case";

function createMockPost(overrides?: Partial<{ userId: string }>) {
  const text: string = "<p>Some content</p>";
  const content = PostContent.create(text).getValue();
  return Post.create({
    userId: overrides?.userId ?? "user-123",
    content,
    isPrivate: false,
    images: [],
  }).getValue();
}

describe("DeletePostUseCase", () => {
  let useCase: DeletePostUseCase;
  let mockPostRepo: IPostRepository;
  let mockEventDispatcher: IEventDispatcher;
  let mockPost: Post;

  const validInput: IDeletePostInputDto = {
    postId: "post-456",
    userId: "user-123",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPost = createMockPost();
    mockPostRepo = {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi
        .fn()
        .mockImplementation((id: PostId) => Promise.resolve(Result.ok(id))),
      findById: vi.fn().mockResolvedValue(Result.ok(Option.some(mockPost))),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      findByUserId: vi.fn(),
    } as unknown as IPostRepository;
    mockEventDispatcher = {
      dispatch: vi.fn(),
      dispatchAll: vi.fn(),
    };
    useCase = new DeletePostUseCase(mockPostRepo, mockEventDispatcher);
  });

  describe("happy path", () => {
    it("should delete an owned post", async () => {
      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id).toBe("post-456");
    });

    it("should call repository delete with correct id", async () => {
      await useCase.execute(validInput);

      expect(mockPostRepo.delete).toHaveBeenCalledOnce();
    });

    it("should add PostDeletedEvent before deletion", async () => {
      await useCase.execute(validInput);

      const events = vi.mocked(mockEventDispatcher.dispatchAll).mock
        .calls[0]?.[0] as unknown[];
      expect(
        events.some(
          (e: unknown) => (e as { type: string }).type === "PostDeleted",
        ),
      ).toBe(true);

      const event = events.find(
        (e: unknown) => (e as { type: string }).type === "PostDeleted",
      ) as unknown as PostDeletedEvent;
      expect(event.userId).toBe("user-123");
    });
  });

  describe("authorization", () => {
    it("should fail when user does not own the post", async () => {
      const result = await useCase.execute({
        ...validInput,
        userId: "other-user",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Forbidden");
      expect(mockPostRepo.delete).not.toHaveBeenCalled();
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
      expect(mockPostRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should fail when repository findById returns error", async () => {
      vi.mocked(mockPostRepo.findById).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });

    it("should fail when repository delete returns error", async () => {
      vi.mocked(mockPostRepo.delete).mockResolvedValue(
        Result.fail("Database delete error"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database delete error");
    });
  });
});
