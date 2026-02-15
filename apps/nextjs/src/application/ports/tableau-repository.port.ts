import type {
  BaseRepository,
  PaginatedResult,
  PaginationParams,
  Result,
} from "@packages/ddd-kit";
import type { Tableau } from "@/domain/tableau/tableau.aggregate";

export interface ITableauRepository extends BaseRepository<Tableau> {
  findByUserId(
    userId: string,
    pagination?: PaginationParams,
  ): Promise<Result<PaginatedResult<Tableau>>>;
}
