import { Result, type UseCase, UUID } from "@packages/ddd-kit";
import type {
  IDeletePostInputDto,
  IDeletePostOutputDto,
} from "@/application/dto/post/delete-post.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IPostRepository } from "@/application/ports/post-repository.port";
import { PostId } from "@/domain/post/post-id";

export class DeletePostUseCase
  implements UseCase<IDeletePostInputDto, IDeletePostOutputDto>
{
  constructor(
    private readonly postRepo: IPostRepository,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(
    input: IDeletePostInputDto,
  ): Promise<Result<IDeletePostOutputDto>> {
    const postId = PostId.create(new UUID(input.postId));
    const findResult = await this.postRepo.findById(postId);

    if (findResult.isFailure) {
      return Result.fail(findResult.getError());
    }

    const option = findResult.getValue();
    if (option.isNone()) {
      return Result.fail("Post not found");
    }

    const post = option.unwrap();

    if (post.get("userId") !== input.userId) {
      return Result.fail("Forbidden");
    }

    post.markDeleted();

    const deleteResult = await this.postRepo.delete(postId);
    if (deleteResult.isFailure) {
      return Result.fail(deleteResult.getError());
    }

    await this.eventDispatcher.dispatchAll(post.domainEvents);
    post.clearEvents();

    return Result.ok({ id: input.postId });
  }
}
