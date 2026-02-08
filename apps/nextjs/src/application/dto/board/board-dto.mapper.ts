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
        isCompleted: c.get("isCompleted"),
        position: c.get("position"),
      })),
    })),
    createdAt: board.get("createdAt").toISOString(),
    updatedAt: match<Date, string | null>(board.get("updatedAt"), {
      Some: (date) => date.toISOString(),
      None: () => null,
    }),
  };
}
