import { Option, Result, UUID } from "@packages/ddd-kit";
import type {
  chronologieEntry as chronologieEntryTable,
  chronologie as chronologieTable,
} from "@packages/drizzle/schema";
import { Chronologie } from "@/domain/chronologie/chronologie.aggregate";
import { ChronologieEntry } from "@/domain/chronologie/chronologie-entry.entity";
import { ChronologieEntryId } from "@/domain/chronologie/chronologie-entry-id";
import { ChronologieId } from "@/domain/chronologie/chronologie-id";
import { ChronologieTitle } from "@/domain/chronologie/value-objects/chronologie-title.vo";

type ChronologieRecord = typeof chronologieTable.$inferSelect;
type EntryRecord = typeof chronologieEntryTable.$inferSelect;

export function chronologieToDomain(
  record: ChronologieRecord,
  entryRecords: EntryRecord[],
): Result<Chronologie> {
  const titleResult = ChronologieTitle.create(record.title);
  if (titleResult.isFailure) {
    return Result.fail(titleResult.getError());
  }

  const entries: ChronologieEntry[] = [];
  for (const er of entryRecords) {
    entries.push(
      ChronologieEntry.reconstitute(
        {
          title: er.title,
          startDate: er.startDate,
          endDate: er.endDate,
          color: er.color,
          position: er.position,
          createdAt: er.createdAt,
          updatedAt: er.updatedAt ?? null,
        },
        ChronologieEntryId.create(new UUID(er.id)),
      ),
    );
  }

  const chronologie = Chronologie.reconstitute(
    {
      userId: record.userId,
      title: titleResult.getValue(),
      entries,
      createdAt: record.createdAt,
      updatedAt: Option.fromNullable(record.updatedAt),
    },
    ChronologieId.create(new UUID(record.id)),
  );

  return Result.ok(chronologie);
}

export function chronologieToPersistence(chronologie: Chronologie) {
  const updatedAt = chronologie.get("updatedAt");
  return {
    chronologie: {
      id: chronologie.id.value.toString(),
      userId: chronologie.get("userId"),
      title: chronologie.get("title").value,
      createdAt: chronologie.get("createdAt"),
      updatedAt: updatedAt.isSome() ? updatedAt.unwrap() : null,
    },
    entries: chronologie.get("entries").map((entry) => ({
      id: entry.id.value.toString(),
      chronologieId: chronologie.id.value.toString(),
      title: entry.get("title"),
      startDate: entry.get("startDate"),
      endDate: entry.get("endDate"),
      color: entry.get("color"),
      position: entry.get("position"),
      createdAt: entry.get("createdAt"),
      updatedAt: entry.get("updatedAt") ?? null,
    })),
  };
}
