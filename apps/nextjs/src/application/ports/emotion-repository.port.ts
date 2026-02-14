import type { BaseRepository, Option, Result } from "@packages/ddd-kit";
import type { EmotionEntry } from "@/domain/emotion/emotion-entry.aggregate";

export interface IEmotionRepository extends BaseRepository<EmotionEntry> {
  findByUserIdAndDate(
    userId: string,
    date: string,
  ): Promise<Result<Option<EmotionEntry>>>;
}
