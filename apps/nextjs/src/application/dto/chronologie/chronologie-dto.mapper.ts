import { match } from "@packages/ddd-kit";
import type { Chronologie } from "@/domain/chronologie/chronologie.aggregate";
import type { IChronologieDto } from "./common-chronologie.dto";

export function chronologieToDto(chronologie: Chronologie): IChronologieDto {
  return {
    id: chronologie.id.value.toString(),
    title: chronologie.get("title").value,
    entries: chronologie
      .get("entries")
      .sort((a, b) => a.get("position") - b.get("position"))
      .map((entry) => ({
        id: entry.id.value.toString(),
        title: entry.get("title"),
        startDate: entry.get("startDate"),
        endDate: entry.get("endDate"),
        color: entry.get("color"),
        position: entry.get("position"),
      })),
    createdAt: chronologie.get("createdAt").toISOString(),
    updatedAt: match<Date, string | null>(chronologie.get("updatedAt"), {
      Some: (d) => d.toISOString(),
      None: () => null,
    }),
  };
}
