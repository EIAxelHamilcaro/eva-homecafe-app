import {
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const tableau = pgTable(
  "tableau",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    statusOptions: jsonb("status_options")
      .$type<{ id: string; label: string; color: string }[]>()
      .notNull()
      .default([
        { id: "todo", label: "À faire", color: "#dbeafe" },
        { id: "in_progress", label: "En cours", color: "#ffedd5" },
        { id: "waiting", label: "En attente", color: "#fef3c7" },
        { id: "done", label: "Terminé", color: "#dcfce7" },
      ]),
    priorityOptions: jsonb("priority_options")
      .$type<{ id: string; label: string; level: number }[]>()
      .notNull()
      .default([
        { id: "low", label: "Basse", level: 1 },
        { id: "medium", label: "Moyenne", level: 2 },
        { id: "high", label: "Haute", level: 3 },
        { id: "critical", label: "Critique", level: 4 },
      ]),
    columns: jsonb("columns")
      .$type<
        {
          id: string;
          name: string;
          type: "text" | "number" | "checkbox" | "date" | "select";
          position: number;
          options?: { id: string; label: string; color?: string }[];
        }[]
      >()
      .notNull()
      .default([]),
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
    status: text("status").notNull().default("todo"),
    priority: text("priority").notNull().default("medium"),
    date: date("date", { mode: "string" }),
    files: jsonb("files").$type<string[]>().notNull().default([]),
    customFields: jsonb("custom_fields")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
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
