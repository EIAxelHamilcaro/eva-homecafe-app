import { match } from "@packages/ddd-kit";
import type { Tableau } from "@/domain/tableau/tableau.aggregate";
import type { ITableauDto } from "./common-tableau.dto";

export function tableauToDto(tableau: Tableau): ITableauDto {
  return {
    id: tableau.id.value.toString(),
    title: tableau.get("title").value,
    statusOptions: tableau.get("statusOptions"),
    priorityOptions: tableau.get("priorityOptions"),
    columns: tableau.get("columns"),
    rows: tableau
      .get("rows")
      .sort((a, b) => a.get("position") - b.get("position"))
      .map((row) => ({
        id: row.id.value.toString(),
        name: row.get("name").value,
        text: match<string, string | null>(row.get("text"), {
          Some: (t) => t,
          None: () => null,
        }),
        status: row.get("status").value,
        priority: row.get("priority").value,
        date: match<string, string | null>(row.get("date"), {
          Some: (d) => d,
          None: () => null,
        }),
        files: row.get("files"),
        customFields: row.get("customFields"),
        position: row.get("position"),
        createdAt: row.get("createdAt").toISOString(),
        updatedAt: match<Date, string | null>(row.get("updatedAt"), {
          Some: (d) => d.toISOString(),
          None: () => null,
        }),
      })),
    createdAt: tableau.get("createdAt").toISOString(),
    updatedAt: match<Date, string | null>(tableau.get("updatedAt"), {
      Some: (d) => d.toISOString(),
      None: () => null,
    }),
  };
}
