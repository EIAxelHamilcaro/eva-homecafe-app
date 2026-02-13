import { Result, type UseCase } from "@packages/ddd-kit";
import type {
  ICreatePostInputDto,
  ICreatePostOutputDto,
} from "@/application/dto/post/create-post.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IPostRepository } from "@/application/ports/post-repository.port";
import { Post } from "@/domain/post/post.aggregate";
import { PostContent } from "@/domain/post/value-objects/post-content.vo";

export class CreatePostUseCase
  implements UseCase<ICreatePostInputDto, ICreatePostOutputDto>
{
  constructor(
    private readonly postRepo: IPostRepository,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(
    input: ICreatePostInputDto,
  ): Promise<Result<ICreatePostOutputDto>> {
    const contentResult = PostContent.create(input.content);
    if (contentResult.isFailure) {
      return Result.fail(contentResult.getError());
    }

    const postResult = Post.create({
      userId: input.userId,
      content: contentResult.getValue(),
      isPrivate: input.isPrivate,
      images: input.images,
      createdAt: input.createdAt
        ? (() => {
            const now = new Date();
            const parts = input.createdAt.split("-").map(Number);
            const y = parts[0] ?? 0;
            const m = parts[1] ?? 1;
            const d = parts[2] ?? 1;
            now.setFullYear(y, m - 1, d);
            return now;
          })()
        : undefined,
    });
    if (postResult.isFailure) {
      return Result.fail(postResult.getError());
    }

    const post = postResult.getValue();

    const saveResult = await this.postRepo.create(post);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    await this.eventDispatcher.dispatchAll(post.domainEvents);
    post.clearEvents();

    return Result.ok({
      id: post.id.value.toString(),
      content: post.get("content").value,
      isPrivate: post.get("isPrivate"),
      images: post.get("images"),
      userId: post.get("userId"),
      createdAt: post.get("createdAt").toISOString(),
    });
  }
}
