import { match } from "@packages/ddd-kit";
import type { Board } from "@/domain/board/board.aggregate";
import type { IBoardDto } from "./common-board.dto";

export function boardToDto(board: Board): IBoardDto {
  return {
    id: board.id.value.toString(),
    title: board.get("title").value,
    type: board.get("type").value as "todo" | "kanban",
    columns: board.get("columns").map((col) => ({
      id: col.id.value.toString(),
      title: col.get("title"),
      position: col.get("position"),
      cards: col.get("cards").map((c) => ({
        id: c.id.value.toString(),
        title: c.get("title").value,
        description: match<string, string | null>(c.get("description"), {
          Some: (desc) => desc,
          None: () => null,
        }),
        isCompleted: c.get("isCompleted"),
        position: c.get("position"),
        progress: c.get("progress"),
        dueDate: match<string, string | null>(c.get("dueDate"), {
          Some: (date) => date,
          None: () => null,
        }),
      })),
    })),
    createdAt: board.get("createdAt").toISOString(),
    updatedAt: match<Date, string | null>(board.get("updatedAt"), {
      Some: (date) => date.toISOString(),
      None: () => null,
    }),
  };
}
