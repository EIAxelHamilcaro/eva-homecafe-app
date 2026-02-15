import {
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const dashboardLayout = pgTable(
  "dashboard_layout",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    sectionOrder: jsonb("section_order")
      .$type<string[]>()
      .notNull()
      .default([
        "todo-kanban",
        "tableau",
        "chronologie",
        "calendrier",
        "badges",
      ]),
    collapsedSections: jsonb("collapsed_sections")
      .$type<string[]>()
      .notNull()
      .default([]),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("dashboard_layout_user_id_idx").on(table.userId)],
);
