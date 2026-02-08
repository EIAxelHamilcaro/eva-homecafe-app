import { match, Result, type UseCase, UUID } from "@packages/ddd-kit";
import type {
  IGetPostDetailInputDto,
  IGetPostDetailOutputDto,
} from "@/application/dto/post/get-post-detail.dto";
import type { IPostRepository } from "@/application/ports/post-repository.port";
import { PostId } from "@/domain/post/post-id";

export class GetPostDetailUseCase
  implements UseCase<IGetPostDetailInputDto, IGetPostDetailOutputDto>
{
  constructor(private readonly postRepo: IPostRepository) {}

  async execute(
    input: IGetPostDetailInputDto,
  ): Promise<Result<IGetPostDetailOutputDto>> {
    const postId = PostId.create(new UUID(input.postId));
    const result = await this.postRepo.findById(postId);

    if (result.isFailure) {
      return Result.fail(result.getError());
    }

    return match(result.getValue(), {
      Some: (post) => {
        const isPrivate = post.get("isPrivate");
        const postUserId = post.get("userId");

        if (isPrivate && postUserId !== input.requestingUserId) {
          return Result.fail("Post not found");
        }

        return Result.ok({
          id: post.id.value.toString(),
          content: post.get("content").value,
          isPrivate,
          images: post.get("images"),
          userId: postUserId,
          createdAt: post.get("createdAt").toISOString(),
          updatedAt: match<Date, string | null>(post.get("updatedAt"), {
            Some: (date) => date.toISOString(),
            None: () => null,
          }),
        });
      },
      None: () => Result.fail("Post not found"),
    });
  }
}
