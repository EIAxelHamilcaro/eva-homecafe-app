import { Option, Result, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ITogglePostReactionInputDto } from "@/application/dto/post/toggle-post-reaction.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { INotificationRepository } from "@/application/ports/notification-repository.port";
import type { IPostRepository } from "@/application/ports/post-repository.port";
import type { IProfileRepository } from "@/application/ports/profile-repository.port";
import type { Notification } from "@/domain/notification/notification.aggregate";
import { Post } from "@/domain/post/post.aggregate";
import { PostId } from "@/domain/post/post-id";
import { PostContent } from "@/domain/post/value-objects/post-content.vo";
import { PostReaction } from "@/domain/post/value-objects/post-reaction.vo";
import { PostReactionsList } from "@/domain/post/watched-lists/post-reactions.list";
import { TogglePostReactionUseCase } from "../toggle-post-reaction.use-case";

function createTestPost(id: string, reactions: PostReaction[] = []): Post {
  const testContent: string = "<p>Test post</p>";
  const content = PostContent.create(testContent).getValue();
  const postId = PostId.create(new UUID<string>(id));
  return Post.reconstitute(
    {
      userId: "owner-123",
      content,
      isPrivate: false,
      images: [],
      reactions: PostReactionsList.create(reactions),
      createdAt: new Date(),
      updatedAt: Option.none(),
    },
    postId,
  );
}

describe("TogglePostReactionUseCase", () => {
  let useCase: TogglePostReactionUseCase;
  let mockPostRepo: IPostRepository;
  let mockEventDispatcher: IEventDispatcher;
  let mockNotificationRepo: INotificationRepository;
  let mockProfileRepo: IProfileRepository;

  const postId = "post-123";
  const userId = "user-456";

  const validInput: ITogglePostReactionInputDto = {
    postId,
    userId,
    emoji: "❤️",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPostRepo = {
      create: vi.fn(),
      update: vi.fn().mockResolvedValue(Result.ok(undefined)),
      delete: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      findByUserId: vi.fn(),
      findByIdWithReactions: vi.fn(),
    } as unknown as IPostRepository;
    mockEventDispatcher = {
      dispatch: vi.fn(),
      dispatchAll: vi.fn(),
    };
    mockNotificationRepo = {
      create: vi.fn().mockResolvedValue(Result.ok({} as Notification)),
    } as unknown as INotificationRepository;
    mockProfileRepo = {
      findByUserId: vi.fn().mockResolvedValue(Result.ok(Option.none())),
    } as unknown as IProfileRepository;
    useCase = new TogglePostReactionUseCase(
      mockPostRepo,
      mockEventDispatcher,
      mockNotificationRepo,
      mockProfileRepo,
    );
  });

  describe("adding a reaction", () => {
    it("should add a reaction when user has not reacted yet", async () => {
      const post = createTestPost(postId);
      vi.mocked(mockPostRepo.findByIdWithReactions).mockResolvedValue(
        Result.ok(Option.some(post)),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.action).toBe("added");
      expect(output.postId).toBe(postId);
      expect(output.userId).toBe(userId);
      expect(output.emoji).toBe("❤️");
    });

    it("should persist the post after adding a reaction", async () => {
      const post = createTestPost(postId);
      vi.mocked(mockPostRepo.findByIdWithReactions).mockResolvedValue(
        Result.ok(Option.some(post)),
      );

      await useCase.execute(validInput);

      expect(mockPostRepo.update).toHaveBeenCalledOnce();
    });

    it("should add a reaction with a different emoji", async () => {
      const post = createTestPost(postId);
      vi.mocked(mockPostRepo.findByIdWithReactions).mockResolvedValue(
        Result.ok(Option.some(post)),
      );

      const result = await useCase.execute({
        ...validInput,
        emoji: "👍",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().action).toBe("added");
      expect(result.getValue().emoji).toBe("👍");
    });
  });

  describe("removing a reaction", () => {
    it("should remove a reaction when user already reacted with same emoji", async () => {
      const existingReaction = PostReaction.createNew(userId, "❤️").getValue();
      const post = createTestPost(postId, [existingReaction]);
      vi.mocked(mockPostRepo.findByIdWithReactions).mockResolvedValue(
        Result.ok(Option.some(post)),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().action).toBe("removed");
    });

    it("should persist the post after removing a reaction", async () => {
      const existingReaction = PostReaction.createNew(userId, "❤️").getValue();
      const post = createTestPost(postId, [existingReaction]);
      vi.mocked(mockPostRepo.findByIdWithReactions).mockResolvedValue(
        Result.ok(Option.some(post)),
      );

      await useCase.execute(validInput);

      expect(mockPostRepo.update).toHaveBeenCalledOnce();
    });

    it("should add a reaction when user reacted with a different emoji", async () => {
      const existingReaction = PostReaction.createNew(userId, "👍").getValue();
      const post = createTestPost(postId, [existingReaction]);
      vi.mocked(mockPostRepo.findByIdWithReactions).mockResolvedValue(
        Result.ok(Option.some(post)),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().action).toBe("added");
      expect(result.getValue().emoji).toBe("❤️");
    });
  });

  describe("error handling", () => {
    it("should fail when post is not found", async () => {
      vi.mocked(mockPostRepo.findByIdWithReactions).mockResolvedValue(
        Result.ok(Option.none()),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Post not found");
      expect(mockPostRepo.update).not.toHaveBeenCalled();
    });

    it("should fail when repository findByIdWithReactions returns error", async () => {
      vi.mocked(mockPostRepo.findByIdWithReactions).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
      expect(mockPostRepo.update).not.toHaveBeenCalled();
    });

    it("should fail when repository update returns error", async () => {
      const post = createTestPost(postId);
      vi.mocked(mockPostRepo.findByIdWithReactions).mockResolvedValue(
        Result.ok(Option.some(post)),
      );
      vi.mocked(mockPostRepo.update).mockResolvedValue(
        Result.fail("Update failed"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Update failed");
    });
  });

  describe("domain events", () => {
    it("should emit PostReactedEvent with 'added' action", async () => {
      const post = createTestPost(postId);
      vi.mocked(mockPostRepo.findByIdWithReactions).mockResolvedValue(
        Result.ok(Option.some(post)),
      );

      await useCase.execute(validInput);

      const events = vi.mocked(mockEventDispatcher.dispatchAll).mock
        .calls[0]?.[0] as unknown[];
      const reactedEvent = events.find(
        (e: unknown) => (e as { type: string }).type === "PostReacted",
      );
      expect(reactedEvent).toBeDefined();
    });

    it("should emit PostReactedEvent with 'removed' action", async () => {
      const existingReaction = PostReaction.createNew(userId, "❤️").getValue();
      const post = createTestPost(postId, [existingReaction]);
      vi.mocked(mockPostRepo.findByIdWithReactions).mockResolvedValue(
        Result.ok(Option.some(post)),
      );

      await useCase.execute(validInput);

      const events = vi.mocked(mockEventDispatcher.dispatchAll).mock
        .calls[0]?.[0] as unknown[];
      const reactedEvent = events.find(
        (e: unknown) => (e as { type: string }).type === "PostReacted",
      );
      expect(reactedEvent).toBeDefined();
    });
  });
});
