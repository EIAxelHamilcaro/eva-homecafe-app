import type {
  BaseRepository,
  PaginatedResult,
  PaginationParams,
  Result,
} from "@packages/ddd-kit";
import type { Photo } from "@/domain/gallery/photo.aggregate";

export interface IGalleryRepository extends BaseRepository<Photo> {
  findByUserId(
    userId: string,
    pagination?: PaginationParams,
  ): Promise<Result<PaginatedResult<Photo>>>;
}
