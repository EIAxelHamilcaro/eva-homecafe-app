import { match, Result, type UseCase } from "@packages/ddd-kit";
import type {
  IGetUserPostsInputDto,
  IGetUserPostsOutputDto,
  IPostDto,
} from "@/application/dto/post/get-user-posts.dto";
import type { IPostRepository } from "@/application/ports/post-repository.port";
import type { Post } from "@/domain/post/post.aggregate";

export class GetUserPostsUseCase
  implements UseCase<IGetUserPostsInputDto, IGetUserPostsOutputDto>
{
  constructor(private readonly postRepo: IPostRepository) {}

  async execute(
    input: IGetUserPostsInputDto,
  ): Promise<Result<IGetUserPostsOutputDto>> {
    const pagination = {
      page: input.page ?? 1,
      limit: input.limit ?? 20,
    };

    const result = await this.postRepo.findByUserId(input.userId, pagination);

    if (result.isFailure) {
      return Result.fail(result.getError());
    }

    const paginatedPosts = result.getValue();
    const posts = paginatedPosts.data.map((post) => this.toDto(post));

    return Result.ok({
      posts,
      pagination: paginatedPosts.pagination,
    });
  }

  private toDto(post: Post): IPostDto {
    return {
      id: post.id.value.toString(),
      content: post.get("content").value,
      isPrivate: post.get("isPrivate"),
      images: post.get("images"),
      userId: post.get("userId"),
      createdAt: post.get("createdAt").toISOString(),
      updatedAt: match<Date, string | null>(post.get("updatedAt"), {
        Some: (date) => date.toISOString(),
        None: () => null,
      }),
    };
  }
}
