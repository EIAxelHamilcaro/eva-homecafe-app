import { match, Result, type UseCase, UUID } from "@packages/ddd-kit";
import type {
  ITogglePostReactionInputDto,
  ITogglePostReactionOutputDto,
} from "@/application/dto/post/toggle-post-reaction.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { INotificationRepository } from "@/application/ports/notification-repository.port";
import type { IPostRepository } from "@/application/ports/post-repository.port";
import type { IProfileRepository } from "@/application/ports/profile-repository.port";
import { Notification } from "@/domain/notification/notification.aggregate";
import { NotificationType } from "@/domain/notification/value-objects/notification-type.vo";
import type { Post } from "@/domain/post/post.aggregate";
import { PostId } from "@/domain/post/post-id";
import type { PostReactionEmoji } from "@/domain/post/value-objects/post-reaction-type.vo";

export class TogglePostReactionUseCase
  implements UseCase<ITogglePostReactionInputDto, ITogglePostReactionOutputDto>
{
  constructor(
    private readonly postRepo: IPostRepository,
    private readonly eventDispatcher: IEventDispatcher,
    private readonly notificationRepo: INotificationRepository,
    private readonly profileRepo: IProfileRepository,
  ) {}

  async execute(
    input: ITogglePostReactionInputDto,
  ): Promise<Result<ITogglePostReactionOutputDto>> {
    const { postId, userId, emoji } = input;

    const postResult = await this.findPost(postId);
    if (postResult.isFailure) {
      return Result.fail(postResult.getError());
    }
    const post = postResult.getValue();

    const action = this.toggleReaction(
      post,
      userId,
      emoji as PostReactionEmoji,
    );
    if (action.isFailure) {
      return Result.fail(action.getError());
    }

    const updateResult = await this.postRepo.update(post);
    if (updateResult.isFailure) {
      return Result.fail(updateResult.getError());
    }

    await this.eventDispatcher.dispatchAll(post.domainEvents);
    post.clearEvents();

    const actionValue = action.getValue();
    const postOwnerId = post.get("userId");
    if (actionValue === "added" && postOwnerId !== userId) {
      await this.notifyPostOwner(postOwnerId, userId, postId, emoji);
    }

    return Result.ok({
      postId,
      userId,
      emoji: emoji as PostReactionEmoji,
      action: actionValue,
    });
  }

  private async findPost(postId: string): Promise<Result<Post>> {
    const postIdVO = PostId.create(new UUID(postId));
    const postResult = await this.postRepo.findByIdWithReactions(postIdVO);

    if (postResult.isFailure) {
      return Result.fail(postResult.getError());
    }

    return match(postResult.getValue(), {
      Some: (post) => Result.ok(post),
      None: () => Result.fail("Post not found"),
    });
  }

  private toggleReaction(
    post: Post,
    userId: string,
    emoji: PostReactionEmoji,
  ): Result<"added" | "removed"> {
    const reactions = post.get("reactions");
    const hasReaction = reactions.hasUserReactedWith(userId, emoji);

    if (hasReaction) {
      const removeResult = post.removeReaction(userId, emoji);
      if (removeResult.isFailure) {
        return Result.fail(removeResult.getError());
      }
      return Result.ok("removed");
    }

    const addResult = post.addReaction(userId, emoji);
    if (addResult.isFailure) {
      return Result.fail(addResult.getError());
    }
    return Result.ok("added");
  }

  private async notifyPostOwner(
    ownerId: string,
    reactorId: string,
    postId: string,
    emoji: string,
  ): Promise<void> {
    let reactorName = "Quelqu'un";
    const profileResult = await this.profileRepo.findByUserId(reactorId);
    if (profileResult.isSuccess) {
      reactorName = match(profileResult.getValue(), {
        Some: (profile) => profile.get("displayName").value ?? reactorName,
        None: () => reactorName,
      });
    }

    const typeResult = NotificationType.createPostReaction();
    if (typeResult.isFailure) return;

    const notifResult = Notification.create({
      userId: ownerId,
      type: typeResult.getValue(),
      title: "Nouvelle réaction",
      body: `${reactorName} a réagi ${emoji} à votre publication`,
      data: { postId, reactorId, emoji },
    });
    if (notifResult.isFailure) return;

    const notification = notifResult.getValue();
    const saveResult = await this.notificationRepo.create(notification);
    if (saveResult.isFailure) return;

    await this.eventDispatcher.dispatchAll(notification.domainEvents);
    notification.clearEvents();
  }
}
