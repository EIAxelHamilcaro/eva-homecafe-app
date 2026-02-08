import { Result, type UseCase } from "@packages/ddd-kit";
import type {
  ICreatePostInputDto,
  ICreatePostOutputDto,
} from "@/application/dto/post/create-post.dto";
import type { IPostRepository } from "@/application/ports/post-repository.port";
import { Post } from "@/domain/post/post.aggregate";
import { PostContent } from "@/domain/post/value-objects/post-content.vo";

export class CreatePostUseCase
  implements UseCase<ICreatePostInputDto, ICreatePostOutputDto>
{
  constructor(private readonly postRepo: IPostRepository) {}

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
    });
    if (postResult.isFailure) {
      return Result.fail(postResult.getError());
    }

    const post = postResult.getValue();

    const saveResult = await this.postRepo.create(post);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

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
