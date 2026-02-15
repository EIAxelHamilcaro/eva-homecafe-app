import { match } from "@packages/ddd-kit";
import type { Board } from "@/domain/board/board.aggregate";
import type { IBoardDto } from "./common-board.dto";

export function boardToDto(board: Board): IBoardDto {
  return {
    id: board.id.value.toString(),
    title: board.get("title").value,
    type: board.get("type").value as "todo" | "kanban",
    description: match<string, string | null>(board.get("description"), {
      Some: (desc) => desc,
      None: () => null,
    }),
    priority: match<string, string | null>(board.get("priority"), {
      Some: (p) => p,
      None: () => null,
    }),
    dueDate: match<string, string | null>(board.get("dueDate"), {
      Some: (d) => d,
      None: () => null,
    }),
    tags: board.get("tags"),
    link: match<string, string | null>(board.get("link"), {
      Some: (l) => l,
      None: () => null,
    }),
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
        content: match<string, string | null>(c.get("content"), {
          Some: (text) => text,
          None: () => null,
        }),
        isCompleted: c.get("isCompleted"),
        position: c.get("position"),
        progress: c.get("progress"),
        priority: match<string, string | null>(c.get("priority"), {
          Some: (p) => p,
          None: () => null,
        }),
        tags: c.get("tags"),
        link: match<string, string | null>(c.get("link"), {
          Some: (l) => l,
          None: () => null,
        }),
        dueDate: match<string, string | null>(c.get("dueDate"), {
          Some: (date) => date,
          None: () => null,
        }),
        createdAt: c.get("createdAt").toISOString(),
      })),
    })),
    createdAt: board.get("createdAt").toISOString(),
    updatedAt: match<Date, string | null>(board.get("updatedAt"), {
      Some: (date) => date.toISOString(),
      None: () => null,
    }),
  };
}
