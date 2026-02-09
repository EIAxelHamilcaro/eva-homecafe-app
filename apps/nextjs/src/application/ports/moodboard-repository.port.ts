import type {
  BaseRepository,
  PaginatedResult,
  PaginationParams,
  Result,
} from "@packages/ddd-kit";
import type { Moodboard } from "@/domain/moodboard/moodboard.aggregate";

export interface IMoodboardRepository extends BaseRepository<Moodboard> {
  findByUserId(
    userId: string,
    pagination?: PaginationParams,
  ): Promise<Result<PaginatedResult<Moodboard>>>;
}
