import {
  boolean,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const boardTypeEnum = pgEnum("board_type", ["todo", "kanban"]);

export const board = pgTable(
  "board",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    type: boardTypeEnum("type").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => [index("board_user_id_idx").on(table.userId)],
);

export const boardColumn = pgTable(
  "board_column",
  {
    id: text("id").primaryKey(),
    boardId: text("board_id")
      .notNull()
      .references(() => board.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("board_column_board_id_position_idx").on(
      table.boardId,
      table.position,
    ),
  ],
);

export const card = pgTable(
  "card",
  {
    id: text("id").primaryKey(),
    columnId: text("column_id")
      .notNull()
      .references(() => boardColumn.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    isCompleted: boolean("is_completed").notNull().default(false),
    position: integer("position").notNull(),
    progress: integer("progress").default(0),
    dueDate: date("due_date", { mode: "string" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => [
    index("card_column_id_position_idx").on(table.columnId, table.position),
  ],
);
