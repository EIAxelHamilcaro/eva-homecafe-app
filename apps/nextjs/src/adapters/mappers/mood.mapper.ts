import { Option, Result, UUID } from "@packages/ddd-kit";
import type { moodEntry as moodEntryTable } from "@packages/drizzle/schema";
import { MoodEntry } from "@/domain/mood/mood-entry.aggregate";
import { MoodEntryId } from "@/domain/mood/mood-entry-id";
import { MoodCategory } from "@/domain/mood/value-objects/mood-category.vo";
import { MoodIntensity } from "@/domain/mood/value-objects/mood-intensity.vo";

type MoodEntryRecord = typeof moodEntryTable.$inferSelect;

type MoodEntryPersistence = Omit<MoodEntryRecord, "updatedAt"> & {
  updatedAt: Date | null;
};

export function moodEntryToDomain(record: MoodEntryRecord): Result<MoodEntry> {
  const categoryResult = MoodCategory.create(record.moodCategory);
  if (categoryResult.isFailure) {
    return Result.fail(categoryResult.getError());
  }

  const intensityResult = MoodIntensity.create(record.moodIntensity);
  if (intensityResult.isFailure) {
    return Result.fail(intensityResult.getError());
  }

  const entry = MoodEntry.reconstitute(
    {
      userId: record.userId,
      category: categoryResult.getValue(),
      intensity: intensityResult.getValue(),
      moodDate: record.moodDate,
      createdAt: record.createdAt,
      updatedAt: Option.fromNullable(record.updatedAt),
    },
    MoodEntryId.create(new UUID(record.id)),
  );

  return Result.ok(entry);
}

export function moodEntryToPersistence(entry: MoodEntry): MoodEntryPersistence {
  const createdAt = entry.get("createdAt");
  const updatedAt = entry.get("updatedAt");
  return {
    id: entry.id.value.toString(),
    userId: entry.get("userId"),
    moodCategory: entry.get("category").value,
    moodIntensity: entry.get("intensity").value,
    moodDate: entry.get("moodDate"),
    createdAt,
    updatedAt: updatedAt.isSome() ? updatedAt.unwrap() : null,
  };
}
