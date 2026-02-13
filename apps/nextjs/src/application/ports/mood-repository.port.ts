import type { BaseRepository, Option, Result } from "@packages/ddd-kit";
import type { MoodEntry } from "@/domain/mood/mood-entry.aggregate";

export interface IMoodRepository extends BaseRepository<MoodEntry> {
  findTodayByUserId(userId: string): Promise<Result<Option<MoodEntry>>>;
  findByUserIdAndDate(
    userId: string,
    date: string,
  ): Promise<Result<Option<MoodEntry>>>;
}
