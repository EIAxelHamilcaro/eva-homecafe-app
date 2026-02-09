import { Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ICreatePostInputDto } from "@/application/dto/post/create-post.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IPostRepository } from "@/application/ports/post-repository.port";
import type { PostCreatedEvent } from "@/domain/post/events/post-created.event";
import type { Post } from "@/domain/post/post.aggregate";
import { CreatePostUseCase } from "../create-post.use-case";

describe("CreatePostUseCase", () => {
  let useCase: CreatePostUseCase;
  let mockPostRepo: IPostRepository;
  let mockEventDispatcher: IEventDispatcher;

  const validInput: ICreatePostInputDto = {
    content: "<p>Hello world</p>",
    isPrivate: false,
    images: ["https://cdn.example.com/post/user-123/img1.jpg"],
    userId: "user-123",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPostRepo = {
      create: vi
        .fn()
        .mockImplementation((post: Post) => Promise.resolve(Result.ok(post))),
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
    mockEventDispatcher = {
      dispatch: vi.fn(),
      dispatchAll: vi.fn(),
    };
    useCase = new CreatePostUseCase(mockPostRepo, mockEventDispatcher);
  });

  describe("happy path", () => {
    it("should create a public post with content and images", async () => {
      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.content).toBe("<p>Hello world</p>");
      expect(output.isPrivate).toBe(false);
      expect(output.images).toEqual([
        "https://cdn.example.com/post/user-123/img1.jpg",
      ]);
      expect(output.userId).toBe("user-123");
      expect(output.id).toBeDefined();
      expect(output.createdAt).toBeDefined();
    });

    it("should create a private post (journal entry)", async () => {
      const result = await useCase.execute({
        ...validInput,
        isPrivate: true,
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().isPrivate).toBe(true);
    });

    it("should create a post without images", async () => {
      const result = await useCase.execute({
        ...validInput,
        images: [],
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().images).toEqual([]);
    });

    it("should create a post with multiple images", async () => {
      const images = [
        "https://cdn.example.com/post/user-123/img1.jpg",
        "https://cdn.example.com/post/user-123/img2.png",
        "https://cdn.example.com/post/user-123/img3.webp",
      ];
      const result = await useCase.execute({
        ...validInput,
        images,
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().images).toEqual(images);
    });

    it("should persist the post via repository", async () => {
      await useCase.execute(validInput);

      expect(mockPostRepo.create).toHaveBeenCalledOnce();
      expect(mockPostRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          _props: expect.objectContaining({
            userId: "user-123",
            isPrivate: false,
          }),
        }),
      );
    });

    it("should add PostCreatedEvent with correct payload", async () => {
      await useCase.execute(validInput);

      const events = vi.mocked(mockEventDispatcher.dispatchAll).mock
        .calls[0]?.[0] as unknown[];
      expect(events).toHaveLength(1);

      const event = events[0] as unknown as PostCreatedEvent;
      expect(event.type).toBe("PostCreated");
      expect(event.aggregateId).toBeDefined();
      expect(event.userId).toBe("user-123");
      expect(event.isPrivate).toBe(false);
    });

    it("should add PostCreatedEvent with isPrivate=true for journal", async () => {
      await useCase.execute({ ...validInput, isPrivate: true });

      const events = vi.mocked(mockEventDispatcher.dispatchAll).mock
        .calls[0]?.[0] as unknown[];
      const event = events[0] as unknown as PostCreatedEvent;
      expect(event.isPrivate).toBe(true);
    });
  });

  describe("validation errors", () => {
    it("should fail when content is empty", async () => {
      const result = await useCase.execute({
        ...validInput,
        content: "",
      });

      expect(result.isFailure).toBe(true);
      expect(mockPostRepo.create).not.toHaveBeenCalled();
    });

    it("should fail when content is whitespace only", async () => {
      const result = await useCase.execute({
        ...validInput,
        content: "   ",
      });

      expect(result.isFailure).toBe(true);
      expect(mockPostRepo.create).not.toHaveBeenCalled();
    });

    it("should fail when content is HTML-only whitespace", async () => {
      const result = await useCase.execute({
        ...validInput,
        content: "<p></p>",
      });

      expect(result.isFailure).toBe(true);
      expect(mockPostRepo.create).not.toHaveBeenCalled();
    });

    it("should fail when content is HTML with only spaces", async () => {
      const result = await useCase.execute({
        ...validInput,
        content: "<p>   </p>",
      });

      expect(result.isFailure).toBe(true);
      expect(mockPostRepo.create).not.toHaveBeenCalled();
    });

    it("should fail when content exceeds 50000 characters", async () => {
      const result = await useCase.execute({
        ...validInput,
        content: "a".repeat(50001),
      });

      expect(result.isFailure).toBe(true);
      expect(mockPostRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should fail when repository returns error", async () => {
      vi.mocked(mockPostRepo.create).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });
  });
});
