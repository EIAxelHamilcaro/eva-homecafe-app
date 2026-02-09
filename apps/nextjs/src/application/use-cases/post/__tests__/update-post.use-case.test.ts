import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IUpdatePostInputDto } from "@/application/dto/post/update-post.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IPostRepository } from "@/application/ports/post-repository.port";
import type { PostUpdatedEvent } from "@/domain/post/events/post-updated.event";
import { Post } from "@/domain/post/post.aggregate";
import { PostContent } from "@/domain/post/value-objects/post-content.vo";
import { UpdatePostUseCase } from "../update-post.use-case";

function createMockPost(
  overrides?: Partial<{ userId: string; isPrivate: boolean; images: string[] }>,
) {
  const text: string = "<p>Original content</p>";
  const content = PostContent.create(text).getValue();
  return Post.create({
    userId: overrides?.userId ?? "user-123",
    content,
    isPrivate: overrides?.isPrivate ?? false,
    images: overrides?.images ?? [],
  }).getValue();
}

describe("UpdatePostUseCase", () => {
  let useCase: UpdatePostUseCase;
  let mockPostRepo: IPostRepository;
  let mockEventDispatcher: IEventDispatcher;

  const validInput: IUpdatePostInputDto = {
    postId: "post-456",
    userId: "user-123",
    content: "<p>Updated content</p>",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPostRepo = {
      create: vi.fn(),
      update: vi
        .fn()
        .mockImplementation((post: Post) => Promise.resolve(Result.ok(post))),
      delete: vi.fn(),
      findById: vi
        .fn()
        .mockResolvedValue(Result.ok(Option.some(createMockPost()))),
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
    useCase = new UpdatePostUseCase(mockPostRepo, mockEventDispatcher);
  });

  describe("happy path", () => {
    it("should update post content", async () => {
      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.content).toBe("<p>Updated content</p>");
      expect(output.updatedAt).toBeDefined();
      expect(output.updatedAt).not.toBeNull();
    });

    it("should update post visibility", async () => {
      const result = await useCase.execute({
        postId: "post-456",
        userId: "user-123",
        isPrivate: true,
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().isPrivate).toBe(true);
    });

    it("should update post images", async () => {
      const images = [
        "https://cdn.example.com/img1.jpg",
        "https://cdn.example.com/img2.jpg",
      ];
      const result = await useCase.execute({
        postId: "post-456",
        userId: "user-123",
        images,
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().images).toEqual(images);
    });

    it("should update all fields at once", async () => {
      const result = await useCase.execute({
        postId: "post-456",
        userId: "user-123",
        content: "<p>New content</p>",
        isPrivate: true,
        images: ["https://cdn.example.com/new.jpg"],
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.content).toBe("<p>New content</p>");
      expect(output.isPrivate).toBe(true);
      expect(output.images).toEqual(["https://cdn.example.com/new.jpg"]);
    });

    it("should persist updated post via repository", async () => {
      await useCase.execute(validInput);

      expect(mockPostRepo.update).toHaveBeenCalledOnce();
    });

    it("should emit exactly one PostUpdatedEvent when updating all fields", async () => {
      const result = await useCase.execute({
        postId: "post-456",
        userId: "user-123",
        content: "<p>New content</p>",
        isPrivate: true,
        images: ["https://cdn.example.com/new.jpg"],
      });

      expect(result.isSuccess).toBe(true);
      const events = vi.mocked(mockEventDispatcher.dispatchAll).mock
        .calls[0]?.[0] as unknown[];
      const updateEvents = events.filter(
        (e: unknown) => (e as { type: string }).type === "PostUpdated",
      );
      expect(updateEvents).toHaveLength(1);
    });

    it("should add PostUpdatedEvent", async () => {
      await useCase.execute(validInput);

      const events = vi.mocked(mockEventDispatcher.dispatchAll).mock
        .calls[0]?.[0] as unknown[];
      const filteredEvents = events.filter(
        (e: unknown) => (e as { type: string }).type === "PostUpdated",
      );
      expect(filteredEvents).toHaveLength(1);

      const event = filteredEvents[0] as unknown as PostUpdatedEvent;
      expect(event.type).toBe("PostUpdated");
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
      expect(mockPostRepo.update).not.toHaveBeenCalled();
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
      expect(mockPostRepo.update).not.toHaveBeenCalled();
    });
  });

  describe("validation errors", () => {
    it("should fail when updated content is empty", async () => {
      const result = await useCase.execute({
        ...validInput,
        content: "",
      });

      expect(result.isFailure).toBe(true);
      expect(mockPostRepo.update).not.toHaveBeenCalled();
    });

    it("should fail when updated content is HTML-only whitespace", async () => {
      const result = await useCase.execute({
        ...validInput,
        content: "<p>   </p>",
      });

      expect(result.isFailure).toBe(true);
      expect(mockPostRepo.update).not.toHaveBeenCalled();
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

    it("should fail when repository update returns error", async () => {
      vi.mocked(mockPostRepo.update).mockResolvedValue(
        Result.fail("Database write error"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database write error");
    });
  });
});
