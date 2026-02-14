import { Option, Result, UUID } from "@packages/ddd-kit";
import type { emotionEntry as emotionEntryTable } from "@packages/drizzle/schema";
import { EmotionEntry } from "@/domain/emotion/emotion-entry.aggregate";
import { EmotionEntryId } from "@/domain/emotion/emotion-entry-id";
import { EmotionCategory } from "@/domain/emotion/value-objects/emotion-category.vo";

type EmotionEntryRecord = typeof emotionEntryTable.$inferSelect;

type EmotionEntryPersistence = Omit<EmotionEntryRecord, "updatedAt"> & {
  updatedAt: Date | null;
};

export function emotionEntryToDomain(
  record: EmotionEntryRecord,
): Result<EmotionEntry> {
  const categoryResult = EmotionCategory.create(record.emotionCategory);
  if (categoryResult.isFailure) {
    return Result.fail(categoryResult.getError());
  }

  const entry = EmotionEntry.reconstitute(
    {
      userId: record.userId,
      category: categoryResult.getValue(),
      emotionDate: record.emotionDate,
      createdAt: record.createdAt,
      updatedAt: Option.fromNullable(record.updatedAt),
    },
    EmotionEntryId.create(new UUID(record.id)),
  );

  return Result.ok(entry);
}

export function emotionEntryToPersistence(
  entry: EmotionEntry,
): EmotionEntryPersistence {
  const createdAt = entry.get("createdAt");
  const updatedAt = entry.get("updatedAt");
  return {
    id: entry.id.value.toString(),
    userId: entry.get("userId"),
    emotionCategory: entry.get("category").value,
    emotionDate: entry.get("emotionDate"),
    createdAt,
    updatedAt: updatedAt.isSome() ? updatedAt.unwrap() : null,
  };
}
