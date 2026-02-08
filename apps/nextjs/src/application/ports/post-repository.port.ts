import type {
  BaseRepository,
  Option,
  PaginatedResult,
  PaginationParams,
  Result,
} from "@packages/ddd-kit";
import type { Post } from "@/domain/post/post.aggregate";
import type { PostId } from "@/domain/post/post-id";

export interface IPostRepository extends BaseRepository<Post> {
  findByUserId(
    userId: string,
    pagination?: PaginationParams,
  ): Promise<Result<PaginatedResult<Post>>>;
  findByIdWithReactions(id: PostId): Promise<Result<Option<Post>>>;
}
