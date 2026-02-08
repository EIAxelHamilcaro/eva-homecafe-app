import { match, Result, type UseCase, UUID } from "@packages/ddd-kit";
import type {
  IUpdatePostInputDto,
  IUpdatePostOutputDto,
} from "@/application/dto/post/update-post.dto";
import type { IPostRepository } from "@/application/ports/post-repository.port";
import { PostId } from "@/domain/post/post-id";
import { PostContent } from "@/domain/post/value-objects/post-content.vo";

export class UpdatePostUseCase
  implements UseCase<IUpdatePostInputDto, IUpdatePostOutputDto>
{
  constructor(private readonly postRepo: IPostRepository) {}

  async execute(
    input: IUpdatePostInputDto,
  ): Promise<Result<IUpdatePostOutputDto>> {
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

    let newContent: PostContent | undefined;
    if (input.content !== undefined) {
      const contentResult = PostContent.create(input.content);
      if (contentResult.isFailure) {
        return Result.fail(contentResult.getError());
      }
      newContent = contentResult.getValue();
    }

    post.update({
      content: newContent,
      isPrivate: input.isPrivate,
      images: input.images,
    });

    const saveResult = await this.postRepo.update(post);
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
      updatedAt: match<Date, string | null>(post.get("updatedAt"), {
        Some: (date) => date.toISOString(),
        None: () => null,
      }),
    });
  }
}
