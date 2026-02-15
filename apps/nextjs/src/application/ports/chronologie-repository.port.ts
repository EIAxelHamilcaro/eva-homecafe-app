import type {
  BaseRepository,
  PaginatedResult,
  PaginationParams,
  Result,
} from "@packages/ddd-kit";
import type { Chronologie } from "@/domain/chronologie/chronologie.aggregate";

export interface IChronologieRepository extends BaseRepository<Chronologie> {
  findByUserId(
    userId: string,
    pagination?: PaginationParams,
  ): Promise<Result<PaginatedResult<Chronologie>>>;
}
