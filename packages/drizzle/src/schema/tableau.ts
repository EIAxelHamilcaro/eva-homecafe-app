import {
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const tableauRowStatusEnum = pgEnum("tableau_row_status", [
  "todo",
  "in_progress",
  "waiting",
  "done",
]);

export const tableauRowPriorityEnum = pgEnum("tableau_row_priority", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const tableau = pgTable(
  "tableau",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => [index("tableau_user_id_idx").on(table.userId)],
);

export const tableauRow = pgTable(
  "tableau_row",
  {
    id: text("id").primaryKey(),
    tableauId: text("tableau_id")
      .notNull()
      .references(() => tableau.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    text: text("text"),
    status: tableauRowStatusEnum("status").notNull().default("todo"),
    priority: tableauRowPriorityEnum("priority").notNull().default("medium"),
    date: date("date", { mode: "string" }),
    files: jsonb("files").$type<string[]>().notNull().default([]),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => [
    index("tableau_row_tableau_id_position_idx").on(
      table.tableauId,
      table.position,
    ),
  ],
);
