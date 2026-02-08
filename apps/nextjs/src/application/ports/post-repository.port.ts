import type {
  BaseRepository,
  PaginatedResult,
  PaginationParams,
  Result,
} from "@packages/ddd-kit";
import type { Post } from "@/domain/post/post.aggregate";

export interface IPostRepository extends BaseRepository<Post> {
  findByUserId(
    userId: string,
    pagination?: PaginationParams,
  ): Promise<Result<PaginatedResult<Post>>>;
}
