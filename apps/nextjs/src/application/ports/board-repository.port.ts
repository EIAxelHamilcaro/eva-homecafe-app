import type {
  BaseRepository,
  PaginatedResult,
  PaginationParams,
  Result,
} from "@packages/ddd-kit";
import type { Board } from "@/domain/board/board.aggregate";

export interface IBoardRepository extends BaseRepository<Board> {
  findByUserId(
    userId: string,
    pagination?: PaginationParams,
    type?: string,
  ): Promise<Result<PaginatedResult<Board>>>;
}
