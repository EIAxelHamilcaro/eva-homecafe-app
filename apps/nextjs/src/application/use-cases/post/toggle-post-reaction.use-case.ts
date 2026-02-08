import { match, Result, type UseCase, UUID } from "@packages/ddd-kit";
import type {
  ITogglePostReactionInputDto,
  ITogglePostReactionOutputDto,
} from "@/application/dto/post/toggle-post-reaction.dto";
import type { IPostRepository } from "@/application/ports/post-repository.port";
import type { Post } from "@/domain/post/post.aggregate";
import { PostId } from "@/domain/post/post-id";
import type { PostReactionEmoji } from "@/domain/post/value-objects/post-reaction-type.vo";

export class TogglePostReactionUseCase
  implements UseCase<ITogglePostReactionInputDto, ITogglePostReactionOutputDto>
{
  constructor(private readonly postRepo: IPostRepository) {}

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

    return Result.ok({
      postId,
      userId,
      emoji: emoji as PostReactionEmoji,
      action: action.getValue(),
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
}
